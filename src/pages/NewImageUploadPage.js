import React, { useState, useEffect } from "react";
import ImageModal from '../components/ImageModal';
import { fetchMissingPersons } from '../database/firebase';
import { updateMissingPerson } from '../util/firestore';
import * as faceapi from 'face-api.js';
import { Button, TextField, Box, Typography } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MapComponent from '../components/MapComponent';
import './styles.css';

const NewImageUploadPage = () => {
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [matchedImage, setMatchedImage] = useState(null);
    const [matchedImageData, setMatchedImageData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);

    // Helper function to convert Firestore timestamp to Date
    const getDateValue = (timestamp) => {
        if (!timestamp) return new Date();
        return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    };

    useEffect(() => {
        const loadModels = async () => {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
            console.log("Models loaded successfully.");
        };
        loadModels();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setImageUrl(URL.createObjectURL(selectedFile));
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const existingPersons = await fetchMissingPersons();
            const matchedImageData = await detectFaces(file, existingPersons);

            if (matchedImageData) {
                setMatchedImage(matchedImageData.image);
                setMatchedImageData(matchedImageData);
                setEditedData({
                    ...matchedImageData,
                    imgSrc: [...matchedImageData.imgSrc, imageUrl]
                });
                setIsEditing(true);
                setModalMessage(`Match found for ${matchedImageData.name}!`);
                setModalOpen(true);
            } else {
                setModalMessage("No match found for the uploaded image.");
                setModalOpen(true);
            }
        } catch (error) {
            console.error("Error during upload:", error);
            setModalMessage("An error occurred during the upload process.");
            setModalOpen(true);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const handleLocationSelect = (locationData) => {
        const [lat, lng] = locationData.coordinates.split(',').map(Number);
        setEditedData(prev => ({
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
            if (editedData && matchedImageData.id) {
                await updateMissingPerson(matchedImageData.id, editedData);
                setModalMessage("Listing updated successfully!");
                setModalOpen(true);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating listing:", error);
            setModalMessage("Failed to update listing. Please try again.");
            setModalOpen(true);
        }
    };

    const handleDateChange = (date) => {
        setEditedData(prev => ({
            ...prev,
            dateMissing: date
        }));
    };

    const detectFaces = async (file, existingPersons) => {
        if (!file) {
            console.error("Invalid image file");
            return;
        }

        const imageUrl = URL.createObjectURL(file);

        try {
            const imgElement = new Image();
            imgElement.src = imageUrl;
            await imgElement.decode();

            const uploadedDescriptor = await faceapi.computeFaceDescriptor(imgElement);

            for (const existingPerson of existingPersons) {
                const existingImg = await faceapi.fetchImage(existingPerson.imgSrc[0]);
                const existingDescriptor = await faceapi.computeFaceDescriptor(existingImg);

                if (uploadedDescriptor && existingDescriptor) {
                    const distance = faceapi.euclideanDistance(uploadedDescriptor, existingDescriptor);
                    if (distance < 0.6) {
                        return { 
                            id: existingPerson.id,
                            image: existingPerson.imgSrc, 
                            name: existingPerson.name, 
                            description: existingPerson.description,
                            dateMissing: existingPerson.dateMissing, 
                            location: existingPerson.location,
                            imgSrc: existingPerson.imgSrc
                        };
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching image:", error);
        }
        return null;
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center'}}>Upload Image for Facial Recognition</h1>
            
            {/* Image Upload Section */}
            <div style={{ display: 'flex', marginTop: '20px', marginBottom: '20px'}}>
                <div style={{ textAlign: 'center', borderRadius: '15px', border: '2px solid #76c7c0', padding: '30px', backgroundColor: '#f0f8ff', width: '44%', marginLeft: '50px' }}>
                    {imageUrl && (
                        <div>
                            <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '90%', height: 'auto', borderRadius: '10px' }} />
                            <p style={{ textAlign: 'center' }}>Uploaded Image</p>
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'center', borderRadius: '15px', border: '2px solid #76c7c0', padding: '30px', backgroundColor: '#f0f8ff', width: '44%', marginLeft: '45px' }}>
                    {matchedImage && (
                        <div>
                            <img src={matchedImage} alt="Matched" style={{ maxWidth: '90%', height: 'auto', borderRadius: '10px' }} />
                            <p>Matched Image: {matchedImageData.name}</p>
                            <p>Date Missing: {matchedImageData.dateMissing ? getDateValue(matchedImageData.dateMissing).toLocaleDateString() : 'N/A'}</p>
                            <p>Location: {matchedImageData.location?.address || 'Location not available'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Controls */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    style={{ marginBottom: '15px', display: 'block', margin: '0 auto' }}
                />
                <button 
                    onClick={handleUpload} 
                    disabled={loading} 
                    style={{ 
                        backgroundColor: '#76c7c0', 
                        color: 'white', 
                        padding: '15px 30px', 
                        fontSize: '16px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Searching...' : 'Search for Match'}
                </button>
            </div>

            {/* Edit Section */}
            {isEditing && editedData && (
                <Box sx={{ 
                    padding: '20px', 
                    margin: '20px 50px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '15px',
                    border: '2px solid #76c7c0'
                }}>
                    <Typography variant="h5" gutterBottom>
                        Update Listing Information
                    </Typography>
                    
                    <TextField
                        fullWidth
                        label="Name"
                        value={editedData.name}
                        onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                        sx={{ mb: 2 }}
                    />
                    
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={4}
                        value={editedData.description}
                        onChange={(e) => setEditedData({...editedData, description: e.target.value})}
                        sx={{ mb: 2 }}
                    />

                    <Typography variant="h6" gutterBottom>
                        Date Missing
                    </Typography>
                    <div style={{ marginBottom: '16px' }}>
                        <Calendar 
                            onChange={handleDateChange}
                            value={getDateValue(editedData.dateMissing)}
                            className="react-calendar"
                        />
                    </div>

                    <Typography variant="h6" gutterBottom>
                        Update Location
                    </Typography>
                    <Box sx={{ height: '400px', mb: 2 }}>
                        <MapComponent 
                            onLocationSelect={handleLocationSelect}
                            initialLocation={editedData.location}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        onClick={handleUpdateListing}
                        sx={{
                            backgroundColor: '#76c7c0',
                            '&:hover': {
                                backgroundColor: '#5fb5ae'
                            }
                        }}
                    >
                        Update Listing
                    </Button>
                </Box>
            )}

            {/* Progress Bar */}
            {progress > 0 && (
                <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: `${progress}%`, height: '10px', backgroundColor: '#76c7c0', borderRadius: '5px' }} />
                </div>
            )}

            {/* Modal */}
            <ImageModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                message={modalMessage}
            />
        </div>
    );
};

export default NewImageUploadPage;
