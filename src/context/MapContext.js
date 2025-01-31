import React, { createContext, useContext, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [googleMaps, setGoogleMaps] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeMap = useCallback(async () => {
    if (!googleMaps) {
      try {
        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places"]
        });

        const google = await loader.load();
        setGoogleMaps(google);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
      }
    }
  }, [googleMaps]);

  React.useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  return (
    <MapContext.Provider value={{ googleMaps, isLoading }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
