import express from "express";
import { checkAuth, login, signup, updateProfile, setNickname, googleAuth } from "../controllers/userController.js";
import { sendOtp, verifyOtp, completePhoneSignup, toggleBlockUser } from "../controllers/otpController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// Email / Password / Google Auth
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/google", googleAuth);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.put("/nickname", protectRoute, setNickname);
userRouter.get("/check", protectRoute, checkAuth);

// WhatsApp-style Phone Number & OTP Auth
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/complete-phone-signup", protectRoute, completePhoneSignup);
userRouter.post("/toggle-block", protectRoute, toggleBlockUser);

export default userRouter;
