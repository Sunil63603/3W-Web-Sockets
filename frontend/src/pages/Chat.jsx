//React imports
import { useEffect, useState } from "react"; //useEffect-whenever userName changes-->connect to socket-->emit register event-->on logout disconnect socket.
import { useNavigate } from "react-router-dom"; //on log-out, redirect user back to login page.

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
  Paper,
  Snackbar,
} from "@mui/material";

//socket.io-client instance from socket.js file
import { socket } from "../socket.js"; //server URL
//provides methods like connect,on,emit,off,disconnect

//for API requests
import axios from "axios";

//component imports
import AllRoomsList from "../components/AllRoomsList.jsx"; //left column
import { RightChatUI } from "../components/RightChatUI.jsx"; //right column

//context imports
import { useChat } from "../context/ChatContext.js";

//used to fetch existing rooms for Backend.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Chat = ({ userName, setUserName }) => {
  //used to display notifications
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate(); //navigate back to login-page on clicking log-out button

  const {
    setMyUserId,
    onlineUsers,
    setOnlineUsers,
    selectedUserId,
    setSelectedUserId,
    setSelectedUser,
    setActiveRoomId,
    setMessages,
    setMessageInput,
    setRoomDetails,
  } = useChat();

  //executes when userName changes
  useEffect(() => {
    //connect to socket server
    if (!socket.connected) {
      socket.connect(); //while using web-sockets, connect with socket server
    }

    //Emit "register" with userName once connected.
    socket.emit("register", { userName });
    //backend can identify the user, update their socketId(null-->generated socketId) and track them as online
    //And backend will emit "registered" event after successful login

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

  //Listen to login confirmation from backend
  useEffect(() => {
    socket.on("registered", (userId, userName) => {
      setOpenSnackbar(true); //use MUI toast notification component
    });

    //Get current user's userId from onlineUsers List.
    //this 'myUserId' is used in many files, so store this in context
    const myUserId = onlineUsers.find((u) => {
      console.log(u.userName, typeof u.userName);
      console.log(userName, typeof userName);
      return u.userName === userName;
    })?.userId;
    setMyUserId(myUserId);

    return () => socket.off("registered");
  }, []);

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

    //clear details of previously selected room(group)
    setRoomDetails(null);

    //Find full user Object from online users List.
    const user = onlineUsers.find((u) => u.userId === targetUserId);
    setSelectedUser(user); //save selected user for UI rendering.

    //Get current user's userId from onlineUsers List.
    //this 'myUserId' is used in many files, so store this in context
    const myUserId = onlineUsers.find((u) => {
      return u.userName === userName;
    })?.userId;

    setMessages([]); //clear messages[] from any previous selected chat room.
    setMessageInput("");

    try {
      //call backend to check if room already exists between current user and selected user.
      const res = await axios.get(`${BACKEND_URL}/api/rooms/existing`, {
        params: { user1: myUserId, user2: targetUserId },
      });
      //404 error if theres no existing room

      //if room exists, store roomId and emit joinRoom event to backend.
      if (res.data?.roomId) {
        setActiveRoomId(res.data.roomId);
        socket.emit("joinRoom", {
          roomId: res.data.roomId,
          userId: myUserId,
          isGroup: false,
        });

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
      {/* Snackbar for confirmation */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Log In Successful"
      ></Snackbar>

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
