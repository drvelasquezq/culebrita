const board = document.getElementById("game-board");
const context = board.getContext("2d");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart-button");
const touchButtons = document.querySelectorAll("[data-dir]");

const gridSize = 20;
const tileCount = board.width / gridSize;
const INITIAL_DELAY = 130;
const MIN_DELAY = 50;
const SPEED_STEP = 15;
const INPUT_DIRECTIONS = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    up: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    down: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    left: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
    right: { x: 1, y: 0 }
};

let tickDelay = INITIAL_DELAY;

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem("snake-best-score") || 0);
let gameLoopId = null;
let isRunning = false;
let hasStarted = false;

bestScoreElement.textContent = String(bestScore);

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { ...direction };
    score = 0;
    tickDelay = INITIAL_DELAY;
    hasStarted = false;
    isRunning = false;
    scoreElement.textContent = "0";
    statusElement.textContent = "Presiona una tecla para empezar";
    placeFood();
    draw();

    if (gameLoopId !== null) {
        clearInterval(gameLoopId);
        gameLoopId = null;
    }
}

function placeFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function startGame() {
    if (isRunning) {
        return;
    }

    isRunning = true;
    hasStarted = true;
    statusElement.textContent = "En juego";
    gameLoopId = setInterval(update, tickDelay);
}

function update() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
    const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreElement.textContent = String(score);
        statusElement.textContent = "Buen bocado";

        if (score > bestScore) {
            bestScore = score;
            bestScoreElement.textContent = String(bestScore);
            localStorage.setItem("snake-best-score", String(bestScore));
        }

        tickDelay = Math.max(MIN_DELAY, tickDelay - SPEED_STEP);
        clearInterval(gameLoopId);
        gameLoopId = setInterval(update, tickDelay);
        placeFood();
    } else {
        snake.pop();
    }

    draw();
}

function endGame() {
    isRunning = false;
    clearInterval(gameLoopId);
    gameLoopId = null;
    statusElement.textContent = "Perdiste. Pulsa reiniciar o una tecla para jugar otra vez";
}

function drawGrid() {
    context.strokeStyle = "#2a2830";
    context.lineWidth = 1;

    for (let step = 0; step <= board.width; step += gridSize) {
        context.beginPath();
        context.moveTo(step, 0);
        context.lineTo(step, board.height);
        context.stroke();

        context.beginPath();
        context.moveTo(0, step);
        context.lineTo(board.width, step);
        context.stroke();
    }
}

function drawCell(x, y, color, inset = 2) {
    context.fillStyle = color;
    context.fillRect(
        x * gridSize + inset,
        y * gridSize + inset,
        gridSize - inset * 2,
        gridSize - inset * 2
    );
}

function draw() {
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "#111118";
    context.fillRect(0, 0, board.width, board.height);

    drawGrid();
    drawCell(food.x, food.y, "#e63946", 3);

    snake.forEach((segment, index) => {
        drawCell(segment.x, segment.y, index === 0 ? "#20c9b8" : "#2a9d8f");
    });
}

function applyDirection(newDirection) {
    if (!newDirection) {
        return;
    }

    const isOpposite =
        newDirection.x === -direction.x && newDirection.y === -direction.y;

    if (isOpposite && hasStarted) {
        return;
    }

    nextDirection = newDirection;

    if (!isRunning) {
        if (!hasStarted) {
            startGame();
        } else {
            resetGame();
            nextDirection = newDirection;
            startGame();
        }
    }
}

function handleDirectionChange(event) {
    const key = event.key.toLowerCase();
    applyDirection(INPUT_DIRECTIONS[key]);
}

function handleTouchDirection(event) {
    event.preventDefault();
    const key = event.currentTarget.dataset.dir;
    applyDirection(INPUT_DIRECTIONS[key]);
}

document.addEventListener("keydown", handleDirectionChange);
restartButton.addEventListener("click", resetGame);
touchButtons.forEach((button) => {
    button.addEventListener("pointerdown", handleTouchDirection);
});

resetGame();