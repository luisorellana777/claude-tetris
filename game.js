'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

// Paletas por skin (índice 0 reservado para celdas vacías)
const RETRO_COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#7986cb', // J - indigo
  '#ffb74d', // L - orange
  '#b0bec5', // NUT piece body
  '#7a8fa0', // permanent nut frame (inamovible)
];

const NEON_COLORS = [
  null,
  '#00ffff', // I - cyan
  '#ffee00', // O - yellow
  '#ff44ff', // T - magenta
  '#44ff44', // S - green
  '#ff2244', // Z - red
  '#2288ff', // J - blue
  '#ff9922', // L - orange
  '#baffee', // NUT piece body
  '#8899bb', // permanent nut frame (inamovible)
];

const PASTEL_COLORS = [
  null,
  '#a8d8e8', // I - cyan
  '#f7e3a9', // O - yellow
  '#d8bfe0', // T - purple
  '#b5dfc0', // S - green
  '#f0bcbc', // Z - red
  '#b4c3e8', // J - indigo
  '#f6d2a8', // L - orange
  '#e6ddd2', // NUT piece body
  '#c9d2da', // permanent nut frame (inamovible)
];

const PIXEL_COLORS = [
  null,
  '#00c3ff', // I - cyan
  '#ffd23e', // O - yellow
  '#c760d8', // T - purple
  '#5fd35f', // S - green
  '#ff5050', // Z - red
  '#5060e8', // J - indigo
  '#ff8c1e', // L - orange
  '#b8c4d0', // NUT piece body
  '#7a90a8', // permanent nut frame (inamovible)
];

const COLORS = RETRO_COLORS;

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // NUT - tuerca rara (~15%), deja marco permanente hueco al fijarse
];

const LINE_SCORES = [0, 100, 300, 500, 800];

