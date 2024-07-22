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
import { BiSolidEraser, BiLogOut } from "react-icons/bi"; // Import the logout icon


const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};


const App = () => {
  const [isEraserMode, setEraserMode] = useState(false);
  const [isCircleMode, setCircleMode] = useState(false);
  const { logout } = useAuth(); // Get the logout function from context
  const navigate = useNavigate(); // Get the navigate function from react-router-dom


  const handleClick = (action) => {
    console.log(`Button ${action} clicked`);
    if (action === 'Eraser') {
      setEraserMode((prevMode) => !prevMode);
      setCircleMode(false); // Turn off circle mode
    } else if (action === 'Circle') {
      setCircleMode((prevMode) => !prevMode);
      setEraserMode(false); // Turn off eraser mode
    } else if (action === 'Logout') {
      logout(navigate); // Call the logout function with navigate
    } else {
      alert(`Button ${action} clicked!`);
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/webglcanvas" element={<PrivateRoute element={<WebGLCanvas isEraserMode={isEraserMode} isCircleMode={isCircleMode} handleClick={handleClick} />} />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

export default App;
