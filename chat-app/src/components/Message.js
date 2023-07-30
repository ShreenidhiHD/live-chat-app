import React from 'react';
import { Box, Typography } from '@mui/material';

const Message = ({ message, user, seen }) => {
  const isUserMessage = message && user && message.sender.id === user.curid;

  const messageStyles = {
    p: 2, 
    m: 1, 
    bgcolor: isUserMessage ? '#1976d2' : '#f5f5f5', 
    color: isUserMessage ? '#ffffff' : '#212121', 
    borderRadius: '16px', 
    maxWidth: '50%', 
    position: 'relative'
  };

  if (!message) {
    return (
      <Box sx={{display: 'flex', justifyContent: isUserMessage ? 'flex-end' : 'flex-start'}}>
        <Box sx={messageStyles}>
          <Typography variant="body2" component="p">
            Welcome to chat! Hey, how can I help you?
          </Typography>
          <Box sx={{ textAlign: 'right', mt: 1, opacity: 0.7 }}>
            <Typography variant="caption">
              {new Date().toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  const { content, created_at } = message;
  const messageBgColor = isUserMessage ? '#1976d2' : '#f5f5f5';
  const textColor = isUserMessage ? '#ffffff' : '#212121';

  return (
    <Box sx={{display: 'flex', justifyContent: isUserMessage ? 'flex-end' : 'flex-start'}}>
      <Box sx={{ ...messageStyles, bgcolor: messageBgColor, color: textColor }}>
        <Box sx={{ textAlign: 'right', opacity: 0.7}}>
          <Typography variant="caption">
            {message.sender.name}
          </Typography>
        </Box>
        <Typography variant="body2" component="p">
          {content}
        </Typography>
        <Box sx={{ textAlign: 'right', mt: 1, opacity: 0.7 }}>
          <Typography variant="caption">
            {new Date(created_at).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="white">
            {seen === undefined ? 'Sending...' : seen ? 'Seen' : 'Delivered'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Message;
