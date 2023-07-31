import React, { useState, useEffect,useRef } from 'react';
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
  const typingTimeoutRef = useRef(null);
  console.log(`UserChat component: authToken = ${authToken}`);

  const { bindMessageSent, bindReadReceipt, bindUserTyping, bindUserStoppedTyping } = usePusher(chatId);

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
          // Mark the new message as unread initially
          newMessageData.message.seen = false;
      
          // If the chat window is open and the selected chat is the same as the new message's chat, mark it as read
          if (chatId === newMessageData.message.chat_id) {
            console.log('Calling markMessageAsRead API...');
            await markMessageAsRead(authToken, newMessageData.message.id);
            console.log('markMessageAsRead API called.');
          } else {
            // If the chat window is not open or the selected chat is different,
            // update the messages state with the new message without duplication
            setMessages(prevMessages => {
              // Check if the new message already exists in the messages state
              const exists = prevMessages.some(message => message.id === newMessageData.message.id);
              if (exists) {
                // If the message exists, return the previous state without changes
                return prevMessages;
              } else {
                // If the message is new, add it to the state
                return [...prevMessages, newMessageData.message];
              }
            });
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

          // Update the messageReadStatus state with the updated seen status from the received data
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(message => {
              if (message.id === data.messageId) {
                return { ...message, seen: data.seen };
              }
              return message;
            });
            return updatedMessages;
          });
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
     // Clear the previous timeout
  clearTimeout(typingTimeoutRef.current);

  // Set a new timeout
  typingTimeoutRef.current = setTimeout(() => {
    // If the user has stopped typing for 2 seconds, emit the 'UserStoppedTyping' event
    bindUserStoppedTyping();
  }, 2000);
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
      bindUserStoppedTyping();

    } catch (error) {
      console.error('Error in handleSendMessage: ', error);
    }
  }
  const handleChatCleared = (chatId) => {
    
    console.log(`Chat with ID ${chatId} cleared.`);
  };

  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
        <MainBar chatId={chatId} onChatCleared={handleChatCleared} />
        </Grid>
        <Grid item xs={12}>
          <ChatWindow
            user={userData}
            chatId={chatId}
            messages={messages}
            newMessage={newMessage}
            handleNewMessageChange={handleNewMessageChange}
            handleSendMessage={handleSendMessage}
            messageReadStatus={messageReadStatus}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default UserChat;
