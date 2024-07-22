import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form default submission
    console.log('Login attempt'); // Debugging statement

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/token/`,
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log('Response:', response); // Debugging statement

      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        console.log('Login successful, navigating to main page'); // Debugging statement
        login();
        navigate('/dashboard');  // Redirect to the main page
      } else {
        setMessage('Invalid credentials');
      }
    } catch (error) {
      console.error('Error:', error); // Debugging statement
      setMessage('Invalid credentials');
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <h1>Shaart</h1>
        <nav>
          <ul>
            <li><a href="#!">자료</a></li>
            <li><a href="#!">계산기</a></li>
            <li><a href="#!">검색</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <div className="login-container">
          <h2>스마트한 방법으로 수학을 가르치고 배우세요</h2>
          <p>Shaart는 수학을 위한 무료 도구 세트 그 이상입니다. 열정적인 교사와 학생을 연결하고 수학을 탐구하고 배울 수 있는 새로운 방법을 제공하는 플랫폼입니다.</p>
          <form onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">로그인</button>
          </form>
          {message && <p className="error-message">{message}</p>}
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
