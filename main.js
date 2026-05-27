const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const distanceEl = document.querySelector("#distance");
const swingEl = document.querySelector("#swing");
const restartBtn = document.querySelector("#restart");
const leftBtn = document.querySelector("#left");
const rightBtn = document.querySelector("#right");
const upBtn = document.querySelector("#up");
const downBtn = document.querySelector("#down");

const W = canvas.width;
const H = canvas.height;
const railY = 96;
const groundY = H - 86;
const minRopeLength = 104;
const maxRopeLength = 176;
const goalDistance = 520;
const dangerAngle = 34;
const warningAngle = 24;

const state = {
  distance: 0,
  speed: 0,
  accel: 0,
  ropeLength: 142,
  angle: 0,
  angularVelocity: 0,
  result: "running",
  message: "",
  last: performance.now(),
  keys: new Set(),
  buttons: new Set(),
  beamX: 0,
  beamY: 0,
  beamVx: 0,
  beamVy: 0,
  beamRotation: 0,
  beamSpin: 0,
};

function reset() {
  state.distance = 0;
  state.speed = 0;
  state.accel = 0;
  state.ropeLength = 142;
  state.angle = 0.08;
  state.angularVelocity = 0;
  state.result = "running";
  state.message = "";
  state.last = performance.now();
  state.beamX = 0;
  state.beamY = 0;
  state.beamVx = 0;
  state.beamVy = 0;
  state.beamRotation = 0;
  state.beamSpin = 0;
  updateHud();
}

function updateHud() {
  distanceEl.textContent = Math.floor(state.distance);
  swingEl.textContent = Math.round(Math.abs(toDeg(state.angle)));
}

function toDeg(rad) {
  return rad * 180 / Math.PI;
}

function readInput() {
  const right = state.keys.has("ArrowRight") || state.keys.has("d") || state.buttons.has("right");
  const left = state.keys.has("ArrowLeft") || state.keys.has("a") || state.buttons.has("left");
  const up = state.keys.has("ArrowUp") || state.keys.has("w") || state.buttons.has("up");
  const down = state.keys.has("ArrowDown") || state.keys.has("s") || state.buttons.has("down");
  return {
    x: Number(right) - Number(left),
    y: Number(down) - Number(up),
    label: right ? "RIGHT" : left ? "LEFT" : up ? "UP" : down ? "DOWN" : "COAST",
  };
}

function step(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;

  if (state.result === "running") {
    updatePhysics(dt);
  } else if (state.result === "dropped") {
    state.beamVy += 840 * dt;
    state.beamX += state.beamVx * dt;
    state.beamY += state.beamVy * dt;
    state.beamRotation += state.beamSpin * dt;
  }

  draw();
  updateHud();
  requestAnimationFrame(step);
}

function updatePhysics(dt) {
  const input = readInput();
  const targetAccel = input.x !== 0 ? input.x * 88 : state.speed === 0 ? 0 : -Math.sign(state.speed) * 22;
  state.accel += (targetAccel - state.accel) * Math.min(1, dt * 9);

  state.speed = Math.max(-58, Math.min(132, state.speed + state.accel * dt));
  if (input.x === 0 && Math.abs(state.speed) < 2) state.speed = 0;
  state.distance = Math.max(0, Math.min(goalDistance, state.distance + state.speed * dt));

  state.ropeLength = Math.max(minRopeLength, Math.min(maxRopeLength, state.ropeLength + input.y * 74 * dt));

  const gravity = 9.8;
  const lengthMeters = state.ropeLength / 58;
  const trolleyAccel = state.accel / 20;
  const pendulumForce = -(gravity / lengthMeters) * Math.sin(state.angle) - (trolleyAccel / lengthMeters) * Math.cos(state.angle);
  state.angularVelocity += pendulumForce * dt;
  state.angularVelocity *= 0.998;
  state.angle += state.angularVelocity * dt;

  if (Math.abs(toDeg(state.angle)) >= dangerAngle) {
    state.result = "dropped";
    state.message = "Steel flew off!";
    const load = loadPosition();
    state.beamX = load.x;
    state.beamY = load.y;
    state.beamVx = state.speed * 1.5 + Math.sign(state.angle || 1) * 190;
    state.beamVy = -260;
    state.beamRotation = state.angle * 1.2;
    state.beamSpin = Math.sign(state.angle || 1) * 5.2;
  } else if (state.distance >= goalDistance) {
    state.result = "cleared";
    state.message = "Goal!";
    state.distance = goalDistance;
  }
}

