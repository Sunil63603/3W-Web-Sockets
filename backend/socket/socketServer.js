import { Server } from "socket.io"; //Socket.io server class
import socketHandler from "./index.js"; //Import custom socket event logic

//Function to initialize Socket.io and attach event listeners
const initializeSocket = (httpServer) => {
  //call this function in server.js by passing express server

  //create socket server using express server and both servers will run on same backend port.
  const io = new Server(httpServer, {
    cors: {
      origin: "*", //Allow all origins
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //Log that socket server is active
  console.log(`✅Socket.io server is running...`);

  //Handle all socket events(register,disconnect, ...etc)
  socketHandler(io);
};

export default initializeSocket;
