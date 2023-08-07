import { useEffect, useRef ,useCallback} from 'react';
import Pusher from 'pusher-js';

const usePusher = (chatId) => {
  const pusher = useRef(null);
  const channel = useRef(null);
  Pusher.logToConsole = true;

  useEffect(() => {
    try {
      pusher.current = new Pusher('b2a6cca875e0b6231687', {
        cluster: 'ap2',
        debug: true,
      });

      if (!pusher.current.connection.state === 'connected') {
        console.warn('Pusher connection is not in a "connected" state. Events may not work as expected.');
      }

      channel.current = pusher.current.subscribe(`chat.${chatId}`);
    } catch (error) {
      console.error('Error creating Pusher instance:', error);
    }

    return () => {
      try {
        if (pusher.current && channel.current) {
          pusher.current.unsubscribe(channel.current.name);
        }
      } catch (error) {
        console.error('Error unsubscribing from Pusher channel:', error);
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

  const bindReadReceipt = useCallback((callback) => {
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
  }, [chatId]);

  const bindUserTyping = (callback) => {
    channel.current.bind('UserTyping', (data) => {
      console.log('UserTyping event data: ', data);
      callback(data);
    });
  };

  return { bindMessageSent, bindReadReceipt, bindUserTyping };
};

export default usePusher;
