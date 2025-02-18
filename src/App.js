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
import { BiSolidEraser,BiCheck } from "react-icons/bi";
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const distance = (x1, y1, x2, y2) => {
  return parseFloat(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(2));
};

const angle = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  const dotProduct = (a, b) => a[0] * b[0] + a[1] * b[1];
  const magnitude = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1]);

  const v1 = [x2 - x1, y2 - y1];
  const v2 = [x4 - x3, y4 - y3];

  const dotProd = dotProduct(v1, v2);
  const mag1 = magnitude(v1);
  const mag2 = magnitude(v2);

  const cosTheta = dotProd / (mag1 * mag2);
  const angleRad = Math.acos(cosTheta);
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg.toFixed(0);
};

const isTriangle = (lines) => {
  if (lines.length !== 12) return false;

  const line1 = distance(lines[0], lines[1], lines[2], lines[3]);
  const line2 = distance(lines[4], lines[5], lines[6], lines[7]);
  const line3 = distance(lines[8], lines[9], lines[10], lines[11]);

  console.log(line1, line2, line3);

  if (line1 === line2 && line1 === line3 && line2 === line3) return true;

  return false;
};

const isBisector = (lines) => {
  if (lines.length !== 12) return false;

  const angle1 = angle(lines[0], lines[1], lines[2], lines[3], lines[4], lines[5], lines[6], lines[7]);
  const angle2 = angle(lines[4], lines[5], lines[6], lines[7], lines[8], lines[9], lines[10], lines[11]);
  const angle3 = angle(lines[0], lines[1], lines[2], lines[3], lines[8], lines[9], lines[10], lines[11]);

  console.log(angle1, angle2, angle3);

  const maxAngle = Math.max(angle1, angle2, angle3);

  console.log(maxAngle);

  

  if (maxAngle == angle1) {
    console.log("wowooi")
    return (Math.floor(angle2) == Math.floor(angle3))||(Math.abs(angle2 - angle3) == 1);
  } else if (maxAngle == angle2) {
    return (Math.floor(2 * angle1) === Math.floor(angle2) && Math.floor(2 * angle3) === Math.floor(angle2)) ||
         (Math.abs(angle1 - angle3) === 1);
  } else {
    return (Math.floor(2 * angle2) === Math.floor(angle3) && Math.floor(2 * angle1) === Math.floor(angle3)) ||
         (Math.abs(angle2 - angle1) === 1);
  }
  
};

const isPerpendicular = (lines) => {
  if (lines.length !== 8) return false;
  const angle1 = angle(lines[0], lines[1], lines[2], lines[3], lines[4], lines[5], lines[6], lines[7]);

  return angle1 == 90;
};

const isHexagon = (lines) => {
  if (lines.length !== 28) return false;
  const line1 = distance(lines[24], lines[25], lines[26], lines[27]);
  const line2 = distance(lines[4], lines[5], lines[6], lines[7]);
  const line3 = distance(lines[8], lines[9], lines[10], lines[11]);
  const line4 = distance(lines[12], lines[13], lines[14], lines[15]);
  const line5 = distance(lines[16], lines[17], lines[18], lines[19]);
  const line6 = distance(lines[20], lines[21], lines[22], lines[23]);

  const angle1 = angle(lines[24], lines[25], lines[26], lines[27], lines[4], lines[5], lines[6], lines[7]);
  const angle2 = angle(lines[4], lines[5], lines[6], lines[7], lines[8], lines[9], lines[10], lines[11]);
  const angle3 = angle(lines[8], lines[9], lines[10], lines[11], lines[12], lines[13], lines[14], lines[15]);
  const angle4 = angle(lines[12], lines[13], lines[14], lines[15], lines[16], lines[17], lines[18], lines[19]);
  const angle5 = angle(lines[16], lines[17], lines[18], lines[19], lines[20], lines[21], lines[22], lines[23]);
  const angle6 = angle(lines[20], lines[21], lines[22], lines[23], lines[24], lines[25], lines[26], lines[27]);

  console.log(line1, line2, line3, line4, line5, line6);
  console.log(angle1, angle2, angle3, angle4, angle5, angle6);

  const equalSixLine = (line1 == line2) && (line1 == line3) && (line1 == line4) && (line1 == line5) && (line1 == line6);
  const equalSixAngle = true;

  return equalSixLine && equalSixAngle;
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
      setActiveButton('Eraser');
    } else if (action === 'Circle') {
      setCircleMode(true);
      setEraserMode(false);
      setLineMode(false);
      setActiveButton('Circle');
    } else if (action === 'Line') {
      setLineMode(true);
      setEraserMode(false);
      setCircleMode(false);
      setActiveButton('Line');
    } else if (action === 'Submit') {
      const confirmed = window.confirm('제출하시겠습니까?');
      if (confirmed) {
        // Handle the submission logic here
        console.log('Submission confirmed');

        // Retrieve points, lines, and circles
        const lines = WebGLCanvasRefs.linesRef;
        const id = WebGLCanvasRefs.id;

        if (id == 1) {
          const isPerpendicularFormed = isPerpendicular(lines);
          if (isPerpendicularFormed) {
            alert('정답입니다!');

            axios.post(`${backendUrl}/api/users/${username}/add_solved_problem/`, { problem_id: 1 })
              .then(response => {
                console.log('Problem solved and submitted:', response.data);
              })
              .catch(error => {
                console.error('There was an error submitting the solved problem:', error);
              });
          } else {
            alert('오답입니다!');
          }
        } else if (id == 2) {
          console.log("hihi");
          const isBisectorFormed = isBisector(lines);
          if (isBisectorFormed) {
            alert('정답입니다!');
            axios.post(`${backendUrl}/api/users/${username}/add_solved_problem/`, { problem_id: 2 })
              .then(response => {
                console.log('Problem solved and submitted:', response.data);
              })
              .catch(error => {
                console.error('There was an error submitting the solved problem:', error);
              });
          } else {
            alert('오답입니다!');
          }
        } else if (id == 3) {
          const isTriangleFormed = isTriangle(lines);
          if (isTriangleFormed) {
            alert('정답입니다!');
            axios.post(`${backendUrl}/api/users/${username}/add_solved_problem/`, { problem_id: 3 })
              .then(response => {
                console.log('Problem solved and submitted:', response.data);
              })
              .catch(error => {
                console.error('There was an error submitting the solved problem:', error);
              });
          } else {
            alert('오답입니다!');
          }
        } else if (id == 4) {
          const isHexagonFormed = isHexagon(lines);

          if (isHexagonFormed) {
            alert('정답입니다!');
            axios.post(`${backendUrl}/api/users/${username}/add_solved_problem/`, { problem_id: 4 })
              .then(response => {
                console.log('Problem solved and submitted:', response.data);
              })
              .catch(error => {
                console.error('There was an error submitting the solved problem:', error);
              });
          } else {
            alert('오답입니다!');
          }
        } else {
          // Add additional shape checks here
        }
      } else {
        console.log('Submission canceled');
      }
    }
  };

  const shouldShowToolbar = window.location.pathname.startsWith('/webglcanvas');

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage username={username} />} />} />
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
            <BiCheck />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
