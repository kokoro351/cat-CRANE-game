const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const distanceEl = document.querySelector("#distance");
const swingEl = document.querySelector("#swing");
const restartBtn = document.querySelector("#restart");
const brakeBtn = document.querySelector("#brake");
const notchBtn = document.querySelector("#notch");
const coastBtn = document.querySelector("#coast");

const W = canvas.width;
const H = canvas.height;
const railY = 96;
const groundY = H - 86;
const ropeLength = 142;
const goalDistance = 520;
const dangerAngle = 34;
const warningAngle = 24;

const state = {
  distance: 0,
  speed: 0,
  accel: 0,
  angle: 0,
  angularVelocity: 0,
  mode: "coast",
  result: "running",
  message: "",
  last: performance.now(),
  keys: new Set(),
  fallY: 0,
};

function reset() {
  state.distance = 0;
  state.speed = 0;
  state.accel = 0;
  state.angle = 0.08;
  state.angularVelocity = 0;
  state.mode = "coast";
  state.result = "running";
  state.message = "";
  state.last = performance.now();
  state.fallY = 0;
  updateHud();
}

function updateHud() {
  distanceEl.textContent = Math.floor(state.distance);
  swingEl.textContent = Math.round(Math.abs(toDeg(state.angle)));
}

function toDeg(rad) {
  return rad * 180 / Math.PI;
}

function setMode(mode) {
  if (state.result !== "running") return;
  state.mode = mode;
}

function readInputMode() {
  if (state.keys.has(" ") || state.keys.has("ArrowRight") || state.keys.has("d")) return "notch";
  if (state.keys.has("ArrowDown") || state.keys.has("s")) return "brake";
  if (state.mode === "notch-hold") return "notch";
  if (state.mode === "brake-hold") return "brake";
  return state.mode;
}

function step(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;

  if (state.result === "running") {
    updatePhysics(dt);
  } else if (state.result === "dropped") {
    state.fallY = Math.min(groundY - 24, state.fallY + 620 * dt);
  }

  draw();
  updateHud();
  requestAnimationFrame(step);
}

function updatePhysics(dt) {
  const input = readInputMode();
  const targetAccel = input === "notch" ? 70 : input === "brake" ? -110 : -16;
  state.accel += (targetAccel - state.accel) * Math.min(1, dt * 9);

  state.speed = Math.max(0, Math.min(132, state.speed + state.accel * dt));
  state.distance += state.speed * dt;

  const gravity = 9.8;
  const lengthMeters = 2.4;
  const trolleyAccel = state.accel / 20;
  const pendulumForce = -(gravity / lengthMeters) * Math.sin(state.angle) - (trolleyAccel / lengthMeters) * Math.cos(state.angle);
  state.angularVelocity += pendulumForce * dt;
  state.angularVelocity *= 0.998;
  state.angle += state.angularVelocity * dt;

  if (Math.abs(toDeg(state.angle)) >= dangerAngle) {
    state.result = "dropped";
    state.message = "Cat dropped!";
    state.fallY = catPosition().y;
  } else if (state.distance >= goalDistance) {
    state.result = "cleared";
    state.message = "Goal!";
    state.distance = goalDistance;
  }
}

function craneX() {
  return 74 + (state.distance / goalDistance) * (W - 148);
}

function catPosition() {
  const x = craneX() + Math.sin(state.angle) * ropeLength;
  const y = railY + 34 + Math.cos(state.angle) * ropeLength;
  return { x, y };
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawScene();
  drawTrack();
  drawCrane();
  drawMeters();
  if (state.result !== "running") drawResult();
}

