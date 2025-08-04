import { useEffect, useState } from "react";
//useEffect-fetchs all users on modal open
//useState-to store grpName,allUsers, and selectedUserIds

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Typography,
} from "@mui/material";

import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreateRoom = ({ open, onClose, currentUserId, socket }) => {
  const [grpName, setGrpName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  //fetch all users on modal open
  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/users`);
        console.log(res.data);

        //exclude current user from list(we'll add him manually)
        const filtered = res.data.filter((user) => user._id !== currentUserId);
        setAllUsers(filtered);
      } catch (error) {
        console.error(`Failed to fetch users:`, error.message);
      }
    };

    fetchUsers();
  }, [open, currentUserId]);

  //handle checkbox toggle
  const handleToggle = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    //first close modal
    onClose();

    const participants = Array.from(
      new Set(
        [...selectedUserIds, currentUserId]
          .map((id) => id?.trim())
          .filter(Boolean)
      )
    );

    if (grpName.trim() === "" || participants.length === 0) return;

    try {
      const res = await axios.post(`${BACKEND_URL}/api/rooms/createGrp`, {
        isGroup: true,
        grpName,
        participants: participants,
        lastActivityAt: Date.now(),
      });

      const roomId = res.data.roomId;

      //Emit to all participants
      socket.emit("roomCreated", { roomId, participants });
      onClose();
    } catch (error) {
      console.error(`Group room creation failed:`, error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Group Chat</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Group Name"
          value={grpName}
          onChange={(e) => setGrpName(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        ></TextField>

        <Typography variant="subtitle1">Select Participants</Typography>
        <FormGroup>
          {allUsers.map((user) => (
            <FormControlLabel
              key={user._id}
              control={
                <Checkbox
                  checked={selectedUserIds.includes(user._id)}
                  onChange={() => handleToggle(user._id)}
                ></Checkbox>
              }
              label={user.userName}
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoom;
