import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const newUser = {
      name,
      email,
      password
    };
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const body = JSON.stringify(newUser);
      const res = await axios.post('http://localhost:8000/api/register', body, config);
      console.log('User registered', res.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={e => onSubmit(e)}>
        <div>
          <input 
            type="text" 
            name="name"
            value={name}
            onChange={e => onChange(e)}
            required 
          />
          <label>Name</label>
        </div>
        <div>
          <input 
            type="email" 
            name="email"
            value={email}
            onChange={e => onChange(e)}
            required 
          />
          <label>Email</label>
        </div>
        <div>
          <input 
            type="password" 
            name="password"
            value={password}
            onChange={e => onChange(e)}
            required 
          />
          <label>Password</label>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
