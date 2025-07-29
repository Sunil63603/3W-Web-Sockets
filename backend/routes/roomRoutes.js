import express from "express";
import {
  findExistingRoom,
  getAllRooms,
  getRoomById,
} from "../controllers/roomController.js"; //finds 1-1 existing room
import { createRoom } from "../controllers/roomController.js";

const router = express.Router();

//GET /api/rooms/existing?user1=...&user2=...
router.get("/existing", findExistingRoom);
router.post("/create", createRoom);
router.get("/all", getAllRooms);
router.get("/:roomId", getRoomById);

export default router;
