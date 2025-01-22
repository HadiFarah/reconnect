import React, { useState } from 'react';
import { Typography, Button, TextField } from '@mui/material';
import './styles.css';

const YourAccountPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleUpdate = (event) => {
    event.preventDefault();
    // Handle account update logic here
  };

  return (
    <form onSubmit={handleUpdate} className="account-page">
      <Typography variant="h4" gutterBottom>
        Your Account
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        margin="normal"
      />
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        margin="normal"
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Update Account
      </Button>
    </form>
  );
};

export default YourAccountPage;
