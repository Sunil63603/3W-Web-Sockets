// 3W-Web-Sockets/frontend/src/context/ChatContext.js
import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
