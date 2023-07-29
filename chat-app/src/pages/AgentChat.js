import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import { fetchUserData } from '../api/userApi';
import { fetchChats, fetchMessages, sendMessage } from '../api/chatApi';


const AgentChat = () => {
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const authToken = localStorage.getItem('authToken');

  // Fetch user data and chats list when the component mounts
  useEffect(() => {
    const fetchAndSetData = async () => {
      const userData = await fetchUserData(authToken);
      setUser(userData);

      const chatsData = await fetchChats(authToken);
      setChats(chatsData);
    };

    fetchAndSetData();
  }, [authToken]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChatId) {
      const fetchAndSetMessages = async () => {
        const messagesData = await fetchMessages(authToken, selectedChatId);
        setMessages(messagesData.messages);
      };

      fetchAndSetMessages();
    }
  }, [authToken, selectedChatId]);

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (newMessage === '') return;
  
    try {
      await sendMessage(authToken, selectedChatId, newMessage, user);
      const messagesData = await fetchMessages(authToken, selectedChatId);
      setMessages(messagesData.messages);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
          <MainBar/>
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
