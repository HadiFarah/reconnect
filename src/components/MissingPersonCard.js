import React from 'react';
import './styles.css';

const MissingPersonCard = ({ person }) => {
  return (
    <div className="missing-person-card">
      <img className="card-img" src={person.imgSrc} alt={person.name} />
      <h2>{person.name}</h2>
      <p>{person.description}</p>
    </div>
  );
};

export default MissingPersonCard;
