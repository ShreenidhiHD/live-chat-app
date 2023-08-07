import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import Grid from '@mui/material/Grid';
import { fetchUserData } from '../api/userApi';
import { fetchLatestChat, fetchMessages, createChat, sendMessage ,markMessageAsRead,notifyUserTyping} from '../api/chatApi';
import usePusher from '../services/pusherService';
import CircularProgress from '@mui/material/CircularProgress';
import debounce from 'lodash.debounce';


const UserChat = () => {
  const [user, setUserData] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const authToken = localStorage.getItem('authToken');
  const [messagesToMarkAsRead, setMessagesToMarkAsRead] = useState([]);
  const { bindMessageSent , bindReadReceipt} = usePusher(chatId);


  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUserData = await fetchUserData(authToken);
        setUserData(fetchedUserData);
    
        const latestChatData = await fetchLatestChat(authToken);
        setChatId(latestChatData.id);
    
        const messagesData = await fetchMessages(authToken, latestChatData.id);
        
        // Add delivered messages to messagesToMarkAsRead
        const deliveredMessages = messagesData.messages.filter(message => message.status === false);
        setMessagesToMarkAsRead(deliveredMessages.map(message => message.id));
        
        setMessages(messagesData.messages);
      } catch (error) {
        console.error('Error in fetchData: ', error);
      }
    };
    

    fetchData();
  }, [authToken]);

  const handleUserTyping = debounce(async () => {
    const typingData = {
      chatId: chatId,
     
    };
  
    try {
      await notifyUserTyping(authToken, typingData);
    } catch (error) {
      console.error('Error notifying user typing:', error);
    }
  }, 300);
  

  useEffect(() => {
    if (bindMessageSent) {
      const handleNewMessage = async (newMessageData) => {
        // Add the new message ID to the state
        setMessagesToMarkAsRead((prevMessagesToMarkAsRead) => {
          return [...prevMessagesToMarkAsRead, newMessageData.message.id];
        });
  
        // Add the new message to the messages state only if it's not already present
        setMessages((prevMessages) => {
          const existingMessage = prevMessages.find(msg => msg.id === newMessageData.message.id);
          if (existingMessage) {
            // Message already exists, no need to add
            return prevMessages;
          } else {
            // Message doesn't exist, add to the list
            return [...prevMessages, newMessageData.message];
          }
        });
      };
  
      // Bind the handleNewMessage callback
      bindMessageSent(handleNewMessage);
    }
  }, [bindMessageSent]);
  
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (messagesToMarkAsRead.length > 0) {
        try {
          await markMessageAsRead(authToken, messagesToMarkAsRead);
          console.log('Messages Marked As Read:', messagesToMarkAsRead.length);
          setMessagesToMarkAsRead([]); // Clear the array after marking the messages as read
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };
  
    const intervalId = setInterval(markMessagesAsRead, 1000); // Mark messages as read every 5 seconds
    return () => clearInterval(intervalId); // Clear the interval when the component unmounts
  }, [messagesToMarkAsRead, authToken]);
  
  useEffect(() => {
    if (bindReadReceipt) {
      const handleReadReceipt = (readReceiptData) => {
        console.log(readReceiptData);
        // Update the 'seen' value of the relevant message
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            if (message.id === readReceiptData.messageId) {
              return {
                ...message,
                seen: readReceiptData.seen,
              };
            }
            return message;
          });
        });
      };
  
      // Bind the handleReadReceipt callback
      bindReadReceipt(handleReadReceipt);
    }
  }, [bindReadReceipt]);
  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  }

  const handleSendMessage = async () => {
    if (newMessage === '') return;

    try {
      const messageData = {
        content: newMessage,
        chatId: chatId,
        sender: {
          id: user.id,
          name: user.name,
        },
      };

      await sendMessage(authToken, messageData);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };
  const handleLogout = () => {
    setUserData(null);
    // or navigate user to a different page
  }
  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </div>
    );
  }
  return (
    <div>
      <Grid item xs={12}>
      <MainBar user={user} handleLogout={handleLogout}/>
      </Grid>
     
      <ChatWindow
  user={user}
  chatId={chatId}
  messages={messages}
  newMessage={newMessage}
  handleNewMessageChange={handleNewMessageChange}
  handleSendMessage={handleSendMessage}
  handleUserTyping={handleUserTyping}
/>

    </div>
  );
};

export default UserChat;
