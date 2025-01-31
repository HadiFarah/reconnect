import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../database/firebase';
import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { addMissingPerson } from '../util/firestore-updated';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getAuth } from 'firebase/auth';
import './styles.css';
import MapComponent from '../components/MapComponent';

const AddMissingPersonPage = () => {
  const [newPerson, setNewPerson] = useState({ 
    name: '', 
    description: '', 
    imgSrc: [],
    dateMissing: '', 
    location: null,
    missingPersonId: '',
    contributorId: []
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleLocationSelect = (locationData) => {
    const [lat, lng] = locationData.coordinates.split(',').map(Number);
    setNewPerson(prev => ({
      ...prev,
      location: {
        lat,
        lng,
        address: locationData.address
      }
    }));
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = () => {
        canvas.width = 512;
        canvas.height = 512;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
    });

    const jpegFile = canvas.toDataURL('image/jpeg');
    const blob = await (await fetch(jpegFile)).blob();
    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", { type: 'image/jpeg' });

    const storageRef = ref(storage, `images/${newFile.name}`);

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(newFile.type)) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF).');
      return null;
    }

    try {
      console.log('Uploading image:', newFile.name);
      await uploadBytes(storageRef, newFile);

      const url = await getDownloadURL(storageRef);
      console.log('Image uploaded successfully, URL:', url);
      return url;
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError);
      setError('Error uploading image. Please try again.');
      return null;
    }
  };

  const handleAddPerson = async (event) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to create a listing.');
      return;
    }
    
    event.preventDefault();
    console.log('Submit button clicked');

    if (!newPerson.location) {
      setError('Please select a location on the map');
      return;
    }

    try {
      const imgSrc = await uploadImage(imageFile);
      if (!imgSrc) return;
      const personData = { 
        ...newPerson, 
        imgSrc: [...newPerson.imgSrc, imgSrc],
        dateMissing: newPerson.dateMissing,
        reporterId: user.uid
      };

      await addMissingPerson(personData);
      setNewPerson({ 
        name: '', 
        description: '', 
        imgSrc: [], 
        dateMissing: '', 
        location: null, 
        missingPersonId: '', 
        contributorId: [] 
      });
      setSuccessMessage('Missing person added successfully!');
      setError(null);
    } catch (error) {
      console.error('Error adding missing person:', error);
      setError(error.message);
      setSuccessMessage('');
    }
  };

  return (
    <form onSubmit={handleAddPerson} className="add-person-page">
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center' }}>
        Add Missing Person
      </Typography>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        value={newPerson.name}
        onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        value={newPerson.description}
        onChange={(e) => setNewPerson({ ...newPerson, description: e.target.value })}
        margin="normal"
      />
      <Calendar 
        onChange={(date) => setNewPerson({ ...newPerson, dateMissing: date })} 
        value={newPerson.dateMissing} 
      />
      
      <div style={{ height: '400px', width: '100%', margin: '20px 0' }}>
        <MapComponent onLocationSelect={handleLocationSelect} />
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ margin: '20px 0' }}
      />
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
      {successMessage && (
        <Typography variant="body1" color="primary">
          {successMessage}
        </Typography>
      )}
      <Button 
        type="submit" 
        variant="contained" 
        style={{ backgroundColor: '#76c7c0', color: 'white' }} 
        fullWidth
      >
        Add Missing Person
      </Button>
    </form>
  );
};

export default AddMissingPersonPage;
