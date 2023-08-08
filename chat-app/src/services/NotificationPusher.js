import { useEffect, useRef ,useCallback} from 'react';
import Pusher from 'pusher-js';

const NotificationPusher = (userId) => {
  const pusher = useRef(null);
  const channel = useRef(null);
  Pusher.logToConsole = false;
  const isBoundRef = useRef(false);
  useEffect(() => {
    try {
      pusher.current = new Pusher('b2a6cca875e0b6231687', {
        cluster: 'ap2',
        debug: false,
      });

      if (!pusher.current.connection.state === 'connected') {
        console.warn('Pusher connection is not in a "connected" state. Events may not work as expected.');
      }

      channel.current = pusher.current.subscribe(`user.${userId}`);
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
  }, [userId]);




  const bindSessionChanged = useCallback((callback) => {
    console.log("Binding to App\\Events\\SessionChanged");
  
    channel.current.bind('App\\Events\\SessionChanged', (data) => {
      console.log(' event data: ', data);
      callback(data);
    });
  
    return () => {
      console.log("Unbinding from App\\Events\\SessionChanged");
      channel.current.unbind('App\\Events\\SessionChanged', callback);
    };
  }, []);
  

  return { bindSessionChanged };
};

export default NotificationPusher;
