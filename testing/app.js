document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_PointSize = 10.0;
            gl_Position = vec4(a_position, 0, 1);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            if (length(coord) > 0.5) {
                discard;
            }
            gl_FragColor = vec4(0, 0, 0, 1);  // Black color for points
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Error compiling shader", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error linking program", gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    function drawPoints(points) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, points.length / 2);
    }


    // 선을 그리는 함수
    function drawLine(points) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, points.length / 2);
    }




    let line_points = [];

    const points = [];
    canvas.addEventListener("click", (event) => {
        const x = (event.clientX / canvas.width) * 2 - 1;
        const y = (event.clientY / canvas.height) * -2 + 1;
        line_points.push(x, y);
        points.push(x, y);
        
        drawPoints(points);
        drawLine(line_points)
        
    });

    // Set the background color to white
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
});
