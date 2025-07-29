import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const RoomOnlineUsersDialog = ({ open, handleClose, onlineUsers }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Online Users in Room</DialogTitle>
      <DialogContent>
        <List>
          {onlineUsers.map((user) => (
            <ListItem key={user.userId}>
              <ListItemText primary={user.userName}></ListItemText>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default RoomOnlineUsersDialog;