// ---- Themes ----
const THEMES = {
  retro: {
    name: 'Retro',
    drawBlock: function(ctx, x, y, ci, sz) {
      const color = RETRO_COLORS[ci];
      ctx.globalAlpha = arguments[4] ?? 1;
      ctx.fillStyle = color;
      ctx.fillRect(x * sz + 1, y * sz + 1, sz - 2, sz - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x * sz + 1, y * sz + 1, sz - 2, 4);
      if (ci === 9) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x * sz + 3, y * sz + 3);
        ctx.lineTo((x + 1) * sz - 3, (y + 1) * sz - 3);
        ctx.moveTo((x + 1) * sz - 3, y * sz + 3);
        ctx.lineTo(x * sz + 3, (y + 1) * sz - 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    gridColor: '#22222e'
  },
  neon: {
    name: 'Neon',
    drawBlock: function(ctx, x, y, ci, sz) {
      const color = NEON_COLORS[ci];
      ctx.globalAlpha = arguments[4] ?? 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = color;
      ctx.fillRect(x * sz + 2, y * sz + 2, sz - 4, sz - 4);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
    gridColor: '#1a1a2e'
  },
  pastel: {
    name: 'Pastel',
    drawBlock: function(ctx, x, y, ci, sz) {
      const color = PASTEL_COLORS[ci];
      ctx.globalAlpha = arguments[4] ?? 1;
      const pad = 2, r = 6;
      const rx = x * sz + pad, ry = y * sz + pad;
      const rw = sz - pad * 2, rh = sz - pad * 2;
      ctx.beginPath();
      ctx.moveTo(rx + r, ry);
      ctx.lineTo(rx + rw - r, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
      ctx.lineTo(rx + rw, ry + rh - r);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
      ctx.lineTo(rx + r, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
      ctx.lineTo(rx, ry + r);
      ctx.quadraticCurveTo(rx, ry, rx + r, ry);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    },
    gridColor: '#e8ddd0'
  },
  pixel: {
    name: 'Pixel Art',
    drawBlock: function(ctx, x, y, ci, sz) {
      const color = PIXEL_COLORS[ci];
      ctx.globalAlpha = arguments[4] ?? 1;
      ctx.fillStyle = color;
      ctx.fillRect(x * sz + 1, y * sz + 1, sz - 2, sz - 2);
      const seed = ci * 1000 + x * 31 + y * 67;
      let s = seed;
      function nextRand() { s = (s * 16807) % 2147483647; return s; }
      for (let i = 0; i < 12; i++) {
        const px = x * sz + ((nextRand() % (sz - 6)) + 3);
        const py = y * sz + ((nextRand() % (sz - 6)) + 3);
        ctx.fillStyle = nextRand() > 1073741823 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(px, py, 3, 3);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x * sz + 1.5, y * sz + 1.5, sz - 3, sz - 3);
      ctx.globalAlpha = 1;
    },
    gridColor: '#333366'
  }
};

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');

let board, permanent, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
let pauseMenuOpen = false;
let initialLevel = 1;
const savedInitial = localStorage.getItem('tetris_initial_level');
if (savedInitial) { const parsed = parseInt(savedInitial, 10); if (!isNaN(parsed)) initialLevel = parsed; }

let currentTheme = 'retro';
const savedTheme = localStorage.getItem('tetris_theme');
if (savedTheme && THEMES[savedTheme]) currentTheme = savedTheme;

let maxCombo = 0, currentCombo = 0, linesClearedThisGame = 0;

function createBoard() {
  board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  permanent = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
}

function randomPiece() {
  const isNut = Math.random() < 0.15;
  const type = isNut ? 8 : Math.floor(Math.random() * 7) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  if (current.type === 8) {
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c] && !(r === 1 && c === 1)) {
          const bx = current.x + c;
          const by = current.y + r;
          if (bx >= 0 && bx < COLS && by >= 0 && by < ROWS && board[by][bx] === 0) {
            board[by][bx] = 9;
            permanent[by][bx] = true;
          }
        }
      }
    }
  } else {
    for (let r = 0; r < current.shape.length; r++)
      for (let c = 0; c < current.shape[r].length; c++)
        if (current.shape[r][c])
          board[current.y + r][current.x + c] = current.shape[r][c];
  }
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r].every(v => v !== 0)) continue;
    board.splice(r, 1);
    board.unshift(new Array(COLS).fill(0));
    permanent.splice(r, 1);
    permanent.unshift(new Array(COLS).fill(false));
    cleared++;
    r++;
  }
  if (cleared) {
    currentCombo++;
    if (currentCombo > maxCombo) maxCombo = currentCombo;
    linesClearedThisGame += cleared;
    lines += cleared;
    score += LINE_SCORES[cleared] * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    updateHUD();
  } else {
    currentCombo = 0;
  }
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  clearLines();
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  THEMES[currentTheme].drawBlock.call(null, context, x, y, colorIndex, size, alpha);
}

function drawGrid() {
  ctx.strokeStyle = THEMES[currentTheme].gridColor;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = (4 - shape[0].length) / 2;
  const offY = (4 - shape.length) / 2;
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

// ---- High scores ----
function getHighScores() {
  try { return JSON.parse(localStorage.getItem('tetris_scores')) || []; }
  catch { return []; }
}

function saveScore(scoreVal, name) {
  const scores = getHighScores();
  scores.push({ score: scoreVal, name: name || 'Anónimo', date: Date.now(), maxCombo, linesClearedThisGame });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 5) scores.length = 5;
  localStorage.setItem('tetris_scores', JSON.stringify(scores));
  return scores;
}

function getMinTopScore() {
  const s = getHighScores();
  return s.length < 5 ? -1 : s[s.length - 1].score;
}

function showHighScoresDisplay(el) {
  const scores = getHighScores();
  if (scores.length === 0) { el.innerHTML = '<p style="color:inherit;opacity:.4;font-size:12px;">Sin records</p>'; return; }
  let html = '<table class="scores-table">';
  scores.forEach((s, i) => {
    const stars = i === 0 ? ' ★' : '';
    html += `<tr><td class="rank">${i + 1}.</td><td class="player-name">${s.name}</td><td class="score-value">${s.score.toLocaleString()}</td></tr>`;
  });
  html += '</table>';
  el.innerHTML = html;
}

