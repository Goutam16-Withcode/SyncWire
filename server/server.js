import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import User from "./models/User.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected:", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Real-time typing indicators
    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", { senderId: userId });
        }
    });

    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
        }
    });

    // Real-time mark seen
    socket.on("markSeen", ({ senderId }) => {
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesSeen", { byUserId: userId });
        }
    });

    // Group rooms
    socket.on("joinGroup", ({ groupId }) => {
        socket.join(`group_${groupId}`);
    });

    socket.on("leaveGroup", ({ groupId }) => {
        socket.leave(`group_${groupId}`);
    });

    // WebRTC Signaling for Voice & Video Calling
    socket.on("callUser", ({ userToCall, signalData, from, callerName, callerPic, isVideo }) => {
        const receiverSocketId = userSocketMap[userToCall];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incomingCall", {
                signal: signalData,
                from,
                callerName,
                callerPic,
                isVideo
            });
        }
    });

    socket.on("answerCall", ({ signal, to }) => {
        const callerSocketId = userSocketMap[to];
        if (callerSocketId) {
            io.to(callerSocketId).emit("callAccepted", { signal });
        }
    });

    socket.on("iceCandidate", ({ target, candidate }) => {
        const targetSocketId = userSocketMap[target];
        if (targetSocketId) {
            io.to(targetSocketId).emit("iceCandidate", { candidate });
        }
    });

    socket.on("endCall", ({ to }) => {
        const partnerSocketId = userSocketMap[to];
        if (partnerSocketId) {
            io.to(partnerSocketId).emit("callEnded");
        }
    });

    socket.on("rejectCall", ({ to }) => {
        const callerSocketId = userSocketMap[to];
        if (callerSocketId) {
            io.to(callerSocketId).emit("callRejected");
        }
    });

    socket.on("disconnect", async () => {
        console.log("User Disconnected:", userId);
        if (userId) {
            try {
                const now = new Date();
                await User.findByIdAndUpdate(userId, { lastSeen: now });
                io.emit("userLastSeenUpdated", { userId, lastSeen: now });
            } catch (e) {}
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));

// Monitoring & Health Check Endpoint (Prometheus / Grafana compatible metrics)
app.get("/api/health", (req, res) => {
    const memory = process.memoryUsage();
    res.json({
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        activeSockets: Object.keys(userSocketMap).length,
        memoryUsageMB: {
            rss: (memory.rss / 1024 / 1024).toFixed(2),
            heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2),
            heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2),
        },
        nodeVersion: process.version,
    });
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);
app.use("/api/stories", storyRouter);
app.use("/api/ai", aiRouter);


// Connect to MongoDB
await connectDB();

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
}

// Export server
export default server;


