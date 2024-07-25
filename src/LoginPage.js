import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import './LoginPage.css';
import mainImage from './main_image.png';
import backgroundImage from './09.png';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '', email: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/token/`, credentials, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', response.data.username); // Store the username
        login();
        navigate('/dashboard');
      } else {
        setMessage('Invalid credentials');
      }
    } catch (error) {
      setMessage('Invalid credentials or network issue');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/register/`, {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      });
      setMessage(response.data.message);
      if (response.data.message === "User registered successfully") {
        navigate('/login'); // Redirect to the login page
      }
    } catch (error) {
      setMessage('Registration failed');
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="left-container">
        <div className="brand-container">
          <div className="bar"></div>
          <h1>SHA-ART</h1>
          <p>누구나 손쉽게 정밀한 도형을 완성하는 혁신적인 작도 프로그램.</p>
        </div>
        {isRegistering ? (
          <div className="login-container">
            <form onSubmit={handleRegister}>
              <input type="text" name="username" placeholder="Username" value={credentials.username} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={credentials.email} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
              <button type="submit">Register</button>
              <button type="button" onClick={() => setIsRegistering(false)}>Back to Login</button>
            </form>
            {message && <p>{message}</p>}
          </div>
        ) : (
          <div className="login-container">
            <form onSubmit={handleLogin}>
              <input type="text" name="username" placeholder="Username" value={credentials.username} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
              <button type="submit">Login</button>
              <button type="button" onClick={() => setIsRegistering(true)}>Go to Register</button>
            </form>
            {message && <p className="error-message">{message}</p>}
          </div>
        )}
      </div>
      <div className="image-container">
        <img src={mainImage} alt="Main Visual" />
      </div>
    </div>
  );
};

export default LoginPage;