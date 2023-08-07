import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import NotificationPusher from '../services/NotificationPusher';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OnlineOfflineStatus = ({ user }) => {
  const userId = user.id;
  const userName= user.name;
  const [status, setStatus] = useState(user.status);
  const { bindSessionChanged } = NotificationPusher(userId);
  
  useEffect(() => {
    const unbindSessionChanged = bindSessionChanged((data) => {
      console.log("Setting status to", data.status);
      setStatus(data.status);
      // toast(`${userName}: Status changed to ${data.status}`);
    });
    
    return () => unbindSessionChanged();
  }, [userId, bindSessionChanged, userName]);
  

  return (
    <div>
      <Box
        sx={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: status === 'online' ? 'green' : 'grey',
        }}
      ></Box>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default OnlineOfflineStatus;
