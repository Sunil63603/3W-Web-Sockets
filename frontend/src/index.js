//React and ReactDOM libraries
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

//createRoot() is used to create React root element
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
