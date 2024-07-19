import React, { useEffect, useRef } from 'react';

const WebGLCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const resizeCanvas = () => {
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
          gl_PointSize = 15.0;
          gl_Position = vec4(a_position, 0, 1);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          if (length(coord) > 0.5) {
              discard;
          }
          gl_FragColor = u_color;
      }
    `;

    const createShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const positionBuffer = gl.createBuffer();

    let isNearPoint = false;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const drawPoints = (points) => {
      gl.uniform4f(colorLocation, 1, 0, 0, 1); // Red color for points
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, points.length / 2);
    };

    const drawLine = (points, color) => {
      gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]); // Set color
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, points.length / 2);
    };

    const drawDashedLine = (x0, y0, x1, y1, color, dashLength = 0.02, gapLength = 0.02) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dashCount = Math.floor(distance / (dashLength + gapLength));
      const dashX = (dx / distance) * dashLength;
      const dashY = (dy / distance) * dashLength;
      const gapX = (dx / distance) * gapLength;
      const gapY = (dy / distance) * gapLength;
      let dashPoints = [];

      for (let i = 0; i < dashCount; i++) {
        const startX = x0 + i * (dashX + gapX);
        const startY = y0 + i * (dashY + gapY);
        const endX = startX + dashX;
        const endY = startY + dashY;
        dashPoints.push(startX, startY, endX, endY);
      }

      drawLine(dashPoints, color);
    };

    let points = [];
    let lines = [];
    let currentLine = [];
    let isAnimating = false;
    const magneticRadius = 0.05; // Radius for magnetic effect

    const animateLine = () => {
      let progress = 0;
      const steps = 50;
      const x0 = currentLine[0];
      const y0 = currentLine[1];
      const x1 = currentLine[2];
      const y1 = currentLine[3];

      const step = () => {
        progress++;
        const t = progress / steps;
        const x = x0 + t * (x1 - x0);
        const y = y0 + t * (y1 - y0);

        gl.clear(gl.COLOR_BUFFER_BIT);

        drawLine(lines, [0, 0, 0, 1]); // Black color for existing lines
        drawLine([x0, y0, x, y], [0, 0, 0, 1]); // Black color for animated line
        drawPoints(points);

        if (progress < steps) {
          requestAnimationFrame(step);
        } else {
          lines.push(...currentLine);
          currentLine = [];
          isAnimating = false;
          gl.clear(gl.COLOR_BUFFER_BIT);
          drawLine(lines, [0, 0, 0, 1]); // Black color for existing lines
          drawPoints(points);
        }
      };

      requestAnimationFrame(step);
      isNearPoint = false;
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

      isNearPoint = false;

      for (let i = 0; i < points.length; i += 2) {
        const px = points[i];
        const py = points[i + 1];
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance < magneticRadius) {
          x = px;
          y = py;
          isNearPoint = true;
          break;
        }
      }

      let hoverPoint = [x, y];

      canvas.style.cursor = isNearPoint ? 'pointer' : 'default';

      gl.clear(gl.COLOR_BUFFER_BIT);
      drawLine(lines, [0, 0, 0, 1]); // Black color for existing lines
      drawPoints(points);

      if (hoverPoint && points.length % 4 === 2) {
        drawDashedLine(points[points.length - 2], points[points.length - 1], hoverPoint[0], hoverPoint[1], [0, 0, 1, 1]); // Blue dashed line
      }
    };

    const handleClick = (event) => {
      if (isAnimating) return;

      const rect = canvas.getBoundingClientRect();
      let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

      for (let i = 0; i < points.length; i += 2) {
        const px = points[i];
        const py = points[i + 1];
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance < magneticRadius) {
          x = px;
          y = py;
          break;
        }
      }

      points.push(x, y);

      if (points.length % 4 === 0) {
        currentLine = points.slice(-4);
        isAnimating = true;
        animateLine();
        canvas.style.cursor = 'default';
      } else {
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawLine(lines, [0, 0, 0, 1]); // Black color for existing lines
        drawPoints(points);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default WebGLCanvas;
