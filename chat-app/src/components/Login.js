import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
const API_BASE_URL = 'http://170.187.232.251';
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.token);

        // Fetch user role after successful login
        const roleResponse = await axios.get(`${API_BASE_URL}/api/userrole`, {
          headers: {
            Authorization: `Bearer ${response.data.token}`,
          },
        });

        if (roleResponse.status === 200) {
          const role = roleResponse.data.message;
          if (role === 'customer') {
            navigate('/userChat'); // Redirect to userChat for users
          } else if (role === 'agent') {
            navigate('/agentChat'); // Redirect to agentChat for agents
          } 
          else if (role === 'website_owner') {
            navigate('/OwnerDashboard'); // Redirect to agentChat for agents
          }else {
            alert('Invalid role'); // Handle any other unexpected roles
          }
        } else {
          alert('Failed to fetch user role');
        }
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card>
      <Button variant="contained" color="primary" href="/register-user">
              Chat With Our Agent
              </Button>
        <CardContent>
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              variant="outlined"
              margin="normal"
            />
            <Button fullWidth variant="contained" color="primary" type="submit">
              Log In
            </Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
