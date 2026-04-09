const board = document.getElementById("game-board");
const context = board.getContext("2d");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart-button");

const gridSize = 20;
const tileCount = board.width / gridSize;
const tickDelay = 130;

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
    context.strokeStyle = "#d8cbb7";
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
    context.fillStyle = "#f8f4ee";
    context.fillRect(0, 0, board.width, board.height);

    drawGrid();
    drawCell(food.x, food.y, "#d62828", 3);

    snake.forEach((segment, index) => {
        drawCell(segment.x, segment.y, index === 0 ? "#1d6f65" : "#2a9d8f");
    });
}

function handleDirectionChange(event) {
    const key = event.key.toLowerCase();
    const directions = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 }
    };

    const newDirection = directions[key];

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

document.addEventListener("keydown", handleDirectionChange);
restartButton.addEventListener("click", resetGame);

resetGame();