import User from "../models/User"; //Import User model to interact with DB.

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
          user = await User.create({ userName, socketId: socket.id });
        }

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
        io.emit("users:update", onlineUserList);
        //use socket.broadcast.emit()-send to all clients except sender.
      } catch (error) {
        console.error("❌Error in register event:", error.message);
        socket.emit("register:error", { message: "Registration Failed" });
      }
    });

    //Disconnect handler will go here later(4.5)
  });
};

export default socketHandler;
export { onlineUsers };
