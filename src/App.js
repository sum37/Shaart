import React, { useState } from 'react';
import WebGLCanvas from './WebGLCanvas';
import './App.css';
import { ReactComponent as LineIcon } from './assets/line.svg';
import { ReactComponent as CircleIcon } from './assets/circle.svg';
import { BiSolidEraser } from "react-icons/bi";

const App = () => {
  const [isEraserMode, setEraserMode] = useState(false);

  const handleClick = (action) => {
    if (action === 'Eraser') {
      setEraserMode((prevMode) => !prevMode);
    } else {
      alert(`Button ${action} clicked!`);
    }
  };

  return (
    <div className="App">
      <WebGLCanvas isEraserMode={isEraserMode} />
      <div className="floating-toolbar">
        <button onClick={() => handleClick('Home')}><LineIcon /></button>
        <button onClick={() => handleClick('Search')}><CircleIcon /></button>
        <button onClick={() => handleClick('Eraser')}><BiSolidEraser /></button>
      </div>
    </div>
  );
};


export default App;
