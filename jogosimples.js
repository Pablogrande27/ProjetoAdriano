const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const backgroundImg = new Image();
backgroundImg.src = "jogo.jpeg";

const playerImg = new Image();
playerImg.src = "char.png";

const obstaculosImg = new Image();
obstaculosImg.src = "mesajogo.png";

let backgroundX = 0;
const backgroundSpeed = 2; // Velocidade do fundo
const groundY = 300;

const player = {
  x: 100,
  y: groundY,
  width: 40,
  height: 80,
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

const hitboxMargin = 7.7;
let animationId = null; // <- controle da animação

function getRandomDelay() {
  return Math.random() * 1500 + 1000;
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !player.jumping && !gameOver) {
    player.velY = player.jumpStrength;
    player.jumping = true;
  }
});

function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: groundY,
    width: 80,
    height: 80,
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

  if (!lastObstacleTime || timestamp - lastObstacleTime > nextObstacleDelay) {
    spawnObstacle();
    lastObstacleTime = timestamp;
    nextObstacleDelay = getRandomDelay();
  }

  // Atualiza obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obs.speed;

    //Ajuste de hitbox
    const playerHitbox = {
      x: player.x + hitboxMargin,
      y: player.y + hitboxMargin,
      width: player.width - hitboxMargin * 2,
      height: player.height - hitboxMargin * 2
    };

    const obsHitbox = {
      x: obs.x + hitboxMargin,
      y: obs.y + hitboxMargin,
      width: obs.width - hitboxMargin * 2,
      height: obs.height - hitboxMargin * 2
    };

    // Colisão
    if (
      playerHitbox.x < obsHitbox.x + obsHitbox.width &&
      playerHitbox.x + playerHitbox.width > obsHitbox.x &&
      playerHitbox.y < obsHitbox.y + obsHitbox.height &&
      playerHitbox.y + playerHitbox.height > obsHitbox.y
    ) {
      gameOver = true;

      const restartBtn = document.getElementById("restartBtn");
      restartBtn.style.display = "block";
      restartBtn.style.position = "absolute";

      const canvasRect = canvas.getBoundingClientRect();
      restartBtn.style.left = `${canvasRect.left + canvas.width / 2 - 90}px`;
      restartBtn.style.top = `${canvasRect.top + canvas.height / 2 + 50}px`;
    }

    // Remove obstáculos que saíram da tela
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score++;
    }
  }
}

function draw(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height);

  update(timestamp);

  ctx.fillStyle = "#5F9EA0";
  ctx.fillRect(0, groundY + player.height, canvas.width, 100);

  // Jogador
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Obstáculos
  for (const obs of obstacles) {
    ctx.drawImage(obstaculosImg, obs.x, obs.y, obs.width, obs.height);
  }

  // Pontuação
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Pontuação: ${score}`, 10, 30);

  // Fim de jogo
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.fillRect(255, 145, 280, 86);
    ctx.strokeStyle = "red";
    ctx.strokeRect(255, 145, 280, 86);
    ctx.fillStyle = "red";
    ctx.font = "bold italic 40px Arial";
    ctx.fillText("REPROVADO", canvas.width / 2 - 132, canvas.height / 2);
  } else {
    animationId = requestAnimationFrame(draw); // salva o ID da animação
  }
}

document.getElementById("restartBtn").addEventListener("click", () => {
  // Cancela o frame anterior para evitar sobreposição
  if (animationId) {
    
    cancelAnimationFrame(animationId);
    animationId = null;
    
  }

  player.y = groundY;
  player.velY = 0;
  player.jumping = false;

  obstacles = [];
  score = 0;
  gameOver = false;
  lastObstacleTime = 0;
  nextObstacleDelay = getRandomDelay();
  backgroundX = 0;

  document.getElementById("restartBtn").style.display = "none";

  animationId = requestAnimationFrame(draw); // reinicia corretamente
  
});

animationId = requestAnimationFrame(draw); // primeira chamada
