import React, { useState, useEffect } from 'react';
import MissingPersonCard from '../components/MissingPersonCard';
import { fetchMissingPersons } from '../util/firestore';
import './styles.css';

const HomePage = () => {
  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchMissingPersons();
      setMissingPersons(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredPersons = missingPersons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button">🔍</button>
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
