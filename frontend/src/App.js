//React imports
import React, { useState, useEffect } from "react"; //state is to store userName, useEffect is to get 'userName' from localStorage.
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

//page imports
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";

//global context
import { ChatProvider } from "./context/ChatContext.js";

const App = () => {
  //Its not possible to use variables from context.So, i am creating local state variable
  const [userName, setUserName] = useState(""); //store logged-in userName

  //load userName from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem("userName");
    if (stored) setUserName(stored); //update local state variable.
    else setUserName("");
  }, []); //runs on initial load

  return (
    <ChatProvider>
      <Router>
        <Routes>
          {/*Redirect '/' to '/login'  */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login page:only show if not already logged in */}
          <Route
            path="/login"
            element={
              userName ? (
                <Navigate to="/chat" replace />
              ) : (
                <Login setUserName={setUserName} />
              )
            }
          />

          {/* Chat page:only accessible if logged in */}
          <Route
            path="/chat"
            element={
              userName ? (
                <Chat userName={userName} setUserName={setUserName} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ChatProvider>
  );
};

export default App;
