import React, { useState } from 'react';
import WebGLCanvas from './WebGLCanvas';
import './App.css';
import { ReactComponent as LineIcon } from './assets/line.svg';
import { ReactComponent as CircleIcon } from './assets/circle.svg';
import { BiSolidEraser } from "react-icons/bi";

const App = () => {
  const [isEraserMode, setEraserMode] = useState(false);
  const [isCircleMode, setCircleMode] = useState(false);
  const [activeButton, setActiveButton] = useState('');

  const handleClick = (action) => {
    if (action === 'Eraser') {
      setEraserMode((prevMode) => !prevMode);
      setCircleMode(false); // Turn off circle mode
      setActiveButton(prevMode => prevMode === 'Eraser' ? '' : 'Eraser');
    } else if (action === 'Circle') {
      setCircleMode((prevMode) => !prevMode);
      setEraserMode(false); // Turn off eraser mode
      setActiveButton(prevMode => prevMode === 'Circle' ? '' : 'Circle');
    } else if (action === 'Home') {
      setEraserMode(false); // Turn off eraser mode
      setCircleMode(false); // Turn off circle mode
      setActiveButton(prevMode => prevMode === 'Home' ? '' : 'Home');
    } else {
      alert(`Button ${action} clicked!`);
    }
  };

  return (
    <div className="App">
      <WebGLCanvas isEraserMode={isEraserMode} isCircleMode={isCircleMode} />
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
    </div>
  );
};

export default App;
