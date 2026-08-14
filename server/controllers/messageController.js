import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js";

// Get all users except the logged in user with their last message and unseen count
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

        const unseenMessages = {};
        const lastMessages = {};

        const promises = filteredUsers.map(async (user) => {
            // Count unseen messages
            const unreadCount = await Message.countDocuments({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });
            if (unreadCount > 0) {
                unseenMessages[user._id] = unreadCount;
            }

            // Get last message between user and me
            const lastMsg = await Message.findOne({
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
}

// Get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        }).sort({ createdAt: 1 });

        // Mark incoming messages as seen
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { seen: true }
        );

        // Notify the other user that their messages were seen
        const senderSocketId = userSocketMap[selectedUserId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesSeen", { byUserId: myId });
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Message.findByIdAndUpdate(id, { seen: true }, { new: true });
        if (updated) {
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
}

// Send message to selected user (text, image, audio)
export const sendMessage = async (req, res) => {
    try {
        const { text, image, audio, messageType = 'text' } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl = null;
        let audioUrl = null;
        let finalType = messageType;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
            finalType = 'image';
        } else if (audio) {
            // Can be base64 data URI or Cloudinary upload
            try {
                const uploadResponse = await cloudinary.uploader.upload(audio, {
                    resource_type: "video" // Cloudinary handles audio files as video resource_type
                });
                audioUrl = uploadResponse.secure_url;
            } catch (err) {
                // Fallback to storing raw base64 data uri if upload fails
                audioUrl = audio;
            }
            finalType = 'audio';
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            audio: audioUrl,
            messageType: finalType,
            seen: false
        });

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}