function craneX() {
  return 74 + (state.distance / goalDistance) * (W - 148);
}

function loadPosition() {
  const x = craneX() + Math.sin(state.angle) * state.ropeLength;
  const y = railY + 34 + Math.cos(state.angle) * state.ropeLength;
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
  const load = loadPosition();

  ctx.fillStyle = "#ef5d43";
  ctx.fillRect(x - 31, railY - 36, 62, 32);
  ctx.fillStyle = "#25333f";
  ctx.fillRect(x - 20, railY - 7, 40, 16);
  drawOperatorCat(x, railY - 52);

  ctx.strokeStyle = swingColor();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, hookY);
  ctx.lineTo(load.x, load.y);
  ctx.stroke();

  if (state.result === "dropped") {
    drawSteelBeam(state.beamX, state.beamY, state.beamRotation);
  } else {
    drawSteelBeam(load.x, load.y, state.angle * 0.55);
  }

  ctx.fillStyle = "#25333f";
  ctx.beginPath();
  ctx.arc(x, hookY, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawOperatorCat(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#f7a65a";
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-13, -10);
  ctx.lineTo(-7, -27);
  ctx.lineTo(-2, -11);
  ctx.moveTo(13, -10);
  ctx.lineTo(7, -27);
  ctx.lineTo(2, -11);
  ctx.fill();

  ctx.fillStyle = "#f0b429";
  ctx.beginPath();
  ctx.arc(0, -6, 19, Math.PI, Math.PI * 2);
  ctx.lineTo(19, -6);
  ctx.lineTo(-19, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-21, -7, 42, 6);

  ctx.strokeStyle = "#9b6b00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-9, -23);
  ctx.lineTo(-9, -8);
  ctx.moveTo(0, -25);
  ctx.lineTo(0, -8);
  ctx.moveTo(9, -23);
  ctx.lineTo(9, -8);
  ctx.stroke();

  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.arc(-6, -1, 2.6, 0, Math.PI * 2);
  ctx.arc(6, -1, 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.lineTo(0, 8);
  ctx.moveTo(-6, 8);
  ctx.quadraticCurveTo(0, 13, 6, 8);
  ctx.stroke();

  ctx.restore();
}

function drawSteelBeam(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = "#6f7f89";
  ctx.fillRect(-44, -9, 88, 18);
  ctx.fillStyle = "#43525c";
  ctx.fillRect(-49, -18, 98, 8);
  ctx.fillRect(-49, 10, 98, 8);

  ctx.strokeStyle = "rgb(255 255 255 / 0.46)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-38, -4);
  ctx.lineTo(38, -4);
  ctx.moveTo(-38, 4);
  ctx.lineTo(38, 4);
  ctx.stroke();

  ctx.restore();
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
  ctx.fillText(`Input: ${readInput().label}  Speed: ${Math.round(state.speed)}`, barX, barY - 48);
  ctx.fillText("Swing limit", barX, barY - 7);
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
    ? "Smooth crane work."
    : "Too much swing.";
  ctx.fillText(detail, W / 2, H / 2 + 10);
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillText("Tap Restart to try again", W / 2, H / 2 + 42);
  ctx.textAlign = "left";
}

function bindDirection(button, direction) {
  const start = (event) => {
    event.preventDefault();
    if (state.result === "running") state.buttons.add(direction);
  };
  const stop = () => {
    state.buttons.delete(direction);
  };
  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("lostpointercapture", stop);
}

bindDirection(leftBtn, "left");
bindDirection(rightBtn, "right");
bindDirection(upBtn, "up");
bindDirection(downBtn, "down");
restartBtn.addEventListener("click", reset);

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
  state.keys.add(event.key);
});
window.addEventListener("keyup", (event) => state.keys.delete(event.key));

reset();
requestAnimationFrame(step);
