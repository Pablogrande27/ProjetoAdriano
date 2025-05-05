const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const backgroundImg = new Image();
backgroundImg.src = "jogo.jpeg"; // Caminho da sua imagem

const playerImg = new Image();
  playerImg.src = "images.png";


let backgroundX = 0;
const backgroundSpeed = 2; // Velocidade do fundo
const groundY = 300;

const player = {
  x: 100,
  y: groundY,
  width: 50,
  height: 50,
  velY: 0,
  gravity: 0.5,
  jumpStrength: -12,
  jumping: false
};

let obstacles = [];
let lastObstacleTime = 0;
let nextObstacleDelay = getRandomDelay();

let score = 0;
let gameOver = false;

function getRandomDelay() {
  return Math.random() * 1500 + 1000; // entre 1s e 2.5s
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !player.jumping) {
    player.velY = player.jumpStrength;
    player.jumping = true;
  }
});

function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: groundY,
    width: 50,
    height: 50,
    speed: 4
  });
}

function update(timestamp) {
  if (gameOver) return;

  // Gravidade
  player.velY += player.gravity;
  player.y += player.velY;

  if (player.y > groundY) {
    player.y = groundY;
    player.velY = 0;
    player.jumping = false;
  }
  backgroundX -= backgroundSpeed;
  if (backgroundX <= -canvas.width) {
    backgroundX = 0;
  }
  // Spawning de obstáculos com atraso aleatório
  if (!lastObstacleTime || timestamp - lastObstacleTime > nextObstacleDelay) {
    spawnObstacle();
    lastObstacleTime = timestamp;
    nextObstacleDelay = getRandomDelay();
  }

  // Atualiza obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obs.speed;

    // Colisão
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y + player.height > obs.y
    ) {
      gameOver = true;
    }

    // Remove obstáculos que saíram da tela
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score++;
    }
  }
}

function draw(timestamp) {



// Fundo com imagem
ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height);
ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height);

update(timestamp);
  // Chão
  ctx.fillStyle = "	#5F9EA0";
  ctx.fillRect(0, groundY + player.height, canvas.width, 100);

  // Jogador
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Obstáculos
  ctx.fillStyle = "#FF6347";
  for (const obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // Pontuação
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Pontuação: ${score}`, 10, 30);

  // Fim de jogo
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
  } else {
    requestAnimationFrame(draw);
  }
}
requestAnimationFrame(draw);
