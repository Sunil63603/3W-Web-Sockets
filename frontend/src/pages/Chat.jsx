//React imports
import React, { useState, useRef, useEffect } from "react"; //useEffect-whenever userName changes-->connect to socket-->emit register event-->disconnect socket
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
  Grid,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import { Send } from "@mui/icons-material";

//socket.io-client instance from socket.js file
import { socket } from "../socket.js";

import axios from "axios";

//❌receives userName from App.js. Move this to context.
const Chat = ({ userName, setUserName }) => {
  const navigate = useNavigate(); //navigate back to login-page on clicking log-out button

  const [onlineUsers, setOnlineUsers] = useState([]); //stores all online users received from server.
  const [selectedUserId, setSelectedUserId] = useState(""); //selected userId from dropdown

  const [selectedUser, setSelectedUser] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);

  const [messages, setMessages] = useState([]); //messages of active chat Room.
  const [messageInput, setMessageInput] = useState(""); //controlled element

  //Ref to scroll to bottom in Chat interface when messages overflow.
  const messagesEndRef = useRef(null); //Ref to scroll to bottom.

  useEffect(() => {
    //connect to socket server
    if (!socket.connected) {
      socket.connect();
    }

    //Emit "register" with userName once connected.
    socket.emit("register", { userName });
    //backend can identify the user, update their socketId and track them as online

    //Listen for users:update event(updated onlineUsers)
    socket.on("users:update", (userList) => {
      setOnlineUsers(userList); //Update online users list from backend
    });

    //Clean up socket on component unmount
    return () => {
      socket.off("users:update");
      socket.disconnect(); //backend will remove user from 'online' users and broadcast.
    };
  }, [userName]); //when userName changes

  //Auto-scroll to bottom when messages change.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    //Find full user Object from online users List.
    const user = onlineUsers.find((u) => u.userId === targetUserId);
    setSelectedUser(user); //save selected user for UI rendering.

    setMessages([]); //clear messages[] from any previous selected chat room.
    setMessageInput("");

    try {
      //Get current user's userId from onlineUsers List.
      const myUserId = onlineUsers.find((u) => u.userName === userName)?.userId;

      //call backend to check if room already exists between current user and selected user.
      const res = await axios.get(`/api/rooms/existing`, {
        params: { user1: myUserId, user2: targetUserId },
      });

      //if room exists, store roomId and emit joinRoom event to backend.
      if (res.data?.roomId) {
        setActiveRoomId(res.data.roomId);
        socket.emit("joinRoom", res.data.roomId);

        //fetch message history
        const msgRes = await axios.get(
          `/api/messages?roomId=${res.data.roomId}`
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

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
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

      {selectedUser && (
        <Box className="p-3">
          <Typography variant="h6">
            Chat with : {selectedUser.userName}
          </Typography>
          {activeRoomId ? (
            <Typography variant="body2" color="green">
              ✅Joined Room : {activeRoomId}
            </Typography>
          ) : (
            <Typography variant="body2" color="gray">
              No room yet.Start chatting to create one.
            </Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default Chat;
