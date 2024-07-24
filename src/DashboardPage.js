import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import './DashboardPage.css';
import Card from './Card';
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
          <Card
            icon="&#128736;"
            title="Training course"
            description="Improve students' ability level through training courses."
            footerLeft="2 days left"
            footerRight="$36"
            onClick={handleCardClick}
          />
          <Card
            icon="&#127916;"
            title="Live course"
            description="Improve students' ability level through live courses."
            footerLeft="3 days left"
            footerRight="-$28"
            onClick={handleCardClick}
          />
          <Card
            icon="&#128249;"
            title="Video course"
            description="Improve students' ability level through video courses."
            footerLeft="3 days left"
            footerRight="$15"
            onClick={handleCardClick}
          />
          <Card
            icon="&#127909;"
            title="Radio course"
            description="Improve students' ability through single-choice courses."
            footerLeft="2 days left"
            footerRight="$18"
            onClick={handleCardClick}
          />
          <Card
            icon="&#128221;"
            title="Package course"
            description="Improve students' abilities through package courses."
            footerLeft="3 days left"
            footerRight="-$25"
            onClick={handleCardClick}
          />
          <Card
            icon="&#128214;"
            title="Other course"
            description="Improve students' abilities through other courses."
            footerLeft="3 days left"
            footerRight="$28"
            onClick={handleCardClick}
          />
          {/* Add more cards as needed */}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
