import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createStory, getActiveStories, viewStory, toggleLikeStory, addStoryComment } from "../controllers/storyController.js";

const router = express.Router();

router.post("/create", protectRoute, createStory);
router.get("/", protectRoute, getActiveStories);
router.put("/view/:storyId", protectRoute, viewStory);
router.put("/like/:storyId", protectRoute, toggleLikeStory);
router.post("/comment/:storyId", protectRoute, addStoryComment);

export default router;
