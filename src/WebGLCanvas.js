import { useEffect, useState, useRef, useCallback } from "react";
import './WebGLCanvas.css'; // CSS 파일을 불러옴

const WebGLCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [center, setCenter] = useState({ x: 0, y: 0 });
    const [radius, setRadius] = useState(0);
    const [circles, setCircles] = useState([]);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const programInfoRef = useRef(null);
    const buffersRef = useRef(null);

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

    const drawDashedCircle = useCallback((gl, programInfo, buffers, center, radius) => {
        const numSegments = 100;
        const dashLength = 0.02;
        const gapLength = 0.01;
        const positions = [];

        for (let i = 0; i <= numSegments; i++) {
            const angle = i * 2 * Math.PI / numSegments;
            if (i % 2 === 0) {
                positions.push(center.x + radius * Math.cos(angle));
                positions.push(center.y + radius * Math.sin(angle));
            } else {
                positions.push(center.x + (radius + gapLength) * Math.cos(angle));
                positions.push(center.y + (radius + gapLength) * Math.sin(angle));
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

    const drawCircle = useCallback((gl, programInfo, buffers, center, radius) => {
        const numSegments = 100;
        const positions = [];

        for (let i = 0; i <= numSegments; i++) {
            const angle = i * 2 * Math.PI / numSegments;
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
        gl.drawArrays(gl.LINE_LOOP, 0, vertexCount);
    }, []);

    const drawFinalCircle = useCallback(() => {
        setCircles((prevCircles) => [...prevCircles, { center, radius }]);
    }, [center, radius]);

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

    const handleMouseUp = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            drawFinalCircle();
        }
    }, [isDrawing, drawFinalCircle]);

    const handleMouseOut = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            drawFinalCircle();
        }
    }, [isDrawing, drawFinalCircle]);

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
        attribute vec2 aVertexPosition;
        void main(void) {
            gl_Position = vec4(aVertexPosition, 0.0, 1.0);
        }
    `;

        const fsSource = `
        void main(void) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `;

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
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
            circles.forEach(({ center, radius }) => {
                drawCircle(gl, programInfoRef.current, buffersRef.current, center, radius);
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mouseout", handleMouseOut);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("mouseout", handleMouseOut);
        };
    }, [initBuffers, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseOut, resizeCanvasToDisplaySize, circles, drawCircle]);

    useEffect(() => {
        const gl = glRef.current;
        const programInfo = programInfoRef.current;
        const buffers = buffersRef.current;
        gl.clear(gl.COLOR_BUFFER_BIT);
        circles.forEach(({ center, radius }) => {
            drawCircle(gl, programInfo, buffers, center, radius);
        });
        if (isDrawing) {
            drawDashedCircle(gl, programInfo, buffers, center, radius);
        }
    }, [isDrawing, center, radius, circles, drawCircle, drawDashedCircle]);

    return <canvas id="glcanvas" ref={canvasRef} style={{ width: '100%', height: '100%' }}>Your browser doesn't support HTML5 canvas.</canvas>;
};

export default WebGLCanvas;
