import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../database/firebase'; // Ensure to import your Firebase storage
import { Button, TextField, Typography } from '@mui/material';
import { addMissingPerson } from '../util/firestore';
import './styles.css';

const AddMissingPersonPage = () => {
  const [newPerson, setNewPerson] = useState({ name: '', description: '', imgSrc: '' });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    // Create a canvas to resize the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = () => {
        canvas.width = 512; // Set width to 512
        canvas.height = 512; // Set height to 512
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Resize the image
        resolve();
      };
    });

    // Convert the canvas to JPEG
    const jpegFile = canvas.toDataURL('image/jpeg');
    const blob = await (await fetch(jpegFile)).blob();
    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", { type: 'image/jpeg' });

    const storageRef = ref(storage, `images/${newFile.name}`);

    // Validate file type
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
    event.preventDefault();
    console.log('Submit button clicked'); // Debug log
    try {
      const imgSrc = await uploadImage(imageFile); // Handle the upload
      if (!imgSrc) return; // Exit if image upload failed
      const personData = { ...newPerson, imgSrc }; // Include the image URL in the person data
      await addMissingPerson(personData);
      setNewPerson({ name: '', description: '', imgSrc: '' }); // Reset form
      setSuccessMessage('Missing person added successfully!'); // Set success message
      setError(null); // Clear any previous error
    } catch (error) {
      console.error('Error adding missing person:', error); // Debug log
      setError(error.message);
      setSuccessMessage(''); // Clear success message on error
    }
  };

  return (
    <form onSubmit={handleAddPerson} className="add-person-page">
      <Typography variant="h4" gutterBottom>
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
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
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
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Missing Person
      </Button>
    </form>
  );
};

export default AddMissingPersonPage;
