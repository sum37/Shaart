// DashboardPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import './DashboardPage.css';
import Card from './Card';
import { useAuth } from './authContext';
import myimg from './assets/su.png';
import triangle from './assets/triangle.png';
import seven from './assets/seven.png';
import two__angle from './assets/angle_two.png';

const DashboardPage = ({ username }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleCardClick = (id) => {
    navigate(`/webglcanvas/${id}`); // Navigate to WebGLCanvas page with the id
  };

  const handleLogout = () => {
    logout(navigate); // Call the logout function with navigate
  };

  return (
    <div className="dashboard-page">
      <header className="top-bar">
        <div className="brand">SHA-ART</div>
        <button className="logout-button" onClick={handleLogout}>
          <BiLogOut />
          Logout
        </button>
      </header>
      <header className="dashboard-header">
        <h1>시작하세요, 작도</h1>
        <p>차례차례 문제를 풀어보세요. 귀하의 공간지각능력을 키워보세요 😊</p>
      </header>
      <main>
        <div className="card-container">
          <Card
            id={1}
            image={myimg}
            title="수선의 발"
            description="임의의 선분이 주어졌을 때 선분의 수선을 작도하세요."
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
            username={username}
          />
          <Card
            id={2}
            image={two__angle}
            title="각의 이등분 선"
            description="임의의 각을 이등분 하는 선을 작도하세요."
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
            username={username}
          />
          <Card
            id={3}
            image={triangle}
            title="정삼각형"
            description="주어진 선분을 한 변으로 하는 정삼각형을 작도하세요."
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
            username={username}
          />
          <Card
            id={4}
            image={seven}
            title="정육각형"
            description="주어진 선분을 한 변으로 하는 정육각형을 작도하세요."
            footerLeft="난이도 중"
            footerRight="미해결"
            onClick={handleCardClick}
            username={username}
          />
          {/* Add more cards as needed */}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;