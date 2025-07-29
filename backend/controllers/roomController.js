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

//controller to create a new 1-1 room.
export const createRoom = async (req, res) => {
  try {
    const { participants } = req.body;
    console.log(participants);

    //expect exactly 2 userIds
    if (!Array.isArray(participants) || participants.length !== 2) {
      return res
        .status(400)
        .json({ message: `Exactly 2 participants required` });
    }

    //Create a room document with isGroup:false and lastActivityAt:now
    const newRoom = new Room({
      participants,
      isGroup: false,
      grpName: null, //if grpName is null display 'selectedUser's name at the top of chat UI
      lastActivityAt: Date.now(),
    });

    await newRoom.save();

    //Respond.with the newly created room ID only
    return res.status(201).json({ roomId: newRoom._id });
  } catch (error) {
    return res.status(500).json({ message: `Server Error` });
  }
};

//controller to fetch all chat rooms, sorted by lastActivityAt
export const getAllRooms = async (req, res) => {
  try {
    //fetch all rooms and sort them by lastActivityAt descending(most recent first).
    const rooms = await Room.find({}).sort({ lastActivityAt: -1 }); //-1=descending order

    //return full room objects (including _id,participants,etc)
    return res.status(200).json(rooms);
  } catch (error) {
    console.error(`Error fetching rooms:`, error.message);
    return res.status(500).json({ message: `Server Error` });
  }
};

//controller to fetch one room by ID.
export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: `Room not found` });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error(`Error getting room by ID:`, error.message);
    return res.status(500).json({ message: `Server error` });
  }
};
