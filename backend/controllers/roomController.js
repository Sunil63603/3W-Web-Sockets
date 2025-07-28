import Room from "../models/Room.js";

//controller to find an existing 1-1 room between two users
export const findExistingRoom = async (req, res) => {
  try {
    const { user1, user2 } = req.query; //Parameters coming from frontend

    //Validate required parameters
    if (!user1 || !user2) {
      return res
        .status(400)
        .json({ message: `Both user1 and user2 are required` });
    }

    //Search for a non-group room with exactly these two participants.
    const existingRoom = await Room.findOne({
      isGroup: false,
      participants: { $all: [user1, user2], $size: 2 }, //exact 2 participants
    });

    if (existingRoom) {
      return res.status(200).json({ roomId: existingRoom._id });
    } else {
      return res.status(404).json({ message: "No existing room found" });
    }
  } catch (error) {
    console.error(`Error finding room:`, error.message);
    res.status(500).json({ message: `Server Error` });
  }
};
