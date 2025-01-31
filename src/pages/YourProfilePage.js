import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  TextField, 
  Box, 
  Card, 
  CardContent, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit as EditIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getAuth, updateProfile } from 'firebase/auth';
import { getUserProfile, updateUserProfile, fetchUserListings, updateMissingPerson, deleteMissingPerson } from '../util/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MapComponent from '../components/MapComponent';
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
].sort((a, b) => a.country.localeCompare(b.country));

const YourProfilePage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedListing, setEditedListing] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUsername(profile.username || '');
            setEmail(user.email || '');
            if (profile.phoneNumber) {
              const code = countryCodes.find(c => profile.phoneNumber.startsWith(c.code));
              if (code) {
                setCountryCode(code.code);
                setPhoneNumber(profile.phoneNumber.slice(code.code.length));
              } else {
                setPhoneNumber(profile.phoneNumber);
              }
            }
          }
          
          const userListings = await fetchUserListings(user.uid);
          setListings(userListings);
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      }
    };

    loadUserData();
  }, []);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const user = auth.currentUser;
    try {
      if (user) {
        await updateProfile(user, { displayName: username });
        
        await updateUserProfile(user.uid, {
          username: username,
          phoneNumber: countryCode + phoneNumber
        });

        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setEditedListing({
      name: listing.name,
      description: listing.description,
      location: listing.location,
      dateMissing: listing.dateMissing.toDate()
    });
    setIsEditModalOpen(true);
  };

  const handleLocationSelect = (locationData) => {
    const [lat, lng] = locationData.coordinates.split(',').map(Number);
    setEditedListing(prev => ({
      ...prev,
      location: {
        lat,
        lng,
        address: locationData.address
      }
    }));
  };

  const handleUpdateListing = async () => {
    try {
      if (!editedListing.location) {
        setError('Please select a location on the map');
        return;
      }

      await updateMissingPerson(selectedListing.id, editedListing);
      
      setListings(listings.map(listing => 
        listing.id === selectedListing.id 
          ? { ...listing, ...editedListing }
          : listing
      ));
      
      setIsEditModalOpen(false);
      setSuccess('Listing updated successfully');
    } catch (err) {
      setError('Failed to update listing');
      console.error(err);
    }
  };

  const handleReportAsFound = async (listingId) => {
    if (window.confirm('Are you sure you want to mark this person as found? This will remove the listing.')) {
      try {
        await deleteMissingPerson(listingId);
        setListings(listings.filter(listing => listing.id !== listingId));
        setSuccess('Person marked as found successfully');
      } catch (err) {
        setError('Failed to update listing status');
        console.error(err);
      }
    }
  };

  return (
    <Box className="account-page">
      <Typography variant="h4" gutterBottom>
        Your Account
      </Typography>
      
      {/* Profile Section */}
      <Card sx={{ mb: 4, width: '100%', maxWidth: 800 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <form onSubmit={handleUpdateProfile}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <div style={{ display: 'flex', gap: '16px' }}>
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
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Listings Section */}
      <Card sx={{ width: '100%', maxWidth: 800 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Listings
          </Typography>
          {listings.length === 0 ? (
            <Typography>You haven't created any listings yet.</Typography>
          ) : (
            listings.map((listing) => (
              <Box key={listing.id} sx={{ mb: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{listing.name}</Typography>
                      <Box>
                        <IconButton onClick={() => handleEditListing(listing)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleReportAsFound(listing.id)}
                          sx={{ ml: 1 }}
                        >
                          Report as Found
                        </Button>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {listing.description}
                    </Typography>
                    {listing.dateMissing && (
                      <Typography variant="body2" color="text.secondary">
                        Date Missing: {listing.dateMissing.toDate().toLocaleDateString()}
                      </Typography>
                    )}
                    {listing.location && (
                      <Typography variant="body2" color="text.secondary">
                        Location: {listing.location.address}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Listing Modal */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Listing</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editedListing?.name || ''}
              onChange={(e) => setEditedListing({ ...editedListing, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editedListing?.description || ''}
              onChange={(e) => setEditedListing({ ...editedListing, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="subtitle1" gutterBottom>
              Date Missing
            </Typography>
            <Calendar 
              onChange={(date) => setEditedListing({ ...editedListing, dateMissing: date })}
              value={editedListing?.dateMissing}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Location
            </Typography>
            <Box sx={{ height: '400px', width: '100%', mb: 2 }}>
              <MapComponent 
                onLocationSelect={handleLocationSelect}
                initialLocation={editedListing?.location}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateListing} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error and Success Messages */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YourProfilePage;
