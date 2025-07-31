// 3W-Web-Sockets/frontend/src/context/ChatContext.js
import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [userName, setUserName] = useState("");
  const [myUserId, setMyUserId] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [roomDetails, setRoomDetails] = useState(null);

  return (
    <ChatContext.Provider
      value={{
        myUserId,
        setMyUserId,
        userName,
        setUserName,
        onlineUsers,
        setOnlineUsers,
        selectedUserId,
        setSelectedUserId,
        selectedUser,
        setSelectedUser,
        activeRoomId,
        setActiveRoomId,
        messages,
        setMessages,
        messageInput,
        setMessageInput,
        roomDetails,
        setRoomDetails,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
