import React from 'react';
import { Toolbar, Typography, IconButton } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const MainBar = ({ chatId, chats, user, handleProfileClick, handleLogout }) => {
  return (
    <Toolbar variant="dense" sx={{ backgroundColor: '#3f51b5', color: 'white' }}>
      <IconButton edge="start" color="inherit" aria-label="user-profile" onClick={handleProfileClick}>
        <AccountCircle />
      </IconButton>
      <Typography variant="h6" style={{ flexGrow: 1 }}>
        {/* {user.curname} */}
      </Typography>
      <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout}>
        <ExitToAppIcon />
      </IconButton>
    </Toolbar>
  );
}

export default MainBar;