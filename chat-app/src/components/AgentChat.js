import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Fab from '@mui/material/Fab';
import SendIcon from '@mui/icons-material/Send';
import Toolbar from '@mui/material/Toolbar';

const AgentChat = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile'); // "/profile" should be the route you've defined for your Profile page.
  };

  useEffect(() => {
    // Fetch chats list on component mount
    const fetchChats = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/agent/chats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setChats(response.data);

      } catch (error) {
        console.error(error);
      }
    };

    fetchChats();
  }, [authToken]);

  // Fetch messages when chatId changes
  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setMessages(response.data.messages);
    } catch (error) {
      console.error(error);
    }
  };

 

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!chatId) {
//         // If chatId is null, create a new chat and set chatId to the first chat's id
//         const chatResponse = await axios.post(
//           'http://localhost:8000/api/chats',
//           {},
//           { headers: { Authorization: `Bearer ${authToken}` }}
//         );
//         setChatId(chatResponse.data[0]?.id);
//       }
  
//       await axios.post(
//         'http://localhost:8000/api/send',
//         { 
//           content: newMessage,
//           chat_id: chatId || chatId[0]?.id,
//         },
//         { headers: { Authorization: `Bearer ${authToken}` }}
//       );
//       fetchMessages(chatId);
//       setNewMessage('');
//     } catch (error) {
//       console.error(error);
//     }
//   };
  

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

  const filteredChats = chats.filter(chat =>
    chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const user = {
    name: 'Agent Name',
    avatar: 'https://mui.com/static/images/avatar/1.jpg'
  };

  const handleLogout = () => {
    console.log('Handle logout here');
  }
 // Listen for real-time updates
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
  
  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
      <Grid container component={Paper} sx={{ width: '100%', height: '90vh' }}>
        <Grid item xs={3} sx={{ borderRight: '1px solid #e0e0e0' }}>
          <Grid item xs={12} sx={{ padding: '10px' }}>
            <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth onChange={e => setSearchQuery(e.target.value)} />
          </Grid>
          <Divider />
          <List>
            {filteredChats.map(chat => (
              <ListItem 
                button 
                key={chat.id} 
                onClick={() => setChatId(chat.id)}
                style={chatId === chat.id ? { backgroundColor: '#e0e0e0' } : null}
              >
                <ListItemIcon>
                  <Avatar alt={chat.customer.name} src="https://mui.com/static/images/avatar/1.jpg" />
                </ListItemIcon>
                <ListItemText primary={chat.customer.name} secondary={chat.customer.email} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={9}>
          <Toolbar variant="dense" sx={{ backgroundColor: '#f0f0f0' }}>
            <Typography variant="h6">
              {chats.find(chat => chat.id === chatId)?.customer.name}
            </Typography>
          </Toolbar>
          <List sx={{ height: '70vh', overflowY: 'auto' }}>
            {messages.map((message, index) => (
              <ListItem key={index}>
                <ListItemText align={message.sender.role === 'agent' ? "right" : "left"} primary={message.content} secondary={new Date(message.created_at).toLocaleString()} />
              </ListItem>
            ))}
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

export default AgentChat;
