import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
const API_BASE_URL = 'http://170.187.232.251';
const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('authToken');
        onLogout(); // Call the onLogout callback passed from the parent component
        navigate('/');
      } else {
        console.error('Logout failed:', response.statusText);
        
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Button onClick={handleLogout} color="inherit">
      Logout
    </Button>
  );
};

export default Logout;


// The Logout component handles the user logout process.
// When the logout button is clicked, it sends a POST request to the logout API endpoint.
// If the response is successful, it removes the auth token from local storage, calls the onLogout callback function
// (likely to update the parent component's state), and navigates the user to the login page.
// If an error occurs, it is logged in the console.