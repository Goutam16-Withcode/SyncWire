import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged in user with their last message and unseen count
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        const unseenMessages = {};
        const lastMessages = {};

        const promises = filteredUsers.map(async (user) => {
            const unreadCount = await Message.countDocuments({
                senderId: user._id,
                receiverId: userId,
                groupId: null,
                seen: false
            });
            if (unreadCount > 0) {
                unseenMessages[user._id] = unreadCount;
            }

            const lastMsg = await Message.findOne({
                groupId: null,
                $or: [
                    { senderId: userId, receiverId: user._id },
                    { senderId: user._id, receiverId: userId }
                ]
            }).sort({ createdAt: -1 });

            if (lastMsg) {
                lastMessages[user._id] = lastMsg;
            }
        });

        await Promise.all(promises);

        res.json({ success: true, users: filteredUsers, unseenMessages, lastMessages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all messages for selected user or group
export const getMessages = async (req, res) => {
    try {
        const { id: targetId } = req.params;
        const { isGroup } = req.query;
        const myId = req.user._id;

        let messages;
        if (isGroup === "true") {
            messages = await Message.find({ groupId: targetId })
                .sort({ createdAt: 1 })
                .populate("senderId", "fullName profilePic");
        } else {
            messages = await Message.find({
                groupId: null,
                $or: [
                    { senderId: myId, receiverId: targetId },
                    { senderId: targetId, receiverId: myId },
                ]
            }).sort({ createdAt: 1 });

            // Mark incoming direct messages as seen
            await Message.updateMany(
                { senderId: targetId, receiverId: myId, seen: false },
                { seen: true }
            );

            // Notify sender
            const senderSocketId = userSocketMap[targetId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { byUserId: myId });
            }
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to mark message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Message.findByIdAndUpdate(id, { seen: true }, { new: true });
        if (updated && updated.senderId) {
            const senderSocketId = userSocketMap[updated.senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { byUserId: req.user._id, messageId: id });
            }
        }
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Send message (direct or group)
export const sendMessage = async (req, res) => {
    try {
        const { text, image, audio, messageType = 'text', isGroup = false } = req.body;
        const targetId = req.params.id;
        const senderId = req.user._id;

        let imageUrl = null;
        let audioUrl = null;
        let finalType = messageType;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
            finalType = 'image';
        } else if (audio) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(audio, {
                    resource_type: "video"
                });
                audioUrl = uploadResponse.secure_url;
            } catch (err) {
                audioUrl = audio;
            }
            finalType = 'audio';
        }

        const messageData = {
            senderId,
            text,
            image: imageUrl,
            audio: audioUrl,
            messageType: finalType,
            seen: false,
        };

        if (isGroup) {
            messageData.groupId = targetId;
        } else {
            messageData.receiverId = targetId;
        }

        const newMessage = await Message.create(messageData);
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "fullName profilePic");

        if (isGroup) {
            // Broadcast to group room
            io.to(`group_${targetId}`).emit("newGroupMessage", populatedMessage);
        } else {
            // Emit to direct receiver
            const receiverSocketId = userSocketMap[targetId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", populatedMessage);
            }
        }

        res.json({ success: true, newMessage: populatedMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// React to a message (toggle emoji reaction)
export const reactToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }

        const existingReactionIndex = message.reactions.findIndex(
            (r) => r.userId.toString() === userId.toString()
        );

        if (existingReactionIndex > -1) {
            if (message.reactions[existingReactionIndex].emoji === emoji) {
                // Remove reaction if clicked the same emoji again
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Update reaction
                message.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            // Add new reaction
            message.reactions.push({ userId, emoji });
        }

        await message.save();

        // Broadcast reaction to parties
        const payload = { messageId, reactions: message.reactions, userId, emoji };
        if (message.groupId) {
            io.to(`group_${message.groupId}`).emit("messageReaction", payload);
        } else {
            const partnerId = message.senderId.toString() === userId.toString() 
                ? message.receiverId 
                : message.senderId;
            const partnerSocketId = userSocketMap[partnerId];
            if (partnerSocketId) {
                io.to(partnerSocketId).emit("messageReaction", payload);
            }
        }

        res.json({ success: true, reactions: message.reactions });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete message ("Delete for everyone")
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.json({ success: false, message: "You can only delete your own messages" });
        }

        message.isDeleted = true;
        message.text = "This message was deleted";
        message.image = null;
        message.audio = null;
        await message.save();

        // Broadcast deletion
        const payload = { messageId, isDeleted: true };
        if (message.groupId) {
            io.to(`group_${message.groupId}`).emit("messageDeleted", payload);
        } else {
            const receiverSocketId = userSocketMap[message.receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("messageDeleted", payload);
            }
        }

        res.json({ success: true, messageId });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Create a native interactive Poll
export const createPoll = async (req, res) => {
    try {
        const { question, options, isAnonymous = false, isGroup = false } = req.body;
        const targetId = req.params.id;
        const senderId = req.user._id;

        if (!question || !options || options.length < 2) {
            return res.json({ success: false, message: "Poll requires a question and at least 2 options" });
        }

        const pollOptions = options.map((opt, idx) => ({
            id: `opt_${Date.now()}_${idx}`,
            text: typeof opt === 'string' ? opt : opt.text,
            votes: []
        }));

        const messageData = {
            senderId,
            text: question,
            messageType: 'poll',
            poll: {
                question,
                options: pollOptions,
                isAnonymous
            }
        };

        if (isGroup) {
            messageData.groupId = targetId;
        } else {
            messageData.receiverId = targetId;
        }

        const newMessage = await Message.create(messageData);
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "fullName profilePic");

        if (isGroup) {
            io.to(`group_${targetId}`).emit("newGroupMessage", populatedMessage);
        } else {
            const receiverSocketId = userSocketMap[targetId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", populatedMessage);
            }
        }

        res.json({ success: true, newMessage: populatedMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Vote on a Poll option (toggle vote)
export const votePoll = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { optionId } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message || message.messageType !== 'poll') {
            return res.json({ success: false, message: "Poll not found" });
        }

        let userAlreadyVotedThisOption = false;

        // Check and toggle vote
        message.poll.options.forEach((opt) => {
            const voteIdx = opt.votes.findIndex((id) => id.toString() === userId.toString());
            if (opt.id === optionId) {
                if (voteIdx > -1) {
                    opt.votes.splice(voteIdx, 1);
                    userAlreadyVotedThisOption = false;
                } else {
                    opt.votes.push(userId);
                    userAlreadyVotedThisOption = true;
                }
            } else {
                // If single-choice, remove from other options
                if (voteIdx > -1) {
                    opt.votes.splice(voteIdx, 1);
                }
            }
        });

        await message.save();

        const payload = {
            messageId,
            poll: message.poll,
            voterId: userId
        };

        if (message.groupId) {
            io.to(`group_${message.groupId}`).emit("pollUpdated", payload);
        } else {
            const partnerId = message.senderId.toString() === userId.toString()
                ? message.receiverId
                : message.senderId;
            const partnerSocketId = userSocketMap[partnerId];
            if (partnerSocketId) {
                io.to(partnerSocketId).emit("pollUpdated", payload);
            }
        }

        res.json({ success: true, poll: message.poll });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Schedule a Message for delayed delivery
export const scheduleMessage = async (req, res) => {
    try {
        const { text, scheduledFor, isGroup = false } = req.body;
        const targetId = req.params.id;
        const senderId = req.user._id;

        if (!text || !scheduledFor) {
            return res.json({ success: false, message: "Text and scheduled date/time are required" });
        }

        const messageData = {
            senderId,
            text,
            messageType: 'text',
            isScheduled: true,
            isDispatched: false,
            scheduledFor: new Date(scheduledFor)
        };

        if (isGroup) {
            messageData.groupId = targetId;
        } else {
            messageData.receiverId = targetId;
        }

        const scheduledMsg = await Message.create(messageData);
        res.json({ success: true, scheduledMessage: scheduledMsg, message: "Message scheduled successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get pending scheduled messages for current user
export const getScheduledMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const scheduledList = await Message.find({
            senderId: userId,
            isScheduled: true,
            isDispatched: false
        }).sort({ scheduledFor: 1 });

        res.json({ success: true, scheduledMessages: scheduledList });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Cancel a scheduled message
export const cancelScheduledMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        await Message.findOneAndDelete({ _id: messageId, senderId: userId, isScheduled: true, isDispatched: false });
        res.json({ success: true, message: "Scheduled message cancelled" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Mark Burner (View-Once) message opened & trigger 5-second vaporization
export const markBurnerOpened = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);

        if (!message || !message.isBurner) {
            return res.json({ success: false, message: "Burner message not found" });
        }

        message.burnerOpenedAt = new Date();
        await message.save();

        // Schedule auto-deletion in 5 seconds
        setTimeout(async () => {
            try {
                const targetMsg = await Message.findById(messageId);
                if (targetMsg) {
                    targetMsg.isDeleted = true;
                    targetMsg.text = "🔥 Burner message vaporized";
                    targetMsg.image = null;
                    targetMsg.audio = null;
                    await targetMsg.save();

                    const payload = { messageId, isDeleted: true };
                    if (targetMsg.groupId) {
                        io.to(`group_${targetMsg.groupId}`).emit("messageDeleted", payload);
                    } else {
                        const recSocket = userSocketMap[targetMsg.receiverId];
                        const sendSocket = userSocketMap[targetMsg.senderId];
                        if (recSocket) io.to(recSocket).emit("messageDeleted", payload);
                        if (sendSocket) io.to(sendSocket).emit("messageDeleted", payload);
                    }
                }
            } catch (e) {}
        }, 5000);

        res.json({ success: true, messageId, expiresInSeconds: 5 });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
