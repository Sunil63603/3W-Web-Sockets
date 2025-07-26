//React imports
import React, { useState, useEffect } from "react"; //state is to store userName, useEffect is to get 'userName' from localStorage.
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";

const App = () => {
  const [userName, setUserName] = useState(""); //store logged-in userName

  //load userName from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem("userName");
    if (stored) setUserName(stored);
  }, []);

  return (
    <Router>
      <Routes>
        {/*Redirect / to /login  */}
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
              <Chat userName={userName} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
