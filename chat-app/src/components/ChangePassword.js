import React, { useState } from 'react';
import { Card, CardContent, Grid, TextField, Button, Container } from '@mui/material';
import Alert from '@mui/material/Alert';
import axios from 'axios';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  const submitForm = async (event) => {
    event.preventDefault();
    try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          // Handle unauthenticated state
          return;
        }
        const response = await axios.put('http://localhost:8000/api/user/change-password', 
        { current_password: currentPassword, new_password: newPassword }, 
        {
          headers: {
              Authorization: `Bearer ${authToken}`,
            },
        });


        setMessage(response.data.message);
        setMessageType('success');
          // Clear the message after 3 seconds
          setTimeout(() => {
            setMessage('');
            setMessageType('');
          }, 3000);
    } catch (error) {
        let errorMessage;
        if (typeof error.response.data.message === 'object') {
            errorMessage = Object.values(error.response.data.message).join(' ');
        } else {
            errorMessage = error.response.data.message;
        }
        setMessage(errorMessage);
        setMessageType('error');
          // Clear the message after 3 seconds
          setTimeout(() => {
            setMessage('');
            setMessageType('');
          }, 3000);
    }
};

  

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', justifyContent: '', marginTop: 10, alignItems: 'center', minHeight: '100vh' }}>
      {message && (
        <Alert severity={messageType}>
          {message}
        </Alert>
      )}
      <Card sx={{ width: '100%', padding: '2rem' }}>
        <CardContent>
          <h2 className="text-center mb-4">Change Password</h2>
          <form onSubmit={submitForm} autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField label="Current Password" type="password" variant="outlined" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="New Password" type="password" variant="outlined" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} fullWidth required />
              </Grid>
              <Grid item xs={12} container justifyContent="flex-end">
                <Button type="submit" variant="contained" color="primary" sx={{ mr: 5, width: 200 }}>Update Password</Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ChangePassword;
