import React, { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import WebGLCanvas from './WebGLCanvas';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';
import { useAuth } from './authContext';
import './App.css';
import { ReactComponent as LineIcon } from './assets/line.svg';
import { ReactComponent as CircleIcon } from './assets/circle.svg';
import { BiSolidEraser } from "react-icons/bi";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App = () => {
  const [isEraserMode, setEraserMode] = useState(false);
  const [isCircleMode, setCircleMode] = useState(false);
  const [activeButton, setActiveButton] = useState('');
  const navigate = useNavigate();

  const handleClick = (action) => {
    console.log(`Button ${action} clicked`);
    if (action === 'Eraser') {
      setEraserMode((prevMode) => !prevMode);
      setCircleMode(false);
      setActiveButton((prevMode) => (prevMode === 'Eraser' ? '' : 'Eraser'));
    } else if (action === 'Circle') {
      setCircleMode((prevMode) => !prevMode);
      setEraserMode(false);
      setActiveButton((prevMode) => (prevMode === 'Circle' ? '' : 'Circle'));
    } else {
      alert(`Button ${action} clicked!`);
    }
  };

  const shouldShowToolbar = ['/webglcanvas'].includes(window.location.pathname);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/webglcanvas" element={<PrivateRoute element={<WebGLCanvas isEraserMode={isEraserMode} isCircleMode={isCircleMode} />} />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      {shouldShowToolbar && (
        <div className="floating-toolbar">
          <button
            onClick={() => handleClick('Home')}
            className={activeButton === 'Home' ? 'active' : ''}
          >
            <LineIcon />
          </button>
          <button
            onClick={() => handleClick('Circle')}
            className={activeButton === 'Circle' ? 'active' : ''}
          >
            <CircleIcon />
          </button>
          <button
            onClick={() => handleClick('Eraser')}
            className={activeButton === 'Eraser' ? 'active' : ''}
          >
            <BiSolidEraser />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
