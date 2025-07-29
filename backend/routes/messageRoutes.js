import express from "express";
import { getMessagesByRoomId } from "../controllers/messageController.js";

const router = express.Router();

//Route to get all messages by room ID
router.get("/:roomId", getMessagesByRoomId);

export default router;
