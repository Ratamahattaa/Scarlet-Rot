const canvas = document.getElementById('rotCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 25;
const cellSize = canvas.width / gridSize;
let grid;

const particles = [];
const cracks = [];

const progressDisplay = document.getElementById('progress');

function initGrid() {
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  particles.length = 0;
  cracks.length = 0;
  drawGrid();
  updateProgress();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x] === 0) ctx.fillStyle = '#2c1b18'; // czyste pole
      else if (grid[y][x] === 1) ctx.fillStyle = '#882222'; // świeża infekcja
      else if (grid[y][x] === 2) ctx.fillStyle = '#cc3333'; // rozwinięta infekcja
      else if (grid[y][x] === 3) ctx.fillStyle = '#ccc8c4'; // martwe pole (puch)
      ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
    }
  }

  drawCracks();
  drawParticles();
}

function drawParticles() {
  for (const p of particles) {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCracks() {
  ctx.strokeStyle = '#bb4455';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;

  cracks.forEach(crack => {
    ctx.beginPath();
    ctx.moveTo(crack.x1, crack.y1);
    ctx.lineTo(crack.x2, crack.y2);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
}

function spreadRot(x, y) {
  if (x < 0 || y < 0 || x >= gridSize || y >= gridSize || grid[y][x] !== 0) return;

  grid[y][x] = 1; // świeża infekcja
  createParticles(x, y);
  createCracks(x, y);
  drawGrid();
  updateProgress();

  setTimeout(() => {
    grid[y][x] = 2; // rozwinięta
    createParticles(x, y, 5);
    drawGrid();
    updateProgress();

    setTimeout(() => {
      grid[y][x] = 3; // martwe pole (puch)
      createParticles(x, y, 10, 0.4);
      drawGrid();
      updateProgress();
    }, 1200 + Math.random() * 800);

    // organiczne rozprzestrzenianie
    if (Math.random() < 0.9) spreadRot(x + (Math.random() > 0.5 ? 1 : -1), y);
    if (Math.random() < 0.9) spreadRot(x, y + (Math.random() > 0.5 ? 1 : -1));
    if (Math.random() < 0.5) spreadRot(x + (Math.random() > 0.5 ? 1 : -1), y + (Math.random() > 0.5 ? 1 : -1));
  }, 500 + Math.random() * 700);
}

function createParticles(gridX, gridY, count = 3, alpha = 0.6) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: gridX * cellSize + Math.random() * cellSize,
      y: gridY * cellSize + Math.random() * cellSize,
      size: Math.random() * 2 + 1,
      alpha,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }
}

function createCracks(gridX, gridY) {
  for (let i = 0; i < 2; i++) {
    const startX = gridX * cellSize + Math.random() * cellSize;
    const startY = gridY * cellSize + Math.random() * cellSize;
    const endX = startX + (Math.random() - 0.5) * 20;
    const endY = startY + (Math.random() - 0.5) * 20;
    cracks.push({ x1: startX, y1: startY, x2: endX, y2: endY });
  }
}

function animateParticles() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.002;
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }
}

function updateProgress() {
  const total = gridSize * gridSize;
  const infected = grid.flat().filter(cell => cell !== 0).length;
  const percent = Math.floor((infected / total) * 100);
  progressDisplay.textContent = `Infected: ${percent}%`;
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  spreadRot(x, y);
});

document.getElementById('resetBtn').addEventListener('click', initGrid);

function loop() {
  animateParticles();
  drawGrid();
  requestAnimationFrame(loop);
}

initGrid();
loop();
