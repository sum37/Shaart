
import React, { useEffect, useRef } from 'react';

const NeonLine = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');

        // Set the canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Center the canvas in the window
        canvas.style.position = 'absolute';
        canvas.style.left = '50%';
        canvas.style.top = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';

        // Vertex shader program
        const vsSource = `
            attribute vec4 aVertexPosition;
            void main(void) {
                gl_Position = aVertexPosition;
            }
        `;

        // Fragment shader program
        const fsSource = `
            precision mediump float;
            uniform vec2 uResolution;
            uniform vec2 uStart;
            uniform vec2 uEnd;
            uniform float uLineWidth;

            float plot(vec2 st, vec2 start, vec2 end, float lineWidth) {
                float d = length(cross(vec3(end - start, 0.0), vec3(st - start, 0.0))) / length(end - start);
                return smoothstep(lineWidth, lineWidth + 0.03, d);
            }

            void main(void) {
                vec2 st = gl_FragCoord.xy / uResolution;
                vec2 start = uStart / uResolution;
                vec2 end = uEnd / uResolution;

                float intensity = 1.0 - plot(st, start, end, uLineWidth);
                intensity += 1.0 * (1.0 - plot(st, start, end, uLineWidth * 2.0)); // increased blur size
                intensity += 0.25 * (1.0 - plot(st, start, end, uLineWidth * 3.0)); // increased blur size

                vec3 neonColor = vec3(0.5, 0.8, 1.0);
                gl_FragColor = vec4(neonColor * intensity, intensity);
            }
        `;

        // Initialize shader program
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
                start: gl.getUniformLocation(shaderProgram, 'uStart'),
                end: gl.getUniformLocation(shaderProgram, 'uEnd'),
                lineWidth: gl.getUniformLocation(shaderProgram, 'uLineWidth'),
            },
        };

        // Define the position buffer for a single point (two points defining a line)
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = [
            -1.0,  1.0,
            -1.0, -1.0,
            1.0,  1.0,
            1.0, -1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Draw the scene
        function drawScene(gl, programInfo, positionBuffer) {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Set the shader program
            gl.useProgram(programInfo.program);

            // Set the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            // Set uniforms
            gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
            gl.uniform2f(programInfo.uniformLocations.start, canvas.width / 4, canvas.height / 2);
            gl.uniform2f(programInfo.uniformLocations.end, (3 * canvas.width) / 4, canvas.height / 2);
            gl.uniform1f(programInfo.uniformLocations.lineWidth, 0.005 /3);

            // Draw
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        // Initialize a shader program, so WebGL knows how to draw our data
        function initShaderProgram(gl, vsSource, fsSource) {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

            // Create the shader program
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            // If creating the shader program failed, alert
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }

            return shaderProgram;
        }

        // Creates a shader of the given type, uploads the source and
        // compiles it.
        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);

            // Send the source to the shader object
            gl.shaderSource(shader, source);

            // Compile the shader program
            gl.compileShader(shader);

            // See if it compiled successfully
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        // Draw the scene repeatedly
        function render() {
            drawScene(gl, programInfo, positionBuffer);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

    }, []);

    return (
        <canvas ref={canvasRef}></canvas>
    );
};

export default NeonLine;



