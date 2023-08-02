import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const Typing = ({ chatId }) => {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Function to handle the 'typing' event
    const handleTyping = (data) => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    };

    // Check if the pusherService is available and has a subscribe method
    if (typeof window.pusherService === 'object' && typeof window.pusherService.subscribe === 'function') {
      // Subscribe to the 'typing' event within the current chat
      window.pusherService.subscribe(chatId, 'typing', handleTyping);

      // Clean up function to unsubscribe from the channel when the component unmounts
      return () => {
        window.pusherService.unsubscribe(chatId, 'typing', handleTyping);
      };
    } else {
      console.warn("Pusher service not available. Typing feature won't work.");
    }
  }, [chatId]);

  return (
    <Box>
      {isTyping && <Typography variant="body2">User is typing...</Typography>}
    </Box>
  );
};

export default Typing;
