// Card.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Card.css';

const Card = ({ id, image, title, description, footerLeft, onClick, username }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/${username}/check_solved_problem/${id}/`);
        setStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching problem status:', error);
      }
    };

    fetchStatus();
  }, [id, username]);

  return (
    <div className="card" onClick={() => onClick(id)}>
      <div className="card-image">
        <img src={image} alt={title} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <p className="card-footer">
        <span>{footerLeft}</span>
        <span className={`status ${status ? 'solved' : 'unsolved'}`}>
          {status ? '해결' : '미해결'}
        </span>
      </p>
    </div>
  );
};

export default Card;
