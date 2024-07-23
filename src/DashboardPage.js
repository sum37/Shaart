import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import './DashboardPage.css';
import { useAuth } from './authContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleCardClick = () => {
    navigate('/webglcanvas'); // Navigate to WebGLCanvas page
  };

  const handleLogout = () => {
    logout(navigate); // Call the logout function with navigate
  };

  return (
    <div className="dashboard-page">
      <header className="top-bar">
        <div className="brand">Shaart</div>
        <button className="logout-button" onClick={handleLogout}>
          <BiLogOut />
          Logout
        </button>
      </header>
      <header className="dashboard-header">
        <h1>Hello Daniel</h1>
        <p>Do you already know what you will design today? Choose a project to get inspired 😊</p>
      </header>
      <main>
        <div className="card-container">
          <div className="card" onClick={handleCardClick}>
            <div className="card-icon">&#128736;</div> {/* Placeholder for an icon */}
            <h3>Training course</h3>
            <p>Improve students' ability level through training courses.</p>
            <p className="card-footer"><span>2 days left</span> <span className="price">$36</span></p>
          </div>
          <div className="card" onClick={handleCardClick}>
            <div className="card-icon">&#127916;</div>
            <h3>Live course</h3>
            <p>Improve students' ability level through live courses.</p>
            <p className="card-footer"><span>3 days left</span> <span className="price">-$28</span></p>
          </div>
          <div className="card" onClick={handleCardClick}>
            <div className="card-icon">&#128249;</div>
            <h3>Video course</h3>
            <p>Improve students' ability level through video courses.</p>
            <p className="card-footer"><span>3 days left</span> <span className="price">$15</span></p>
          </div>
          <div className="card" onClick={handleCardClick}>
            <div className="card-icon">&#127909;</div>
            <h3>Radio course</h3>
            <p>Improve students' ability through single-choice courses.</p>
            <p className="card-footer"><span>2 days left</span> <span className="price">$18</span></p>
          </div>
          <div className="card" onClick={handleCardClick}>
            <div className="card-icon">&#128221;</div>
            <h3>Package course</h3>
            <p>Improve students' abilities through package courses.</p>
            <p className="card-footer"><span>3 days left</span> <span className="price">-$25</span></p>
          </div>
          <div className="card" onClick={handleCardClick}>
            <div className="card-icon">&#128214;</div>
            <h3>Other course</h3>
            <p>Improve students' abilities through other courses.</p>
            <p className="card-footer"><span>3 days left</span> <span className="price">$28</span></p>
          </div>
          {/* Add more cards as needed */}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
