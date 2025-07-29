import User from "../models/User.js"; //Import User model to interact with DB.
import Room from "../models/Room.js";
import Message from "../models/Message.js";

//In-memory map to store online users:userId -> socketId.
//stored in RAM allow for faster lookup and updates.
//This allows us to send private messages or typing indicators to specific users
const onlineUsers = new Map();

//function to handle all socket.io events (used in socketServer.js)
const socketHandler = (io) => {
  //Run on every new socket connection.
  io.on("connection", (socket) => {
    console.log(`New socket connected:${socket.id}`);

    //REGISTER EVENT - Sent by client after successfu login
    socket.on("register", async ({ userName }) => {
      try {
        let user = await User.findOne({ userName }); //findOne will return only first user matching this userName in DB

        if (user) {
          //✅User exists:update socketId.
          user.socketId = socket.id;
          await user.save();
        } else {
          //❌ User doesnot exist:create new
          user = await User.create({
            userName,
            socketId: socket.id,
            password: "",
          });
        }

        //Save userId on socket instance for use during disconnect.
        socket.data.userId = user._id.toString();

        //Store userId->socketId mapping in memory
        onlineUsers.set(user._id.toString(), socket.id);

        //Debug:print current online user map
        console.log(`Online Users Map:`);
        for (const [userId, sockId] of onlineUsers.entries()) {
          console.log(`${userId}->${sockId}`);
        }

        //socket.emit()-send to specific client only
        //Send confirmation back to client
        socket.emit("registered", {
          userId: user._id,
          userName: user.userName,
        });

        //Broadcast updated online users list to all clients
        const onlineUserList = [];
        for (const [userId, sockId] of onlineUsers.entries()) {
          //'u' because to avoid naming conflict with 'user' variable.
          const u = await User.findById(userId);
          if (u) onlineUserList.push({ userId, userName: u.userName });
        }

        //io.emit()-send to all connected clients(not just currentUser)
        io.emit("onlineUsers", onlineUserList);
        //use socket.broadcast.emit()-send to all clients except sender.
      } catch (error) {
        console.error("❌Error in register event:", error.message);
        socket.emit("register:error", { message: "Registration Failed" });
      }
    });

    //Join a room:for group rooms only.
    socket.on("joinRoom", async ({ roomId, userId, isGroup }) => {
      try {
        //Always join the socket.io room by roomId
        socket.join(roomId);

        //If not a group room,just confirm join(no DB update).
        if (!isGroup) {
          socket.emit("room:joined", { roomId, message: `joined (1-1) room` });
          return;
        }

        //find room by ID
        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit("room:joined", { roomId, message: "Room not found" });
          return;
        }

        //If user already in participants, do not modify DB.
        if (room.participants.includes(userId)) {
          socket.emit("room:joined", {
            roomId,
            message: "Already joined",
            room,
          });
        } else {
          //Otherwise, add user to participants and save
          room.participants.push(userId);
          await room.save();

          // fetch the updated room details
          const updatedRoom = await Room.findById(roomId);
          socket.emit("room:joined", {
            roomId,
            message: "Join failed",
            room: updatedRoom,
          });
        }
      } catch (error) {
        socket.emit("room:joined", { roomId, message: "Join failed" });
      }
    });

    //handle incoming chat message.
    socket.on("chatMessage", async ({ roomId, sender, content, timestamp }) => {
      try {
        //create and save message in DB.
        const message = new Message({
          roomId,
          sender,
          content,
          timestamp,
        });

        const savedMessage = await message.save();

        //populate sender field with userName only.
        await savedMessage.populate("sender", "userName");

        //emit message to all in that room
        io.to(roomId).emit("chatMessage", savedMessage);
      } catch (err) {
        console.error(`Error handling chatMessage:`, err.message);
      }
    });

    //DISCONNECT EVENT - called when socket connection closes
    socket.on("disconnect", async () => {
      const userId = socket.data.userId; //Retrieve  userId saved earlier while user logged-in(REGISTER event).

      if (!userId) return; //If no user was registered,skip.

      console.log(`🔴Socket disconnected: ${socket.id} (userId:${userId})`);

      //Remove from in-memory map
      onlineUsers.delete(userId);

      //set socketId to null in DB.
      await User.findByIdAndUpdate(userId, { socketId: null });

      //Broadcast updated online users list to all clients
      const onlineUserList = [];
      for (const [userId, sockId] of onlineUsers.entries()) {
        //'u' because to avoid naming conflict with 'user' variable.
        const u = await User.findById(userId);
        if (u) onlineUserList.push({ userId, userName: u.userName });
      }

      //io.emit()-send to all connected clients(not just currentUser)
      io.emit("onlineUsers", onlineUserList);
      //use socket.broadcast.emit()-send to all clients except sender.

      //Debug lo after disconnect
      console.log(`Updated Online Users Map:`);
      for (const [id, sock] of onlineUsers.entries()) {
        console.log(`${id}->${sock}`);
      }
    });
  });
};

export default socketHandler;
export { onlineUsers };
