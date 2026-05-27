const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const distanceEl = document.querySelector("#distance");
const swingEl = document.querySelector("#swing");
const restartBtn = document.querySelector("#restart");
const leftBtn = document.querySelector("#left");
const rightBtn = document.querySelector("#right");
const upBtn = document.querySelector("#up");
const downBtn = document.querySelector("#down");
const shell = document.querySelector(".game-shell");
const startScreen = document.querySelector("#start-screen");
const stageScreen = document.querySelector("#stage-screen");
const tutorialScreen = document.querySelector("#tutorial-screen");
const tutorialButton = document.querySelector("#tutorial-button");
const stageButton = document.querySelector("#stage-button");
const stageBackButton = document.querySelector("#stage-back");
const stageGrid = document.querySelector("#stage-grid");
const storyTitle = document.querySelector("#story-title");
const storyText = document.querySelector("#story-text");
const storyVisual = document.querySelector("#story-visual");
const storyNextButton = document.querySelector("#story-next");
const demoLabel = document.querySelector("#demo-label");
const beamCatSprite = new Image();
beamCatSprite.src = "assets/cat-beam-anime.png";

const W = canvas.width;
const H = canvas.height;
const railY = 96;
const groundY = H - 86;
const minRopeLength = 104;
const maxRopeLength = 176;
const goalDistance = 2200;
const cameraLead = 120;
const visibleWorld = W - 148;
const dangerAngle = 34;
const warningAngle = 24;
const tutorialScenes = [
  {
    title: "シーン 1",
    text: "クレーンを動かすと揺れます",
    sceneClass: "scene-1",
    accent: "ゆらっ",
  },
  {
    title: "シーン 2",
    text: "揺れているクレーンを最適なタイミングで動かすと揺れを打ち消せる！！",
    sceneClass: "scene-2",
    accent: "ここ！",
  },
  {
    title: "シーン 3",
    text: "動かして、止めて、動かすと揺れずに動けるぞ！\nこれが追いノッチ運転！！",
    sceneClass: "scene-3",
    accent: "ヨシ！",
  },
];

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

let appScreen = "start";
let storyIndex = 0;
let demoTime = 0;
let demoInput = { x: 0, y: 0, label: "COAST" };

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
  state.keys.clear();
  state.buttons.clear();
  updateHud();
}

function updateHud() {
  distanceEl.textContent = Math.floor(state.distance / 4);
  swingEl.textContent = Math.round(Math.abs(toDeg(state.angle)));
}

function toDeg(rad) {
  return rad * 180 / Math.PI;
}

