import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    hashedOtp: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    createdAt: { type: Date, default: Date.now, expires: 300 } // TTL 5 minutes (300s)
});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
