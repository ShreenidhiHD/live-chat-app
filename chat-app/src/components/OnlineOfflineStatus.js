import React, { useState } from 'react';
import { Box } from '@mui/material';

const OnlineOfflineStatus = () => {
  // Initial status can be 'offline'
  const [status, setStatus] = useState('offline');

  // Function to change status to online
  const setOnline = () => {
    setStatus('online');
  }

  // Function to change status to offline
  const setOffline = () => {
    setStatus('offline');
  }

  return (
    <Box
      sx={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: status === 'online' ? 'green' : 'grey',
      }}
    >
      {/* This box represents the status dot */}
    </Box>
  );
};

export default OnlineOfflineStatus;
