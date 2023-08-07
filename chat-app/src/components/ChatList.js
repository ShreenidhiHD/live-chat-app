import React from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import OnlineOfflineStatus from './OnlineOfflineStatus';

const ChatList = ({ chats, selectedChatId, setSelectedChatId, searchQuery, setSearchQuery }) => {
  const handleChatClick = (chatId) => {
    setSelectedChatId(chatId);
  };

  const filteredChats = chats.filter(chat =>
    chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid item xs={12} sx={{ borderRight: '1px solid #e0e0e0' }}>
      <Grid item xs={12} sx={{ padding: '10px' }}>
        <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth onChange={e => setSearchQuery(e.target.value)} />
      </Grid>
      <Divider />
      <List>
        {filteredChats.map(chat => (
          <ListItem
            button
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            style={selectedChatId === chat.id ? { backgroundColor: '#e0e0e0' } : null}
          >
            <ListItemIcon>
              <Avatar alt={chat.customer.name} src="https://mui.com/static/images/avatar/1.jpg" />
            </ListItemIcon>
            <ListItemText primary={chat.customer.name} secondary={chat.customer.email} />
            <OnlineOfflineStatus  user={chat.customer}/>
          </ListItem>
        ))}
      </List>
    </Grid>
  );
};

export default ChatList;
