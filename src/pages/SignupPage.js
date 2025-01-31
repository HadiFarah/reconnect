import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '../util/firestore';
import './styles.css';

// Comprehensive list of country codes
const countryCodes = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+64', country: 'New Zealand' },
  { code: '+52', country: 'Mexico' },
  { code: '+55', country: 'Brazil' },
  { code: '+7', country: 'Russia' },
  { code: '+82', country: 'South Korea' },
  { code: '+65', country: 'Singapore' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+20', country: 'Egypt' },
  { code: '+27', country: 'South Africa' },
  { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' },
  { code: '+60', country: 'Malaysia' },
  { code: '+66', country: 'Thailand' },
  { code: '+84', country: 'Vietnam' },
  { code: '+62', country: 'Indonesia' },
  { code: '+63', country: 'Philippines' },
  { code: '+90', country: 'Turkey' },
  { code: '+972', country: 'Israel' },
  { code: '+31', country: 'Netherlands' },
  { code: '+32', country: 'Belgium' },
  { code: '+41', country: 'Switzerland' },
  { code: '+46', country: 'Sweden' },
  { code: '+47', country: 'Norway' },
  { code: '+45', country: 'Denmark' },
  { code: '+358', country: 'Finland' },
  { code: '+48', country: 'Poland' },
  { code: '+420', country: 'Czech Republic' },
  { code: '+36', country: 'Hungary' }, 
  { code: '+974', country: 'Qatar' },
  { code: '+43', country: 'Austria' }
].sort((a, b) => a.country.localeCompare(b.country)); // Sort alphabetically by country name

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);

  const auth = getAuth();

  const registerUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const accountId = userCredential.user.uid;
      return { user: userCredential.user, accountId };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { user, accountId } = await registerUser(email, password);
      
      // Create user document in Firestore
      await createUserProfile(accountId, {
        username,
        email,
        phoneNumber: countryCode + phoneNumber,
        createdAt: new Date()
      });
      
      // Navigate to home page
      window.location.href = '/';
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-page">
      <Typography variant="h4" gutterBottom>
        Sign up
      </Typography>
      {error && (
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
      )}

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
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        margin="normal"
      />
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', marginBottom: '16px' }}>
        <FormControl style={{ width: '40%' }}>
          <InputLabel>Country Code</InputLabel>
          <Select
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            label="Country Code"
          >
            {countryCodes.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                {country.code} ({country.country})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Phone Number"
          variant="outlined"
          fullWidth
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          style={{ width: '60%' }}
        />
      </div>

      <Button 
        type="submit" 
        variant="contained" 
        style={{ backgroundColor: '#76c7c0', color: 'white', marginTop: '20px' }} 
        fullWidth
      >
        Sign up
      </Button>
    </form>
  );
};

export default SignupPage;
