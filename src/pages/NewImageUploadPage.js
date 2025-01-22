import React, { useState, useEffect } from "react";
import { storage, fetchImagesWithNames } from '../database/firebase'; // Ensure this is correctly set up
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as faceapi from 'face-api.js'; // Import face-api.js
 
const NewImageUploadPage = () => {
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0); // State for progress
    const [matchedImage, setMatchedImage] = useState(null); // State for matched image
    const [matchedImageData, setMatchedImageData] = useState(null); // State for matched image data

    useEffect(() => {
        const loadModels = async () => {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models'); // Load models
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
            console.log("Models loaded successfully.");
        };
        loadModels();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        // Fetch existing images and their names from Firestore
        const existingImages = await fetchImagesWithNames();
        const downloadURL = URL.createObjectURL(file); // Create a URL for the file
        const matchedImageData = await detectFaces(downloadURL, existingImages);

        if (matchedImageData) {
            setMatchedImage(matchedImageData.image); // Set the matched image URL
            setMatchedImageData(matchedImageData); // Store matched image data
            // Proceed to upload the image only if a match is found
            const storageRef = ref(storage, `images/${file.name}`);
            setLoading(true);

            const metadata = {
                contentType: file.type // Set the correct MIME type
            };

            const uploadTask = uploadBytesResumable(storageRef, file, metadata);
            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress); // Update progress
            }, (error) => {
                console.error(error);
                setLoading(false);
            }, async () => {
                const downloadURL = await getDownloadURL(storageRef);
                setImageUrl(downloadURL);
                setLoading(false);
            });
        } else {
            console.log("No match found, image will not be uploaded.");
        }
    };

    const detectFaces = async (imageUrl, existingImages) => {
        if (!imageUrl) {
            console.error("Invalid image URL");
            return;
        }
    
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error("Image could not be fetched");
            }
    
            const blob = await response.blob(); // Fetch the image as a Blob
            const imgElement = new Image();
            imgElement.src = URL.createObjectURL(blob); // Create a URL for the Blob
            await imgElement.decode(); // Wait for the image to load
    
            // Compute the face descriptor for the uploaded image
            const uploadedDescriptor = await faceapi.computeFaceDescriptor(imgElement);
    
            // Compare with existing images
            for (const existingImage of existingImages) {
                const existingImg = await faceapi.fetchImage(existingImage.url);
                const existingDescriptor = await faceapi.computeFaceDescriptor(existingImg);
    
                // Ensure both descriptors are valid before comparing
                if (uploadedDescriptor && existingDescriptor) {
                    const distance = faceapi.euclideanDistance(uploadedDescriptor, existingDescriptor);
                    if (distance < 0.6) { // Adjust the threshold as needed
                        return { image: existingImage.url, name: existingImage.name };
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching image:", error);
        }
        return null; // Return null if no match is found
    };

    return (
        <div>
            <h1>Upload Image for Facial Recognition</h1>
            <input type="file" onChange={handleFileChange} />
            <button 
                onClick={handleUpload} 
                disabled={loading} 
                style={{ padding: '15px 30px', fontSize: '16px' }}
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>
            {progress > 0 && (
                <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', marginTop: '10px' }}>
                    <div style={{ width: `${progress}%`, height: '10px', backgroundColor: '#76c7c0', borderRadius: '5px' }} />
                </div>
            )}
            <div className="image-container">
                {imageUrl && (
                    <div>
                        <img src={imageUrl} alt="Uploaded" style={{ width: '30%', height: 'auto' }} />
                        <p>Uploaded Image</p>
                    </div>
                )}
                {matchedImage && (
                    <div>
                        <img src={matchedImage} alt="Matched" style={{ width: '30%', height: 'auto' }} />
                        <p>Matched Image: {matchedImageData.name}</p>
                        <p>Name: Hadi</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewImageUploadPage;
