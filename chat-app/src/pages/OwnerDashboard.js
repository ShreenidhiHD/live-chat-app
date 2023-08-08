import React, { useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container'; 
const API_BASE_URL = 'http://170.187.232.251';

const OwnerDashboard = () => {
  const [agentData, setAgentData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const { name, email, password, role } = agentData;

  const onChange = (e) => setAgentData({ ...agentData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the authentication token from localStorage
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('Authentication token not found in localStorage');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`, // Add the authentication token to the header
        },
      };

      const body = JSON.stringify(agentData);
      const res = await axios.post(`${API_BASE_URL}/api/registeranotheruser`, body, config);
      console.log('Agent added successfully', res.data);

      // Show an alert upon successful agent addition
      alert('Agent added successfully!');
    } catch (error) {
      console.error(error.response.data);
      // Show an alert on error
      alert('Failed to add agent. Please try again.');
    }
  };

  return (
    <Container>
      <h1>Owner Dashboard</h1>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
        <Card>
            <CardContent>
              <h2>Manage Agents</h2>
              <Button variant="contained" color="primary" href="/manage-agents">
                Click here
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <h2>See Chats</h2>
              <Button variant="contained" color="primary" href="/manage-agents">
                Click here
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <h2>Manage Profile</h2>
              <Button variant="contained" color="primary" href="/userprofile">
                Click here
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <form onSubmit={onSubmit}>
        <Card>
          <CardContent>
            <h2>Add Agent</h2>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  label="Agent Name"
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  label="Agent Email"
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              select
              name="role"
              value={role}
              onChange={onChange}
              label="Role"
              variant="outlined"
              margin="normal"
              required
            >
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Agent">Agent</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              label="Password"
              variant="outlined"
              margin="normal"
              required
            />
            <Button fullWidth variant="contained" color="primary" type="submit">
              Add Agent
            </Button>
          </CardContent>
        </Card>
      </form>
    </Container>
  );
};

export default OwnerDashboard;
