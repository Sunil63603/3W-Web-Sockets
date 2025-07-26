import mongoose from "mongoose";

//Define schema for the 'users' collection.
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true, //every user must have a username
      trim: true, //remove leading/trailing spaces.
    },
    socketId: {
      type: String, //stores current socket.io connection ID
      default: null, //can be null if user is offline
    },
    password: {
      type: String, //will store hashed password after Authentiation
      required: false, //optional for now as auth is not implemented
    },
  },
  {
    collection: "users", //explicitly name the MongoDB collection as 'users'
  }
);

//create and export the User model.
const User = mongoose.model("User", userSchema);
export default User;
