import React, { useRef, useEffect } from 'react';
import { Grid, TextField, List, Toolbar, IconButton, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Typing from './Typing'; 
import Message from './Message';
import MainBar from './Mainbar';

const ChatWindow = ({ user, chatId, messages, newMessage, handleNewMessageChange, handleSendMessage }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const handleProfileClick = () => {
    navigate('/profile');
  };
  
 
  
  const handleLogout = () => {
    console.log('Handle logout here');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]); 
  
  return (
    <div>
      <Grid container>
        <Grid item xs={12} sx={{ height: '90vh' }}>
          <Paper style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
            {messages && messages.length > 0 ? (
              <List style={{ flexGrow: 1, overflow: 'auto' }}>
                {messages.map((message, index) => (
                 
                <Message key={index} message={message} user={user} isUserMessage={message.isUserMessage}  />

                  
                ))}
                
                <div ref={messagesEndRef} />
              </List>
            ) : (
              <Message message={null} isUserMessage={false} /> 
            )}
            <Divider />
            <Grid container style={{ padding: '20px', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <Grid item xs={11}>
                <TextField id="outlined-basic-email" label="Type Something" fullWidth value={newMessage} onChange={handleNewMessageChange} />
              </Grid>
              <Grid item xs={1} align="right">
                <IconButton color="primary" aria-label="add" onClick={handleSendMessage}>
                  <SendIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      {/* Render the Typing component */}
      <Typing chatId={chatId} />
    </div>
  );
};

export default ChatWindow;
