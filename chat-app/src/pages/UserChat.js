import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import Grid from '@mui/material/Grid';
import { fetchUserData } from '../api/userApi';
import { fetchLatestChat, fetchMessages, createChat, sendMessage, markMessageAsRead } from '../api/chatApi';
import usePusher from '../services/pusherService';

const UserChat = () => {
  const [userData, setUserData] = useState(null);
  const [latestChat, setLatestChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const authToken = localStorage.getItem('authToken');

  console.log(`UserChat component: authToken = ${authToken}`);

  const { bindMessageSent, bindReadReceipt } = usePusher(chatId);

  useEffect(() => {
    const fetchAndSetData = async () => {
      console.log('Running fetchAndSetData...');
      try {
        const fetchedUserData = await fetchUserData(authToken);
        console.log('Fetched user data: ', fetchedUserData);
        setUserData(fetchedUserData);

        const latestChatData = await fetchLatestChat(authToken);
        console.log('Fetched latest chat data: ', latestChatData);
        setLatestChat(latestChatData);
        setChatId(latestChatData.id);

        const messagesData = await fetchMessages(authToken, latestChatData.id);
        console.log('Fetched messages: ', messagesData);
        setMessages(messagesData.messages);
      } catch (error) {
        console.error('Error in fetchAndSetData: ', error);
      }
    };

    fetchAndSetData();
  }, []);

  useEffect(() => {
    let cleanupFunc = () => {};

    if (bindMessageSent) {
      bindMessageSent(async (newMessageData) => {
        try {
          const messagesData = await fetchMessages(authToken, chatId);
          console.log('Fetched messages after receiving new message: ', messagesData);

          // Update messages state with newly fetched messages
          setMessages(prevMessages => {
            const mergedMessages = messagesData.messages.map(fetchedMessage => {
              const currentMessage = prevMessages.find(message => message.id === fetchedMessage.id);
              return currentMessage ? {...fetchedMessage, seen: currentMessage.seen} : fetchedMessage;
            });
            return mergedMessages;
          });

          // Check if the new message is in the fetched messages, and mark it as read.
          const newMessage = messagesData.messages.find(message => message.id === newMessageData.id);
          if (newMessage) {
            await markMessageAsRead(authToken, newMessage.id);
          }
        } catch (error) {
          console.error('Error in bindMessageSent callback: ', error);
        }
      });
    }

    if (bindReadReceipt) {
      cleanupFunc = bindReadReceipt(async (data) => {
        console.log('Received read receipt:', data);

        try {
          const messagesData = await fetchMessages(authToken, chatId);
          console.log('Fetched messages after receiving read receipt: ', messagesData);

          // Update messages state with newly fetched messages
          setMessages(messagesData.messages);

        } catch (error) {
          console.error('Error in bindReadReceipt callback: ', error);
        }
      });
    }

    return () => {
      cleanupFunc();
    };
  }, [bindMessageSent, bindReadReceipt, authToken, chatId, messages]);

  const messageReadStatus = messages?.reduce((acc, message) => ({
    ...acc,
    [message.id]: message.seen,
  }), {}) || {};

  const handleNewMessageChange = (e) => {
    console.log('handleNewMessageChange: ', e.target.value);
    setNewMessage(e.target.value);
  }

  const handleSendMessage = async () => {
    if (newMessage === '') return;
    console.log('handleSendMessage: newMessage = ', newMessage);

    try {
      let chatResponse;
      if (!chatId) {
        chatResponse = await createChat(authToken);
        console.log('Created new chat: ', chatResponse);
        setChatId(chatResponse.id);
      }

      await sendMessage(authToken, chatId || chatResponse.id, newMessage, userData);
      const fetchedMessagesData = await fetchMessages(authToken, chatId || chatResponse.id);

      const mergedMessages = fetchedMessagesData.messages.map(fetchedMessage => {
        const currentMessage = messages.find(message => message.id === fetchedMessage.id);
        return currentMessage ? {...fetchedMessage, seen: currentMessage.seen} : fetchedMessage;
      });

      console.log('Merged messages: ', mergedMessages);
      setMessages(mergedMessages);
      setNewMessage('');

    } catch (error) {
      console.error('Error in handleSendMessage: ', error);
    }
  }

  return (
    <div>
      <Grid item xs={12}>
        <MainBar />
      </Grid>
      <ChatWindow
        user={userData}
        chatId={chatId}
        messages={messages}
        newMessage={newMessage}
        handleNewMessageChange={handleNewMessageChange}
        handleSendMessage={handleSendMessage}
        messageReadStatus={messageReadStatus}
      />
    </div>
  );
};

export default UserChat;
