import DataTable from '../components/DataTable';
import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const AdminUsers = () => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

 


  const fetchData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        // Handle unauthenticated state
        return;
      }
  
      const response = await axios.get('http://localhost:8000/api/admin/agents', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log(response.data); 
      setColumns(response.data.columns);
      setRows(response.data.rows);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const searchableFields = ["name"];

  return (
    <Container sx={{ marginTop: '2rem' }}>
      <Card>
        <CardContent>
            <h1 className='text-center'>Users</h1>
            <DataTable columns={columns} rows={rows} searchableFields={searchableFields} />
        </CardContent>
      </Card>
      <ToastContainer position="top-center" />
    </Container>
  );
};

export default AdminUsers;
