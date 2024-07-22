import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/webglcanvas'); // Navigate to WebGLCanvas page
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Hello Daniel</h1>
        <p>Do you already know what you will design today? Choose a project to get inspired 😊</p>
      </header>
      <main>
        <div className="card-container">
          <div className="card" onClick={handleCardClick}>
            <h3>Add new project</h3>
            <p>Start and modify your tasks in a new and improved way.</p>
          </div>
          <div className="card" onClick={handleCardClick}>
            <h3>Friendly painters</h3>
            <p>Task: Practice<br />Date: 03/07/2020</p>
          </div>
          {/* Add more cards as needed */}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
