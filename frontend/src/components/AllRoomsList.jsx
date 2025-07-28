//react imports
import React, { useEffect, useState } from "react";

//axios imports
import axios from "axios";

//MUI imports
import { Box, Paper, Typography, Stack, Avatar } from "@mui/material";

//socket import
import { socket } from "../socket.js";

//context import
import { useChat } from "../context/ChatContext.js";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AllRoomsList = () => {
  //state to store list of all rooms from backend
  const [rooms, setRooms] = useState([]);

  //access gloal chat context for active room and online users
  const { onlineUsers, setActiveRoomId } = useChat();

  //fetch rooms from backend when component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/rooms/all`);
        setRooms(res.data); //Update local state with fetched rooms
      } catch (error) {
        console.error(`Failed to fetch rooms:`, error.message);
      }
    };

    fetchRooms();
  }, []);

  //called when user clicks a room.
  const handleRoomClick = (room) => {
    const myUserName = localStorage.getItem("userName"); //get current userName from localStorage.
    if (!myUserName) return;

    //find myUserId using onlineUsers
    const myUserId = onlineUsers.find((u) => u.userName === myUserName)?.userId; //Extract current user's ID.

    //Emit joinRoom socket event with necessary data
    socket.emit("joinRoom", {
      roomId: room._id,
      myUserId,
      isGroup: room.isGroup,
    });

    setActiveRoomId(room._id);
  };

  return (
    <Box>
      {/* Loop through all rooms and render each as a chat card */}
      <Stack spacing={2}>
        {rooms.map((room) => (
          <Paper
            key={room._id}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => handleRoomClick(room)}
          >
            {/* Placeholder avatar(first letter of groupName or "1-1") */}
            <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
              {room.isGroup
                ? room.grpName?.charAt(0).toUpperCase() || "G"
                : "1"}
            </Avatar>

            <Box>
              {/* Group name or fallback */}
              <Typography variant="subtitle1">
                {room.isGroup ? room.grpName : "1-1 Chat"}
              </Typography>
              {/* <Typography variant="caption" color="text.secondary">
                Room ID:{room._id}
              </Typography> */}
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default AllRoomsList;
