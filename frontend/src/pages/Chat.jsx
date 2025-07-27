//React imports
import React, { useEffect } from "react"; //useEffect-whenever userName changes-->connect to socket-->emit register event-->disconnect socket
import { useNavigate } from "react-router-dom"; //on log-out, redirect user back to login page

//MUI imports
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

//socket.io-client instance from socket.js file
import { socket } from "../socket.js";

//❌receives userName from App.js. Move this to context.
const Chat = ({ userName }) => {
  const navigate = useNavigate(); //navigate back to login-page on clicking log-out button

  useEffect(() => {
    //connect to socket server
    if (!socket.connected) {
      socket.connect();
    }

    //Emit "register" with userName once connected.
    socket.emit("register", { userName });
    //backend can identify the user, update their socketId and track them as online

    //Clean up socket on component unmount
    return () => {
      socket.disconnect(); //backend will remove user from 'online' users and broadcast.
    };
  }, [userName]); //when userName changes

  //Logout handler:clear storage,disconnect socket,redirect
  const handleLogout = () => {
    localStorage.removeItem("userName"); //clear userName.
    socket.disconnect(); //Disconnect socket.
    navigate("/login");
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

      {/* Placeholder UI */}
      <Box className="p-3">
        <Typography variant="h5">Welcome, {userName}</Typography>
        <Typography variant="body1">
          (User list and chat layout coming soon)
        </Typography>
      </Box>
    </>
  );
};

export default Chat;
