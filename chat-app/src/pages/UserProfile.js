import React, { useContext, useState, useEffect } from 'react';
import { Container, Grid, TextField, Button, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { Alert } from '@mui/material';
import ChangePassword from '../components/ChangePassword';
const Profile = () => {
  return (
    <div>
   <Container>
        <ChangePassword />
      </Container>
    </div>
  );
};

export default Profile;
