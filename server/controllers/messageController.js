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
