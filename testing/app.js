document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);

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
    const colorLocation = gl.getUniformLocation(program, "u_color");
    const positionBuffer = gl.createBuffer();


    let isNearPoint = false;



    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    function drawPoints(points) {
        gl.uniform4f(colorLocation, 1, 0, 0, 1); // Black color for points
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, points.length / 2);
    }

    function drawLine(points, color) {
        gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]); // Set color
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, points.length / 2);
    }

    function drawDashedLine(x0, y0, x1, y1, color, dashLength = 0.02, gapLength = 0.02) {
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
        
    }

    let points = [];
    let lines = [];
    let currentLine = [];
    let isAnimating = false;
    const magneticRadius = 0.05; // Radius for magnetic effect

    function animateLine() {
        let progress = 0;
        const steps = 50;
        const x0 = currentLine[0];
        const y0 = currentLine[1];
        const x1 = currentLine[2];
        const y1 = currentLine[3];

        function step() {
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
        }

        requestAnimationFrame(step);
        isNearPoint = false;
    }

    canvas.addEventListener("mousemove", (event) => {
        // if (points.length % 4 === 0) return;

        const rect = canvas.getBoundingClientRect();
        let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

        isNearPoint = false;
        // Apply magnetic effect
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

        hoverPoint = [x, y];

        if (isNearPoint) {
            canvas.style.cursor = "pointer"; // Change cursor to pointer when near a point
        } else {
            canvas.style.cursor = "default"; // Change cursor back to default
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        drawLine(lines, [0, 0, 0, 1]); // Black color for existing lines
        drawPoints(points);
        

        if (hoverPoint && points.length % 4 === 2) {
            drawDashedLine(points[points.length - 2], points[points.length - 1], hoverPoint[0], hoverPoint[1], [0, 0, 1, 1]); // Blue dashed line
        }
    });

    canvas.addEventListener("click", (event) => {
        if (isAnimating) return;

        const rect = canvas.getBoundingClientRect();
        let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        let y = ((event.clientY - rect.top) / rect.height) * -2 + 1;

        // Apply magnetic effect
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
            canvas.style.cursor = "default";
        } else {
            gl.clear(gl.COLOR_BUFFER_BIT);
            drawLine(lines, [0, 0, 0, 1]); // Black color for existing lines
            drawPoints(points);
            

        }
    });

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
});
