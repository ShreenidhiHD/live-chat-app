import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import Grid from '@mui/material/Grid';
import { fetchUserData } from '../api/userApi';
import { fetchLatestChat, fetchMessages, createChat, sendMessage } from '../api/chatApi';
import usePusher from '../services/pusherService';

const UserChat = () => {
  const [user, setUserData] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const authToken = localStorage.getItem('authToken');

  const { bindMessageSent } = usePusher(chatId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUserData = await fetchUserData(authToken);
        setUserData(fetchedUserData);

        const latestChatData = await fetchLatestChat(authToken);
        setChatId(latestChatData.id);

        const messagesData = await fetchMessages(authToken, latestChatData.id);
        setMessages(messagesData.messages);
      } catch (error) {
        console.error('Error in fetchData: ', error);
      }
    };

    fetchData();
  }, [authToken]);

  useEffect(() => {
    if (bindMessageSent) {
      const handleNewMessage = (newMessageData) => {
       

        // Mark the new message as unread initially
        newMessageData.message.seen = false;
        newMessageData.message.sender.name= user.name;
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

      await sendMessage(authToken, chatId, newMessage, user);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };
  
  
  return (
    <div>
      <Grid item xs={12}>
        <MainBar />
      </Grid>
     
      <ChatWindow
        user={user}
        chatId={chatId}
        messages={messages}
        newMessage={newMessage}
        handleNewMessageChange={handleNewMessageChange}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default UserChat;
