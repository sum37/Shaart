import React, { useEffect, useRef } from 'react';

const WebGLCanvas = ({ isEraserMode, isCircleMode }) => {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]); // Store points' coordinates
  const linesRef = useRef([]); // Store lines' coordinates as arrays of start and end points
  const circlesRef = useRef([]); // Store circles' center coordinates and radius
  const intersectionsRef = useRef([]); // Store intersection points
  const intersectionMapRef = useRef(new Map()); // Map to store intersection points and related shapes
  const currentLineRef = useRef([]);
  const currentCircleRef = useRef([]);
  const isAnimatingRef = useRef(false);

  const magneticRadius = 0.02;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const resizeCanvas = () => {
      const size = Math.max(window.innerWidth, window.innerHeight);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = size * devicePixelRatio;
      canvas.height = size * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const drawScene = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      drawLine(linesRef.current, [0, 0, 0, 1]); // Redraw existing lines
      drawPoints(pointsRef.current); // Redraw points
      drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles
      drawPoints(intersectionsRef.current, [0, 1, 1, 1]); // Draw intersections in mint color
    };

    const drawPoints = (points, color = [1, 0, 0, 1]) => {
      gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]); // Set color for points
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
      for (const circle of circles) {
        const [cx, cy, radius] = circle;
        const segments = 100;
        const angleStep = (Math.PI * 2) / segments;
        const circlePoints = [];
        for (let i = 0; i <= segments; i++) {
          const angle = i * angleStep;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          circlePoints.push(x, y);
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circlePoints), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, circlePoints.length / 2);
      }
    };

    const animateCircle = (cx, cy, radius, startX, startY) => {
      const segments = 100;
      const angleStep = (Math.PI * 2) / segments;
      let progress = 0;
      const startAngle = Math.atan2(startY - cy, startX - cx); // Calculate start angle based on click position

      const step = () => {
        progress++;
        const t = progress / segments;
        const angle = startAngle + t * 2 * Math.PI;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        gl.clear(gl.COLOR_BUFFER_BIT);

        drawLine(linesRef.current, [0, 0, 0, 1]); // Black color for existing lines
        drawPoints(pointsRef.current);
        drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles
        drawPoints(intersectionsRef.current, [0, 1, 1, 1]); // Redraw intersections

        const circlePoints = [];
        for (let i = 0; i <= progress; i++) {
          const angle = startAngle + i * angleStep;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          circlePoints.push(x, y);
        }

        gl.uniform4f(colorLocation, 0, 0, 0, 1); // Set color to black for the circle being animated
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circlePoints), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_STRIP, 0, circlePoints.length / 2);

        if (progress < segments) {
          requestAnimationFrame(step);
        } else {
          circlesRef.current.push([cx, cy, radius]);
          isAnimatingRef.current = false;
          findIntersections();
          drawScene();
        }
      };

      requestAnimationFrame(step);
    };

    const findIntersections = () => {
      intersectionsRef.current = [];
      intersectionMapRef.current.clear();

      // Check intersections between lines
      for (let i = 0; i < linesRef.current.length; i += 4) {
        for (let j = i + 4; j < linesRef.current.length; j += 4) {
          const [x1, y1, x2, y2] = linesRef.current.slice(i, i + 4);
          const [x3, y3, x4, y4] = linesRef.current.slice(j, j + 4);
          const intersection = getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
          if (intersection) {
            intersectionsRef.current.push(intersection[0], intersection[1]);
            const key = `${intersection[0]},${intersection[1]}`;
            if (!intersectionMapRef.current.has(key)) {
              intersectionMapRef.current.set(key, []);
            }
            intersectionMapRef.current.get(key).push(`line:${i}`, `line:${j}`);
          }
        }
      }

      // Check intersections between lines and circles
      for (let i = 0; i < linesRef.current.length; i += 4) {
        const [x1, y1, x2, y2] = linesRef.current.slice(i, i + 4);
        for (let j = 0; j < circlesRef.current.length; j++) {
          const [cx, cy, radius] = circlesRef.current[j];
          const intersections = getLineCircleIntersections(x1, y1, x2, y2, cx, cy, radius);
          if (intersections) {
            intersections.forEach(([ix, iy]) => {
              intersectionsRef.current.push(ix, iy);
              const key = `${ix},${iy}`;
              if (!intersectionMapRef.current.has(key)) {
                intersectionMapRef.current.set(key, []);
              }
              intersectionMapRef.current.get(key).push(`line:${i}`, `circle:${j}`);
            });
          }
        }
      }

      // Check intersections between circles
      for (let i = 0; i < circlesRef.current.length; i++) {
        for (let j = i + 1; j < circlesRef.current.length; j++) {
          const [cx1, cy1, r1] = circlesRef.current[i];
          const [cx2, cy2, r2] = circlesRef.current[j];
          const intersections = getCircleCircleIntersections(cx1, cy1, r1, cx2, cy2, r2);
          if (intersections) {
            intersections.forEach(([ix, iy]) => {
              intersectionsRef.current.push(ix, iy);
              const key = `${ix},${iy}`;
              if (!intersectionMapRef.current.has(key)) {
                intersectionMapRef.current.set(key, []);
              }
              intersectionMapRef.current.get(key).push(`circle:${i}`, `circle:${j}`);
            });
          }
        }
      }
    };

    const getLineIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (denom === 0) return null;

      const intersectX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
      const intersectY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

      if (isPointOnLineSegment(x1, y1, x2, y2, intersectX, intersectY) && isPointOnLineSegment(x3, y3, x4, y4, intersectX, intersectY)) {
        return [intersectX, intersectY];
      }

      return null;
    };

    const isPointOnLineSegment = (x1, y1, x2, y2, px, py) => {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return px >= minX && px <= maxX && py >= minY && py <= maxY;
    };

    const getLineCircleIntersections = (x1, y1, x2, y2, cx, cy, radius) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const fx = x1 - cx;
      const fy = y1 - cy;

      const a = dx * dx + dy * dy;
      const b = 2 * (fx * dx + fy * dy);
      const c = (fx * fx + fy * fy) - radius * radius;

      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) return null;

      const sqrtDiscriminant = Math.sqrt(discriminant);
      const t1 = (-b - sqrtDiscriminant) / (2 * a);
      const t2 = (-b + sqrtDiscriminant) / (2 * a);

      const intersections = [];

      if (t1 >= 0 && t1 <= 1) {
        intersections.push([x1 + t1 * dx, y1 + t1 * dy]);
      }

      if (t2 >= 0 && t2 <= 1) {
        intersections.push([x1 + t2 * dx, y1 + t2 * dy]);
      }

      return intersections.length > 0 ? intersections : null;
    };

    const getCircleCircleIntersections = (cx1, cy1, r1, cx2, cy2, r2) => {
      const dx = cx2 - cx1;
      const dy = cy2 - cy1;
      const d = Math.sqrt(dx * dx + dy * dy);

      // Check for no intersection or coincident circles
      if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) return null;

      const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
      const h = Math.sqrt(r1 * r1 - a * a);
      const xm = cx1 + (dx * a) / d;
      const ym = cy1 + (dy * a) / d;

      const xs1 = xm + (h * dy) / d;
      const ys1 = ym - (h * dx) / d;
      const xs2 = xm - (h * dy) / d;
      const ys2 = ym + (h * dx) / d;

      return [[xs1, ys1], [xs2, ys2]];
    };

    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawScene();
    });

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
          gl_PointSize = 10.0;
          gl_Position = vec4(a_position, 0, 1);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
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

    const drawDashedCircle = (cx, cy, radius, color, segments = 100, dashLength = 0.02, gapLength = 0.02) => {
      const angleStep = (Math.PI * 2) / segments;
      let dashPoints = [];

      for (let i = 0; i < segments; i++) {
        const angleStart = i * angleStep;
        const angleEnd = angleStart + angleStep * (dashLength / (dashLength + gapLength));
        const xStart = cx + radius * Math.cos(angleStart);
        const yStart = cy + radius * Math.sin(angleStart);
        const xEnd = cx + radius * Math.cos(angleEnd);
        const yEnd = cy + radius * Math.sin(angleEnd);

        dashPoints.push(xStart, yStart, xEnd, yEnd);
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

        const tempLines = [...linesRef.current, x0, y0, x, y];
        const tempIntersections = [];
        for (let i = 0; i < tempLines.length; i += 4) {
          for (let j = i + 4; j < tempLines.length; j += 4) {
            const [x1, y1, x2, y2] = tempLines.slice(i, i + 4);
            const [x3, y3, x4, y4] = tempLines.slice(j, j + 4);
            const intersection = getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
            if (intersection) {
              tempIntersections.push(intersection[0], intersection[1]);
            }
          }
        }
        for (let i = 0; i < tempLines.length; i += 4) {
          const [x1, y1, x2, y2] = tempLines.slice(i, i + 4);
          for (const [cx, cy, radius] of circlesRef.current) {
            const intersections = getLineCircleIntersections(x1, y1, x2, y2, cx, cy, radius);
            if (intersections) {
              tempIntersections.push(...intersections);
            }
          }
        }
        for (let i = 0; i < circlesRef.current.length; i++) {
          for (let j = i + 1; j < circlesRef.current.length; j++) {
            const [cx1, cy1, r1] = circlesRef.current[i];
            const [cx2, cy2, r2] = circlesRef.current[j];
            const intersections = getCircleCircleIntersections(cx1, cy1, r1, cx2, cy2, r2);
            if (intersections) {
              tempIntersections.push(...intersections);
            }
          }
        }
        drawPoints(tempIntersections, [0, 1, 1, 1]); // Mint color for intersections

        if (progress < steps) {
          requestAnimationFrame(step);
        } else {
          linesRef.current.push(...currentLineRef.current);
          currentLineRef.current = [];
          isAnimatingRef.current = false;
          findIntersections();
          drawScene();
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
      let closestPoint = null;
      let closestLine = null;
      let closestCircle = null;

      if (!isEraserMode) {
        const allPoints = [...pointsRef.current, ...intersectionsRef.current]; // Include intersections in points check
        for (let i = 0; i < allPoints.length; i += 2) {
          const px = allPoints[i];
          const py = allPoints[i + 1];
          const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
          if (distance < magneticRadius) {
            x = px;
            y = py;
            isNearPoint = true;
            closestPoint = [x, y];
            break;
          }
        }
      } else {
        // Eraser mode: find the nearest line or circle
        for (let i = 0; i < linesRef.current.length; i += 4) {
          const x0 = linesRef.current[i];
          const y0 = linesRef.current[i + 1];
          const x1 = linesRef.current[i + 2];
          const y1 = linesRef.current[i + 3];
          if (isPointNearLineSegment(x, y, x0, y0, x1, y1, magneticRadius)) {
            closestLine = [x0, y0, x1, y1];
            break;
          }
        }

        if (!closestLine) {
          for (let i = 0; i < circlesRef.current.length; i++) {
            const [cx, cy, radius] = circlesRef.current[i];
            const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (distance < radius + magneticRadius) {
              closestCircle = [cx, cy, radius];
              break;
            }
          }
        }
      }

      let hoverPoint = [x, y];

      canvas.style.cursor = isNearPoint || closestLine || closestCircle ? 'pointer' : 'default';

      gl.clear(gl.COLOR_BUFFER_BIT);
      drawLine(linesRef.current, [0, 0, 0, 1]); // Black color for existing lines
      drawPoints(pointsRef.current);
      drawCircles(circlesRef.current, [0, 0, 0, 1]); // Redraw circles
      drawPoints(intersectionsRef.current, [0, 1, 1, 1]); // Redraw intersections

      if (closestPoint) {
        drawPoints([closestPoint[0], closestPoint[1]], [1, 0.5, 0, 1]); // Orange color for the closest point
      }

      if (closestLine) {
        drawLine(closestLine, [0, 1, 0, 1]); // Green color for the nearest line
      }

      if (closestCircle) {
        drawCircles([closestCircle], [0, 1, 0, 1]); // Green color for the nearest circle
      }

      if (isCircleMode && currentCircleRef.current.length === 2) {
        const [cx, cy] = currentCircleRef.current;
        const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        drawDashedCircle(cx, cy, radius, [0, 0, 1, 1]); // Blue dashed circle
      } else if (hoverPoint && pointsRef.current.length % 4 === 2) {
        drawDashedLine(pointsRef.current[pointsRef.current.length - 2], pointsRef.current[pointsRef.current.length - 1], hoverPoint[0], hoverPoint[1], [0, 0, 1, 1]); // Blue dashed line
      }
    };

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

      const allPoints = [...pointsRef.current, ...intersectionsRef.current]; // Include intersections in points check
      for (let i = 0; i < allPoints.length; i += 2) {
        const px = allPoints[i];
        const py = allPoints[i + 1];
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance < magneticRadius) {
          x = px;
          y = py;
          break;
        }
      }

      if (isEraserMode) {
        // Eraser mode: remove the nearest line if clicked near it
        let lineRemoved = false;
        for (let i = 0; i < linesRef.current.length; i += 4) {
          const x0 = linesRef.current[i];
          const y0 = linesRef.current[i + 1];
          const x1 = linesRef.current[i + 2];
          const y1 = linesRef.current[i + 3];
          if (isPointNearLineSegment(x, y, x0, y0, x1, y1, magneticRadius)) {
            const [startX, startY, endX, endY] = linesRef.current.splice(i, 4);
            removeIntersections(`line:${i}`);
            removePoint(startX, startY);
            removePoint(endX, endY);
            lineRemoved = true;
            break;
          }
        }

        if (!lineRemoved) {
          // Eraser mode: remove the nearest point if clicked near it
          let pointRemoved = false;
          for (let i = 0; i < pointsRef.current.length; i += 2) {
            const px = pointsRef.current[i];
            const py = pointsRef.current[i + 1];
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            if (distance < magneticRadius) {
              pointsRef.current.splice(i, 2);
              pointRemoved = true;
              break;
            }
          }

          if (!pointRemoved) {
            // Eraser mode: remove the nearest circle if clicked near it
            for (let i = 0; i < circlesRef.current.length; i++) {
              const [cx, cy, radius] = circlesRef.current[i];
              const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
              if (distance < radius + magneticRadius) {
                circlesRef.current.splice(i, 1);
                removeIntersections(`circle:${i}`);
                break;
              }
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
          animateCircle(cx, cy, radius, x, y); // Pass startX and startY for the start angle calculation
        }
      } else {
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

    const removeIntersections = (shape) => {
      intersectionsRef.current = intersectionsRef.current.filter((_, index) => {
        if (index % 2 !== 0) return true; // Skip every other index (y-coordinates)
        const key = `${intersectionsRef.current[index]},${intersectionsRef.current[index + 1]}`;
        const shapes = intersectionMapRef.current.get(key);
        if (shapes) {
          const shapeIndex = shapes.indexOf(shape);
          if (shapeIndex !== -1) {
            shapes.splice(shapeIndex, 1);
          }
          if (shapes.length === 0) {
            intersectionMapRef.current.delete(key);
            return false;
          }
        }
        return true;
      });
    };

    const removePoint = (x, y) => {
      for (let i = 0; i < pointsRef.current.length; i += 2) {
        if (pointsRef.current[i] === x && pointsRef.current[i + 1] === y) {
          pointsRef.current.splice(i, 2);
          break;
        }
      }
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

    gl.clearColor(1, 1, 1, 1); // White background
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawScene();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [isEraserMode, isCircleMode]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default WebGLCanvas;
