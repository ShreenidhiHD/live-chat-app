import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const usePusher = (chatId) => {
  const pusher = useRef(null);
  const channel = useRef(null);

  useEffect(() => {
    pusher.current = new Pusher('63ec3433f5f1ad17bcb5', {
      cluster: 'ap2',
      debug: true,
    });
    channel.current = pusher.current.subscribe(`chat.${chatId}`);

    return () => {
      if (pusher.current && channel.current) {
        pusher.current.unsubscribe(channel.current.name);
      }
    };
  }, [chatId]);

  const bindMessageSent = (callback) => {
    channel.current.bind('message.sent', callback);
  };

  const bindReadReceipt = (callback) => {
    channel.current.bind('ReadReceipt', callback);
  };

  const bindUserTyping = (callback) => {
    channel.current.bind('UserTyping', callback);
  };

  return { bindMessageSent, bindReadReceipt, bindUserTyping };
};

export default usePusher;