function drawScene() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#a7ddff");
  sky.addColorStop(0.62, "#f4fbff");
  sky.addColorStop(1, "#f5d77d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#f2c968";
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = "#d9b053";
  for (let x = -12; x < W; x += 42) {
    ctx.fillRect(x, groundY + 28, 24, 7);
  }

  ctx.fillStyle = "rgb(255 255 255 / 0.58)";
  ctx.beginPath();
  ctx.arc(70, 178, 30, 0, Math.PI * 2);
  ctx.arc(105, 176, 24, 0, Math.PI * 2);
  ctx.arc(132, 184, 28, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrack() {
  ctx.fillStyle = "#314a59";
  ctx.fillRect(28, railY - 20, W - 56, 14);
  ctx.fillRect(38, railY - 20, 12, groundY - railY + 8);
  ctx.fillRect(W - 50, railY - 20, 12, groundY - railY + 8);

  const goalX = 74 + W - 148;
  ctx.fillStyle = "#159a9c";
  ctx.fillRect(goalX - 9, railY - 48, 18, 54);
  ctx.fillStyle = "#fff";
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GOAL", goalX, railY - 55);
  ctx.textAlign = "left";
}

function drawCrane() {
  const x = craneX();
  const hookY = railY + 34;
  const cat = catPosition();

  ctx.fillStyle = "#ef5d43";
  ctx.fillRect(x - 31, railY - 36, 62, 32);
  ctx.fillStyle = "#25333f";
  ctx.fillRect(x - 20, railY - 7, 40, 16);

  ctx.strokeStyle = swingColor();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, hookY);
  ctx.lineTo(cat.x, state.result === "dropped" ? state.fallY : cat.y);
  ctx.stroke();

  if (state.result === "dropped") {
    drawCat(cat.x, state.fallY, 24, "#f7a65a");
  } else {
    drawCat(cat.x, cat.y, 24, "#f7a65a");
  }

  ctx.fillStyle = "#25333f";
  ctx.beginPath();
  ctx.arc(x, hookY, 7, 0, Math.PI * 2);
  ctx.fill();
}

function swingColor() {
  const swing = Math.abs(toDeg(state.angle));
  if (swing >= warningAngle) return "#d64545";
  if (swing >= warningAngle * 0.65) return "#f0b429";
  return "#25333f";
}

function drawMeters() {
  const barX = 34;
  const barY = H - 54;
  const barW = W - 68;
  const progress = state.distance / goalDistance;
  const swing = Math.min(1, Math.abs(toDeg(state.angle)) / dangerAngle);

  ctx.fillStyle = "rgb(255 255 255 / 0.78)";
  ctx.fillRect(barX, barY - 38, barW, 16);
  ctx.fillStyle = "#159a9c";
  ctx.fillRect(barX, barY - 38, barW * progress, 16);
  ctx.strokeStyle = "#25333f";
  ctx.strokeRect(barX, barY - 38, barW, 16);

  ctx.fillStyle = "rgb(255 255 255 / 0.78)";
  ctx.fillRect(barX, barY, barW, 16);
  ctx.fillStyle = swingColor();
  ctx.fillRect(barX, barY, barW * swing, 16);
  ctx.strokeStyle = "#25333f";
  ctx.strokeRect(barX, barY, barW, 16);

  ctx.fillStyle = "#17212b";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText(`Mode: ${readInputMode().toUpperCase()}  Speed: ${Math.round(state.speed)}`, barX, barY - 48);
  ctx.fillText("Swing limit", barX, barY - 7);
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

function drawResult() {
  ctx.fillStyle = "rgb(23 33 43 / 0.76)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "800 40px system-ui, sans-serif";
  ctx.fillText(state.message, W / 2, H / 2 - 28);
  ctx.font = "700 18px system-ui, sans-serif";
  const detail = state.result === "cleared"
    ? "Smooth notch work."
    : "Too much swing.";
  ctx.fillText(detail, W / 2, H / 2 + 10);
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillText("Tap Restart to try again", W / 2, H / 2 + 42);
  ctx.textAlign = "left";
}

function bindHold(button, mode) {
  button.addEventListener("pointerdown", () => setMode(`${mode}-hold`));
  button.addEventListener("pointerup", () => setMode("coast"));
  button.addEventListener("pointerleave", () => setMode("coast"));
  button.addEventListener("pointercancel", () => setMode("coast"));
  button.addEventListener("click", () => setMode(mode));
}

bindHold(notchBtn, "notch");
bindHold(brakeBtn, "brake");
coastBtn.addEventListener("click", () => setMode("coast"));
restartBtn.addEventListener("click", reset);

window.addEventListener("keydown", (event) => {
  if ([" ", "ArrowRight", "ArrowDown"].includes(event.key)) event.preventDefault();
  state.keys.add(event.key);
});
window.addEventListener("keyup", (event) => state.keys.delete(event.key));

reset();
requestAnimationFrame(step);
