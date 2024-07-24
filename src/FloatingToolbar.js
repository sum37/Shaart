import React from 'react';
import { ReactComponent as LineIcon } from './assets/line.svg';
import { ReactComponent as CircleIcon } from './assets/circle.svg';
import { BiSolidEraser, BiLogOut } from 'react-icons/bi';

const FloatingToolbar = ({ handleClick }) => {
  return (
    <div className="floating-toolbar">
      <button onClick={() => handleClick('Home')}><LineIcon /></button>
      <button onClick={() => handleClick('Circle')}><CircleIcon /></button>
      <button onClick={() => handleClick('Eraser')}><BiSolidEraser /></button>
      <button onClick={() => handleClick('Submit')}><LineIcon /></button>
      <button onClick={() => handleClick('Logout')}><BiLogOut /></button>
    </div>
  );
};

export default FloatingToolbar;
