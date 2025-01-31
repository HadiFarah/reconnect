import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingButton.css'; // Import the CSS for styling

const FloatingButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/upload'); // Navigate to the upload page
    };

    return (
        <button className="floating-button" onClick={handleClick}>
            Report A Sighting
        </button>
    );
};

export default FloatingButton;
