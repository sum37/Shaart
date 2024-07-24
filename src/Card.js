import React from 'react';
import './Card.css';

const Card = ({ image, title, description, footerLeft, footerRight, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-image">
        <img src={image} alt={title} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <p className="card-footer">
        <span>{footerLeft}</span>
        <span className="price">{footerRight}</span>
      </p>
    </div>
  );
};

export default Card;
