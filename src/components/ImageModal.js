import React from 'react';
import { Button } from '@mui/material';
import './ImageModal.css';

const ImageModal = ({ isOpen, onClose, image, name, dateMissing, location, message, showUpdateOption, onUpdateClick }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <h1>{showUpdateOption ? 'Match Found!' : 'Alert!'}</h1>
                <p>{message}</p>
                {showUpdateOption && (
                    <div className="modal-actions">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={onUpdateClick}
                            style={{ 
                                backgroundColor: '#76c7c0',
                                marginTop: '20px'
                            }}
                        >
                            Update Listing Information
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageModal;
