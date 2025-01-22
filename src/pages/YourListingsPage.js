import React, { useState, useEffect } from 'react';
import './styles.css';

const YourListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      // Simulate fetching data from an API or database
      const data = [
        { id: 1, title: 'Listing 1', description: 'Description for listing 1', imgSrc: 'path/to/image1.jpg' },
        { id: 2, title: 'Listing 2', description: 'Description for listing 2', imgSrc: 'path/to/image2.jpg' },
      ];
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, []);

  return (
    <div>
      <h1>Your Listings</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="listings-list">
          {listings.map(listing => (
            <div key={listing.id} className="listing-card">
              <img src={listing.imgSrc} alt={listing.title} />
              <h2>{listing.title}</h2>
              <p>{listing.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourListingsPage;
