import Message from "../models/Message.js";

//controller to fetch messages for a given roomId.
export const getMessagesByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    //find all messages for that room sorted by timestamp
    const messages = await Message.find({ roomId })
      .populate("sender", "userName") //while displaying messages in UI, display 'sender name' along with userName
      .sort({ timestamp: 1 }); //ascneding order

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
