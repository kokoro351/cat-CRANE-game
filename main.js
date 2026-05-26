const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const timeEl = document.querySelector("#time");
const restartBtn = document.querySelector("#restart");
const leftBtn = document.querySelector("#left");
const rightBtn = document.querySelector("#right");
const dropBtn = document.querySelector("#drop");

const W = canvas.width;
const H = canvas.height;
const floorY = H - 92;

const state = {
  score: 0,
  time: 60,
  clawX: W / 2,
  clawY: 94,
  rope: 70,
  dir: 1,
  phase: "aim",
  held: null,
  cats: [],
  keys: new Set(),
  last: performance.now(),
  ended: false,
};

const catColors = ["#f7a65a", "#6f8798", "#f2f0df", "#222b35", "#d8946f"];

function reset() {
  state.score = 0;
  state.time = 60;
  state.clawX = W / 2;
  state.rope = 70;
  state.phase = "aim";
  state.held = null;
  state.ended = false;
  state.cats = Array.from({ length: 9 }, (_, i) => ({
    x: 45 + (i % 3) * 118 + Math.random() * 16,
    y: floorY - 28 - Math.floor(i / 3) * 48,
    r: 22 + Math.random() * 5,
    color: catColors[i % catColors.length],
    saved: false,
    vx: (Math.random() - 0.5) * 0.18,
  }));
  updateHud();
}

function updateHud() {
  scoreEl.textContent = state.score;
  timeEl.textContent = Math.max(0, Math.ceil(state.time));
}

function startDrop() {
  if (state.phase === "aim" && !state.ended) {
    state.phase = "down";
    state.held = null;
  }
}

function moveClaw(delta) {
  if (state.phase !== "aim" || state.ended) return;
  state.clawX = Math.max(42, Math.min(W - 42, state.clawX + delta));
}

function step(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;

  if (!state.ended) {
    state.time -= dt;
    if (state.time <= 0) {
      state.time = 0;
      state.ended = true;
    }
  }

  if (state.keys.has("ArrowLeft") || state.keys.has("a")) moveClaw(-260 * dt);
  if (state.keys.has("ArrowRight") || state.keys.has("d")) moveClaw(260 * dt);

  updateCats(dt);
  updateClaw(dt);
  draw();
  updateHud();
  requestAnimationFrame(step);
}

function updateCats(dt) {
  for (const cat of state.cats) {
    if (cat.saved || cat === state.held) continue;
    cat.x += cat.vx * dt * 60;
    if (cat.x < cat.r + 10 || cat.x > W - cat.r - 10) cat.vx *= -1;
  }
}

function updateClaw(dt) {
  if (state.phase === "aim") {
    state.clawX += state.dir * 88 * dt;
    if (state.clawX > W - 46 || state.clawX < 46) state.dir *= -1;
    return;
  }

  if (state.phase === "down") {
    state.rope += 270 * dt;
    const hookY = 24 + state.rope;
    const target = state.cats.find((cat) => !cat.saved && Math.hypot(cat.x - state.clawX, cat.y - hookY) < cat.r + 8);
    if (target) {
      state.held = target;
      state.phase = "up";
    } else if (hookY > floorY - 8) {
      state.phase = "up";
    }
    return;
  }

  if (state.phase === "up") {
    state.rope -= 250 * dt;
    if (state.held) {
      state.held.x = state.clawX;
      state.held.y = 24 + state.rope + 32;
    }
    if (state.rope <= 70) {
      state.rope = 70;
      if (state.held) {
        state.held.saved = true;
        state.score += 100;
        state.held = null;
      }
      state.phase = "aim";
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawScene();
  for (const cat of state.cats) {
    if (!cat.saved) drawCat(cat.x, cat.y, cat.r, cat.color);
  }
  drawClaw();
  if (state.ended) drawEndCard();
}

function drawScene() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#9bd8ff");
  sky.addColorStop(1, "#eaf8ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#3c5968";
  ctx.fillRect(28, 42, W - 56, 14);
  ctx.fillRect(38, 42, 12, floorY - 20);
  ctx.fillRect(W - 50, 42, 12, floorY - 20);

  ctx.fillStyle = "#f6d47c";
  ctx.fillRect(0, floorY, W, H - floorY);
  ctx.fillStyle = "#dfb85d";
  for (let x = -20; x < W; x += 36) {
    ctx.fillRect(x, floorY + 34, 20, 7);
  }

  ctx.fillStyle = "rgb(255 255 255 / 0.5)";
  ctx.beginPath();
  ctx.arc(74, 118, 34, 0, Math.PI * 2);
  ctx.arc(110, 118, 25, 0, Math.PI * 2);
  ctx.arc(137, 125, 29, 0, Math.PI * 2);
  ctx.fill();
}

function drawClaw() {
  const hookY = 24 + state.rope;
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(state.clawX, 56);
  ctx.lineTo(state.clawX, hookY);
  ctx.stroke();

  ctx.fillStyle = "#ef5d43";
  ctx.fillRect(state.clawX - 28, 35, 56, 28);

  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(state.clawX, hookY);
  ctx.lineTo(state.clawX - 20, hookY + 25);
  ctx.moveTo(state.clawX, hookY);
  ctx.lineTo(state.clawX + 20, hookY + 25);
  ctx.stroke();
}

function drawCat(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - r * 0.72, y - r * 0.55);
  ctx.lineTo(x - r * 0.28, y - r * 1.12);
  ctx.lineTo(x - r * 0.08, y - r * 0.42);
  ctx.moveTo(x + r * 0.72, y - r * 0.55);
  ctx.lineTo(x + r * 0.28, y - r * 1.12);
  ctx.lineTo(x + r * 0.08, y - r * 0.42);
  ctx.fill();

  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.12, 3.2, 0, Math.PI * 2);
  ctx.arc(x + r * 0.32, y - r * 0.12, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 1);
  ctx.lineTo(x, y + 8);
  ctx.moveTo(x - 8, y + 9);
  ctx.quadraticCurveTo(x, y + 15, x + 8, y + 9);
  ctx.stroke();
}

function drawEndCard() {
  ctx.fillStyle = "rgb(23 33 43 / 0.74)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "800 38px system-ui, sans-serif";
  ctx.fillText("Time!", W / 2, H / 2 - 30);
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillText(`Score ${state.score}`, W / 2, H / 2 + 12);
  ctx.font = "600 15px system-ui, sans-serif";
  ctx.fillText("Tap Restart to play again", W / 2, H / 2 + 46);
  ctx.textAlign = "left";
}

function bindHold(button, delta) {
  let timer = null;
  const start = () => {
    moveClaw(delta);
    timer = setInterval(() => moveClaw(delta), 32);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("pointercancel", stop);
}

bindHold(leftBtn, -18);
bindHold(rightBtn, 18);
dropBtn.addEventListener("click", startDrop);
restartBtn.addEventListener("click", reset);
window.addEventListener("keydown", (event) => {
  state.keys.add(event.key);
  if (event.key === " " || event.key === "Enter") startDrop();
});
window.addEventListener("keyup", (event) => state.keys.delete(event.key));

reset();
requestAnimationFrame(step);
