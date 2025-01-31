import React, { useState, useEffect } from 'react';
import MissingPersonCard from '../components/MissingPersonCard';
import { fetchMissingPersons } from '../util/firestore';
import { getCurrentLocation, calculateDistance } from '../util/locationUtils';
import { FaSearch } from 'react-icons/fa';
import './styles.css';

const HomePage = () => {
  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user's location first
        const location = await getCurrentLocation();
        setUserLocation(location);
        
        // Fetch missing persons data
        const data = await fetchMissingPersons();
        
        if (location && data.length > 0) {
          // Sort by distance
          const sortedData = data.sort((a, b) => {
            // Handle cases where location might be missing
            if (!a.location) return 1;
            if (!b.location) return -1;
            
            const distanceA = calculateDistance(
              location.lat,
              location.lng,
              a.location.lat,
              a.location.lng
            );
            
            const distanceB = calculateDistance(
              location.lat,
              location.lng,
              b.location.lat,
              b.location.lng
            );
            
            return distanceA - distanceB;
          });
          
          setMissingPersons(sortedData);
        } else {
          setMissingPersons(data);
        }
      } catch (error) {
        const data = await fetchMissingPersons();
        setMissingPersons(data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPersons = missingPersons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="search-bar" style={{ margin: '20px auto', width: '90%', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '5px' }}
        />
        <button 
          className="search-button" 
          style={{ 
            position: 'absolute', 
            right: '0px', 
            top: '20px', 
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <FaSearch />
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="missing-persons-list">
          {filteredPersons.map(person => (
            <MissingPersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
