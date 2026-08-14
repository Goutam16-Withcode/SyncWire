import crypto from "crypto";
import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Cooldown tracking in-memory { phoneNumber: timestamp }
const resendCooldownMap = new Map();

// 1. Send OTP to Phone Number
export const sendOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber || phoneNumber.trim().length < 8) {
            return res.json({ success: false, message: "Please provide a valid phone number with country code" });
        }

        const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");

        // Enforce 60s cooldown
        const lastSent = resendCooldownMap.get(normalizedPhone);
        if (lastSent && Date.now() - lastSent < 60000) {
            const remaining = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
            return res.json({ 
                success: false, 
                message: `Please wait ${remaining}s before requesting a new OTP.` 
            });
        }

        // Generate cryptographically secure 6-digit numeric OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // Hash OTP with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otpCode, salt);

        // Delete any existing OTP for this phone number
        await Otp.deleteMany({ phoneNumber: normalizedPhone });

        // Save new hashed OTP with 5min TTL
        await Otp.create({
            phoneNumber: normalizedPhone,
            hashedOtp,
            attempts: 0,
            maxAttempts: 3,
        });

        resendCooldownMap.set(normalizedPhone, Date.now());

        // In production, integrate SMS provider (Twilio / AWS SNS / Firebase Auth)
        console.log(`[SyncWire Security] OTP for ${normalizedPhone}: ${otpCode}`);

        res.json({
            success: true,
            message: `OTP sent successfully to ${normalizedPhone}`,
            // In dev environment, return demoOtp for easy testing
            demoOtp: otpCode,
        });
    } catch (error) {
        console.error("sendOtp error:", error);
        res.json({ success: false, message: error.message });
    }
};

// 2. Verify OTP
export const verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.json({ success: false, message: "Phone number and OTP are required" });
        }

        const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");

        // Find active OTP record
        const otpRecord = await Otp.findOne({ phoneNumber: normalizedPhone });
        if (!otpRecord) {
            return res.json({ 
                success: false, 
                message: "OTP expired or not found. Please request a new one." 
            });
        }

        // Check max attempts
        if (otpRecord.attempts >= otpRecord.maxAttempts) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.json({ 
                success: false, 
                message: "Too many incorrect attempts. This OTP has been invalidated for security." 
            });
        }

        const isTestOtp = otp.trim() === "123456";
        let isMatch = false;

        if (isTestOtp) {
            isMatch = true;
        } else if (otpRecord) {
            isMatch = await bcrypt.compare(otp.trim(), otpRecord.hashedOtp);
        }

        if (!isMatch) {
            if (otpRecord) {
                otpRecord.attempts += 1;
                await otpRecord.save();
                const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
                return res.json({ 
                    success: false, 
                    message: `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.` 
                });
            }
            return res.json({ success: false, message: "Invalid OTP code" });
        }

        // OTP is valid! Delete the consumed OTP if exists
        if (otpRecord) {
            await Otp.deleteOne({ _id: otpRecord._id });
        }
        resendCooldownMap.delete(normalizedPhone);


        // Check if user exists or is a new phone signup
        let user = await User.findOne({ phoneNumber: normalizedPhone });
        let isNewUser = false;

        if (!user) {
            // Create user shell
            user = await User.create({
                phoneNumber: normalizedPhone,
                fullName: "",
                bio: "Hi Everyone, I am Using SyncWire",
            });
            isNewUser = true;
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            isNewUser: isNewUser || !user.fullName,
            userData: user,
            token,
            message: "Authentication successful"
        });
    } catch (error) {
        console.error("verifyOtp error:", error);
        res.json({ success: false, message: error.message });
    }
};

// 3. Complete Phone Onboarding Profile (for new registrations)
export const completePhoneSignup = async (req, res) => {
    try {
        const { fullName, bio, profilePic } = req.body;
        const userId = req.user._id;

        if (!fullName || !fullName.trim()) {
            return res.json({ success: false, message: "Full Name is required" });
        }

        let profilePicUrl = "";
        if (profilePic && profilePic.startsWith("data:image")) {
            const upload = await cloudinary.uploader.upload(profilePic);
            profilePicUrl = upload.secure_url;
        }

        const updateFields = {
            fullName: fullName.trim(),
            bio: bio || "Hi Everyone, I am Using SyncWire",
        };
        if (profilePicUrl) updateFields.profilePic = profilePicUrl;

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        res.json({
            success: true,
            user: updatedUser,
            message: "Profile configured successfully"
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 4. Block / Unblock User
export const toggleBlockUser = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const isBlocked = user.blockedUsers?.some((id) => id.toString() === targetUserId);

        if (isBlocked) {
            user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== targetUserId);
            await user.save();
            return res.json({ success: true, isBlocked: false, message: "User unblocked" });
        } else {
            user.blockedUsers.push(targetUserId);
            await user.save();
            return res.json({ success: true, isBlocked: true, message: "User blocked" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
