import { useEffect, useState, useRef, useCallback } from "react";
import './WebGLCanvas.css'; // CSS 파일을 불러옴

const WebGLCanvas = ({ isEraserMode }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [center, setCenter] = useState({ x: 0, y: 0 });
    const [radius, setRadius] = useState(0);
    const [startAngle, setStartAngle] = useState(0);
    const [circles, setCircles] = useState([]);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const programInfoRef = useRef(null);
    const buffersRef = useRef(null);
    const pointsRef = useRef([]);
    const linesRef = useRef([]);
    const currentLineRef = useRef([]);
    const isAnimatingRef = useRef(false);

    const resizeCanvasToDisplaySize = useCallback((canvas) => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            setCanvasWidth(width);
            setCanvasHeight(height);
        }
    }, []);

    const initBuffers = useCallback((gl) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW);
        return { position: positionBuffer };
    }, []);

    const drawDashedCircle = useCallback((gl, programInfo, buffers, center, radius, startAngle = 0) => {
        const numSegments = 100;
        const dashLength = 0.02;
        const gapLength = 0.02;
        const positions = [];

        for (let i = 0; i <= numSegments; i++) {
            const angle = startAngle + i * 2 * Math.PI / numSegments;
            if (i % 2 === 0) {
                positions.push(center.x + radius * Math.cos(angle));
                positions.push(center.y + radius * Math.sin(angle));
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.useProgram(programInfo.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        const vertexCount = positions.length / 2;
        gl.drawArrays(gl.LINES, 0, vertexCount);
    }, []);

    const drawCircle = useCallback((gl, programInfo, buffers, center, radius, startAngle = 0, endAngle = 2 * Math.PI) => {
        const numSegments = 100;
        const positions = [];

        for (let i = 0; i <= numSegments; i++) {
            const angle = startAngle + i * endAngle / numSegments;
            positions.push(center.x + radius * Math.cos(angle));
            positions.push(center.y + radius * Math.sin(angle));
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.useProgram(programInfo.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        const vertexCount = positions.length / 2;
        gl.drawArrays(gl.LINE_STRIP, 0, vertexCount);
    }, []);

    const animateCircle = useCallback((gl, programInfo, buffers, center, radius, startAngle) => {
        let currentStartAngle = startAngle;
        const endAngle = 2 * Math.PI;
        const animationDuration = 1000; // 1 second
        const startTime = performance.now();

        const render = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const currentAngle = Math.min((elapsedTime / animationDuration) * endAngle, endAngle);

            gl.clear(gl.COLOR_BUFFER_BIT);
            circles.forEach(({ center, radius, startAngle }) => {
                drawCircle(gl, programInfo, buffers, center, radius, startAngle);
            });
            drawCircle(gl, programInfo, buffers, center, radius, currentStartAngle, currentAngle);

            if (currentAngle < endAngle) {
                requestAnimationFrame(render);
            }
        };

        requestAnimationFrame(render);
    }, [drawCircle, circles]);

    const drawFinalCircle = useCallback(() => {
        const gl = glRef.current;
        const programInfo = programInfoRef.current;
        const buffers = buffersRef.current;
        setCircles((prevCircles) => [...prevCircles, { center, radius, startAngle }]);
        animateCircle(gl, programInfo, buffers, center, radius, startAngle);
    }, [center, radius, startAngle, animateCircle]);

    const handleMouseDown = useCallback((e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvasWidth * 2 - 1;
        const y = (e.clientY - rect.top) / canvasHeight * -2 + 1;
        setCenter({ x, y });
        setIsDrawing(true);
    }, [canvasWidth, canvasHeight]);

    const handleMouseMove = useCallback((e) => {
        if (!isDrawing) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvasWidth * 2 - 1;
        const y = (e.clientY - rect.top) / canvasHeight * -2 + 1;
        const dx = x - center.x;
        const dy = y - center.y;
        setRadius(Math.sqrt(dx * dx + dy * dy));
    }, [isDrawing, center, canvasWidth, canvasHeight]);

    const handleMouseUp = useCallback((e) => {
        if (isDrawing) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / canvasWidth * 2 - 1;
            const y = (e.clientY - rect.top) / canvasHeight * -2 + 1;
            const dx = x - center.x;
            const dy = y - center.y;
            const angle = Math.atan2(dy, dx);
            setStartAngle(angle);
            setIsDrawing(false);
            drawFinalCircle();
        }
    }, [isDrawing, canvasWidth, canvasHeight, center, drawFinalCircle]);

    const handleMouseOut = useCallback(() => {
        if (isDrawing) {
            drawFinalCircle();
        }
    }, [isDrawing, drawFinalCircle]);

    const drawScene = () => {
        const gl = glRef.current;
        gl.clear(gl.COLOR_BUFFER_BIT);
        circles.forEach(({ center, radius, startAngle }) => {
            drawCircle(gl, programInfoRef.current, buffersRef.current, center, radius, startAngle);
        });
        drawLine(linesRef.current, [0, 0, 0, 1]);
        drawPoints(pointsRef.current);
    };

    const drawPoints = (points) => {
        const gl = glRef.current;
        gl.uniform4f(colorLocation, 1, 0, 0, 1);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, points.length / 2);
    };

    const drawLine = (points, color) => {
        const gl = glRef.current;
        gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, points.length / 2);
    };

    const drawDashedLine = (x0, y0, x1, y1, color, dashLength = 0.02, gapLength = 0.02) => {
        const gl = glRef.current;
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

            const gl = glRef.current;
            gl.clear(gl.COLOR_BUFFER_BIT);

            drawLine(linesRef.current, [0, 0, 0, 1]);
            drawLine([x0, y0, x, y], [0, 0, 0, 1]);
            drawPoints(pointsRef.current);

            if (progress < steps) {
                requestAnimationFrame(step);
            } else {
                linesRef.current.push(...currentLineRef.current);
                currentLineRef.current = [];
                isAnimatingRef.current = false;
                gl.clear(gl.COLOR_BUFFER_BIT);
                drawLine(linesRef.current, [0, 0, 0, 1]);
                drawPoints(pointsRef.current);
            }
        };

        requestAnimationFrame(step);
    };

    const handleMouseMovePoints = (event) => {
        if(isEraserMode) return;

        const rect = canvasRef.current.getBoundingClientRect();
        let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

        let isNearPoint = false;

        for (let i = 0; i < pointsRef.current.length; i += 2) {
            const px = pointsRef.current[i];
            const py = pointsRef.current[i + 1];
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            if (distance < 0.05) {
                x = px;
                y = py;
                isNearPoint = true;
                break;
            }
        }

        let hoverPoint = [x, y];

        canvasRef.current.style.cursor = isNearPoint ? 'pointer' : 'default';

        const gl = glRef.current;
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawLine(linesRef.current, [0, 0, 0, 1]);
        drawPoints(pointsRef.current);

        if (hoverPoint && pointsRef.current.length % 4 === 2) {
            drawDashedLine(pointsRef.current[pointsRef.current.length - 2], pointsRef.current[pointsRef.current.length - 1], hoverPoint[0], hoverPoint[1], [0, 0, 1, 1]);
        }
    };

    const handleClickPoints = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

        if (isEraserMode) {
            let lineRemoved = false;
            for (let i = 0; i < linesRef.current.length; i += 4) {
                const x0 = linesRef.current[i];
                const y0 = linesRef.current[i + 1];
                const x1 = linesRef.current[i + 2];
                const y1 = linesRef.current[i + 3];
                if (isPointNearLineSegment(x, y, x0, y0, x1, y1, 0.05)) {
                    linesRef.current.splice(i, 4);
                    lineRemoved = true;
                    break;
                }
            }
            if (!lineRemoved) {
                for (let i = 0; i < pointsRef.current.length; i += 2) {
                    const px = pointsRef.current[i];
                    const py = pointsRef.current[i + 1];
                    const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                    if (distance < 0.05) {
                        pointsRef.current.splice(i, 2);
                        break;
                    }
                }
            }
        } else {
            for (let i = 0; i < pointsRef.current.length; i += 2) {
                const px = pointsRef.current[i];
                const py = pointsRef.current[i + 1];
                const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                if (distance < 0.05) {
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
                canvasRef.current.style.cursor = 'default';
            } else {
                const gl = glRef.current;
                gl.clear(gl.COLOR_BUFFER_BIT);
                drawLine(linesRef.current, [0, 0, 0, 1]);
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

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
            alert("Unable to initialize WebGL.");
            return;
        }
        glRef.current = gl;

        const initShaderProgram = (gl, vsSource, fsSource) => {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        };

        const loadShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vsSource = `
        attribute vec2 a_position;
        void main(void) {
            gl_PointSize = 15.0;
            gl_Position = vec4(a_position, 0, 1);
        }
    `;

        const fsSource = `
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

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'a_position'),
            },
            uniformLocations: {
                color: gl.getUniformLocation(shaderProgram, 'u_color'),
            },
        };

        programInfoRef.current = programInfo;

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const buffers = initBuffers(gl);
        buffersRef.current = buffers;

        const handleResize = () => {
            resizeCanvasToDisplaySize(canvas);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            circles.forEach(({ center, radius, startAngle }) => {
                drawCircle(gl, programInfoRef.current, buffersRef.current, center, radius, startAngle);
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mouseout", handleMouseOut);

        canvas.addEventListener('mousemove', handleMouseMovePoints);
        canvas.addEventListener('click', handleClickPoints);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("mouseout", handleMouseOut);
            canvas.removeEventListener('mousemove', handleMouseMovePoints);
            canvas.removeEventListener('click', handleClickPoints);
        };
    }, [initBuffers, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseOut, resizeCanvasToDisplaySize, circles, drawCircle, handleMouseMovePoints, handleClickPoints]);

    useEffect(() => {
        const gl = glRef.current;
        const programInfo = programInfoRef.current;
        const buffers = buffersRef.current;
        gl.clear(gl.COLOR_BUFFER_BIT);
        circles.forEach(({ center, radius, startAngle }) => {
            drawCircle(gl, programInfo, buffers, center, radius, startAngle);
        });
        if (isDrawing) {
            drawDashedCircle(gl, programInfo, buffers, center, radius, startAngle);
        }
        drawLine(linesRef.current, [0, 0, 0, 1]);
        drawPoints(pointsRef.current);
    }, [isDrawing, center, radius, circles, drawCircle, drawDashedCircle, startAngle]);

    return <canvas id="glcanvas" ref={canvasRef} style={{ width: '100%', height: '100%' }}>Your browser doesn't support HTML5 canvas.</canvas>;
};

export default WebGLCanvas;
