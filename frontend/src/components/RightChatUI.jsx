//react imports
import { useState, useRef, useEffect } from "react";

//MUI imports
import {
  Paper,
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { Send } from "@mui/icons-material";

//axios import
import axios from "axios";

//socket imports
import { socket } from "../socket.js";

//global context
import { useChat } from "../context/ChatContext";

//component imports
import RoomOnlineUsersDialog from "./RoomOnlineUsersDialog.jsx";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const RightChatUI = ({ userName, setUserName }) => {
  //Ref to scroll to bottom in Chat interface when messages overflow.
  const messagesEndRef = useRef(null); //Ref to scroll to bottom.

  const [openDialog, setOpenDialog] = useState(false);
  const [roomOnlineUsers, setRoomOnlineUsers] = useState([]);

  const {
    onlineUsers,
    selectedUserId,
    selectedUser,
    activeRoomId,
    setActiveRoomId,
    messages,
    setMessages,
    messageInput,
    setMessageInput,
    setSelectedUser,
    roomDetails,
    setRoomDetails,
  } = useChat();

  //Auto-scroll to bottom when messages change.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //fetch room infor when activeRoomId changes.
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/rooms/${activeRoomId}`);
        setRoomDetails(res.data);
        setSelectedUser(null);
      } catch (error) {
        console.error("Failed to load room details:", error.message);
        setRoomDetails(null);
      }
    };

    if (activeRoomId) {
      fetchRoomDetails();
    } else {
      setRoomDetails(null);
    }
  }, [activeRoomId]);

  useEffect(() => {
    socket.on("chatMessage", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => socket.off("chatMessage");
  }, [setMessages]);

  useEffect(() => {
    const handleRoomJoined = ({ room }) => {
      if (room) setRoomDetails(room);
    };
    socket.on("room:joined", handleRoomJoined);
    return () => socket.off("room:joined", handleRoomJoined);
  }, [setRoomDetails]);

  const handleOneOneSendMessage = async () => {
    if (!messageInput.trim()) return;

    let roomId = activeRoomId;
    const myUserId = onlineUsers.find((u) => u.userName === userName)?.userId;

    //Create room if it doesnt exist yet.
    if (!roomId) {
      try {
        const res = await axios.post(`${BACKEND_URL}/api/rooms/create`, {
          participants: [myUserId, selectedUserId],
        });

        roomId = res.data.roomId;
        setActiveRoomId(roomId);
      } catch (error) {
        console.log(`Room creation failed:`, error.message);
        return;
      }
    }

    //emit message to socket
    const message = {
      roomId,
      sender: myUserId,
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    socket.emit("chatMessage", message);

    //optimistically update local message list
    setMessages((prev) => [...prev, message]);
    setMessageInput("");
  };

  const handleGrpSendMsg = () => {
    if (!messageInput.trim()) return;

    const userName = localStorage.getItem("userName");
    const myUserId = onlineUsers.find((u) => u.userName === userName)?.userId;
    if (!myUserId) return;

    const messageData = {
      roomId: activeRoomId,
      sender: myUserId,
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    socket.emit("chatMessage", messageData);
    setMessageInput("");
  };

  //Open dialog and filter online users in this room
  const handleOpenOnlineUsers = () => {
    if (!roomDetails) return;
    const filtered = onlineUsers.filter((user) =>
      roomDetails.participants.includes(user.userId)
    );

    console.log(roomDetails.participants);
    console.log(onlineUsers);

    setRoomOnlineUsers(filtered);
    setOpenDialog(true);
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* 1-1 interface */}
        {selectedUser && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderBottom: "1px solid #ddd",
              }}
            >
              <Avatar>{selectedUser.userName.charAt(0).toUpperCase()}</Avatar>
              <Typography variant="h6">{selectedUser.userName}</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <Typography key={idx} variant="body2" gutterBottom>
                    <strong>
                      {msg.sender ===
                      onlineUsers.find((u) => u.userName === userName)?.userId
                        ? "Me"
                        : selectedUser.userName}
                      :
                    </strong>{" "}
                    {msg.content}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Start chatting with {selectedUser.userName}
                </Typography>
              )}
              <div ref={messagesEndRef}></div>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                p: 2,
                borderTop: "1px solid #ddd",
              }}
            >
              <TextField
                fullWidth
                multiline
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              ></TextField>
              <IconButton color="primary" onClick={handleOneOneSendMessage}>
                <Send />
              </IconButton>
            </Box>
          </>
        )}

        {/* Chat Header */}
        {roomDetails && (
          <>
            <Box sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
              <Typography variant="h6">
                {roomDetails.isGroup ? roomDetails.grpName : "1-1 Chat"}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenOnlineUsers}
              >
                Show Online Users
              </Button>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <Typography key={idx} variant="body2" gutterBottom>
                    <strong>{msg.sender?.userName}:</strong>
                    {msg.content}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No messages yet
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                p: 2,
                borderTop: "1px solid #ddd",
              }}
            >
              <TextField
                fullWidth
                multiline
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <IconButton color="primary" onClick={handleGrpSendMsg}>
                <Send />
              </IconButton>
            </Box>

            {/* Online Users Dialog */}
            <RoomOnlineUsersDialog
              open={openDialog}
              handleClose={() => setOpenDialog(false)}
              onlineUsers={roomOnlineUsers}
            />
          </>
        )}
      </Paper>
    </>
  );
};
