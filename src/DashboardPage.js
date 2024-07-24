import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import './DashboardPage.css';
import Card from './Card';
import { useAuth } from './authContext';
import myimg from './assets/su.png';
import mathimg from './math.png';

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
        <div className="brand">SHA-ART</div>
        <button className="logout-button" onClick={handleLogout}>
          <BiLogOut />
          Logout
        </button>
      </header>
      <header className="dashboard-header">
        
        <div className="image-container">
          <img src={mathimg} alt="Main Visual" />
        </div>
        <h1>시작하세요, 작도</h1>
        <p>차례차례 문제를 풀어보세요. 귀하의 공간지각능력을 키워보세요 😊</p>
      </header>
      <main>
        <div className="card-container">
          <Card
            image={myimg}
            title="수선의 발"
            description="임의의 선분이 주어졌을 때 선분의 수선을 작도하세요"
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
          />
          <Card
            image={myimg}
            title="수선의 발"
            description="임의의 선분이 주어졌을 때 선분의 수선을 작도하세요"
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
          />
          <Card
            image={myimg}
            title="수선의 발"
            description="임의의 선분이 주어졌을 때 선분의 수선을 작도하세요"
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
          />
          <Card
            image={myimg}
            title="수선의 발"
            description="임의의 선분이 주어졌을 때 선분의 수선을 작도하세요"
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
          />
          <Card
            image={myimg}
            title="수선의 발"
            description="임의의 선분이 주어졌을 때 선분의 수선을 작도하세요"
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
          />
          <Card
            image={myimg}
            title="수선의 발"
            description="임의의 선분이 주어졌을 때 선분의 수선을 작도하세요"
            footerLeft="난이도 하"
            footerRight="미해결"
            onClick={handleCardClick}
          />
          {/* Add more cards as needed */}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
