import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MainBar from '../components/Mainbar';
import { fetchUserData } from '../api/userApi';
import { fetchChats, fetchMessages, sendMessage ,markMessageAsRead} from '../api/chatApi';
import usePusher from '../services/pusherService';
import CircularProgress from '@mui/material/CircularProgress';

const AgentChat = () => {
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const authToken = localStorage.getItem('authToken');
  const { bindMessageSent,bindReadReceipt } = usePusher(selectedChatId);
  const [messagesToMarkAsRead, setMessagesToMarkAsRead] = useState([]);
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
  
    const intervalId = setInterval(markMessagesAsRead, 5000); // Mark messages as read every 5 seconds
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

      await sendMessage(authToken, messageData);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }  
  };
  const handleLogout = () => {
    setUser(null);
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
      <Grid container>
        <Grid item xs={12}>
          <MainBar user={user} handleLogout={handleLogout} />
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
