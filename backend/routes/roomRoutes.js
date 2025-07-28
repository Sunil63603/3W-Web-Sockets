import express from "express";
import { findExistingRoom } from "../controllers/roomController.js"; //finds 1-1 existing room

const router = express.Router();

//GET /api/rooms/existing?user1=...&user2=...
router.get("/existing", findExistingRoom);

export default router;