function readInput() {
  if (appScreen === "demo") return demoInput;
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

  if (appScreen === "demo") {
    updateDemo(dt);
  } else if (appScreen === "game" && state.result === "running") {
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

function updatePhysics(dt, input = readInput(), allowEnd = true) {
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

  if (!allowEnd) return;

  if (Math.abs(toDeg(state.angle)) >= dangerAngle) {
    state.result = "dropped";
    state.message = "Thrown off!";
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

function updateDemo(dt) {
  demoTime += dt;
  const phase = demoTime % 3.2;
  if (phase < 0.7 || (phase > 1.45 && phase < 2.05)) {
    demoInput = { x: 1, y: 0, label: "RIGHT" };
  } else {
    demoInput = { x: 0, y: 0, label: "COAST" };
  }
  updatePhysics(dt, demoInput, false);
  if (demoTime > 8.8) {
    showStageSelect();
  }
}

function craneX() {
  return worldToScreen(state.distance);
}

function cameraX() {
  return Math.max(0, Math.min(goalDistance - visibleWorld, state.distance - cameraLead));
}

function worldToScreen(worldX) {
  return worldX - cameraX() + 74;
}

function parallaxToScreen(worldX, factor) {
  return worldX - cameraX() * factor + 74;
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

  drawIndustrialBackground();

  ctx.fillStyle = "#f2c968";
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = "#d9b053";
  const groundOffset = -((cameraX() * 0.85) % 42);
  for (let x = groundOffset - 42; x < W + 42; x += 42) {
    ctx.fillRect(x, groundY + 28, 24, 7);
  }

  ctx.fillStyle = "rgb(255 255 255 / 0.58)";
  ctx.beginPath();
  const cloudX = parallaxToScreen(20, 0.18);
  ctx.arc(cloudX, 178, 30, 0, Math.PI * 2);
  ctx.arc(cloudX + 35, 176, 24, 0, Math.PI * 2);
  ctx.arc(cloudX + 62, 184, 28, 0, Math.PI * 2);
  ctx.fill();
}

function drawIndustrialBackground() {
  drawDistantTowers();
  drawFactoryBlock(180, 0.32, "#7f98a5");
  drawFactoryBlock(820, 0.32, "#6f8794");
  drawPortCranes();
  drawStorageTanks();
}

function drawDistantTowers() {
  ctx.strokeStyle = "rgb(65 88 100 / 0.38)";
  ctx.lineWidth = 3;
  for (let worldX = -120; worldX < goalDistance + 500; worldX += 360) {
    const x = parallaxToScreen(worldX, 0.18);
    const base = groundY - 84;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x + 24, base - 122);
    ctx.lineTo(x + 48, base);
    ctx.moveTo(x + 10, base - 32);
    ctx.lineTo(x + 38, base - 32);
    ctx.moveTo(x + 16, base - 68);
    ctx.lineTo(x + 32, base - 68);
    ctx.moveTo(x + 24, base - 122);
    ctx.lineTo(x + 24, base - 148);
    ctx.stroke();
  }
}

function drawFactoryBlock(worldX, factor, color) {
  const x = parallaxToScreen(worldX, factor);
  const y = groundY - 132;
  ctx.fillStyle = `${color}99`;
  ctx.fillRect(x, y + 62, 190, 70);
  ctx.fillRect(x + 28, y + 36, 58, 96);
  ctx.fillRect(x + 128, y + 16, 22, 116);
  ctx.fillRect(x + 160, y - 4, 18, 136);

  ctx.fillStyle = "rgb(245 251 255 / 0.48)";
  ctx.beginPath();
  ctx.arc(x + 171, y - 18, 14, 0, Math.PI * 2);
  ctx.arc(x + 190, y - 24, 18, 0, Math.PI * 2);
  ctx.arc(x + 213, y - 20, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgb(255 255 255 / 0.48)";
  for (let wx = x + 16; wx < x + 178; wx += 28) {
    ctx.fillRect(wx, y + 82, 11, 10);
  }
}

function drawPortCranes() {
  ctx.strokeStyle = "rgb(48 69 80 / 0.5)";
  ctx.lineWidth = 5;
  for (let worldX = 520; worldX < goalDistance + 700; worldX += 690) {
    const x = parallaxToScreen(worldX, 0.45);
    const y = groundY - 132;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 34, y);
    ctx.lineTo(x + 126, y - 26);
    ctx.moveTo(x + 34, y);
    ctx.lineTo(x + 34, groundY);
    ctx.moveTo(x + 94, y - 17);
    ctx.lineTo(x + 94, y + 34);
    ctx.stroke();
    ctx.fillStyle = "rgb(48 69 80 / 0.48)";
    ctx.fillRect(x + 84, y + 34, 20, 14);
  }
}

function drawStorageTanks() {
  ctx.fillStyle = "rgb(92 112 122 / 0.55)";
  for (let worldX = 330; worldX < goalDistance + 500; worldX += 560) {
    const x = parallaxToScreen(worldX, 0.38);
    const y = groundY - 62;
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 34, y, 68, 44);
    ctx.beginPath();
    ctx.ellipse(x, y + 44, 34, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTrack() {
  ctx.fillStyle = "#314a59";
  const railStart = worldToScreen(-80);
  const railEnd = worldToScreen(goalDistance + 120);
  ctx.fillRect(railStart, railY - 20, railEnd - railStart, 14);

  for (let worldX = 0; worldX <= goalDistance + 80; worldX += 320) {
    const x = worldToScreen(worldX);
    ctx.fillRect(x - 6, railY - 20, 12, groundY - railY + 8);
  }

  const goalX = worldToScreen(goalDistance);
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

function drawBeamCat() {
  ctx.save();
  ctx.translate(2, -48);

  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-8, -3);
  ctx.lineTo(-20, 12);
  ctx.moveTo(7, -1);
  ctx.lineTo(18, 15);
  ctx.moveTo(-8, -22);
  ctx.lineTo(-29, -28);
  ctx.moveTo(9, -22);
  ctx.lineTo(34, -35);
  ctx.stroke();

  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.arc(36, -36, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2f6fcb";
  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-12, -24, 24, 29, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f7a65a";
  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -43, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f7a65a";
  ctx.beginPath();
  ctx.moveTo(-12, -53);
  ctx.lineTo(-7, -70);
  ctx.lineTo(-1, -54);
  ctx.moveTo(12, -53);
  ctx.lineTo(7, -70);
  ctx.lineTo(1, -54);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f0b429";
  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -49, 18, Math.PI, Math.PI * 2);
  ctx.lineTo(18, -49);
  ctx.lineTo(-18, -49);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(-22, -51, 44, 6);
  ctx.strokeRect(-22, -51, 44, 6);

  ctx.strokeStyle = "#9b6b00";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-8, -64);
  ctx.lineTo(-8, -50);
  ctx.moveTo(0, -67);
  ctx.lineTo(0, -50);
  ctx.moveTo(8, -64);
  ctx.lineTo(8, -50);
  ctx.stroke();

  ctx.fillStyle = "#101820";
  ctx.beginPath();
  ctx.ellipse(-6, -43, 2.8, 3.8, 0, 0, Math.PI * 2);
  ctx.ellipse(6, -43, 2.8, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-7, -44.5, 0.9, 0, Math.PI * 2);
  ctx.arc(5, -44.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(0, -34);
  ctx.moveTo(-6, -33);
  ctx.quadraticCurveTo(0, -28, 7, -34);
  ctx.stroke();

  ctx.strokeStyle = "#f7a65a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-13, -41);
  ctx.lineTo(-25, -45);
  ctx.moveTo(13, -41);
  ctx.lineTo(25, -45);
  ctx.stroke();

  ctx.fillStyle = "#101820";
  ctx.fillRect(-24, 10, 11, 5);
  ctx.save();
  ctx.translate(18, 15);
  ctx.rotate(-0.18);
  ctx.fillRect(-2, -2, 15, 5);
  ctx.restore();

  ctx.restore();
}

function drawSteelBeam(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (beamCatSprite.complete && beamCatSprite.naturalWidth > 0) {
    const width = 112;
    const scale = width / beamCatSprite.naturalWidth;
    const height = beamCatSprite.naturalHeight * scale;
    const hookAnchorX = 166 * scale;
    const hookAnchorY = 9 * scale;
    ctx.drawImage(beamCatSprite, -hookAnchorX, -hookAnchorY, width, height);
    ctx.restore();
    return;
  }

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

  drawBeamCat();

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

function setScreen(nextScreen) {
  appScreen = nextScreen;
  startScreen.classList.toggle("hidden", nextScreen !== "start");
  stageScreen.classList.toggle("hidden", nextScreen !== "stage");
  tutorialScreen.classList.toggle("hidden", nextScreen !== "tutorial");
  demoLabel.classList.toggle("hidden", nextScreen !== "demo");
  shell.classList.toggle("menu-mode", ["start", "stage", "tutorial"].includes(nextScreen));
  shell.classList.toggle("demo-mode", nextScreen === "demo");
  shell.classList.toggle("play-mode", nextScreen === "game");
}

function showTitle() {
  setScreen("start");
}

function showStageSelect() {
  setScreen("stage");
}

function startGame() {
  reset();
  setScreen("game");
}

function startTutorial() {
  storyIndex = 0;
  renderStory();
  setScreen("tutorial");
}

function renderStory() {
  const scene = tutorialScenes[storyIndex];
  storyTitle.textContent = scene.title;
  storyText.textContent = scene.text;
  storyVisual.className = `story-visual ${scene.sceneClass}`;
  storyVisual.innerHTML = `<span class="rope"></span><span class="beam"></span><span class="pulse">${scene.accent}</span>`;
  storyNextButton.textContent = storyIndex === tutorialScenes.length - 1 ? "見本を見る" : "次へ";
}

function startDemo() {
  reset();
  demoTime = 0;
  demoInput = { x: 0, y: 0, label: "COAST" };
  setScreen("demo");
}

function buildStageGrid() {
  stageGrid.innerHTML = "";
  for (let i = 1; i <= 20; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `ステージ${i}`;
    if (i === 1) {
      button.addEventListener("click", startGame);
    } else {
      button.disabled = true;
    }
    stageGrid.append(button);
  }
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
restartBtn.addEventListener("click", startGame);
tutorialButton.addEventListener("click", startTutorial);
stageButton.addEventListener("click", showStageSelect);
stageBackButton.addEventListener("click", showTitle);
storyNextButton.addEventListener("click", () => {
  storyIndex += 1;
  if (storyIndex >= tutorialScenes.length) {
    startDemo();
  } else {
    renderStory();
  }
});

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
  state.keys.add(event.key);
});
window.addEventListener("keyup", (event) => state.keys.delete(event.key));

buildStageGrid();
reset();
setScreen("start");
requestAnimationFrame(step);
