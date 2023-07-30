import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import { fetchUserData } from '../api/userApi';
import { fetchChats, fetchMessages, sendMessage, markMessageAsRead } from '../api/chatApi';
import usePusher from '../services/pusherService';

const AgentChat = () => {
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const authToken = localStorage.getItem('authToken');
  const { bindMessageSent, bindReadReceipt } = usePusher(selectedChatId);
  const debouncedFetchRef = useRef(null);
  const [messageReadStatus, setMessageReadStatus] = useState({});

  // useRef to store the current value of messages
  const messagesRef = useRef(messages);

  useEffect(() => {
    const fetchAndSetData = async () => {
      const userData = await fetchUserData(authToken);
      setUser(userData);

      const chatsData = await fetchChats(authToken);
      setChats(chatsData);
    };

    fetchAndSetData();
  }, [authToken]);

  const fetchAndSetMessages = async () => {
    if (selectedChatId) {
      const messagesData = await fetchMessages(authToken, selectedChatId);

      // Initialize the seen status for each message
      const initialMessageReadStatus = messagesData.messages.reduce((acc, message) => {
        acc[message.id] = message.seen;
        return acc;
      }, {});

      setMessageReadStatus(initialMessageReadStatus);
      setMessages(messagesData.messages.map(message => ({
        ...message,
        seen: initialMessageReadStatus[message.id] || false,
      })));
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    clearTimeout(debouncedFetchRef.current);
    debouncedFetchRef.current = setTimeout(fetchAndSetMessages, 1000);
  }, [authToken, selectedChatId]);

  useEffect(() => {
    if (bindMessageSent) {
      const handleNewMessage = async (newMessageData) => {
        console.log('New message data:', newMessageData);
        clearTimeout(debouncedFetchRef.current);
        debouncedFetchRef.current = setTimeout(fetchAndSetMessages, 1000);

        // Mark the new message as unread initially
        newMessageData.message.seen = false;

        // Add the new message to the messages state
        setMessages((prevMessages) => [...prevMessages, newMessageData.message]);

        // If the chat window is open and the selected chat is the same as the new message's chat, mark it as read
        if (selectedChatId === newMessageData.message.chat_id) {
          console.log('Calling markMessageAsRead API...');
          await markMessageAsRead(authToken, newMessageData.message.id);
          console.log('markMessageAsRead API called.');
        }
      };

      // Bind the handleNewMessage callback
      bindMessageSent(handleNewMessage);
    }

    if (bindReadReceipt) {
      console.log('Attempting to bind ReadReceipt...');
      bindReadReceipt(async (data) => {
        console.log('Received read receipt:', data);

        // Check if the received data is correct and if it contains the messageId and seen status.
        const index = messagesRef.current.findIndex((message) => message.id === data.messageId);

        if (index !== -1) {
          console.log(`Attempting to update the message at index ${index}`);
          const updatedMessages = [
            ...messagesRef.current.slice(0, index),
            { ...messagesRef.current[index], seen: data.seen },
            ...messagesRef.current.slice(index + 1),
          ];

          // Verify if the updatedMessages array is correct and if it contains the updated "seen" status.
          setMessages(updatedMessages);
        } else {
          // If the message is not found in the messages array, log an error or check if there's any issue with the received data.
          console.error('Message not found in messages array.');
        }

        setMessageReadStatus(prevStatus => ({ ...prevStatus, [data.messageId]: data.seen }));
      });
    }
  }, [authToken, selectedChatId, bindMessageSent, bindReadReceipt]);

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
          id: user.curid,
        },
      };

      await sendMessage(authToken, selectedChatId, newMessage, user);
      const newMessageObj = { ...messageData, id: Math.random().toString(), seen: false };
      setMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setMessageReadStatus((prevStatus) => ({ ...prevStatus, [newMessageObj.id]: false }));
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
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
              messageReadStatus={messageReadStatus}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default AgentChat;
