import mongoose from "mongoose";

//Define schema for 'rooms' collection.
const roomSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId, //Each participant is a reference to a User.
        ref: "User", //reference the User model.
        required: true,
      },
    ],
    isGroup: {
      type: Boolean, //indicates if this is a group chat room.
      default: false,
    },
    grpName: {
      type: String, //Name of the group(only needed if isGroup:true)
      required: function () {
        return this.isGroup; //Make grpName required only for group rooms
      },
    },
    lastActivityAt: {
      type: Date, //stores the timestamp of the last message sent in this room
      default: Date.now, //Default value is the creation time
    },
  },
  {
    collection: "rooms", //explicitly set collection name as 'rooms'.
  }
);

//Create and export the Room model.
const Room = mongoose.model("Room", roomSchema);
export default Room;
