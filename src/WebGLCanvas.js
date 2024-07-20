import React, { useEffect, useRef } from 'react';

const WebGLCanvas = ({ isEraserMode, isCircleMode }) => {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]); // 점들의 좌표 저장
  const linesRef = useRef([]); // 선들의 좌표 저장, 시작점과 끝점 배열로 저장 
  const circlesRef = useRef([]); // 원들의 중심 좌표 저장, 반지름 저장
  const currentLineRef = useRef([]);
  const currentCircleRef = useRef([]);
  const isAnimatingRef = useRef(false);

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

    const drawScene = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      drawLine(linesRef.current, [0, 0, 0, 1]); // Redraw existing lines
      drawPoints(pointsRef.current); // Redraw points
      drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles
    };

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

    const drawCircles = (circles, color) => {
      gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]); // Set color
      const aspect = canvas.width / canvas.height; // 화면 비율
      for (const circle of circles) {
        const [cx, cy, radius] = circle;
        const segments = 100;
        const angleStep = (Math.PI * 2) / segments;
        const circlePoints = [];
        for (let i = 0; i <= segments; i++) {
          const angle = i * angleStep;
          const x = cx + radius * Math.cos(angle) / aspect; // 가로 비율 적용
          const y = cy + radius * Math.sin(angle);
          circlePoints.push(x, y);
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circlePoints), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, circlePoints.length / 2);
      }
    };

    const animateCircle = (cx, cy, radius) => {
      const segments = 100;
      const angleStep = (Math.PI * 2) / segments;
      let progress = 0;

      const step = () => {
        progress++;
        const t = progress / segments;
        const angle = t * 2 * Math.PI;
        const x = cx + radius * Math.cos(angle) / (canvas.width / canvas.height);
        const y = cy + radius * Math.sin(angle);

        gl.clear(gl.COLOR_BUFFER_BIT);

        drawLine(linesRef.current, [0, 0, 0, 1]); // Black color for existing lines
        drawPoints(pointsRef.current);
        drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles

        const circlePoints = [];
        for (let i = 0; i <= progress; i++) {
          const angle = i * angleStep;
          const x = cx + radius * Math.cos(angle) / (canvas.width / canvas.height);
          const y = cy + radius * Math.sin(angle);
          circlePoints.push(x, y);
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circlePoints), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_STRIP, 0, circlePoints.length / 2);

        if (progress < segments) {
          requestAnimationFrame(step);
        } else {
          circlesRef.current.push([cx, cy, radius]);
          isAnimatingRef.current = false;
          drawScene();
        }
      };

      requestAnimationFrame(step);
    };

    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawScene();
    });

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

    const magneticRadius = 0.05;

    let isNearPoint = false;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

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

    const animateLine = () => {
      let progress = 0;
      const steps = 50;
      const x0 = currentLineRef.current[0];
      const y0 = currentLineRef.current[1];
      const x1 = currentLineRef.current[2];
      const y1 = currentLineRef.current[3];

      const step = () => {
        progress++;
        const t = progress / steps;
        const x = x0 + t * (x1 - x0);
        const y = y0 + t * (y1 - y0);

        gl.clear(gl.COLOR_BUFFER_BIT);

        drawLine(linesRef.current, [0, 0, 0, 1]); // Black color for existing lines
        drawLine([x0, y0, x, y], [0, 0, 0, 1]); // Black color for animated line
        drawPoints(pointsRef.current);
        drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles

        if (progress < steps) {
          requestAnimationFrame(step);
        } else {
          linesRef.current.push(...currentLineRef.current);
          currentLineRef.current = [];
          isAnimatingRef.current = false;
          gl.clear(gl.COLOR_BUFFER_BIT);
          drawLine(linesRef.current, [0, 0, 0, 1]); // Black color for existing lines
          drawPoints(pointsRef.current);
          drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles
        }
      };

      requestAnimationFrame(step);
      isNearPoint = false;
    };

    const handleMouseMove = (event) => {
      if (isEraserMode) return;

      const rect = canvas.getBoundingClientRect();
      let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

      isNearPoint = false;

      for (let i = 0; i < pointsRef.current.length; i += 2) {
        const px = pointsRef.current[i];
        const py = pointsRef.current[i + 1];
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
      drawLine(linesRef.current, [0, 0, 0, 1]); // Black color for existing lines
      drawPoints(pointsRef.current);
      drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles

      if (isCircleMode && currentCircleRef.current.length === 2) {
        const [cx, cy] = currentCircleRef.current;
        const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        drawCircles([[cx, cy, radius]], [0, 0, 1, 1]); // Blue color for preview circle
      } else if (hoverPoint && pointsRef.current.length % 4 === 2) {
        drawDashedLine(pointsRef.current[pointsRef.current.length - 2], pointsRef.current[pointsRef.current.length - 1], hoverPoint[0], hoverPoint[1], [0, 0, 1, 1]); // Blue dashed line
      }
    };

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

      if (isEraserMode) {
        // Eraser mode: remove the nearest line if clicked near it
        let lineRemoved = false;
        for (let i = 0; i < linesRef.current.length; i += 4) {
          const x0 = linesRef.current[i];
          const y0 = linesRef.current[i + 1];
          const x1 = linesRef.current[i + 2];
          const y1 = linesRef.current[i + 3];
          if (isPointNearLineSegment(x, y, x0, y0, x1, y1, magneticRadius)) {
            linesRef.current.splice(i, 4);
            lineRemoved = true;
            break;
          }
        }

        if (!lineRemoved) {
          // Eraser mode: remove the nearest point if clicked near it
          for (let i = 0; i < pointsRef.current.length; i += 2) {
            const px = pointsRef.current[i];
            const py = pointsRef.current[i + 1];
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            if (distance < magneticRadius) {
              pointsRef.current.splice(i, 2);
              break;
            }
          }
        }
      } else if (isCircleMode) {
        if (currentCircleRef.current.length === 0) {
          currentCircleRef.current.push(x, y); // Store the center of the circle
        } else {
          const [cx, cy] = currentCircleRef.current;
          const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          currentCircleRef.current = [];
          animateCircle(cx, cy, radius);
        }
      } else {
        for (let i = 0; i < pointsRef.current.length; i += 2) {
          const px = pointsRef.current[i];
          const py = pointsRef.current[i + 1];
          const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
          if (distance < magneticRadius) {
            x = px;
            y = py;
            break;
          }
        }

        pointsRef.current.push(x, y);

        if (pointsRef.current.length % 4 === 0) {
          currentLineRef.current = pointsRef.current.slice(-4);
          isAnimatingRef.current = true;
          animateLine();
          canvas.style.cursor = 'default';
        } else {
          gl.clear(gl.COLOR_BUFFER_BIT);
          drawLine(linesRef.current, [0, 0, 0, 1]); // Black color for existing lines
          drawPoints(pointsRef.current);
        }
      }

      drawScene();
    };

    const isPointNearLineSegment = (px, py, x0, y0, x1, y1, radius) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const lengthSquared = dx * dx + dy * dy;
      const t = ((px - x0) * dx + (py - y0) * dy) / lengthSquared;
      const clampedT = Math.max(0, Math.min(1, t));
      const closestX = x0 + clampedT * dx;
      const closestY = y0 + clampedT * dy;
      const distance = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
      return distance < radius;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawScene();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [isEraserMode, isCircleMode]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh' }} />;
};

export default WebGLCanvas;
