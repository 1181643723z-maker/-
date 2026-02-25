const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart-btn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const initialSpeed = 140;
const minSpeed = 80;

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore;
let gameInterval;
let gameSpeed;
let started;
let paused;

const directionMap = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function resetGame() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  food = randomFoodPosition();
  score = 0;
  gameSpeed = initialSpeed;
  started = false;
  paused = false;
  scoreEl.textContent = String(score);
  statusEl.textContent = "按方向键开始游戏";
  stopLoop();
  draw();
}

function loadBestScore() {
  const saved = localStorage.getItem("snake-best-score");
  bestScore = saved ? Number(saved) : 0;
  if (Number.isNaN(bestScore)) {
    bestScore = 0;
  }
  bestScoreEl.textContent = String(bestScore);
}

function saveBestScore() {
  localStorage.setItem("snake-best-score", String(bestScore));
  bestScoreEl.textContent = String(bestScore);
}

function randomFoodPosition() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake?.some((segment) => segment.x === pos.x && segment.y === pos.y));
  return pos;
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i += 1) {
    const p = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function drawRoundedRect(x, y, color, radius = 4) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, radius);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  drawRoundedRect(food.x * gridSize, food.y * gridSize, "#ff6b6b", 6);

  snake.forEach((segment, index) => {
    const isHead = index === 0;
    drawRoundedRect(
      segment.x * gridSize,
      segment.y * gridSize,
      isHead ? "#7df9ff" : "#2ec4b6",
      isHead ? 6 : 4,
    );
  });
}

function tick() {
  if (paused) {
    return;
  }

  direction = { ...nextDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const outOfBounds =
    head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (outOfBounds || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head);

  const ateFood = head.x === food.x && head.y === food.y;
  if (ateFood) {
    score += 1;
    scoreEl.textContent = String(score);
    food = randomFoodPosition();

    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }

    if (gameSpeed > minSpeed) {
      gameSpeed = Math.max(minSpeed, gameSpeed - 4);
      restartLoop();
    }
  } else {
    snake.pop();
  }

  draw();
}

function startLoop() {
  if (!gameInterval) {
    gameInterval = setInterval(tick, gameSpeed);
  }
}

function stopLoop() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
}

function restartLoop() {
  stopLoop();
  startLoop();
}

function gameOver() {
  stopLoop();
  started = false;
  statusEl.textContent = `游戏结束！最终得分：${score}，按方向键重新开始`;
}

function setDirection(newDirection) {
  const isOpposite =
    newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0;
  if (!isOpposite) {
    nextDirection = newDirection;
  }
}

function togglePause() {
  if (!started) {
    return;
  }
  paused = !paused;
  statusEl.textContent = paused ? "游戏已暂停（按空格继续）" : "游戏进行中";
}

function handleMoveKey(key) {
  const newDirection = directionMap[key];
  if (!newDirection) {
    return;
  }

  if (!started) {
    resetGame();
    started = true;
    statusEl.textContent = "游戏进行中";
    setDirection(newDirection);
    startLoop();
    return;
  }

  if (!paused) {
    setDirection(newDirection);
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === " ") {
    togglePause();
    return;
  }

  handleMoveKey(key);
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

loadBestScore();
resetGame();
