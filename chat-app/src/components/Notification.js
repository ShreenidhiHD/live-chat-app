import React, { useEffect, useState } from 'react';
import { Badge } from '@mui/material';
import PusherService from '../services/pusherService';

const Notification = ({ chatId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const pusherService = new PusherService();

  useEffect(() => {
    const handleNewMessage = (data) => {
      setUnreadCount(prevCount => prevCount + 1);
    };

    pusherService.subscribe(chatId, 'new-message', handleNewMessage);

    return () => {
      pusherService.unsubscribe(chatId, 'new-message', handleNewMessage);
    };
  }, [chatId, pusherService]);

  return (
    <Badge badgeContent={unreadCount} color="primary" />
  );
};

export default Notification;
