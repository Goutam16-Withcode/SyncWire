import mongoose from "mongoose";
import dns from "node:dns";

// Configure public DNS servers to prevent querySrv ECONNREFUSED on local/ISP DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Function to connect to the mongodb database
export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}