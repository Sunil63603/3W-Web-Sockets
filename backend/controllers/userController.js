import User from "../models/User.js";

//controller:fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(`Error fetching users:`, error.message);
    res.status(500).json({ message: "Server error" });
  }
};
