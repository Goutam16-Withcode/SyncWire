import Message from "../models/Message.js";
import { io, userSocketMap } from "../server.js";

export const startScheduledMessageWorker = () => {
    // Run every 10 seconds
    setInterval(async () => {
        try {
            const now = new Date();
            const dueMessages = await Message.find({
                isScheduled: true,
                isDispatched: false,
                scheduledFor: { $lte: now }
            }).populate("senderId", "fullName profilePic");

            for (const msg of dueMessages) {
                msg.isDispatched = true;
                await msg.save();

                if (msg.groupId) {
                    io.to(`group_${msg.groupId}`).emit("newGroupMessage", msg);
                } else if (msg.receiverId) {
                    const receiverSocketId = userSocketMap[msg.receiverId.toString()];
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit("newMessage", msg);
                    }
                    const senderSocketId = userSocketMap[msg.senderId._id.toString()];
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("newMessage", msg);
                    }
                }
            }
        } catch (error) {
            console.error("Scheduled message worker error:", error.message);
        }
    }, 10000);
};