// ---- Theme switching ----
function selectTheme(name) {
  if (!THEMES[name]) return;
  currentTheme = name;
  localStorage.setItem('tetris_theme', name);
  ['theme-neon','theme-pastel','theme-pixel','theme-retro'].forEach(c => document.body.classList.remove(c));
  if (name !== 'retro') document.body.classList.add('theme-' + name);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === name);
  });
}

// ---- Pause menu ----
function showPauseMenu() {
  pauseMenuOpen = true;
  overlayTitle.textContent = 'PAUSA';
  let html = '<div class="menu-items">';
  html += '<button id="resume-btn" class="menu-btn">▶ Reanudar</button>';
  html += '<button id="pause-restart-btn" class="menu-btn">↻ Reiniciar</button>';
  html += '<div class="level-selector"><span class="level-label">Nivel inicial:</span><button class="level-btn" id="level-minus">−</button><span class="level-val" id="level-display">' + initialLevel + '</span><button class="level-btn" id="level-plus">+</button></div>';
  html += '<button id="controls-btn" class="menu-btn">⌨ Ver controles</button>';
  html += '<div id="controls-info" class="controls-info hidden"><table class="controls-table"><tbody><tr><td>← →</td><td>Mover pieza</td></tr><tr><td>↑ / X</td><td>Rotar</td></tr><tr><td>↓</td><td>Bajar suave</td></tr><tr><td>Space</td><td>Caída instantánea</td></tr><tr><td>P / Esc</td><td>Pausa / Menú</td></tr></tbody></table></div>';
  html += '<button id="scores-btn" class="menu-btn">🏆 Ver records</button>';
  html += '</div>';
  overlayScore.innerHTML = html;
}

function hideOverlay() {
  pauseMenuOpen = false;
  overlay.classList.add('hidden');
  overlayScore.innerHTML = '';
}

function showScoresOverlay() {
  pauseMenuOpen = true;
  overlayTitle.textContent = 'RECORDS';
  let html = '<div class="menu-items">';
  html += '<div id="overlay-scores"><table class="scores-table">';
  const scores = getHighScores();
  if (scores.length === 0) {
    html += '<tr><td style="text-align:center;color:inherit;opacity:.4;">Sin records aún</td></tr>';
  } else {
    scores.forEach((s, i) => {
      const stars = i === 0 ? ' ★' : '';
      html += `<tr><td class="rank">${i + 1}.</td><td class="player-name">${s.name}</td><td class="score-value">${s.score.toLocaleString()}</td></tr>`;
    });
  }
  html += '</table></div>';
  html += '<button id="back-btn" class="menu-btn">← Volver</button>';
  html += '</div>';
  overlayScore.innerHTML = html;
}

// ---- Game over with high score capture ----
function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  const minTop = getMinTopScore();
  const scores = getHighScores();
  const qualifies = scores.length < 5 || score >= minTop;

  overlayTitle.textContent = 'GAME OVER';
  let html = `<p style="font-family:'Courier New',monospace;font-size:18px;color:#7aa2f7;">${score.toLocaleString()}</p>`;

  if (qualifies) {
    html += '<input id="name-input" type="text" placeholder="Tu nombre" maxlength="15" class="name-input">';
    html += '<button id="save-score-btn" class="menu-btn">💾 Guardar record</button>';
  } else {
    html += `<p style="font-size:12px;color:#888;">Max combo: ${maxCombo} | Líneas: ${linesClearedThisGame}</p>`;
    html += '<button id="view-scores-btn" class="menu-btn">🏆 Ver records</button>';
  }

  overlayScore.innerHTML = html;
  overlay.classList.remove('hidden');

  if (qualifies) {
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 100);
      nameInput.addEventListener('keydown', e => { if (e.code === 'Enter') document.getElementById('save-score-btn').click(); });
    }
    document.getElementById('save-score-btn').addEventListener('click', () => {
      const name = nameInput.value.trim();
      saveScore(score, name);
      showScoresOverlay();
    });
  } else {
    document.getElementById('view-scores-btn').addEventListener('click', showScoresOverlay);
  }

  // Back button from game-over scores overlay (gameOver blocks togglePause)
  setTimeout(() => {
    const backBtn = document.getElementById('back-btn');
    if (backBtn && gameOver) {
      backBtn.addEventListener('click', () => {
        pauseMenuOpen = false;
        overlay.classList.add('hidden');
        overlayScore.innerHTML = '';
        // Show restart option since game is over
        overlayTitle.textContent = 'GAME OVER';
        overlayScore.innerHTML = `<p style="font-family:'Courier New',monospace;font-size:18px;color:#7aa2f7;">${score.toLocaleString()}</p>`;
        overlayScore.innerHTML += '<button id="restart-btn" class="menu-btn">Reiniciar</button>';
        overlay.classList.remove('hidden');
        document.getElementById('restart-btn').addEventListener('click', () => init(initialLevel));
      });
    }
  }, 50);
}

