"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const rulesButton = document.getElementById("rules-btn");
const closeButton = document.getElementById("close-btn");
const rules = document.getElementById("rules");

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
};

const paddle = {
  x: (canvas.width - 80) / 2,
  y: canvas.height - 30,
  width: 80,
  height: 10,
  speed: 8,
  dx: 0,
};

const brickInfo = {
  width: 70,
  height: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
};
const brickRowCount = 5;
const brickColumnCount = 9;
const bricks = Array.from({ length: brickRowCount }, (_, row) =>
  Array.from({ length: brickColumnCount }, (_, column) => ({
    x: column * (brickInfo.width + brickInfo.padding) + brickInfo.offsetX,
    y: row * (brickInfo.height + brickInfo.padding) + brickInfo.offsetY,
    ...brickInfo,
    visible: true,
  })),
);

let score = 0;
let animationFrameId;
let gameWon = false;

rulesButton.addEventListener("click", () => {
  rules.classList.add("show");
  rules.setAttribute("aria-hidden", "false");
});

closeButton.addEventListener("click", () => {
  rules.classList.remove("show");
  rules.setAttribute("aria-hidden", "true");
});

function drawScore() {
  ctx.font = "20px Arial";
  ctx.textAlign = "right";
  ctx.fillStyle = "#222";
  ctx.fillText(score >= 25 ? "ЗНУ найкращі!!!" : `Рахунок: ${score}`, canvas.width - 16, 30);
  ctx.textAlign = "start";
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#087eae";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
  ctx.fillStyle = "#190146";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  bricks.forEach((row) => {
    row.forEach((brick) => {
      if (!brick.visible) return;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
      ctx.fillStyle = "#087eae";
      ctx.fill();
      ctx.closePath();
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScore();
  drawBricks();
  drawBall();
  drawPaddle();
}

function movePaddle() {
  paddle.x += paddle.dx;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
}

function showAllBricks() {
  bricks.forEach((row) => row.forEach((brick) => {
    brick.visible = true;
  }));
}

function resetAfterMiss() {
  score = 0;
  ball.speed = 4;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4;
  ball.dy = -4;
  paddle.x = (canvas.width - paddle.width) / 2;
  paddle.dx = 0;
  showAllBricks();
}

function increaseScore() {
  score += 1;
  if (score % 10 === 0) {
    ball.speed += 1;
    ball.dx = Math.sign(ball.dx) * ball.speed;
    ball.dy = Math.sign(ball.dy) * ball.speed;
  }
  if (score >= 25) {
    gameWon = true;
  }
}

function ballTouchesBrick(brick) {
  const nearestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
  const nearestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
  const distanceX = ball.x - nearestX;
  const distanceY = ball.y - nearestY;
  return distanceX * distanceX + distanceY * distanceY <= ball.size * ball.size;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size >= canvas.width || ball.x - ball.size <= 0) {
    ball.dx *= -1;
    ball.x = Math.max(ball.size, Math.min(canvas.width - ball.size, ball.x));
  }
  if (ball.y - ball.size <= 0) {
    ball.dy = Math.abs(ball.dy);
    ball.y = ball.size;
  }

  if (
    ball.dy > 0 &&
    ball.y + ball.size >= paddle.y &&
    ball.y - ball.size <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    const hitPosition = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    const angle = hitPosition * (Math.PI / 3);
    ball.dx = Math.sin(angle) * ball.speed;
    ball.dy = -Math.cos(angle) * ball.speed;
    ball.y = paddle.y - ball.size;
  }

  for (const row of bricks) {
    for (const brick of row) {
      if (brick.visible && ballTouchesBrick(brick)) {
        brick.visible = false;
        ball.dy *= -1;
        increaseScore();
        if (gameWon) return;
        break;
      }
    }
  }

  if (ball.y - ball.size > canvas.height) {
    resetAfterMiss();
  }
}

function update() {
  movePaddle();
  if (!gameWon) moveBall();
  draw();
  if (!gameWon) animationFrameId = window.requestAnimationFrame(update);
}

function keyDown(event) {
  if (event.key === "ArrowRight" || event.key === "Right") {
    paddle.dx = paddle.speed;
    event.preventDefault();
  } else if (event.key === "ArrowLeft" || event.key === "Left") {
    paddle.dx = -paddle.speed;
    event.preventDefault();
  }
}

function keyUp(event) {
  if (["ArrowRight", "Right", "ArrowLeft", "Left"].includes(event.key)) {
    paddle.dx = 0;
  }
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
draw();
animationFrameId = window.requestAnimationFrame(update);
