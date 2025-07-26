// entry point for backend

//import required packages
import express from "express"; //express framework
import cors from "cors"; //For handling Cross-origin requests
import dotenv from "dotenv"; //to load variables from .env

//import custom MongoDB connection function
import connectDB from "./config/db.js";

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

//start listening on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀server is running on port ${PORT}`);
});
