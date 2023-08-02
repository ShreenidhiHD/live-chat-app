import React from 'react';
import { Toolbar, Typography } from '@mui/material';

const ChatToolbar = ({ chatId, chats }) => {
  return (
    <Toolbar variant="dense" sx={{ backgroundColor: '#f0f0f0' }}>
      <Typography variant="h6">
        {chats.find(chat => chat.id === chatId)?.customer.name}
      </Typography>
    </Toolbar>
  );
}

export default ChatToolbar;
