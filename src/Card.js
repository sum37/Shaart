import React from 'react';
import './Card.css';

const Card = ({ icon, title, description, price, daysLeft }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-menu">...</div>
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="card-footer">
        <div className="card-info">
          <span className="card-days-left">{daysLeft} days left</span>
        </div>
        <div className="card-price">{price}</div>
      </div>
    </div>
  );
};

export default Card;
