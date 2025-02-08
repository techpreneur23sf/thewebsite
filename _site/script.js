// Function to set theme and update UI
function setTheme(isDark) {
    const html = document.documentElement;
    if (isDark) {
        html.classList.remove('light-mode');
        html.classList.add('dark-mode');
    } else {
        html.classList.remove('dark-mode');
        html.classList.add('light-mode');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Function to initialize theme
function initTheme() {
    const toggleSwitch = document.querySelector('#checkbox');
    if (!toggleSwitch) return;

    // Set initial theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setTheme(isDark);
    toggleSwitch.checked = isDark;

    // Handle toggle changes
    toggleSwitch.addEventListener('change', (e) => {
        setTheme(e.target.checked);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches);
            toggleSwitch.checked = e.matches;
        }
    });
}

// Add this function to load the navigation bar
async function loadNavBar() {
    const response = await fetch('nav.html');
    const navHtml = await response.text();
    document.body.insertAdjacentHTML('afterbegin', navHtml);
    initTheme(); // Initialize theme after nav is loaded
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadNavBar();
});

// Add this class to your CSS 

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 4,
    dy: -4,
    radius: 8
};

const paddle = {
    width: 100,
    height: 10,
    x: canvas.width / 2 - 50,
    speed: 8
};

const brickConfig = {
    rows: 5,
    cols: 8,
    width: 80,
    height: 20,
    padding: 10,
    offsetTop: 30,
    offsetLeft: 35
};

let bricks = [];
let score = 0;
let gameRunning = false;

// Add these constants near the top with other game objects
const COLORS = [
    '#FF6B6B', // red
    '#4ECDC4', // turquoise
    '#45B7D1', // blue
    '#96CEB4', // green
    '#FFEEAD', // yellow
    '#D4A5A5', // pink
    '#9B59B6', // purple
    '#E67E22'  // orange
];

// Initialize bricks
function initBricks() {
    for (let i = 0; i < brickConfig.rows; i++) {
        bricks[i] = [];
        for (let j = 0; j < brickConfig.cols; j++) {
            bricks[i][j] = { 
                x: 0, 
                y: 0, 
                status: 1,
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
            };
        }
    }
}

// Event listeners
startButton.addEventListener('click', startGame);

// Add mouse movement listener
canvas.addEventListener('mousemove', mouseMoveHandler);

// Add this new function to handle mouse movement
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        initBricks();
        score = 0;
        scoreElement.textContent = score;
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 30;
        ball.dx = 4;
        ball.dy = -4;
        paddle.x = canvas.width / 2 - paddle.width / 2;
        
        // Start the color changing interval
        colorInterval = setInterval(() => {
            if (gameRunning) {
                updateBrickColors();
            } else {
                clearInterval(colorInterval);
            }
        }, 1000);
        
        draw();
    }
}

function collisionDetection() {
    for (let i = 0; i < brickConfig.rows; i++) {
        for (let j = 0; j < brickConfig.cols; j++) {
            const brick = bricks[i][j];
            if (brick.status === 1) {
                const brickX = j * (brickConfig.width + brickConfig.padding) + brickConfig.offsetLeft;
                const brickY = i * (brickConfig.height + brickConfig.padding) + brickConfig.offsetTop;
                brick.x = brickX;
                brick.y = brickY;

                // Calculate the ball's closest point to the brick
                let testX = ball.x;
                let testY = ball.y;

                // Find the closest edge
                if (ball.x < brickX) testX = brickX;                    // Left edge
                else if (ball.x > brickX + brickConfig.width) testX = brickX + brickConfig.width;     // Right edge
                if (ball.y < brickY) testY = brickY;                    // Top edge
                else if (ball.y > brickY + brickConfig.height) testY = brickY + brickConfig.height;   // Bottom edge

                // Get distance from closest point
                const distX = ball.x - testX;
                const distY = ball.y - testY;
                const distance = Math.sqrt((distX * distX) + (distY * distY));

                // Check collision
                if (distance <= ball.radius) {
                    // Determine which side was hit
                    const collidePoint = {
                        x: testX,
                        y: testY
                    };

                    // Calculate angle of impact
                    const angle = Math.atan2(ball.y - collidePoint.y, ball.x - collidePoint.x);

                    // Reflect ball based on collision angle
                    if (Math.abs(Math.sin(angle)) > 0.7) { // Top or bottom collision
                        ball.dy = -ball.dy;
                    } else { // Side collision
                        ball.dx = -ball.dx;
                    }

                    brick.status = 0;
                    score++;
                    scoreElement.textContent = score;

                    if (score === brickConfig.rows * brickConfig.cols) {
                        alert('Congratulations! You won!');
                        gameRunning = false;
                    }
                    
                    // Break to prevent multiple collisions in the same frame
                    return;
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// Add this new function to update brick colors
function updateBrickColors() {
    for (let i = 0; i < brickConfig.rows; i++) {
        for (let j = 0; j < brickConfig.cols; j++) {
            if (bricks[i][j].status === 1) {
                bricks[i][j].color = COLORS[Math.floor(Math.random() * COLORS.length)];
            }
        }
    }
}

// Modify the drawBricks() function to use the brick's color
function drawBricks() {
    for (let i = 0; i < brickConfig.rows; i++) {
        for (let j = 0; j < brickConfig.cols; j++) {
            if (bricks[i][j].status === 1) {
                const brickX = j * (brickConfig.width + brickConfig.padding) + brickConfig.offsetLeft;
                const brickY = i * (brickConfig.height + brickConfig.padding) + brickConfig.offsetTop;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickConfig.width, brickConfig.height);
                ctx.fillStyle = bricks[i][j].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function draw() {
    if (!gameRunning) {
        clearInterval(colorInterval);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Ball collision with walls
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            // Calculate where the ball hits the paddle (0 to 1)
            const hitPoint = (ball.x - paddle.x) / paddle.width;
            
            // Define maximum deflection angle (in radians)
            const maxAngle = Math.PI / 6; // 30 degrees
            
            // Calculate deflection angle (-30 to +30 degrees)
            const deflectionAngle = (hitPoint * 2 - 1) * maxAngle;
            
            // Set base speed
            const baseSpeed = 4;
            
            // Calculate new velocities
            ball.dx = baseSpeed * Math.sin(deflectionAngle);
            ball.dy = -baseSpeed * Math.cos(deflectionAngle);
        } else {
            alert('Game Over');
            gameRunning = false;
            return;
        }
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw);
}