import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import { fetchUserData } from '../api/userApi';
import { fetchChats, fetchMessages, sendMessage } from '../api/chatApi';
import usePusher from '../services/pusherService';

const AgentChat = () => {
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const authToken = localStorage.getItem('authToken');
  const { bindMessageSent } = usePusher(selectedChatId);

  useEffect(() => {
    const fetchAndSetData = async () => {
      const userData = await fetchUserData(authToken);
      setUser(userData);
   
      const chatsData = await fetchChats(authToken);
      setChats(chatsData);
    };

    fetchAndSetData();
  }, [authToken]);
  useEffect(() => {
    console.log('Current User:', user);
}, [user]);

  useEffect(() => {
    const fetchAndSetMessages = async () => {
      if (selectedChatId) {
        const messagesData = await fetchMessages(authToken, selectedChatId);
        setMessages(messagesData.messages);
      } else {
        setMessages([]);
      }
    };
    
    fetchAndSetMessages();
  }, [authToken, selectedChatId]);

  useEffect(() => {
    if (bindMessageSent) {
      const handleNewMessage = (newMessageData) => {
        console.log('New message data:', newMessageData);

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

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (newMessage === '') return;

    try {
      const messageData = {
        content: newMessage,
        chatId: selectedChatId,
        sender: {
          id: user.id,
          name: user.name,
        },
      };

      await sendMessage(authToken, selectedChatId, newMessage, user);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {/* {user.curname} */}
      <Grid container>
        <Grid item xs={12}>
          <MainBar />
        </Grid>
        <Grid item xs={3}>
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </Grid>
        <Grid item xs={9}>
          {selectedChatId && (
            <ChatWindow
              user={user}
              chatId={selectedChatId}
              messages={messages}
              newMessage={newMessage}
              handleNewMessageChange={handleNewMessageChange}
              handleSendMessage={handleSendMessage}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default AgentChat;
