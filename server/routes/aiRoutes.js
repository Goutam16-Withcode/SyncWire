import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { generateSmartReplies, askAiCopilot, translateMessage, transcribeVoiceNote } from "../controllers/aiController.js";

const router = express.Router();

router.post("/smart-replies", protectRoute, generateSmartReplies);
router.post("/copilot", protectRoute, askAiCopilot);
router.post("/translate", protectRoute, translateMessage);
router.post("/transcribe", protectRoute, transcribeVoiceNote);

export default router;
