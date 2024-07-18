import { useEffect } from "react";

const WebGLCanvas = () => {
    useEffect(() => {
        const canvas = document.getElementById("glcanvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
            alert("Unable to initialize WebGL.");
            return;
        }

        // Initialize shaders
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

        const initBuffers = (gl) => {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const positions = [];
            const numSegments = 100;
            const radius = 0.5;
            for (let i = 0; i <= numSegments; i++) {
                const angle = i * 2 * Math.PI / numSegments;
                positions.push(radius * Math.cos(angle));
                positions.push(radius * Math.sin(angle));
            }
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            return { position: positionBuffer };
        };

        const drawScene = (gl, programInfo, buffers) => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(programInfo.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
            const vertexCount = 101;
            gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);
        };

        const vsSource = `
            attribute vec2 aVertexPosition;
            void main(void) {
                gl_Position = vec4(aVertexPosition, 0.0, 1.0);
            }
        `;

        const fsSource = `
            void main(void) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `;

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
        };
        const buffers = initBuffers(gl);
        drawScene(gl, programInfo, buffers);
    }, []);

    return <canvas id="glcanvas" width="640" height="480">Your browser doesn't support HTML5 canvas.</canvas>;
};

export default WebGLCanvas;
