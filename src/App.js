import React, { useState } from 'react';
import WebGLCanvas from './WebGLCanvas';
import './App.css';
import { ReactComponent as LineIcon } from './assets/line.svg';
import { ReactComponent as CircleIcon } from './assets/circle.svg';
import { BiSolidEraser } from "react-icons/bi";

const App = () => {
  const [isEraserMode, setEraserMode] = useState(false);
  const [isCircleMode, setCircleMode] = useState(false);

  const handleClick = (action) => {
    if (action === 'Eraser') {
      setEraserMode((prevMode) => !prevMode);
      setCircleMode(false); // Turn off circle mode
    } else if (action === 'Circle') {
      setCircleMode((prevMode) => !prevMode);
      setEraserMode(false); // Turn off eraser mode
    } else if (action === 'Home') {
      setEraserMode(false); // Turn off eraser mode
      setCircleMode(false); // Turn off circle mode
    } else {
      alert(`Button ${action} clicked!`);
    }
  };

  return (
    <div className="App">
      <WebGLCanvas isEraserMode={isEraserMode} isCircleMode={isCircleMode} />
      <div className="floating-toolbar">
        <button onClick={() => handleClick('Home')}><LineIcon /></button>
        <button onClick={() => handleClick('Circle')}><CircleIcon /></button>
        <button onClick={() => handleClick('Eraser')}><BiSolidEraser /></button>
      </div>
    </div>
  );
};

export default App;
