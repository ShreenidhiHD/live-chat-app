// ClearChatButton.js
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ClearChatButton = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleChatClear = () => {
   
    setShowPopup(false);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleButtonClick}>
        Clear Chat
      </Button>
      <Dialog open={showPopup} onClose={handlePopupClose}>
        <DialogTitle>Clear Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear the chat?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePopupClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleChatClear} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClearChatButton;
