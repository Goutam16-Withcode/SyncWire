import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { generateSmartReplies, askAiCopilot } from "../controllers/aiController.js";

const router = express.Router();

router.post("/smart-replies", protectRoute, generateSmartReplies);
router.post("/copilot", protectRoute, askAiCopilot);

export default router;