// ---- Initial level ----
function setInitialLevel(delta) {
  if (isNaN(initialLevel)) initialLevel = 1;
  initialLevel = Math.max(1, Math.min(99, initialLevel + delta));
  localStorage.setItem('tetris_initial_level', initialLevel);
  document.getElementById('level-display').textContent = initialLevel;
}

// ---- Game loop & init ----
function togglePause() {
  if (gameOver) return;
  if (pauseMenuOpen) {
    hideOverlay();
    paused = false;
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
    return;
  }
  if (!paused) {
    paused = true;
    cancelAnimationFrame(animId);
    showPauseMenu();
  } else {
    paused = false;
    hideOverlay();
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}

function init(startLevel) {
  const lvl = startLevel || initialLevel;
  createBoard();
  score = 0;
  lines = 0;
  level = lvl;
  maxCombo = 0;
  currentCombo = 0;
  linesClearedThisGame = 0;
  paused = false;
  gameOver = false;
  pauseMenuOpen = false;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  overlayScore.innerHTML = '';
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

// ---- Event listeners ----
document.addEventListener('keydown', e => {
  if (e.code === 'KeyP' || e.code === 'Escape') {
    e.preventDefault();
    togglePause();
    return;
  }
  if (pauseMenuOpen) {
    if (e.code === 'Enter' || e.code === 'Space') {
      const resumeBtn = document.getElementById('resume-btn');
      if (resumeBtn) resumeBtn.click();
      return;
    }
    if (e.code === 'KeyR') {
      const restartBtn2 = document.getElementById('pause-restart-btn');
      if (restartBtn2) restartBtn2.click();
      return;
    }
    if (e.code === 'KeyL' || e.code === 'ArrowRight') { setInitialLevel(1); return; }
    if (e.code === 'KeyK' || e.code === 'ArrowLeft') { setInitialLevel(-1); return; }
    if (e.code === 'Escape' || e.code === 'KeyP') { hideOverlay(); return; }
    if (e.code === 'KeyC') {
      const info = document.getElementById('controls-info');
      if (info) info.classList.toggle('hidden');
      return;
    }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      const scoresBtn = document.getElementById('scores-btn');
      if (scoresBtn) showScoresOverlay();
      return;
    }
    return; // block game inputs during pause menu
  }
  if (paused || gameOver) return;

  switch (e.code) {
    case 'ArrowLeft':
      e.preventDefault();
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
});

restartBtn.addEventListener('click', () => init(initialLevel));

// Theme buttons
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => selectTheme(btn.dataset.theme));
});

// Pause menu buttons (delegated)
overlayScore.addEventListener('click', e => {
  if (e.target.id === 'resume-btn') togglePause();
  else if (e.target.id === 'pause-restart-btn') init(initialLevel);
  else if (e.target.id === 'level-minus') setInitialLevel(-1);
  else if (e.target.id === 'level-plus') setInitialLevel(1);
  else if (e.target.id === 'controls-btn') { const info = document.getElementById('controls-info'); if (info) info.classList.toggle('hidden'); }
  else if (e.target.id === 'scores-btn') showScoresOverlay();
  else if (e.target.id === 'back-btn') togglePause();
});

// Initialize
selectTheme(currentTheme);
showHighScoresDisplay(document.getElementById('high-scores-list'));
init(initialLevel);
