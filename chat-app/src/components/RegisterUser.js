import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const newUser = {
      name,
      email,
      password,
    };

    // Show the toast message before registration starts
    const registrationPromise = toast.promise(axios.post('http://localhost:8000/api/registeruser', newUser), {
      pending: 'Registering...',
      success: 'User registered successfully. Please login to continue.',
      error: 'Registration failed. Please try again.',
    });

    try {
      const res = await registrationPromise;
      console.log('User registered', res.data);
      navigate('/'); // Redirect to the login page after successful registration
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card>
        <CardContent>
          <h1>Register</h1>
          <form onSubmit={(e) => onSubmit(e)}>
            <div>
              <TextField
                fullWidth
                type="text"
                name="name"
                value={name}
                onChange={(e) => onChange(e)}
                label="Name"
                variant="outlined"
                margin="normal"
                required
              />
            </div>
            <div>
              <TextField
                fullWidth
                type="email"
                name="email"
                value={email}
                onChange={(e) => onChange(e)}
                label="Email"
                variant="outlined"
                margin="normal"
                required
              />
            </div>
            <div>
              <TextField
                fullWidth
                type="password"
                name="password"
                value={password}
                onChange={(e) => onChange(e)}
                label="Password"
                variant="outlined"
                margin="normal"
                required
              />
            </div>
            <Button fullWidth variant="contained" color="primary" type="submit">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default RegisterUser;
