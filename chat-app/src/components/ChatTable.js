import React, { useEffect, useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Fab from '@mui/material/Fab';
import SendIcon from '@mui/icons-material/Send';

const AChat = () => {
  const [messages, setMessages] = useState([
    { key: "1", text: "Hey man, What's up ?", time: "09:30", align: "right" },
    { key: "2", text: "Hey, Iam Good! What about you ?", time: "09:31", align: "left" },
    { key: "3", text: "Cool. i am good, let's catch up!", time: "10:30", align: "right" },
    { key: "1", text: "Hey man, What's up ?", time: "09:30", align: "right" },
    { key: "2", text: "Hey, Iam Good! What about you ?", time: "09:31", align: "left" },
    { key: "3", text: "Cool. i am good, let's catch up!", time: "10:30", align: "right" },
    
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);

  return (
    <div style={{ height: '100vh' }}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h5" className="header-message">Chat</Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} style={{ height: '100vh' }}>
        <Grid item xs={3} style={{ borderRight: '1px solid #e0e0e0', height: '100%', overflow: 'auto' }}>
          <List>
            <ListItem button key="RemySharp">
              <Avatar alt="Remy Sharp" src="https://mui.com/static/images/avatar/1.jpg" />
              <ListItemText primary="John Wick" />
            </ListItem>
          </List>
          <Divider />
          <Grid item xs={12} style={{ padding: '10px' }}>
            <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth />
          </Grid>
          <Divider />
          <List>
            <ListItem button key="RemySharp">
              <Avatar alt="Remy Sharp" src="https://mui.com/static/images/avatar/1.jpg" />
              <ListItemText primary="Remy Sharp" />
              <ListItemText secondary="online" align="right" />
            </ListItem>
            <ListItem button key="Alice">
              <Avatar alt="Alice" src="https://mui.com/static/images/avatar/3.jpg" />
              <ListItemText primary="Alice" />
            </ListItem>
            <ListItem button key="CindyBaker">
              <Avatar alt="Cindy Baker" src="https://mui.com/static/images/avatar/2.jpg" />
              <ListItemText primary="Cindy Baker" />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={9} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List style={{ flexGrow: 1, overflow: 'auto' }}>
            {messages.map((message) => (
              <ListItem key={message.key}>
                <Grid container>
                  <Grid item xs={12}>
                    <ListItemText align={message.align} primary={message.text} />
                  </Grid>
                  <Grid item xs={12}>
                    <ListItemText align={message.align} secondary={message.time} />
                  </Grid>
                </Grid>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
          <Divider />
          <Grid container style={{ padding: '20px' }}>
            <Grid item xs={10}>
              <TextField id="outlined-basic-email" label="Type Something" fullWidth />
            </Grid>
            <Grid item xs={2} align="right">
              <Fab color="primary" aria-label="add"><SendIcon /></Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default AChat;
