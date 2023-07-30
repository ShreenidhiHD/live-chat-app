import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const usePusher = (chatId) => {
  const pusher = useRef(null);
  const channel = useRef(null);
  Pusher.logToConsole = true;
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
    channel.current.bind('message.sent', (data) => {
      console.log('message.sent event data: ', data);
      callback(data);
    });
    
    return () => {
      channel.current.unbind('message.sent', callback);
    };
  };

  const bindReadReceipt = (callback) => {
    console.log("Binding ReadReceipt event for channel: ", channel.current);
    channel.current.bind('ReadReceipt', (data) => {
      console.log('ReadReceipt event data: ', data);
      const { messageId, seen } = data;
      console.log(`MessageId: ${messageId}, Seen: ${seen}`);
      callback({ messageId, seen });
    });
    return () => {
      channel.current.unbind('ReadReceipt', callback);
    };
  };
  

  const bindUserTyping = (callback) => {
    channel.current.bind('UserTyping', (data) => {
      console.log('UserTyping event data: ', data);
      callback(data);
    });
  };

  return { bindMessageSent, bindReadReceipt, bindUserTyping };
};

export default usePusher;
