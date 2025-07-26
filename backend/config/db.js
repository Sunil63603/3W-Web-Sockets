import mongoose from "mongoose"; //Object document mapper
import dotenv from "dotenv"; //load env variables

dotenv.config(); //Load environment variables from .env file

//Async function to connect to MongoDB Atlas
const connectToDB = async () => {
  try {
    //connect using MONGO_URI from .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, //Use new URL string parser
      useUnifiedTopology: true, //use new server discovery and monitoring engine
    });
    console.log(`✅MongoDB connected successfully`);
  } catch (error) {
    console.error(`❌MongoDB connection error:`, error.message);
    process.exit(1); //Exit process with failure
  }
};

//export the function using ES module syntax
export default connectToDB;
