import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import Grid from '@mui/material/Grid';
import { fetchUserData } from '../api/userApi';
import { fetchLatestChat, fetchMessages, createChat, sendMessage } from '../api/chatApi';

const UserChat = () => {
  const [userData, setUserData] = useState(null);
  const [latestChat, setLatestChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const authToken = localStorage.getItem('authToken');
 

  useEffect(() => {
    const fetchAndSetData = async () => {
      const fetchedUserData = await fetchUserData(authToken); 
      setUserData(fetchedUserData);

      const latestChatData = await fetchLatestChat(authToken);
      setLatestChat(latestChatData);
      setChatId(latestChatData.id); 

      const messagesData = await fetchMessages(authToken, latestChatData.id);
      setMessages(messagesData.messages);
    };

    fetchAndSetData();
  }, []); 

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  }

  const handleSendMessage = async () => {
    if (newMessage === '') return;

    try {
        let chatResponse;
        if (!chatId) {
            chatResponse = await createChat(authToken);
            setChatId(chatResponse.id);
        }

        await sendMessage(authToken, chatId || chatResponse.id, newMessage, userData);
        const messagesData = await fetchMessages(authToken, chatId || chatResponse.id);
        setMessages(messagesData.messages);
        setNewMessage('');

    } catch (error) {
        console.error(error);
    }
}

  return (
    <div>
       <Grid item xs={12}>
          <MainBar/>
        </Grid>
      <ChatWindow 
        user={userData} 
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
