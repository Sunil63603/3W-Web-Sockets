//React imports
import React, { useState } from "react"; //to store userName from input(ie, controlled element)
import { useNavigate } from "react-router-dom"; //redirect to 'chat interface' on successful login

//MUI imports
import { TextField, Button, Container, Typography, Box } from "@mui/material";

//Bootstrap imports
import "bootstrap/dist/css/bootstrap.min.css";

//why is this component receiving this 'setUserName'. Where is it receiving from? why not contextAPI ?
const Login = ({ setUserName }) => {
  const [inputName, setInputName] = useState(""); //store form input.
  const navigate = useNavigate(); //for navigation

  const handleSubmit = (e) => {
    e.preventDefault(); //prevent page reload.

    //store in localStorage and parent state.
    localStorage.setItem("userName", inputName);
    setUserName(inputName);

    //Navigate to chat page(socket connect + register will be done there).
    navigate("/chat");
  };

  return (
    <Container
      maxWidth="sm"
      className="d-flex vh-100 align-items-center justify-content-center"
    >
      <Box component="form" onSubmit={handleSubmit} className="w-100">
        <Typography variant="h4" gutterBottom align="center">
          Enter your userName
        </Typography>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          className="mb-3"
        />
        <Button fullWidth type="submit" variant="contained" colors="primary">
          Join chat
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
