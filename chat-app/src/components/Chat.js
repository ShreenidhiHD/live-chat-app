import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Grid, TextField, Typography, List, ListItem, ListItemText, Toolbar, IconButton, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';

const UserChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [user, setUser] = useState({});
  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  useEffect(() => {
    let currentSubscription;
    const fetchUserDataAndMessages = async () => {
      try {
        const userResponse = await axios.get('http://localhost:8000/api/userdata', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUser(userResponse.data);
        
        const chatIdResponse = await axios.get(`http://localhost:8000/api/chats/latest`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const chatId = chatIdResponse.data.id;
        setChatId(chatId);

        const messagesResponse = await axios.get(`http://localhost:8000/api/chats/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const fetchedMessages = messagesResponse.data.messages.map(message => {
          message.isUserMessage = message.sender.id === userResponse.data.curid;
          return message;
        });

        setMessages(fetchedMessages);

        const pusher = new Pusher('63ec3433f5f1ad17bcb5', {
          cluster: 'ap2',
          debug: true,
        });

        const channel = pusher.subscribe(`chat.${chatId}`);
        channel.bind('message.sent', function (data) {
          if (data.message && data.message.chat_id === chatId) {
            const isUserMessage = data.message.sender.id === userResponse.data.curid;
            setMessages((prevMessages) => {
              const messageAlreadyExists = prevMessages.some(message => message.id === data.message.id);
              if (!messageAlreadyExists) {
                if (isChatWindowOpen) {
          markMessageAsRead(data.message.id); 
        }
                return [...prevMessages, { ...data.message, isUserMessage }];
              }
              return prevMessages;
            });
          }
        });
        channel.bind('ReadReceipt', function (data) {
          // This function will run when a `ReadReceipt` event is received.
          // `data` will contain the data sent with the event (username, messageId).
      
          // You can now update your message in the UI.
          const updatedMessages = messages.map((message) => {
              if (message.id === data.messageId) {
                  // Update the seen status of the message
                  return { ...message, seen: true };
              }
              return message;
          });
          setMessages(updatedMessages);
      });
        currentSubscription = { pusher, channel };
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserDataAndMessages();

    return () => {
      if (currentSubscription) {
        const { pusher, channel } = currentSubscription;
        pusher.unsubscribe(channel.name);
      }
    };
  }, []);
const handleChatWindowOpen = () => {
  setIsChatWindowOpen(true);
};

const handleChatWindowClose = () => {
  setIsChatWindowOpen(false);
};

  const markMessageAsRead = async (messageId) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/messages/read', 
        {
          message_id: messageId,
        },
        { headers: { Authorization: `Bearer ${authToken}` } } 
      );
  
      console.log('Message Marked As Read:', response.data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let chatResponse;
      if (!chatId) {
        chatResponse = await axios.post(
          'http://localhost:8000/api/chats',
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setChatId(chatResponse.data.id);
      }

      const response = await axios.post(
        'http://localhost:8000/api/send',
        {
          content: newMessage,
          chat_id: chatId || chatResponse.data.id,
          sender_id: user.curid,
          sender_name: user.curname,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      console.log('Message Sent:', response.data);

      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    console.log('Handle logout here');
  }

  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
          <Toolbar variant="dense" sx={{ backgroundColor: '#3f51b5', color: 'white' }}>
            <IconButton edge="start" color="inherit" aria-label="user-profile" onClick={handleProfileClick}>
              <AccountCircle />
            </IconButton>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              {user.curname}
            </Typography>
            <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout}>
              <ExitToAppIcon />
            </IconButton>
          </Toolbar>
        </Grid>
        <Grid item xs={12} sx={{ height: '90vh' }}>
          <Paper style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List style={{ flexGrow: 1, overflow: 'auto' }}>
              {messages.map((message, index) => {
                const isOutgoing = message.isUserMessage;
                return (
                  <ListItem key={index}>
                    <ListItemText
                      align={isOutgoing ? 'right' : 'left'}
                      primary={message.content}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="textPrimary">
                            {message.sender.name} -{' '}
                          </Typography>
                          {new Date(message.created_at).toLocaleString()}
                          {message.seen}
                          {message.seen ? <span>Seen</span> : <span>Delivered</span>}

                        </>
                      }
                    />
                  </ListItem>
                );
              })}
              <div ref={messagesEndRef} />
            </List>

            <Divider />
            <Grid container style={{ padding: '20px' }}>
              <Grid item xs={11}>
                <TextField id="outlined-basic-email" label="Type Something" fullWidth value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              </Grid>
              <Grid item xs={1} align="right">
                <IconButton color="primary" aria-label="add" onClick={handleSubmit}>
                  <SendIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default UserChat;
