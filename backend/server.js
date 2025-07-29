// entry point for backend

//import required packages
import express from "express"; //express framework
import cors from "cors"; //For handling Cross-origin requests
import dotenv from "dotenv"; //to load variables from .env
import http from "http"; //create HTTP server manually

//import custom MongoDB connection function
import connectDB from "./config/db.js";

//import Socket.io setup
import initializeSocket from "./socket/socketServer.js";

//route imports
import roomRoutes from "./routes/roomRoutes.js"; //Room-related API routes
import messageRoutes from "./routes/messageRoutes.js";

//Load environment variables from .env file
dotenv.config();

//Initialize Express app
const app = express(); //returns server instance

//enable CORS for frontendURL(stored in env file).
app.use(
  cors({
    //add CORS method as a middleware
    origin: process.env.FRONTEND_URL, //allow requests from frontend origin only
    methods: ["GET", "POST"],
    credentials: true,
  })
);

//middleware to parse JSON payloads in incoming requests
app.use(express.json());

//Connect to MongoDB using connectDB()
connectDB();

//Register room-related API endpoints.
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

//Create HTTP server and attach Express app to it.
const httpServer = http.createServer(app);

//Initialize and configure Socket.io
initializeSocket(httpServer);

//start listening on port 5000
const PORT = process.env.BACKEND_PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀server is running on port ${PORT}`);
});
