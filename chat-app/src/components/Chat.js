import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Grid, Box, Divider, TextField, Typography, List, ListItem, ListItemText, Toolbar, IconButton, Avatar, Fab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';

const UserChat = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({});  
  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const currentSubscription = useRef(null);

  const handleProfileClick = () => {
    navigate('/profile'); // "/profile" should be the route you've defined for your Profile page.
  };

  useEffect(() => {
    let pusher;
    let channel;
  
    const fetchUserDataAndMessages = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get('http://localhost:8000/api/userdata', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUser(userResponse.data);
  
        // Fetch chatId
        const chatIdResponse = await axios.get(`http://localhost:8000/api/chats/latest`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const chatId = chatIdResponse.data.id;
        setChatId(chatId);
  
        // Fetch chat messages
        const messagesResponse = await axios.get(`http://localhost:8000/api/chats/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        const fetchedMessages = messagesResponse.data.messages.map(message => {
          message.isUserMessage = message.sender.id === userResponse.data.curid;
          return message;
        });
  
        setMessages(fetchedMessages);
  
        // Initialize Pusher here, after user data has been fetched
        pusher = new Pusher('63ec3433f5f1ad17bcb5', {
          cluster: 'ap2',
          debug: true,
        });

        if (currentSubscription.current === `chat.${chatId}`) return;
  
        channel = pusher.subscribe(`chat.${chatId}`);
        channel.bind('message.sent', function (data) {
          if (data.message && data.message.chat_id === chatId) {
            const isUserMessage = data.message.sender.id === userResponse.data.curid;
            setMessages((messages) => [...messages, { ...data.message, isUserMessage }]);
          }
        });

        currentSubscription.current = `chat.${chatId}`;
        
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchUserDataAndMessages();
  
    // Cleanup function
    return () => {
      if (chatId) {
        pusher.unsubscribe(`chat.${chatId}`);
      }
    };
  }, []);
  
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
          sender_id: user.curid,
          sender_name: user.curname, 
        },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );

      // Handle the response here if needed
      console.log('Message Sent:', response.data);

      // Do not add the message to the state here. Let the Pusher listener handle it.
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

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
            <Typography variant="h6" style={{flexGrow: 1}}>
              {user.curname}
            </Typography>
            <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout}>
              <ExitToAppIcon />
            </IconButton>
          </Toolbar>
        </Grid>
      </Grid>
      <Grid container component={Paper} sx={{ width: '100%', height: '90vh' }}>
        
        <Grid item xs={12}>
          <Toolbar variant="dense" sx={{ backgroundColor: '#f0f0f0' }}>
            <Typography variant="h6">
              {chats.find(chat => chat.id === chatId)?.customer.name}
            </Typography>
          </Toolbar>
          <List sx={{ height: '70vh', overflowY: 'auto' }}>
            {messages.map((message, index) => {
              const isOutgoing = message.sender_id === user.curid;
              console.log(isOutgoing);  
              return (
                <ListItem key={index}>
                  <ListItemText
                    align={isOutgoing ? 'right' : 'left'}
                    
                    primary={message.content}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textPrimary">
                          {message && message.sender ? message.sender.name : 'unknown'} -{' '}
                        </Typography>
                        {new Date(message.created_at).toLocaleString()}
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>


          <Divider />
          <Grid container style={{ padding: '20px' }}>
            <Grid item xs={11}>
              <TextField id="outlined-basic-email" label="Type Something" fullWidth value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            </Grid>
            <Grid xs={1} align="right">
              <Fab color="primary" aria-label="add" onClick={handleSubmit}><SendIcon /></Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default UserChat;
