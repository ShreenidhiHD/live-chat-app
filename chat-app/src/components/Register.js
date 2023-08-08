import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
const API_BASE_URL = 'http://170.187.232.251:80';

const Register = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    company_name: '',
    website_url: '',
  });

  const { user_name, user_email, user_password, company_name, website_url } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const newUser = {
      user_name,
      user_email,
      user_password,
      company_name,
      website_url,
    };
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const body = JSON.stringify(newUser);
      const res = await axios.post(`${API_BASE_URL}/api/register`, body, config);
      console.log('User and Company registered successfully', res.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };
  console.log(`API_BASE_URL is: ${API_BASE_URL}`);
  return (
    

    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card>
        <CardContent>
          <h1>Register</h1>
          <form onSubmit={(e) => onSubmit(e)}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="text"
                  name="user_name"
                  value={user_name}
                  onChange={(e) => onChange(e)}
                  label="User Name"
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="email"
                  name="user_email"
                  value={user_email}
                  onChange={(e) => onChange(e)}
                  label="User Email"
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="password"
                  name="user_password"
                  value={user_password}
                  onChange={(e) => onChange(e)}
                  label="Password"
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="text"
                  name="company_name"
                  value={company_name}
                  onChange={(e) => onChange(e)}
                  label="Company Name"
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="url"
                  name="website_url"
                  value={website_url}
                  onChange={(e) => onChange(e)}
                  label="Website URL"
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
            <Button fullWidth variant="contained" color="primary" type="submit">
              Register
            </Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            Already have an account? <Link to="/">Log in here</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
