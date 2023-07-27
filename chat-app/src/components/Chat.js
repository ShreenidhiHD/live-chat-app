import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Grid, Box, Divider, TextField, Typography, List, ListItem, ListItemText, Toolbar, IconButton, Avatar, Fab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';

const UserChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [user, setUser] = useState({});  // you might want to fetch the user data somewhere

  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.data.messages) {
        setMessages(response.data.messages.map(message => ({ ...message, content: message.content })));
      } else {
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     let chatResponse;
  //     if (!chatId) {
  //       chatResponse = await axios.post(
  //         'http://localhost:8000/api/chats',
  //         {},
  //         { headers: { Authorization: `Bearer ${authToken}` }}
  //       );
  //       setChatId(chatResponse.data.id);
  //     }

  //     await axios.post(
  //       'http://localhost:8000/api/send',
  //       { 
  //         content: newMessage,
  //         chat_id: chatId || chatResponse.data.id,
  //       },
  //       { headers: { Authorization: `Bearer ${authToken}` }}
  //     );
  //     fetchMessages(chatId); // Fetch messages again after sending a new one
  //     setNewMessage('');
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let chatResponse;
      if (!chatId) {
        chatResponse = await axios.post(
          'http://localhost:8000/api/chats',
          {},
          { headers: { Authorization: `Bearer ${authToken}` }}
        );
        setChatId(chatResponse.data.id);
      }
  
      const response = await axios.post(
        'http://localhost:8000/api/send',
        { 
          content: newMessage,
          chat_id: chatId || chatResponse.data.id,
        },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
  
      // Handle the response here if needed
      console.log('Message Sent:', response.data);
  
      // Fetch messages again after sending a new one
      fetchMessages(chatId);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };
  
  // Fetch chatId on component mount
  useEffect(() => {
    const fetchChatId = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/chats/latest`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setChatId(response.data.id);
        fetchMessages(response.data.id); // pass response.data.id here

      } catch (error) {
        console.error(error);
      }
    };

    fetchChatId();
  }, []);

  const pusher = new Pusher('f48340963d2929a521dc', {
    cluster: 'ap2',
    debug: true,
  });
  useEffect(() => {
    // Function to subscribe to the Pusher channel when chatId changes
    const subscribeToChannel = () => {
      // Subscribe to the channel based on the current chatId
      const channel = pusher.subscribe(`chat.${chatId}`);
  
      // Event handler for the 'App.Events.MessageSent' event
      channel.bind('App.Events.MessageSent', function (data) {
        // Your event handling code here...
        // For example, you can update the state with the received message:
        console.log('Received Pusher Event:', data);
        if (data.message && data.message.chat_id === chatId) {
          setMessages((messages) => [...messages, data.message]);
        }
      });
    };

    // Call the subscribeToChannel function when chatId changes
    subscribeToChannel();

    // Cleanup on component unmount
    return () => {
      // Unsubscribe from the channel to prevent memory leaks
      pusher.unsubscribe(`chat.${chatId}`);
    };
  }, [chatId]);

  const handleLogout = () => {
    // handle logout
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div>
      <Toolbar variant="dense" sx={{ backgroundColor: '#3f51b5', color: 'white' }}>
        <IconButton edge="start" color="inherit" aria-label="user-profile" onClick={handleProfileClick}>
          <AccountCircle />
        </IconButton>
        <Typography variant="h6" style={{flexGrow: 1}}>
          {user.name}
        </Typography>
        <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout}>
          <ExitToAppIcon />
        </IconButton>
      </Toolbar>
      <Grid container sx={{ width: '100%', height: '90vh' }}>
        <Grid item xs={12}>
          <div style={{ height: '80vh', overflow: 'auto' }}>
            <List sx={{ overflowY: 'auto' }}>
              {messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((message, index, self) => (
                <React.Fragment key={message.id}>
                  {(index === 0 || new Date(self[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString()) &&
                    <ListItem>
                      <ListItemText 
                        align="center" 
                        primary={new Date(message.created_at).toLocaleDateString()}
                      />
                    </ListItem>
                  }
                  <ListItem>
                    <Grid container>
                      <Grid item xs={12}>
                        <ListItemText 
                          align={message.sender.role === 'agent' ? "left" : "right"} 
                          primary={message.content}
                          secondary={
                            message.sender.role === 'agent'
                              ? `${message.sender.name} - ${new Date(message.created_at).toLocaleTimeString()}`
                              : new Date(message.created_at).toLocaleTimeString()
                          }
                          secondaryTypographyProps={{ variant: "body2" }}
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </div>
          <Divider />
          <Box sx={{ padding: '20px' }}>
            <Grid container spacing={1}>
              <Grid item xs={11}>
                <TextField id="outlined-basic-email" label="Type Something" fullWidth value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              </Grid>
              <Grid item xs={1} align="right">
                <Fab color="primary" aria-label="add" onClick={handleSubmit}><SendIcon /></Fab>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

export default UserChat;
