import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import WebGLCanvas, { WebGLCanvasRefs } from './WebGLCanvas';
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

const distance = (x1, y1, x2, y2) => {
  return parseFloat(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(4));
};

const isTriangle = (lines) => {
  if(lines.length !== 12) return false;

  const line1 = distance(lines[0], lines[1], lines[2], lines[3]);
  const line2 = distance(lines[4], lines[5], lines[6], lines[7]);
  const line3 = distance(lines[8], lines[9], lines[10], lines[11]);

  console.log(line1, line2, line3);

  if (line1 === line2 && line1 === line3 && line2 === line3) return true;

  return false;
};

const App = () => {
  const [isEraserMode, setEraserMode] = useState(false);
  const [isCircleMode, setCircleMode] = useState(false);
  const [isLineMode, setLineMode] = useState(false);
  const [activeButton, setActiveButton] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleClick = (action) => {
    console.log(`Button ${action} clicked`);
    if (action === 'Eraser') {
      setEraserMode(true);
      setCircleMode(false);
      setLineMode(false);
      setActiveButton((prevMode) => (prevMode === 'Eraser' ? '' : 'Eraser'));
    } else if (action === 'Circle') {
      setCircleMode(true);
      setEraserMode(false);
      setLineMode(false);
      setActiveButton((prevMode) => (prevMode === 'Circle' ? '' : 'Circle'));
    } else if (action === 'Line') {
      setLineMode(true);
      setEraserMode(false);
      setCircleMode(false);
      setActiveButton((prevMode) => (prevMode === 'Line' ? '' : 'Line'));
    } else if (action === 'Submit') {
      const confirmed = window.confirm('제출하시겠습니까?');
      if (confirmed) {
        // Handle the submission logic here
        console.log('Submission confirmed');

        // Retrieve points, lines, and circles
        const points = WebGLCanvasRefs.pointsRef;
        const lines = WebGLCanvasRefs.linesRef;
        const circles = WebGLCanvasRefs.circlesRef;

        // Print the points, lines, and circles to the console
        console.log('Points:', points);
        console.log('Lines:', lines);
        console.log('Circles:', circles);

        // Check if the points form a triangle
        const isTriangleFormed = isTriangle(lines);
        if (isTriangleFormed) {
          alert('The shapes form a triangle.');
        } else {
          alert('The shapes do not form a triangle.');
        }

        // 각의 이등분선
        // const isBisector = isBisector(lines);
        // if (isBisector) {
        //   alert('이등분함');
        // } else {
        //   alert('이등분안함');
        // }
      } else {
        console.log('Submission canceled');
      }
    }
  };

  const shouldShowToolbar = window.location.pathname.startsWith('/webglcanvas');

  return (
    <div className="App">
      <div className="username-display">Welcome, {username}!</div> {/* Display the username */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/webglcanvas/:id" element={<PrivateRoute element={<WebGLCanvas isLineMode={isLineMode} isEraserMode={isEraserMode} isCircleMode={isCircleMode} />} />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>

      {shouldShowToolbar && (
        <div className="floating-toolbar">
          <button
            onClick={() => handleClick('Line')}
            className={activeButton === 'Line' ? 'active' : ''}
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
          <button
            onClick={() => handleClick('Submit')}
            className={activeButton === 'Submit' ? 'active' : ''}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
