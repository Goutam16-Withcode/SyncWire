import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { 
    getMessages, 
    getUsersForSidebar, 
    markMessageAsSeen, 
    sendMessage,
    reactToMessage,
    deleteMessage,
    createPoll,
    votePoll,
    scheduleMessage,
    getScheduledMessages,
    cancelScheduledMessage,
    markBurnerOpened
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/schedule/list", protectRoute, getScheduledMessages);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/react/:messageId", protectRoute, reactToMessage);
messageRouter.delete("/delete/:messageId", protectRoute, deleteMessage);

// Next-Gen Interactive Features
messageRouter.post("/poll/:id", protectRoute, createPoll);
messageRouter.put("/poll/vote/:messageId", protectRoute, votePoll);
messageRouter.post("/schedule/:id", protectRoute, scheduleMessage);
messageRouter.delete("/schedule/cancel/:messageId", protectRoute, cancelScheduledMessage);
messageRouter.put("/burner/open/:messageId", protectRoute, markBurnerOpened);

export default messageRouter;