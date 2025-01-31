import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth functions
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './styles.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const auth = getAuth(); // Initialize Firebase Auth
  const navigate = useNavigate(); // Initialize navigate

  const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user; // Return the user object
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error; // Rethrow the error for handling in UI
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await loginUser(email, password); // Use the loginUser function
      navigate('/'); // Redirect to the homepage
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-page">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        margin="normal"
      />
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        margin="normal"
      />
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" style={{ backgroundColor: '#76c7c0', color: 'white' }} fullWidth>
        Login
      </Button>
    </form>
  );
};

export default LoginPage;