import React, { useState, useEffect, useRef } from 'react';
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
  const [user, setUser] = useState({});
  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  useEffect(() => {
    let pusher;
    let channel;
    if (chatId) {
      fetchMessages(chatId);
    }

    const fetchUserDataAndMessage = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get('http://localhost:8000/api/userdata', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUser(userResponse.data);

        // Fetch chatId
        const chatIdResponse = await axios.get(`http://localhost:8000/api/agent/chats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setChats(chatIdResponse.data);
        const chatId = chatIdResponse.data.id;
        setChatId(chatId);

        


       

        pusher = new Pusher('63ec3433f5f1ad17bcb5', {
          cluster: 'ap2',
          debug: true,
        });

        channel = pusher.subscribe(`chat.${chatId}`);
        channel.bind('message.sent', function (data) {
          if (data.message && data.message.chat_id === chatId) {
            const isUserMessage = data.message.sender.id === userResponse.data.curid;

            setMessages((messages) => [...messages, { ...data.message, isUserMessage }]);
          }
        });
        
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserDataAndMessage();

    return () => {
      if (chatId) {
        pusher.unsubscribe(`chat.${chatId}`);
      }
    };
  }, [user.curid]);






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

      // Handle the response here if needed
      console.log('Message Sent:', response.data);

      // Fetch messages again after sending a new one
      //   fetchMessages(chatId);
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

  Pusher.logToConsole = true;
  useEffect(() => {
    // Initialize Pusher once
    const pusher = new Pusher('63ec3433f5f1ad17bcb5', {
      cluster: 'ap2',
      debug: true,
    });

    // Function to handle subscription to a new channel when chatId changes
    const subscribeToChannel = () => {
      if (chatId) {
        const channel = pusher.subscribe(`chat.${chatId}`);
        channel.bind('message.sent', function (data) {
          if (data.message && data.message.chat_id === chatId) {
            const isUserMessage = data.message.sender.id === user.curid;
            setMessages((prevMessages) => {
              const messageAlreadyExists = prevMessages.some(message => message.id === data.message.id);
              if (!messageAlreadyExists) {
                return [...prevMessages, { ...data.message, isUserMessage }];
              }
              return prevMessages;
            });
          }
        });
      }
    };

    subscribeToChannel();

    // Cleanup function
    return () => {
      if (chatId) {
        pusher.unsubscribe(`chat.${chatId}`);
      }
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
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              {user.curname}
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
            {messages.map((message, index) => {
              const isOutgoing = message.sender.id === user.curid;
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

