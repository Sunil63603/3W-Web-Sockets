import express from "express";
import {
  findExistingRoom,
  getAllRooms,
} from "../controllers/roomController.js"; //finds 1-1 existing room
import { createRoom } from "../controllers/roomController.js";

const router = express.Router();

//GET /api/rooms/existing?user1=...&user2=...
router.get("/existing", findExistingRoom);
router.get("/create", createRoom);
router.get("/all", getAllRooms);

export default router;
