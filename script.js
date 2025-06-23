const canvas = document.getElementById('rotCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 25;
const cellSize = canvas.width / gridSize;
let grid;

const particles = [];
const cracks = [];

const progressDisplay = document.getElementById('progress');

let time = 0; // do animacji cracków i particles

// Funkcja easing (easeInOutQuad)
function easeInOutQuad(t) {
  return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
}

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
      if (grid[y][x] === 0) ctx.fillStyle = '#2c1b18';
      else if (grid[y][x] === 1) ctx.fillStyle = '#882222';
      else if (grid[y][x] === 2) ctx.fillStyle = '#cc3333';
      else if (grid[y][x] === 3) ctx.fillStyle = '#ccc8c4';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
    }
  }

  drawCracks();
  drawParticles();
}

function drawParticles() {
  for (const p of particles) {
    // dodajemy falowanie alfa i pozycji dla naturalności
    const wave = Math.sin(time * 0.05 + p.x) * 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(p.alpha + wave, 0)})`;
    ctx.beginPath();
    ctx.arc(p.x + wave * 2, p.y + wave * 2, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCracks() {
  ctx.strokeStyle = '#bb4455';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;

  cracks.forEach((crack, i) => {
    // Animujemy końcówki cracków sinusoidą (falowanie)
    const offsetX = Math.sin(time * 0.02 + i) * 2;
    const offsetY = Math.cos(time * 0.02 + i) * 2;

    ctx.beginPath();
    ctx.moveTo(crack.x1 + offsetX, crack.y1 + offsetY);
    ctx.lineTo(crack.x2 + offsetX, crack.y2 + offsetY);
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

  // Zamiast stałego czasu, modulujemy czas z easingiem
  let t1 = 0.5 + Math.random() * 0.7;
  t1 = easeInOutQuad(t1);

  setTimeout(() => {
    grid[y][x] = 2; // rozwinięta
    createParticles(x, y, 5);
    drawGrid();
    updateProgress();

    let t2 = 1.2 + Math.random() * 0.8;
    t2 = easeInOutQuad(t2);

    setTimeout(() => {
      grid[y][x] = 3; // martwe pole (puch)
      createParticles(x, y, 10, 0.4);
      drawGrid();
      updateProgress();
    }, t2 * 1000);

    if (Math.random() < 0.9) spreadRot(x + (Math.random() > 0.5 ? 1 : -1), y);
    if (Math.random() < 0.9) spreadRot(x, y + (Math.random() > 0.5 ? 1 : -1));
    if (Math.random() < 0.5) spreadRot(x + (Math.random() > 0.5 ? 1 : -1), y + (Math.random() > 0.5 ? 1 : -1));
  }, t1 * 1000);
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
    // Falowany ruch zamiast prostego liniowego
    p.x += p.vx + Math.sin(time * 0.1 + p.x) * 0.1;
    p.y += p.vy + Math.cos(time * 0.1 + p.y) * 0.1;
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
  time++;
  animateParticles();
  drawGrid();
  requestAnimationFrame(loop);
}

initGrid();
loop();
