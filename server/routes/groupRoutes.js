import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createGroup, getUserGroups, getGroupDetails } from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupDetails);

export default router;
