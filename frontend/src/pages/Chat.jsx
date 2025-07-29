//React imports
import React, { useRef, useEffect } from "react"; //useEffect-whenever userName changes-->connect to socket-->emit register event-->disconnect socket
import { useNavigate } from "react-router-dom"; //on log-out, redirect user back to login page

//MUI imports
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Avatar,
  Stack,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";

//socket.io-client instance from socket.js file
import { socket } from "../socket.js";

import axios from "axios";

//component imports
import AllRoomsList from "../components/AllRoomsList.jsx";

//context imports
import { useChat } from "../context/ChatContext.js";
import { RightChatUI } from "../components/RightChatUI.jsx";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

//❌receives userName from App.js. Move this to context.
const Chat = ({ userName, setUserName }) => {
  const navigate = useNavigate(); //navigate back to login-page on clicking log-out button

  const {
    onlineUsers,
    setOnlineUsers,
    selectedUserId,
    setSelectedUserId,
    setSelectedUser,
    setActiveRoomId,
    setMessages,
    setMessageInput,
    roomDetails,
    setRoomDetails,
  } = useChat();

  useEffect(() => {
    //connect to socket server
    if (!socket.connected) {
      socket.connect();
    }

    //Emit "register" with userName once connected.
    socket.emit("register", { userName });
    //backend can identify the user, update their socketId and track them as online

    //Listen for onlineUsers event(updated onlineUsers)
    socket.on("onlineUsers", (userList) => {
      setOnlineUsers(userList); //Update online users list from backend
    });

    //Clean up socket on component unmount
    return () => {
      socket.off("onlineUsers");
      socket.disconnect(); //backend will remove user from 'online' users and broadcast.
    };
  }, [userName]); //when userName changes

  //Logout handler:clear storage,disconnect socket,redirect
  const handleLogout = () => {
    localStorage.removeItem("userName"); //clear userName.
    setUserName("");
    socket.disconnect(); //Disconnect socket.
    navigate("/login");
  };

  //handle selecting a user from active online users dropdown.
  const handleSelectUser = async (targetUserId) => {
    setSelectedUserId(targetUserId); //update local state for dropdown.
    setRoomDetails(null);

    //Find full user Object from online users List.
    const user = onlineUsers.find((u) => u.userId === targetUserId);
    setSelectedUser(user); //save selected user for UI rendering.

    setMessages([]); //clear messages[] from any previous selected chat room.
    setMessageInput("");

    try {
      //Get current user's userId from onlineUsers List.
      const myUserId = onlineUsers.find((u) => u.userName === userName)?.userId;

      //call backend to check if room already exists between current user and selected user.
      const res = await axios.get(`${BACKEND_URL}/api/rooms/existing`, {
        params: { user1: myUserId, user2: targetUserId },
      });

      //if room exists, store roomId and emit joinRoom event to backend.
      if (res.data?.roomId) {
        setActiveRoomId(res.data.roomId);
        socket.emit("joinRoom", res.data.roomId);

        //fetch message history
        const msgRes = await axios.get(
          `${BACKEND_URL}/api/messages?roomId=${res.data.roomId}`
        );
        setMessages(msgRes.data || []);
      } else {
        //If no room exists yet, prepare chat UI but do not emit anything yet
        setActiveRoomId(null);
      }
    } catch (error) {
      console.log(`Room not found or error:`, error.message);
      setActiveRoomId(null); //fallback in case of failure
    }
  };

  return (
    <>
      {/* Top AppBar with Logout */}
      <AppBar position="static" color="primary">
        <Toolbar className="d-flex justify-content-between">
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            3W sockets
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              backgroundColor: "red",
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Dropdown to select user */}
      <Box className="p-3">
        <Typography variant="h6">Welcome, {userName}👋</Typography>

        <FormControl fullWidth className="mt-4">
          <InputLabel>Select online User to Chat</InputLabel>
          <Select
            value={selectedUserId}
            label="Select User to Chat"
            onChange={(e) => handleSelectUser(e.target.value)}
          >
            {onlineUsers.map((user) => (
              <MenuItem key={user.userId} value={user.userId}>
                <Stack direction="row" spaing={2} alignItems="center">
                  {/* Emoji Avatar or icon */}
                  <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
                    {user.userName.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ marginLeft: 2 }}>
                      {user.userName}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "green",
                        marginLeft: 10,
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      Active
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/*Whatsapp-style layout*/}
      <Box sx={{ display: "flex", gap: 2, mt: 2, height: "70vh" }}>
        {/*Left Column:Chat Rooms sidebar - 30% width*/}
        <Box sx={{ width: "30%", flexShrink: 0 }}>
          <Paper
            elevation={3}
            sx={{
              height: "100%",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6">Chats</Typography>
            {/* Scrollable AllRoomsList */}
            <Box sx={{ flex: 1, overflowY: "auto", mt: 2 }}>
              <AllRoomsList></AllRoomsList>
            </Box>
          </Paper>
        </Box>

        {/* Right Column:Chat UI - 70% width */}
        <Box sx={{ width: "70%" }}>
          <RightChatUI
            userName={userName}
            setUserName={setUserName}
          ></RightChatUI>
        </Box>
      </Box>
    </>
  );
};

export default Chat;
