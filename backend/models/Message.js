import mongoose from "mongoose";

//Define schema for 'messages' collection
const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId, //Reference to the Room where the message was sent.
      ref: "Room",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId, //Reference to the User who sent the message
      ref: "User",
      required: true,
    },
    content: {
      type: String, //Actual message content
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date, //Time when the message was sent
      default: Date.now, //Defaults to current date and time
    },
  },
  {
    collection: "messages", //Explicitly set collection name as 'messages'
  }
);

//Create and export the Message model
const Message = mongoose.model("Message", messageSchema);
export default Message;
