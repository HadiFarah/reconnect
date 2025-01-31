import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Divider, Box, Typography } from '@mui/material';
import { fetchUserById } from '../util/firestore-updated';
import 'swiper/swiper-bundle.css';
import './styles.css';

const MissingPersonCard = ({ person }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [locationAddress, setLocationAddress] = useState('');
    const [reporterInfo, setReporterInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const geocodeLocation = async () => {
            if (person.location && typeof person.location.lat === 'number' && typeof person.location.lng === 'number') {
                try {
                    const geocoder = new window.google.maps.Geocoder();
                    
                    const response = await new Promise((resolve, reject) => {
                        geocoder.geocode({ 
                            location: { 
                                lat: person.location.lat, 
                                lng: person.location.lng 
                            } 
                        }, (results, status) => {
                            if (status === 'OK') {
                                resolve(results);
                            } else {
                                reject(status);
                            }
                        });
                    });
                    
                    if (response[0]) {
                        setLocationAddress(response[0].formatted_address);
                        return;
                    }
                } catch (error) {
                    console.error('Geocoding failed:', error);
                }
                setLocationAddress(`${person.location.lat.toFixed(6)}, ${person.location.lng.toFixed(6)}`);
            } else {
                setLocationAddress(`${person.location.lat}, ${person.location.lng}`);
            }
        };

        geocodeLocation();
    }, [person.location]);

    useEffect(() => {
        const getReporterInfo = async () => {
            if (person.reporterId) {
                const userData = await fetchUserById(person.reporterId);
                setReporterInfo(userData);
            }
            setLoading(false);
        };

        getReporterInfo();
    }, [person.reporterId]);

    const handleCardClick = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="missing-person-card" onClick={handleCardClick}>
            <Swiper spaceBetween={10} slidesPerView={1}>
                {person.imgSrc.map((ref, index) => (
                    <SwiperSlide key={index}>
                        <img className="card-img" src={ref} alt={person.name} />
                    </SwiperSlide>
                ))}
            </Swiper>
            <h2>{person.name}</h2>
            <p>{person.description}</p>
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setIsModalOpen(false)}>X</button>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: '1' }}>
                                <h2>{person.name}</h2>
                                <Swiper style={{ width: '100%', maxWidth: '500px' }}>
                                    {person.imgSrc.map((ref, index) => (
                                        <SwiperSlide key={index}>
                                            <img 
                                                src={ref} 
                                                alt={`Missing person ${person.name}`}
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            <div style={{ flex: '1' }}>
                                <Box>
                                    <Typography variant="body1" gutterBottom>
                                        {person.description}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Went missing on {person.dateMissing?.toDate().toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Last seen at {locationAddress}
                                    </Typography>
                                    <Divider style={{ margin: '20px 0' }} />
                                    <Typography variant="h6" gutterBottom>
                                        Contact Reporter
                                    </Typography>
                                    {loading ? (
                                        <Typography>Loading contact information...</Typography>
                                    ) : reporterInfo ? (
                                        <>
                                            <Typography variant="body1" gutterBottom>
                                                Contact Person: {reporterInfo.username || 'Not provided'}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                Email: {reporterInfo.email || 'Not provided'}
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                Phone: {reporterInfo.phoneNumber || 'Not provided'}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography>Contact information not available</Typography>
                                    )}
                                </Box>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MissingPersonCard;
