import React, { useEffect, useRef } from 'react';
import { useMap } from '../context/MapContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const MapComponent = ({ onLocationSelect, initialLocation }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { googleMaps, isLoading } = useMap();

  useEffect(() => {
    if (!googleMaps || !mapRef.current || mapInstanceRef.current) return;

    const defaultLocation = { lat: 1.3521, lng: 103.8198 }; // Singapore
    const initialPos = initialLocation ? 
      { lat: initialLocation.lat, lng: initialLocation.lng } : 
      defaultLocation;

    // Create map instance only once
    mapInstanceRef.current = new googleMaps.maps.Map(mapRef.current, {
      center: initialPos,
      zoom: 12,
    });

    const geocoder = new googleMaps.maps.Geocoder();

    // Set up click listener only once
    mapInstanceRef.current.addListener('click', async (event) => {
      event.stop(); // Prevent event bubbling
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new googleMaps.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true
      });

      try {
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results[0]) {
          const address = response.results[0].formatted_address;
          onLocationSelect({
            coordinates: `${lat},${lng}`,
            address: address
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    });

  }, [googleMaps]); // Only depend on googleMaps

  // Handle initial location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !initialLocation) return;

    const position = { 
      lat: initialLocation.lat, 
      lng: initialLocation.lng 
    };

    // Update map center
    mapInstanceRef.current.setCenter(position);

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new googleMaps.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
        draggable: true
      });

      // Set up marker drag listener
      const geocoder = new googleMaps.maps.Geocoder();
      markerRef.current.addListener('dragend', async () => {
        const newPosition = markerRef.current.getPosition();
        const lat = newPosition.lat();
        const lng = newPosition.lng();

        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results[0]) {
            const address = response.results[0].formatted_address;
            onLocationSelect({
              coordinates: `${lat},${lng}`,
              address: address
            });
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      });
    }
  }, [initialLocation, googleMaps]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        borderRadius: '8px'
      }} 
      onClick={(e) => e.stopPropagation()} // Prevent click propagation
    />
  );
};

export default MapComponent;
