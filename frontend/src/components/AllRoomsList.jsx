//react imports
import { useEffect, useState } from "react";

//axios imports
import axios from "axios";

//MUI imports
import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  Snackbar,
  Button,
} from "@mui/material";

//socket import
import { socket } from "../socket.js";

//context import
import { useChat } from "../context/ChatContext.js";

//component imports
import CreateRoom from "./CreateRoom.jsx";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AllRoomsList = () => {
  //state to store list of all rooms from backend
  const [rooms, setRooms] = useState([]);

  //snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [openModal, setOpenModal] = useState(false); //createGroup modal

  //access gloal chat context for active room and online users
  const { onlineUsers, setActiveRoomId, setMessages } = useChat();

  //Get current user ID from context.
  const currentUserId = onlineUsers.find(
    (u) => u.userName === localStorage.getItem("userName")
  )?.userId;

  //fetch rooms from backend when component mounts
  let fetchRooms;
  useEffect(() => {
    fetchRooms = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/rooms/all`);
        setRooms(res.data); //Update local state with fetched rooms
      } catch (error) {
        console.error(`Failed to fetch rooms:`, error.message);
      }
    };

    fetchRooms();
  }, []);

  //Listen to join confirmation from backend
  useEffect(() => {
    socket.on("room:joined", () => {
      setOpenSnackbar(true);
    });
    socket.on("roomCreated", ({ roomId, participants }) => {
      console.log(participants);
      fetchRooms();
    }); //re-fetch rooms when new room is created.

    return () => {
      socket.off("room:joined");
      socket.off("roomCreated");
    };
  }, []);

  //called when user clicks a room.
  const handleRoomClick = async (room) => {
    const myUserName = localStorage.getItem("userName"); //get current userName from localStorage.
    if (!myUserName) return;

    //find myUserId using onlineUsers
    const myUserId = onlineUsers.find((u) => u.userName === myUserName)?.userId; //Extract current user's ID.

    //Emit joinRoom socket event with necessary data
    socket.emit("joinRoom", {
      roomId: room._id,
      userId: myUserId,
      isGroup: room.isGroup,
    });

    setActiveRoomId(room._id);

    //fetch messages of current room and update 'messages'(in context using setMessages).
    try {
      const res = await axios.get(`${BACKEND_URL}/api/messages/${room._id}`);
      setMessages(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(`Failed to fetch messages:`, err.message);
    }
  };

  return (
    <Box>
      <Box className="d-flex justify-content-between align-items-center">
        <Typography variant="h6" gutterBottom>
          Chats
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOpenModal(true)}
        >
          Create Room
        </Button>
      </Box>

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

      {/* Snackbar for confirmation */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="joined room successfuly"
      ></Snackbar>

      {/* Modal for creating group room */}
      <CreateRoom
        open={openModal}
        onClose={() => setOpenModal(false)}
        currentUserId={currentUserId}
        socket={socket}
      ></CreateRoom>
    </Box>
  );
};

export default AllRoomsList;
