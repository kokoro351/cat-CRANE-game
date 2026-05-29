const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const distanceEl = document.querySelector("#distance");
const swingEl = document.querySelector("#swing");
const restartBtn = document.querySelector("#restart");
const stageMenuBtn = document.querySelector("#stage-menu");
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
const hardModeButton = document.querySelector("#hard-mode-button");
const stageBackButton = document.querySelector("#stage-back");
const stageGrid = document.querySelector("#stage-grid");
const endingButton = document.querySelector("#ending-button");
const unlockStatus = document.querySelector("#unlock-status");
const storyTitle = document.querySelector("#story-title");
const storyText = document.querySelector("#story-text");
const storyVisual = document.querySelector("#story-visual");
const storyNextButton = document.querySelector("#story-next");
const demoLabel = document.querySelector("#demo-label");
const buttonCue = document.querySelector("#button-cue");
const resultPanel = document.querySelector("#result-panel");
const resultTitle = document.querySelector("#result-title");
const resultText = document.querySelector("#result-text");
const resultRestartBtn = document.querySelector("#result-restart");
const resultStageBtn = document.querySelector("#result-stage");
const resultAutoBtn = document.querySelector("#result-auto");
const beamCatSprite = new Image();
beamCatSprite.src = "assets/cat-beam-anime.png";

const W = canvas.width;
const H = canvas.height;
const railY = 96;
const groundY = H - 86;
const minRopeLength = 56;
const maxRopeLength = 320;
let goalDistance = 2200;
const cameraLead = 120;
const visibleWorld = W - 148;
const dangerAngle = 34;
const warningAngle = 24;
const clearedStagesKey = "catCrane.clearedStages";
const clearedHardStagesKey = "catCrane.hardClearedStages";
const hardModePurchasedKey = "catCrane.hardModePurchased";
const beamSpriteWidth = 96;
const loadHitbox = { left: -40, right: 40, top: 16, bottom: 132 };
const obstacleHeightScale = 0.72;
const gateGapBonus = 78;
const pendulumReturnScale = 0.70;
const driveAccelPower = 110;
const driveAccelResponse = 24;
const driveCoastBrake = 16;
const maxForwardSpeed = 112;
const trolleyAccelDivisor = 40;
const stages = [
  { name: "ステージ1", distance: 1500, obstacles: [], gates: [] },
  {
    name: "ステージ2",
    distance: 1700,
    obstacles: [
      { x: 610, y: 222, w: 104, h: 38 },
      { x: 1060, y: 424, w: 112, h: 38 },
      { x: 1430, y: 230, w: 104, h: 40 },
    ],
    gates: [],
  },
  {
    name: "ステージ3",
    distance: 1550,
    obstacles: [],
    gates: [],
    swingGates: [
      { x: 640, w: 46, limit: 24 },
      { x: 1180, w: 46, limit: 22 },
    ],
  },
  {
    name: "ステージ4",
    distance: 1750,
    obstacles: [],
    gates: [
      { x: 700, w: 34, gapY: 354, gap: 214, phase: 0, speed: 1.1 },
      { x: 1340, w: 34, gapY: 318, gap: 206, phase: 1.35, speed: 1.15 },
    ],
  },
  {
    name: "ステージ5",
    distance: 1750,
    windCenter: -0.08,
    obstacles: [],
    gates: [
      { x: 1120, w: 34, gapY: 350, gap: 226, phase: 0.9, speed: 1.05 },
    ],
    swingGates: [{ x: 1460, w: 46, limit: 26 }],
  },
  {
    name: "ステージ6",
    distance: 2050,
    obstacles: [
      { x: 520, y: 250, w: 118, h: 44 },
      { x: 1140, y: 400, w: 118, h: 44 },
    ],
    gates: [{ x: 1640, w: 40, gapY: 338, gap: 168, phase: 0, speed: 0, switchId: "tank1" }],
    switches: [
      { id: "tank1", x: 850, y: 374, w: 126, h: 104 },
    ],
  },
  {
    name: "ステージ7",
    distance: 1850,
    obstacles: [{ x: 1260, y: 420, w: 130, h: 40 }],
    gates: [{ x: 760, w: 34, gapY: 334, gap: 226, phase: 0.6, speed: 0.95 }],
    projectiles: [{ kind: "wrench", y: 500, speed: 104, interval: 3.7, phase: 0.7 }],
  },
  {
    name: "ステージ8",
    distance: 2200,
    obstacles: [],
    gates: [],
    machines: [
      { kind: "excavator", startX: 1500, y: 150, w: 330, h: 388, triggerX: 620, leftX: 1040, exitX: 2840, leftSpeed: 48, rightSpeed: 185 },
    ],
  },
  {
    name: "ステージ9",
    distance: 2200,
    obstacles: [{ x: 1080, y: 220, w: 126, h: 36 }],
    gates: [{ x: 1700, w: 34, gapY: 352, gap: 222, phase: 0.7, speed: 1.1 }],
    machines: [
      { kind: "forklift", startX: -1040, y: 150, w: 330, h: 388, speed: 36, maxX: 2920 },
    ],
  },
  {
    name: "ステージ10",
    distance: 2150,
    windCenter: 0.05,
    obstacles: [
      { x: 760, y: 424, w: 122, h: 40 },
      { x: 1480, y: 232, w: 118, h: 40 },
    ],
    gates: [
      { x: 1120, w: 36, gapY: 344, gap: 224, phase: 0.4, speed: 1.0 },
      { x: 1840, w: 36, gapY: 326, gap: 218, phase: 1.6, speed: 1.05 },
    ],
    swingGates: [{ x: 2020, w: 48, limit: 24 }],
  },
  {
    name: "ステージ11",
    distance: 2700,
    windCenter: 0.07,
    obstacles: [
      { x: 520, y: 420, w: 180, h: 48 },
      { x: 920, y: 218, w: 150, h: 48 },
      { x: 1320, y: 420, w: 180, h: 48 },
      { x: 1780, y: 218, w: 150, h: 48 },
      { x: 2320, y: 340, w: 170, h: 48 },
    ],
    gates: [],
  },
  {
    name: "ステージ12",
    distance: 2900,
    obstacles: [
      { x: 790, y: 262, w: 140, h: 42 },
      { x: 1900, y: 420, w: 150, h: 44 },
    ],
    gates: [
      { x: 520, w: 34, gapY: 355, gap: 132, phase: 0.3, speed: 2.6 },
      { x: 1260, w: 34, gapY: 320, gap: 124, phase: 2.2, speed: 2.6 },
      { x: 2500, w: 34, gapY: 350, gap: 124, phase: 1.2, speed: 2.5 },
    ],
    projectiles: [{ kind: "wrench", y: 372, speed: 175, interval: 3.3, phase: 0.7 }],
  },
  {
    name: "ステージ13",
    distance: 3050,
    obstacles: [
      { x: 530, y: 244, w: 130, h: 46 },
      { x: 830, y: 390, w: 130, h: 46 },
      { x: 1130, y: 244, w: 130, h: 46 },
      { x: 1430, y: 390, w: 130, h: 46 },
      { x: 1730, y: 244, w: 130, h: 46 },
      { x: 2030, y: 390, w: 130, h: 46 },
    ],
    gates: [{ x: 2650, w: 34, gapY: 334, gap: 126, phase: 0.6, speed: 2.7 }],
  },
  {
    name: "ステージ14",
    distance: 2850,
    obstacles: [
      { x: 690, y: 300, w: 110, h: 160 },
      { x: 1550, y: 210, w: 110, h: 160 },
      { x: 2360, y: 348, w: 110, h: 160 },
    ],
    gates: [
      { x: 1030, w: 36, gapY: 355, gap: 120, phase: 1.4, speed: 2.8 },
      { x: 1980, w: 36, gapY: 320, gap: 120, phase: 2.7, speed: 2.8 },
    ],
  },
  {
    name: "ステージ15",
    distance: 3100,
    windCenter: -0.08,
    obstacles: [
      { x: 500, y: 430, w: 150, h: 44 },
      { x: 820, y: 238, w: 150, h: 44 },
      { x: 1530, y: 430, w: 150, h: 44 },
      { x: 1880, y: 238, w: 150, h: 44 },
      { x: 2670, y: 332, w: 190, h: 44 },
    ],
    gates: [
      { x: 1180, w: 34, gapY: 342, gap: 120, phase: 0.4, speed: 2.9 },
      { x: 2250, w: 34, gapY: 356, gap: 120, phase: 2.0, speed: 3.0 },
    ],
  },
  {
    name: "ステージ16",
    distance: 3350,
    obstacles: [
      { x: 620, y: 252, w: 170, h: 46 },
      { x: 1260, y: 396, w: 170, h: 46 },
      { x: 2480, y: 252, w: 170, h: 46 },
    ],
    gates: [
      { x: 930, w: 36, gapY: 324, gap: 118, phase: 0.8, speed: 3.1 },
      { x: 1740, w: 36, gapY: 376, gap: 118, phase: 2.3, speed: 3.1 },
      { x: 3020, w: 36, gapY: 335, gap: 118, phase: 1.5, speed: 3.0 },
    ],
    projectiles: [{ kind: "saw", y: 268, speed: 190, interval: 2.8, phase: 0.4 }],
  },
  {
    name: "ステージ17",
    distance: 3050,
    obstacles: [
      { x: 500, y: 250, w: 125, h: 44 },
      { x: 770, y: 415, w: 125, h: 44 },
      { x: 1040, y: 250, w: 125, h: 44 },
      { x: 1310, y: 415, w: 125, h: 44 },
      { x: 2070, y: 250, w: 125, h: 44 },
      { x: 2340, y: 415, w: 125, h: 44 },
      { x: 2610, y: 250, w: 125, h: 44 },
    ],
    gates: [{ x: 1690, w: 34, gapY: 342, gap: 118, phase: 2.1, speed: 3.2 }],
  },
  {
    name: "ステージ18",
    distance: 3600,
    windCenter: 0.09,
    obstacles: [
      { x: 700, y: 214, w: 150, h: 50 },
      { x: 1500, y: 440, w: 160, h: 50 },
      { x: 2860, y: 214, w: 150, h: 50 },
    ],
    gates: [
      { x: 1020, w: 38, gapY: 336, gap: 112, phase: 0.2, speed: 3.3 },
      { x: 2040, w: 38, gapY: 360, gap: 112, phase: 1.7, speed: 3.4 },
      { x: 3300, w: 38, gapY: 330, gap: 112, phase: 2.8, speed: 3.3 },
    ],
  },
  {
    name: "ステージ19",
    distance: 3500,
    obstacles: [
      { x: 540, y: 388, w: 150, h: 46 },
      { x: 900, y: 236, w: 150, h: 46 },
      { x: 1260, y: 388, w: 150, h: 46 },
      { x: 2050, y: 236, w: 150, h: 46 },
      { x: 2410, y: 388, w: 150, h: 46 },
      { x: 2770, y: 236, w: 150, h: 46 },
    ],
    gates: [
      { x: 1640, w: 38, gapY: 346, gap: 112, phase: 1.0, speed: 3.5 },
      { x: 3210, w: 38, gapY: 346, gap: 112, phase: 2.4, speed: 3.5 },
    ],
  },
  {
    name: "ステージ20",
    distance: 4100,
    windCenter: -0.08,
    obstacles: [
      { x: 560, y: 230, w: 150, h: 46 },
      { x: 960, y: 420, w: 150, h: 46 },
      { x: 1390, y: 230, w: 150, h: 46 },
      { x: 2450, y: 420, w: 150, h: 46 },
      { x: 2870, y: 230, w: 150, h: 46 },
      { x: 3420, y: 340, w: 190, h: 46 },
    ],
    gates: [
      { x: 1780, w: 40, gapY: 330, gap: 108, phase: 0.4, speed: 3.6 },
      { x: 2180, w: 40, gapY: 370, gap: 108, phase: 2.0, speed: 3.6 },
      { x: 3830, w: 40, gapY: 348, gap: 108, phase: 1.2, speed: 3.7 },
    ],
    projectiles: [
      { kind: "saw", y: 250, speed: 205, interval: 2.7, phase: 0.6 },
      { kind: "wrench", y: 420, speed: 185, interval: 3.5, phase: 1.5 },
    ],
  },
];
stages.length = 10;
const hardStages = [
  {
    name: "ガチ1",
    label: "初期型",
    type: "carry",
    distance: 1450,
    noCat: true,
    ropeLength: 190,
    initialAngle: 0.16,
    physics: { returnScale: 0.46, accelPower: 132, accelResponse: 18, coastBrake: 10, maxSpeed: 118, accelDivisor: 30, damping: 0.9992 },
    dangerAngle: 25,
  },
  {
    name: "ガチ2",
    label: "軽量・揺れ止め",
    type: "dampen",
    noCat: true,
    ropeLength: 158,
    initialAngle: 0.34,
    initialAngularVelocity: -0.18,
    physics: { returnScale: 0.52, accelPower: 126, accelResponse: 22, coastBrake: 9, maxSpeed: 105, accelDivisor: 32, damping: 0.999 },
    successAngle: 3.8,
    successSpeed: 8,
    successHold: 1.2,
    dangerAngle: 28,
  },
  {
    name: "ガチ3",
    label: "重荷",
    type: "carry",
    distance: 1300,
    noCat: true,
    ropeLength: 178,
    initialAngle: 0.12,
    physics: { returnScale: 0.48, accelPower: 102, accelResponse: 16, coastBrake: 8, maxSpeed: 94, accelDivisor: 37, damping: 0.9991 },
    dangerAngle: 24,
  },
  {
    name: "ガチ4",
    label: "長尺・揺れ止め",
    type: "dampen",
    noCat: true,
    ropeLength: 250,
    initialAngle: -0.30,
    initialAngularVelocity: 0.11,
    physics: { returnScale: 0.42, accelPower: 122, accelResponse: 18, coastBrake: 8, maxSpeed: 104, accelDivisor: 34, damping: 0.99925 },
    successAngle: 3.4,
    successSpeed: 7,
    successHold: 1.4,
    dangerAngle: 25,
  },
  {
    name: "ガチ5",
    label: "短尺高速",
    type: "carry",
    distance: 1200,
    noCat: true,
    ropeLength: 124,
    initialAngle: 0.18,
    physics: { returnScale: 0.62, accelPower: 148, accelResponse: 24, coastBrake: 11, maxSpeed: 128, accelDivisor: 29, damping: 0.9989 },
    dangerAngle: 24,
  },
  {
    name: "ガチ6",
    label: "重荷・揺れ止め",
    type: "dampen",
    noCat: true,
    ropeLength: 198,
    initialAngle: 0.28,
    initialAngularVelocity: 0.16,
    physics: { returnScale: 0.45, accelPower: 96, accelResponse: 15, coastBrake: 7, maxSpeed: 88, accelDivisor: 40, damping: 0.99935 },
    successAngle: 3.2,
    successSpeed: 6,
    successHold: 1.5,
    dangerAngle: 24,
  },
  {
    name: "ガチ7",
    label: "長距離",
    type: "carry",
    distance: 1650,
    noCat: true,
    ropeLength: 220,
    initialAngle: -0.14,
    physics: { returnScale: 0.43, accelPower: 118, accelResponse: 17, coastBrake: 8, maxSpeed: 108, accelDivisor: 34, damping: 0.99925 },
    dangerAngle: 23,
  },
  {
    name: "ガチ8",
    label: "逆振れ始動",
    type: "dampen",
    noCat: true,
    ropeLength: 182,
    initialAngle: -0.32,
    initialAngularVelocity: -0.12,
    physics: { returnScale: 0.50, accelPower: 128, accelResponse: 20, coastBrake: 9, maxSpeed: 106, accelDivisor: 33, damping: 0.9991 },
    successAngle: 3.0,
    successSpeed: 6,
    successHold: 1.5,
    dangerAngle: 23,
  },
  {
    name: "ガチ9",
    label: "超重量",
    type: "carry",
    distance: 1400,
    noCat: true,
    ropeLength: 210,
    initialAngle: 0.15,
    physics: { returnScale: 0.40, accelPower: 84, accelResponse: 13, coastBrake: 6, maxSpeed: 78, accelDivisor: 44, damping: 0.9994 },
    dangerAngle: 22,
  },
  {
    name: "ガチ10",
    label: "最終揺れ止め",
    type: "dampen",
    noCat: true,
    ropeLength: 236,
    initialAngle: 0.36,
    initialAngularVelocity: -0.08,
    physics: { returnScale: 0.38, accelPower: 110, accelResponse: 16, coastBrake: 7, maxSpeed: 96, accelDivisor: 38, damping: 0.99935 },
    successAngle: 2.6,
    successSpeed: 5,
    successHold: 1.8,
    dangerAngle: 22,
  },
];
let currentStageIndex = 0;
let currentStage = stages[currentStageIndex];
let clearedStages = loadClearedStages();
let clearedHardStages = loadClearedStages(clearedHardStagesKey);
let stageMode = "normal";
let dampenHold = 0;
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
  stageTime: 0,
  keys: new Set(),
  buttons: new Set(),
  beamX: 0,
  beamY: 0,
  beamVx: 0,
  beamVy: 0,
  beamRotation: 0,
  beamSpin: 0,
  machines: [],
  switches: {},
};

let appScreen = "start";
let storyIndex = 0;
let demoTime = 0;
let demoInput = { x: 0, y: 0, label: "COAST" };
let stageDemoLabelKey = "";
let stageDemoLabelUntil = 0;
let stageDemoRecoveries = 0;
let stageDemoAutoClear = false;
let stageReplay = [];
let stageReplayProfile = null;
let stageReplayStatus = "empty";
let endingTime = 0;

function reset() {
  goalDistance = currentStage.distance || 900;
  state.distance = 0;
  state.speed = 0;
  state.accel = 0;
  state.ropeLength = currentStage.ropeLength || 142;
  state.angle = currentStage.initialAngle ?? 0.08;
  state.angularVelocity = currentStage.initialAngularVelocity || 0;
  state.result = "running";
  state.message = "";
  state.last = performance.now();
  state.stageTime = 0;
  state.beamX = 0;
  state.beamY = 0;
  state.beamVx = 0;
  state.beamVy = 0;
  state.beamRotation = 0;
  state.beamSpin = 0;
  state.machines = (currentStage.machines || []).map((machine) => ({
    ...machine,
    x: machine.startX,
    phase: machine.kind === "excavator" ? "waiting" : "chasing",
  }));
  state.switches = {};
  dampenHold = 0;
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
  if (appScreen === "demo" || appScreen === "stageDemo") return demoInput;
  const right = state.keys.has("ArrowRight") || state.keys.has("d") || state.buttons.has("right");
  const left = stageMode !== "hard" && (state.keys.has("ArrowLeft") || state.keys.has("a") || state.buttons.has("left"));
  const up = stageMode !== "hard" && (state.keys.has("ArrowUp") || state.keys.has("w") || state.buttons.has("up"));
  const down = stageMode !== "hard" && (state.keys.has("ArrowDown") || state.keys.has("s") || state.buttons.has("down"));
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
  } else if (appScreen === "ending") {
    updateEnding(dt);
  } else if (appScreen === "stageDemo") {
    const autoSteps = stageDemoAutoClear ? 2 : 1;
    for (let i = 0; i < autoSteps && appScreen === "stageDemo"; i += 1) {
      state.stageTime += dt;
      updateStageMachines(dt);
      updateStageClearDemo(dt);
    }
  } else if (appScreen === "game" && state.result === "running") {
    state.stageTime += dt;
    updateStageMachines(dt);
    updatePhysics(dt);
  } else if (appScreen === "game" && state.result === "dropped") {
    state.beamVy += 840 * dt;
    state.beamX += state.beamVx * dt;
    state.beamY += state.beamVy * dt;
    state.beamRotation += state.beamSpin * dt;
  }

  draw();
  updateHud();
  syncResultPanel();
  syncButtonStates();
  requestAnimationFrame(step);
}

function updatePhysics(dt, input = readInput(), allowEnd = true) {
  const windCenter = currentStage.windCenter || 0;
  const physics = currentStage.physics || {};
  const accelPower = physics.accelPower || driveAccelPower;
  const accelResponse = physics.accelResponse || driveAccelResponse;
  const coastBrake = physics.coastBrake || driveCoastBrake;
  const maxSpeed = physics.maxSpeed || maxForwardSpeed;
  const accelDivisor = physics.accelDivisor || trolleyAccelDivisor;
  const returnScale = physics.returnScale || pendulumReturnScale;
  const damping = physics.damping || 0.998;
  const stageDangerAngle = currentStage.dangerAngle || dangerAngle;
  const targetAccel = input.x !== 0 ? input.x * accelPower : state.speed === 0 ? 0 : -Math.sign(state.speed) * coastBrake;
  state.accel += (targetAccel - state.accel) * Math.min(1, dt * accelResponse);

  const previousSpeed = state.speed;
  state.speed = Math.max(-58, Math.min(maxSpeed, state.speed + state.accel * dt));
  if (input.x === 0 && Math.abs(state.speed) < 2) state.speed = 0;
  const actualTrolleyAccel = (state.speed - previousSpeed) / Math.max(dt, 0.0001);
  const windDrift = input.x === 0 && windCenter ? Math.sign(windCenter) * 10 : 0;
  state.distance = Math.max(0, Math.min(goalDistance, state.distance + (state.speed + windDrift) * dt));

  state.ropeLength = Math.max(minRopeLength, Math.min(maxRopeLength, state.ropeLength + input.y * 88 * dt));

  const gravity = 9.8;
  const lengthMeters = state.ropeLength / 58;
  const trolleyAccel = actualTrolleyAccel / accelDivisor;
  const pendulumForce = -(gravity * returnScale / lengthMeters) * Math.sin(state.angle - windCenter) - (trolleyAccel / lengthMeters) * Math.cos(state.angle);
  state.angularVelocity += pendulumForce * dt;
  state.angularVelocity *= damping;
  state.angle += state.angularVelocity * dt;

  if (!allowEnd) return;

  if (Math.abs(toDeg(state.angle)) >= stageDangerAngle) {
    state.result = "dropped";
    state.message = "Thrown off!";
    const load = loadPosition();
    throwLoad(load.x, load.y);
  } else if (hitStageHazard()) {
    state.result = "dropped";
    state.message = "Crash!";
    const load = loadPosition();
    throwLoad(load.x, load.y);
  } else if (state.distance >= goalDistance) {
    state.result = "cleared";
    state.message = "Goal!";
    state.distance = goalDistance;
    markCurrentStageCleared();
  } else if (currentStage.type === "dampen" && hasDampened(dt)) {
    state.result = "cleared";
    state.message = "Damped!";
    markCurrentStageCleared();
  }
}

function hasDampened(dt) {
  const swing = Math.abs(toDeg(state.angle));
  const speed = Math.abs(state.speed);
  const angular = Math.abs(toDeg(state.angularVelocity));
  const clear = swing <= (currentStage.successAngle || 3)
    && speed <= (currentStage.successSpeed || 6)
    && angular <= 9
    && state.stageTime > 1.2;
  dampenHold = clear ? dampenHold + dt : 0;
  return dampenHold >= (currentStage.successHold || 1.2);
}

function loadClearedStages(key = clearedStagesKey) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

function activeClearedStages() {
  return stageMode === "hard" ? clearedHardStages : clearedStages;
}

function activeClearedStagesKey() {
  return stageMode === "hard" ? clearedHardStagesKey : clearedStagesKey;
}

function markStageCleared(stageNumber) {
  const cleared = activeClearedStages();
  if (cleared.has(stageNumber)) return;
  cleared.add(stageNumber);
  localStorage.setItem(activeClearedStagesKey(), JSON.stringify([...cleared]));
}

function markCurrentStageCleared() {
  markStageCleared(currentStageIndex + 1);
}

function throwLoad(x, y) {
  state.beamX = x;
  state.beamY = y;
  state.beamVx = state.speed * 1.5 + Math.sign(state.angle || 1) * 190;
  state.beamVy = -260;
  state.beamRotation = state.angle * 1.2;
  state.beamSpin = Math.sign(state.angle || 1) * 5.2;
}

function updateStageMachines(dt) {
  state.machines.forEach((machine) => {
    if (machine.kind === "excavator") updateExcavator(machine, dt);
    if (machine.kind === "forklift") updateForklift(machine, dt);
  });
}

function updateExcavator(machine, dt) {
  if (machine.phase === "waiting" && state.distance > machine.triggerX) {
    machine.phase = "left";
  }
  if (machine.phase === "left") {
    machine.x = Math.max(machine.leftX, machine.x - machine.leftSpeed * dt);
    if (machine.x <= machine.leftX) machine.phase = "right";
  } else if (machine.phase === "right") {
    machine.x = Math.min(machine.exitX, machine.x + machine.rightSpeed * dt);
  }
}

function updateForklift(machine, dt) {
  machine.x = Math.min(machine.maxX, machine.x + machine.speed * dt);
}

function updateDemo(dt) {
  demoTime += dt;
  if (demoTime > 0.5 && demoTime < 0.92) {
    demoInput = { x: 1, y: 0, label: "RIGHT" };
  } else if (demoTime > 2.05 && demoTime < 8.4) {
    demoInput = { x: 1, y: 0, label: "RIGHT" };
  } else {
    demoInput = { x: 0, y: 0, label: "COAST" };
  }
  updatePhysics(dt, demoInput, false);
  if (demoTime > 2.16) {
    const angleDamping = demoTime < 3.35 ? 4.8 : 1.35;
    const velocityDamping = demoTime < 3.35 ? 7.2 : 2.1;
    state.angle *= Math.max(0, 1 - dt * angleDamping);
    state.angularVelocity *= Math.max(0, 1 - dt * velocityDamping);
  }
  if (demoTime > 8.9) {
    showStageSelect();
  }
}

function updateStageClearDemo(dt) {
  if (stageReplayStatus === "failed" || state.result === "dropped") {
    if (stageDemoAutoClear && demoTime > 4) {
      markStageCleared(currentStageIndex + 1);
      showStageSelect();
      return;
    }
    demoTime += dt;
    updateStageDemoLabel("FAILED", true);
    return;
  }
  demoInput = stageReplayProfile ? referenceReplayInput(stageReplayProfile) : replayInputAt(demoTime);
  updateStageDemoLabel(demoInput.label);
  updatePhysics(dt, demoInput, true);
  demoTime += dt;

  if (state.result === "cleared") {
    if (stageDemoAutoClear) markStageCleared(currentStageIndex + 1);
    state.speed = 0;
    demoInput = { x: 0, y: 0, label: "COAST" };
    showStageSelect();
  } else if (state.result === "dropped") {
    updateStageDemoLabel("FAILED", true);
  }
}

function buildStageReplay() {
  const saved = snapshotRunState();
  const previousScreen = appScreen;
  const profiles = replayProfilesForStage();
  const excavatorProfile = profiles.find((profile) => profile.excavator);

  if (excavatorProfile) {
    restoreRunState(saved);
    appScreen = previousScreen;
    stageReplayStatus = "ready";
    stageReplayProfile = { ...excavatorProfile };
    return [{ t: 0, x: 0, y: 0, label: "COAST" }];
  }

  for (const profile of profiles) {
    reset();
    appScreen = "stageDemo";
    demoTime = 0;
    stageDemoRecoveries = 0;
    const result = simulateReplayProfile(profile);
    if (result.success) {
      restoreRunState(saved);
      appScreen = previousScreen;
      stageReplayStatus = "ready";
      stageReplayProfile = { ...profile };
      return result.replay;
    }
  }

  restoreRunState(saved);
  appScreen = previousScreen;
  stageReplayStatus = "failed";
  stageReplayProfile = null;
  return [{ t: 0, x: 0, y: 0, label: "COAST" }];
}

function simulateReplayProfile(profile) {
  const dt = 1 / 30;
  const replay = [];
  let lastKey = "";

  for (let t = 0; t < profile.maxTime; t += dt) {
    state.stageTime += dt;
    updateStageMachines(dt);
    const input = referenceReplayInput(profile);
    const key = `${input.x},${input.y},${input.label}`;
    if (key !== lastKey) {
      replay.push({ t: Number(t.toFixed(2)), ...input });
      lastKey = key;
    }

    updatePhysics(dt, input, false);
    if (Math.abs(toDeg(state.angle)) >= dangerAngle || hitStageHazard()) {
      return { success: false, replay };
    }
    if (state.distance >= goalDistance) {
      replay.push({ t: Number((t + dt).toFixed(2)), x: 0, y: 0, label: "COAST" });
      return { success: true, replay };
    }
  }
  return { success: false, replay };
}

function replayProfilesForStage() {
  const base = [
    { speed: 82, lookAhead: 300, heightTolerance: 30, gateMargin: 48, maxTime: 90, notchStyle: "tapHold", tapStart: 0.45, tapEnd: 0.86, holdStart: 1.72, holdUntil: 5.7 },
    { speed: 68, lookAhead: 340, heightTolerance: 26, gateMargin: 58, maxTime: 110, notchStyle: "tapHold", tapStart: 0.45, tapEnd: 0.84, holdStart: 1.82, holdUntil: 5.4 },
    { speed: 30, lookAhead: 300, heightTolerance: 28, gateMargin: 42, maxTime: 180, notch: true, notchAngle: -0.08, notchVelocity: -0.18, startDelay: 1.2 },
    { speed: 24, lookAhead: 360, heightTolerance: 24, gateMargin: 54, maxTime: 220, notch: true, notchAngle: -0.12, notchVelocity: -0.28, startDelay: 1.8 },
    { speed: 18, lookAhead: 260, heightTolerance: 18, gateMargin: 70, maxTime: 280, notch: true, notchAngle: -0.10, notchVelocity: -0.24, startDelay: 1.5 },
    { speed: 42, lookAhead: 260, heightTolerance: 26, gateMargin: 36, maxTime: 120 },
    { speed: 34, lookAhead: 320, heightTolerance: 22, gateMargin: 48, maxTime: 150 },
    { speed: 26, lookAhead: 380, heightTolerance: 18, gateMargin: 60, maxTime: 180 },
    { speed: 20, lookAhead: 420, heightTolerance: 16, gateMargin: 70, maxTime: 240 },
  ];
  if ((currentStage.machines || []).some((machine) => machine.kind === "forklift")) {
    return [
      { speed: 92, lookAhead: 360, heightTolerance: 40, gateMargin: 66, maxTime: 70, notchStyle: "tapHold", tapStart: 0.45, tapEnd: 0.84, holdStart: 1.72, holdUntil: 5.5 },
      { speed: 78, lookAhead: 360, heightTolerance: 34, gateMargin: 60, maxTime: 120, notch: true, notchAngle: -0.08, notchVelocity: -0.18, startDelay: 1.2 },
      { speed: 68, lookAhead: 400, heightTolerance: 30, gateMargin: 70, maxTime: 150, notch: true, notchAngle: -0.12, notchVelocity: -0.28, startDelay: 1.8 },
      { speed: 108, lookAhead: 330, heightTolerance: 44, gateMargin: 54, maxTime: 80 },
      { speed: 100, lookAhead: 360, heightTolerance: 38, gateMargin: 64, maxTime: 95 },
      { speed: 92, lookAhead: 300, heightTolerance: 34, gateMargin: 72, maxTime: 110 },
    ];
  }
  if ((currentStage.machines || []).some((machine) => machine.kind === "excavator")) {
    return [
      { speed: 42, lookAhead: 240, heightTolerance: 30, gateMargin: 36, maxTime: 150, excavator: true, safeGap: 560 },
      { speed: 36, lookAhead: 240, heightTolerance: 30, gateMargin: 36, maxTime: 170, excavator: true, safeGap: 620 },
    ];
  }
  return base;
}

function referenceReplayInput(profile) {
  if (profile.excavator) return referenceExcavatorInput(profile);
  if (profile.startDelay && state.stageTime < profile.startDelay) return labeledInput(0, 0);
  const targetRope = demoRopeTarget(state.distance + profile.lookAhead);
  const ropeError = targetRope - state.ropeLength;
  const y = ropeError > profile.heightTolerance ? 1 : ropeError < -profile.heightTolerance ? -1 : 0;
  const wait = referenceShouldWait(profile, ropeError);
  let x = 0;

  if (!wait && Math.abs(ropeError) <= profile.heightTolerance * 2.2) {
    if (profile.notchStyle === "tapHold") {
      x = referenceTapHoldInput(profile);
    } else if (profile.notch && state.speed < profile.speed) {
      x = state.angle < profile.notchAngle || state.angularVelocity > profile.notchVelocity ? 1 : 0;
    } else if (state.speed < profile.speed) x = 1;
    else if (state.speed > profile.speed + 14) x = -1;
  } else if (state.speed > 12) {
    x = -1;
  } else if (currentStage.windCenter) {
    x = -Math.sign(currentStage.windCenter);
  }

  return labeledInput(x, y);
}

function referenceTapHoldInput(profile) {
  const t = state.stageTime;
  if (t >= profile.tapStart && t < profile.tapEnd) return 1;
  if (t < profile.holdStart) return 0;
  if (profile.holdUntil && t < profile.holdUntil) return 1;
  return state.speed < profile.speed ? 1 : 0;
}

function referenceExcavatorInput(profile = stageReplayProfile || {}) {
  const excavator = state.machines.find((machine) => machine.kind === "excavator");
  let x = 1;
  if (excavator) {
    const hit = machineHitRect(excavator);
    const load = loadWorldPosition();
    const gap = hit.x - load.x;
    if (excavator.phase === "waiting") x = state.distance < excavator.triggerX + 20 ? 1 : 0;
    else if (excavator.phase === "left") x = 0;
    else if (excavator.phase === "right") x = gap < (profile.safeGap || 560) ? 0 : 1;
  }
  if (x > 0 && state.speed < (profile.speed || 42)) {
    x = state.angle < -0.08 || state.angularVelocity > -0.18 ? 1 : 0;
  }
  return labeledInput(x, 0);
}

function referenceShouldWait(profile, ropeError) {
  const load = loadWorldPosition();
  const closedGate = (currentStage.gates || []).some((gate) => {
    if (gateIsOpen(gate)) return false;
    const distanceToGate = gate.x - load.x;
    if (distanceToGate < 45 || distanceToGate > 190) return false;
    const gapY = gateGapY(gate);
    const gap = gateClearance(gate) - profile.gateMargin;
    return load.y < gapY - gap / 2 || load.y > gapY + gap / 2;
  });
  if (closedGate) return true;

  const projectileDanger = activeProjectiles().some((projectile) => {
    const dx = projectile.x - load.x;
    return dx > 40 && dx < 210 && Math.abs(projectile.y - load.y) < 98;
  });
  return projectileDanger || Math.abs(ropeError) > profile.heightTolerance * 2.8;
}

function labeledInput(x, y) {
  const clampedX = Math.max(-1, Math.min(1, Math.round(x)));
  const clampedY = Math.max(-1, Math.min(1, Math.round(y)));
  return {
    x: clampedX,
    y: clampedY,
    label: clampedY < 0 ? "UP" : clampedY > 0 ? "DOWN" : clampedX < 0 ? "LEFT" : clampedX > 0 ? "RIGHT" : "COAST",
  };
}

function replayInputAt(time) {
  if (!stageReplay.length) return { x: 0, y: 0, label: "COAST" };
  let selected = stageReplay[0];
  for (let i = 1; i < stageReplay.length && stageReplay[i].t <= time; i += 1) {
    selected = stageReplay[i];
  }
  return { x: selected.x, y: selected.y, label: selected.label };
}

function snapshotRunState() {
  return {
    distance: state.distance,
    speed: state.speed,
    accel: state.accel,
    ropeLength: state.ropeLength,
    angle: state.angle,
    angularVelocity: state.angularVelocity,
    result: state.result,
    message: state.message,
    stageTime: state.stageTime,
    beamX: state.beamX,
    beamY: state.beamY,
    beamVx: state.beamVx,
    beamVy: state.beamVy,
    beamRotation: state.beamRotation,
    beamSpin: state.beamSpin,
    machines: state.machines.map((machine) => ({ ...machine })),
    switches: { ...state.switches },
  };
}

function restoreRunState(saved) {
  Object.assign(state, saved);
  state.machines = saved.machines.map((machine) => ({ ...machine }));
  state.switches = { ...saved.switches };
}

function recoverStageDemoIfInvalid(showLabel = true) {
  if (Math.abs(toDeg(state.angle)) < dangerAngle && !hitStageHazard()) return;
  stageDemoRecoveries += 1;
  state.distance = Math.max(0, state.distance - 34);
  state.speed = Math.min(8, Math.max(-10, state.speed * -0.2));
  state.accel = 0;
  state.ropeLength = Math.max(minRopeLength + 8, Math.min(maxRopeLength - 8, state.ropeLength - 34));
  state.angle *= 0.35;
  state.angularVelocity = 0;
  state.result = "running";
  state.message = "";
  if (showLabel) updateStageDemoLabel("RECOVER", true);
}

function updateStageDemoLabel(label, force = false) {
  if (!force && label === stageDemoLabelKey && demoTime < stageDemoLabelUntil) return;
  if (!force && label !== stageDemoLabelKey && demoTime < stageDemoLabelUntil) return;
  stageDemoLabelKey = label;
  stageDemoLabelUntil = demoTime + 2.8;
  demoLabel.textContent = stageDemoInstruction(label);
}

function completeAutoClearIfNeeded() {
  if (!stageDemoAutoClear) return false;
  const autoTimeLimit = currentStageIndex === 1 ? 35 : currentStageIndex === 2 ? 35 : 90;
  const autoRecoveryLimit = currentStageIndex === 1 ? 5 : currentStageIndex === 2 ? 5 : 12;
  if (state.distance < goalDistance && demoTime < autoTimeLimit && stageDemoRecoveries < autoRecoveryLimit) return false;
  markStageCleared(currentStageIndex + 1);
  state.distance = goalDistance;
  state.speed = 0;
  demoInput = { x: 0, y: 0, label: "COAST" };
  showStageSelect();
  return true;
}

function stageDemoInstruction(label) {
  const prefix = `見本プレイ: ${currentStage.name}`;
  if (label === "FAILED") return `${prefix}  成功リプレイを作れませんでした`;
  if (label === "RECOVER") return `${prefix}  速度を落として姿勢を立て直す`;
  if (label === "LEFT") return `${prefix}  ←で下がって重機を待つ`;
  if (label === "UP") return `${prefix}  ↑で巻き上げて避ける`;
  if (label === "DOWN") return `${prefix}  ↓で下げて通過高さへ`;
  if (label === "RIGHT") return `${prefix}  →を押して進む`;
  return `${prefix}  離して揺れを抑える`;
}

function demoRopeTarget(distance) {
  let target = 142;
  const load = loadWorldPosition();
  const pendingSwitch = (currentStage.switches || [])
    .find((stageSwitch) => !state.switches[stageSwitch.id] && stageSwitch.x > load.x - 180 && stageSwitch.x < load.x + 520);
  if (pendingSwitch) {
    return Math.max(minRopeLength + 10, Math.min(maxRopeLength - 10, pendingSwitch.y - 134));
  }

  const threateningProjectile = activeProjectiles()
    .filter((projectile) => {
      const dx = projectile.x - load.x;
      return dx > 20 && dx < 240 && Math.abs(projectile.y - load.y) < 118;
    })
    .sort((a, b) => Math.abs(a.x - load.x) - Math.abs(b.x - load.x))[0];
  if (threateningProjectile) {
    const avoidY = threateningProjectile.y < load.y ? threateningProjectile.y + 170 : threateningProjectile.y - 170;
    return Math.max(minRopeLength + 10, Math.min(maxRopeLength - 10, avoidY - railY - 34));
  }

  const nearbyGate = (currentStage.gates || [])
    .filter((gate) => gate.x + gate.w > load.x - 100 && gate.x < load.x + Math.max(280, distance - load.x + 140))
    .sort((a, b) => Math.max(0, a.x - load.x) - Math.max(0, b.x - load.x))[0];
  if (nearbyGate) {
    return Math.max(minRopeLength + 10, Math.min(maxRopeLength - 10, gateGapY(nearbyGate) - 204));
  }

  const nearbyObstacle = (currentStage.obstacles || [])
    .filter((obstacle) => obstacle.x + obstacle.w > load.x - 120 && obstacle.x < load.x + Math.max(320, distance - load.x + 180))
    .sort((a, b) => Math.max(0, a.x - load.x) - Math.max(0, b.x - load.x))[0];
  if (nearbyObstacle) {
    target = nearbyObstacle.h > 96 ? (nearbyObstacle.y < 300 ? 235 : 76) : nearbyObstacle.y > 340 ? 76 : 226;
  }
  const nearbyMachine = state.machines
    .filter((machine) => machine.x + machine.w > load.x - 170 && machine.x < load.x + Math.max(320, distance - load.x + 180))
    .sort((a, b) => Math.max(0, a.x - load.x) - Math.max(0, b.x - load.x))[0];
  if (nearbyMachine) {
    target = nearbyMachine.y > 350 ? 80 : 210;
  }
  return target;
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

function loadWorldPosition() {
  const x = state.distance + Math.sin(state.angle) * state.ropeLength;
  const y = railY + 34 + Math.cos(state.angle) * state.ropeLength;
  return { x, y };
}

function hitStageHazard() {
  if (appScreen !== "game" && appScreen !== "stageDemo") return false;
  const points = loadHitboxPoints(loadWorldPosition(), state.angle * 0.55);
  updateSwitches(points);
  return (currentStage.obstacles || []).some((obstacle) => points.some((point) => pointInRect(point, adjustedObstacle(obstacle))))
    || (currentStage.gates || []).some((gate) => points.some((point) => pointHitsGate(point, gate)))
    || (currentStage.swingGates || []).some((gate) => points.some((point) => pointHitsSwingGate(point, gate)))
    || state.machines.some((machine) => points.some((point) => pointInRect(point, machineHitRect(machine))))
    || activeProjectiles().some((projectile) => points.some((point) => pointInRect(point, projectile.rect)));
}

function loadHitboxPoints(origin, rotation, hitbox = loadHitbox) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const xs = [hitbox.left, (hitbox.left + hitbox.right) / 2, hitbox.right];
  const ys = [hitbox.top, hitbox.top + 34, hitbox.top + 76, hitbox.bottom];
  const points = [];
  xs.forEach((localX) => {
    ys.forEach((localY) => {
      points.push({
        x: origin.x + localX * cos - localY * sin,
        y: origin.y + localX * sin + localY * cos,
      });
    });
  });
  return points;
}

function adjustedObstacle(obstacle) {
  const h = Math.max(28, obstacle.h * obstacleHeightScale);
  return {
    x: obstacle.x,
    y: obstacle.y + (obstacle.h - h) / 2,
    w: obstacle.w,
    h,
  };
}

function machineHitRect(machine) {
  if (machine.kind === "excavator") {
    return { x: machine.x + machine.w * 0.375, y: machine.y, w: machine.w * 0.25, h: machine.h };
  }
  if (machine.kind === "forklift") {
    return { x: machine.x + machine.w * 0.46, y: machine.y, w: machine.w * 0.08, h: machine.h };
  }
  return { x: machine.x, y: machine.y, w: machine.w, h: machine.h };
}

function updateSwitches(points) {
  (currentStage.switches || []).forEach((stageSwitch) => {
    if (state.switches[stageSwitch.id]) return;
    if (points.some((point) => pointInRect(point, stageSwitch))) {
      state.switches[stageSwitch.id] = true;
    }
  });
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w
    && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function gateGapY(gate) {
  return gate.gapY + Math.sin(state.stageTime * gate.speed + gate.phase) * 58;
}

function gateClearance(gate) {
  return gate.gap + gateGapBonus;
}

function gateIsOpen(gate) {
  return gate.switchId && state.switches[gate.switchId];
}

function pointHitsGate(point, gate) {
  if (gateIsOpen(gate)) return false;
  if (point.x < gate.x || point.x > gate.x + gate.w) return false;
  const gapY = gateGapY(gate);
  const gap = gateClearance(gate);
  return point.y < gapY - gap / 2 || point.y > gapY + gap / 2;
}

function pointHitsSwingGate(point, gate) {
  if (point.x < gate.x || point.x > gate.x + gate.w) return false;
  return Math.abs(state.angle * 180 / Math.PI) > gate.limit;
}

function activeProjectiles() {
  return (currentStage.projectiles || []).map((projectile, index) => {
    const travel = W + 260;
    const offset = ((state.stageTime + projectile.phase) * projectile.speed) % travel;
    const x = cameraX() + W + 90 - offset;
    const size = projectile.kind === "saw" ? 42 : 58;
    return {
      ...projectile,
      index,
      x,
      size,
      rect: { x: x - size / 2, y: projectile.y - size / 2, w: size, h: size },
    };
  });
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  if (appScreen === "ending") {
    drawEnding();
    return;
  }
  drawScene();
  drawWind();
  drawTrack();
  drawStageHazards();
  drawCrane();
  drawDemoCue();
  drawMeters();
  if (appScreen === "game" && state.result !== "running") drawResult();
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

function drawStageHazards() {
  if (appScreen !== "game" && appScreen !== "stageDemo") return;
  (currentStage.switches || []).forEach(drawSwitch);
  (currentStage.obstacles || []).forEach(drawObstacle);
  (currentStage.gates || []).forEach(drawGate);
  (currentStage.swingGates || []).forEach(drawSwingGate);
  state.machines.forEach(drawMachine);
  activeProjectiles().forEach(drawProjectile);
}

function drawWind() {
  if (!currentStage.windCenter || (appScreen !== "game" && appScreen !== "stageDemo")) return;
  ctx.save();
  ctx.strokeStyle = "rgb(21 154 156 / 0.45)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  const direction = currentStage.windCenter < 0 ? -1 : 1;
  for (let y = 168; y < 468; y += 86) {
    const startX = direction < 0 ? W - 42 : 42;
    const endX = startX + direction * 72;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.lineTo(endX - direction * 14, y - 10);
    ctx.moveTo(endX, y);
    ctx.lineTo(endX - direction * 14, y + 10);
    ctx.stroke();
  }
  ctx.restore();
  drawWindLeaves(direction);
}

function drawWindLeaves(direction) {
  ctx.save();
  const travel = W + 180;
  const colors = ["#8fb339", "#d6a33f", "#6aa56f", "#c98530"];
  for (let i = 0; i < 14; i += 1) {
    const speed = 48 + i * 9;
    const phase = i * 0.37;
    const progress = ((state.stageTime * speed + phase * 180 + cameraX() * 0.12) % travel);
    const x = direction < 0 ? W + 80 - progress : -80 + progress;
    const y = 136 + ((i * 47 + Math.sin(state.stageTime * 1.4 + i) * 22) % 340);
    const wobble = Math.sin(state.stageTime * 4 + i) * 8;

    ctx.save();
    ctx.translate(x, y + wobble);
    ctx.rotate(direction * 0.7 + Math.sin(state.stageTime * 3 + i) * 0.65);
    ctx.fillStyle = colors[i % colors.length];
    ctx.strokeStyle = "rgb(37 51 63 / 0.36)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawSwitch(stageSwitch) {
  const x = worldToScreen(stageSwitch.x);
  if (x + stageSwitch.w < -50 || x > W + 50) return;
  const pressed = state.switches[stageSwitch.id];

  ctx.save();
  ctx.fillStyle = "rgb(68 112 130 / 0.46)";
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, stageSwitch.y, stageSwitch.w, stageSwitch.h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = pressed ? "#159a9c" : "#f0b429";
  ctx.beginPath();
  ctx.arc(x + stageSwitch.w / 2, stageSwitch.y + stageSwitch.h / 2, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "900 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(pressed ? "OPEN" : "PUSH", x + stageSwitch.w / 2, stageSwitch.y + stageSwitch.h / 2 + 4);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawMachine(machine) {
  if (machine.kind === "excavator") drawExcavator(machine);
  if (machine.kind === "forklift") drawForklift(machine);
}

function drawExcavator(machine) {
  const x = worldToScreen(machine.x);
  if (x + machine.w < -80 || x > W + 80) return;
  const topY = machine.y;
  const baseY = machine.y + machine.h;
  const bodyY = baseY - 98;
  const cabinY = bodyY - 66;
  const armBaseX = x + machine.w * 0.58;
  const armMidX = x + machine.w * 0.28;
  const bucketX = x - 24;

  ctx.save();
  ctx.fillStyle = "rgb(214 69 69 / 0.16)";
  ctx.fillRect(x + 8, topY, machine.w - 16, machine.h);

  ctx.fillStyle = "#f0b429";
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 4;
  ctx.fillRect(x + 78, bodyY, 154, 62);
  ctx.strokeRect(x + 78, bodyY, 154, 62);
  ctx.fillStyle = "#d88918";
  ctx.fillRect(x + 138, cabinY, 76, 62);
  ctx.strokeRect(x + 138, cabinY, 76, 62);
  ctx.fillStyle = "rgb(255 255 255 / 0.55)";
  ctx.fillRect(x + 154, cabinY + 14, 34, 24);

  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(armBaseX, bodyY + 8);
  ctx.lineTo(armMidX, topY + 72);
  ctx.lineTo(bucketX + 44, topY + 22);
  ctx.stroke();

  ctx.strokeStyle = "#d88918";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(armBaseX, bodyY + 8);
  ctx.lineTo(armMidX, topY + 72);
  ctx.lineTo(bucketX + 44, topY + 22);
  ctx.stroke();

  ctx.fillStyle = "#6f7f89";
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bucketX - 18, topY + 18);
  ctx.lineTo(bucketX + 56, topY + 6);
  ctx.lineTo(bucketX + 44, topY + 58);
  ctx.lineTo(bucketX - 24, topY + 66);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#25333f";
  ctx.fillRect(x + 54, baseY - 28, 214, 28);
  ctx.fillStyle = "#17212b";
  ctx.beginPath();
  ctx.arc(x + 92, baseY - 2, 22, 0, Math.PI * 2);
  ctx.arc(x + 212, baseY - 2, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawForklift(machine) {
  const x = worldToScreen(machine.x);
  if (x + machine.w < -80 || x > W + 80) return;
  const topY = machine.y;
  const baseY = machine.y + machine.h;
  const bodyY = baseY - 112;
  const cabinY = bodyY - 74;
  const mastX = x + machine.w - 76;

  ctx.save();
  ctx.fillStyle = "rgb(239 93 67 / 0.14)";
  ctx.fillRect(x, topY, machine.w, machine.h);

  ctx.fillStyle = "#ef5d43";
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 4;
  ctx.fillRect(x + 52, bodyY, 158, 70);
  ctx.strokeRect(x + 52, bodyY, 158, 70);
  ctx.fillStyle = "#f0b429";
  ctx.fillRect(x + 126, cabinY, 82, 78);
  ctx.strokeRect(x + 126, cabinY, 82, 78);
  ctx.fillStyle = "rgb(255 255 255 / 0.6)";
  ctx.fillRect(x + 146, cabinY + 16, 34, 28);

  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(mastX, topY + 28);
  ctx.lineTo(mastX, baseY - 26);
  ctx.moveTo(mastX + 34, topY + 44);
  ctx.lineTo(mastX + 34, baseY - 20);
  ctx.moveTo(mastX, bodyY + 52);
  ctx.lineTo(x + machine.w + 54, bodyY + 52);
  ctx.moveTo(mastX, bodyY + 78);
  ctx.lineTo(x + machine.w + 70, bodyY + 78);
  ctx.stroke();

  ctx.fillStyle = "#17212b";
  ctx.fillRect(x + 42, baseY - 34, 206, 30);
  ctx.beginPath();
  ctx.arc(x + 82, baseY - 2, 25, 0, Math.PI * 2);
  ctx.arc(x + 202, baseY - 2, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CHASE", x + 132, bodyY + 46);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawObstacle(obstacle) {
  const adjusted = adjustedObstacle(obstacle);
  const x = worldToScreen(adjusted.x);
  if (x + adjusted.w < -40 || x > W + 40) return;

  ctx.save();
  ctx.fillStyle = "#52616d";
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 4;
  ctx.fillRect(x, adjusted.y, adjusted.w, adjusted.h);
  ctx.strokeRect(x, adjusted.y, adjusted.w, adjusted.h);

  ctx.fillStyle = "#f0b429";
  const stripeW = 18;
  for (let sx = x - adjusted.h; sx < x + adjusted.w + adjusted.h; sx += stripeW * 2) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, adjusted.y, adjusted.w, adjusted.h);
    ctx.clip();
    ctx.translate(sx, adjusted.y);
    ctx.rotate(-Math.PI / 4);
    ctx.fillRect(0, -8, stripeW, adjusted.h * 3);
    ctx.restore();
  }
  ctx.restore();
}

function drawGate(gate) {
  const x = worldToScreen(gate.x);
  if (x + gate.w < -40 || x > W + 40) return;
  const gapY = gateGapY(gate);
  const gap = gateClearance(gate);
  const topY = railY - 18;
  const topH = Math.max(0, gapY - gap / 2 - topY);
  const bottomY = gapY + gap / 2;
  const bottomH = groundY - bottomY;

  ctx.save();
  if (gateIsOpen(gate)) {
    ctx.fillStyle = "rgb(21 154 156 / 0.48)";
    ctx.strokeStyle = "#159a9c";
    ctx.lineWidth = 4;
    ctx.fillRect(x, topY, gate.w, groundY - topY);
    ctx.strokeRect(x, topY, gate.w, groundY - topY);
    ctx.fillStyle = "#fff";
    ctx.font = "900 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OPEN", x + gate.w / 2, topY + 34);
    ctx.textAlign = "left";
    ctx.restore();
    return;
  }
  ctx.fillStyle = "#d64545";
  ctx.strokeStyle = "#7f2532";
  ctx.lineWidth = 4;
  ctx.fillRect(x, topY, gate.w, topH);
  ctx.strokeRect(x, topY, gate.w, topH);
  ctx.fillRect(x, bottomY, gate.w, bottomH);
  ctx.strokeRect(x, bottomY, gate.w, bottomH);

  ctx.fillStyle = "rgb(255 255 255 / 0.86)";
  ctx.font = "900 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GATE", x + gate.w / 2, Math.max(topY + 22, gapY - gap / 2 - 8));
  ctx.textAlign = "left";
  ctx.restore();
}

function drawSwingGate(gate) {
  const x = worldToScreen(gate.x);
  if (x + gate.w < -40 || x > W + 40) return;
  const topY = railY - 18;
  const height = groundY - topY;
  const swingDeg = Math.abs(state.angle * 180 / Math.PI);
  const clear = swingDeg <= gate.limit;

  ctx.save();
  ctx.fillStyle = clear ? "rgb(21 154 156 / 0.18)" : "rgb(214 69 69 / 0.22)";
  ctx.strokeStyle = clear ? "#159a9c" : "#d64545";
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(x, topY, gate.w, height);
  ctx.setLineDash([]);
  ctx.fillRect(x, topY, gate.w, height);

  ctx.fillStyle = clear ? "#159a9c" : "#d64545";
  ctx.beginPath();
  ctx.roundRect(x - 30, topY + 16, gate.w + 60, 42, 8);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`ゆれ${gate.limit}°以下`, x + gate.w / 2, topY + 42);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawProjectile(projectile) {
  const x = worldToScreen(projectile.x);
  if (x + projectile.size < -60 || x - projectile.size > W + 60) return;

  ctx.save();
  ctx.translate(x, projectile.y);
  ctx.rotate((state.stageTime * 5 + projectile.index) * (projectile.kind === "saw" ? 1 : -0.8));
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 4;
  if (projectile.kind === "saw") {
    ctx.fillStyle = "#c8d2d8";
    ctx.beginPath();
    for (let i = 0; i < 18; i += 1) {
      const radius = i % 2 === 0 ? 24 : 18;
      const angle = i / 18 * Math.PI * 2;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#52616d";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#8a98a2";
    ctx.fillRect(-26, -6, 52, 12);
    ctx.strokeRect(-26, -6, 52, 12);
    ctx.beginPath();
    ctx.arc(-30, 0, 13, Math.PI * 0.4, Math.PI * 1.6);
    ctx.arc(30, 0, 13, Math.PI * 1.4, Math.PI * 0.6, true);
    ctx.stroke();
  }
  ctx.restore();
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

  if (!currentStage.noCat && beamCatSprite.complete && beamCatSprite.naturalWidth > 0) {
    const width = beamSpriteWidth;
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

  if (!currentStage.noCat) drawBeamCat();

  ctx.restore();
}

function swingColor() {
  const swing = Math.abs(toDeg(state.angle));
  const limit = currentStage.dangerAngle || dangerAngle;
  if (swing >= limit * 0.82) return "#d64545";
  if (swing >= limit * 0.55) return "#f0b429";
  return "#25333f";
}

function drawMeters() {
  const barX = 34;
  const barY = H - 54;
  const barW = W - 68;
  const progress = currentStage.type === "dampen" ? Math.min(1, dampenHold / (currentStage.successHold || 1.2)) : state.distance / goalDistance;
  const swing = Math.min(1, Math.abs(toDeg(state.angle)) / (currentStage.dangerAngle || dangerAngle));

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
  const objective = currentStage.type === "dampen" ? "Dampen hold" : "Distance";
  ctx.fillText(`${currentStage.name}  ${objective}  Input: ${readInput().label}  Speed: ${Math.round(state.speed)}`, barX, barY - 48);
  ctx.fillText("Swing limit", barX, barY - 7);
}

function drawResult() {
  ctx.fillStyle = "rgb(23 33 43 / 0.76)";
  ctx.fillRect(0, 0, W, H);
}

function resultDetailText() {
  if (state.result === "cleared") return currentStage.type === "dampen" ? "揺れ止め完了。" : `${currentStage.name} cleared.`;
  return state.message === "Crash!" ? "Hit the obstacle." : "Too much swing.";
}

function syncResultPanel() {
  const visible = appScreen === "game" && state.result !== "running";
  resultPanel.classList.toggle("hidden", !visible);
  resultAutoBtn.classList.toggle("hidden", !visible || state.result !== "dropped" || stageMode === "hard");
  if (!visible) return;
  resultTitle.textContent = state.message;
  resultText.textContent = resultDetailText();
}

function drawDemoCue() {
  const stageDemoPita =
    appScreen === "stageDemo"
    && stageReplayProfile?.notchStyle === "tapHold"
    && state.stageTime > stageReplayProfile.holdStart + 0.45
    && state.stageTime < stageReplayProfile.holdStart + 1.55;
  if ((appScreen !== "demo" || demoTime < 2.22 || demoTime > 3.45) && !stageDemoPita) return;
  const load = loadPosition();
  drawSpeechBubble(load.x + 48, load.y - 72, "ピタッ");
}

function drawSpeechBubble(x, y, text) {
  ctx.save();
  ctx.font = "900 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const width = Math.max(80, ctx.measureText(text).width + 34);
  const height = 42;
  const bx = Math.max(12, Math.min(W - width - 12, x - width / 2));
  const by = Math.max(64, Math.min(H - height - 102, y - height / 2));

  ctx.fillStyle = "rgb(255 255 255 / 0.96)";
  ctx.strokeStyle = "#d64545";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(bx, by, width, height, 14);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bx + width * 0.38, by + height - 1);
  ctx.lineTo(bx + width * 0.48, by + height + 17);
  ctx.lineTo(bx + width * 0.56, by + height - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#d64545";
  ctx.fillText(text, bx + width / 2, by + height / 2);
  ctx.restore();
}

function startEnding() {
  endingTime = 0;
  state.keys.clear();
  state.buttons.clear();
  setScreen("ending");
}

function updateEnding(dt) {
  endingTime += dt;
  if (endingTime > 22) {
    showStageSelect();
  }
}

function drawEnding() {
  const p = Math.min(1, endingTime / 22);
  drawEndingSky(p);
  drawIndustrialBackground();
  drawEndingSea(p);

  const craneX = 86 + endingTime * 12;
  const beamX = 78 + endingTime * 18;
  const beamY = 322 + Math.sin(endingTime * 1.8) * 7;
  const shipX = 278 - Math.max(0, endingTime - 10) * 8;
  const shipY = 448 + Math.sin(endingTime * 2.2) * 4;
  const sunY = 118 + Math.min(1, Math.max(0, (endingTime - 13) / 5)) * 420;
  const sleep = endingTime > 16.2;

  ctx.save();
  ctx.fillStyle = "#f0b429";
  ctx.beginPath();
  ctx.arc(318, sunY, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawEndingShip(shipX, shipY, Math.sin(endingTime * 2.8) * 0.05);
  drawEndingCraneBeam(craneX, beamY);
  drawPlainBeam(beamX + 58, beamY + 86, Math.sin(endingTime * 1.7) * 0.06);

  if (endingTime < 5.2) {
    drawEndingCat(beamX + 52, beamY + 58, Math.sin(endingTime * 2) * 0.08);
    drawEndingCaption("最後の一本。猫は静かに揺れを読んでいる。");
  } else if (endingTime < 9.2) {
    const t = (endingTime - 5.2) / 4;
    const catX = beamX + 52 + t * 116;
    const catY = beamY + 58 - Math.sin(t * Math.PI) * 118 + t * 58;
    drawEndingCat(catX, catY, 0.35 - t * 0.45);
    drawEndingCaption("チョン、待って、長押し。今日の現場もヨシ。");
  } else if (endingTime < 14.6) {
    const walk = (endingTime - 9.2) / 5.4;
    drawEndingCat(shipX - 48 + walk * 92, shipY - 96 + Math.sin(endingTime * 6) * 3, Math.sin(endingTime * 5) * 0.08);
    drawStormWind();
    drawEndingCaption("港の風が吹いても、もう猫はあわてない。");
  } else if (!sleep) {
    const t = (endingTime - 14.6) / 1.6;
    drawEndingCat(230 + t * 28, 354 - Math.sin(t * Math.PI) * 44, 0.2);
    drawEndingCaption("ヘルメットを直して、指差し呼称。");
  } else {
    drawPlainBeam(196, 426, 0.04);
    drawEndingCat(206, 336, 0.05);
    drawEndingCaption(endingTime < 19.2 ? "ご安全に。また明日。" : "thank you for your playing");
  }
}

function drawEndingSky(progress) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, progress > 0.55 ? "#f07f5a" : "#9fdcff");
  sky.addColorStop(0.58, progress > 0.55 ? "#f7c879" : "#f4fbff");
  sky.addColorStop(1, progress > 0.55 ? "#25333f" : "#f5d77d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
}

function drawMidEnding() {
  const p = Math.min(1, endingTime / 16);
  drawEndingSky(p);
  drawEndingSea(p);

  const shipRock = Math.sin(endingTime * 5) * Math.min(0.35, Math.max(0, p - 0.28) * 1.2);
  const shipY = 438 + Math.sin(endingTime * 2.2) * 5;
  drawEndingShip(195, shipY, shipRock);

  const beamStartX = 85 + endingTime * 20;
  const catJump = endingTime > 2.4 && endingTime < 4.4;
  const catReturn = endingTime > 8.7 && endingTime < 11.2;
  let catX = 120;
  let catY = 318;
  let catRot = -0.08;

  if (catJump) {
    const t = (endingTime - 2.4) / 2;
    catX = 120 + t * 96;
    catY = 318 - Math.sin(t * Math.PI) * 110 + t * 92;
    catRot = 0.45;
  } else if (endingTime >= 4.4 && endingTime < 8.7) {
    catX = 212;
    catY = shipY - 92;
    catRot = shipRock;
  } else if (catReturn) {
    const t = (endingTime - 8.7) / 2.5;
    catX = 212 + t * 96;
    catY = shipY - 92 - Math.sin(t * Math.PI) * 120 - t * 20;
    catRot = -0.35;
  } else if (endingTime >= 11.2) {
    catX = beamStartX + 82;
    catY = 318;
  }

  if (endingTime < 3.1 || endingTime > 10.5) drawEndingCraneBeam(beamStartX, 330);
  if (endingTime > 5.2 && endingTime < 9.8) drawStormWind();
  drawEndingCat(catX, catY, catRot);

  const caption = endingTime < 4.7
    ? "船に飛び乗った！"
    : endingTime < 9.8
      ? "でも風が強すぎる！"
      : "再び鉄骨へ。クレーンはまた動き出す。";
  drawEndingCaption(caption);
}

function drawFinalEnding() {
  const p = Math.min(1, endingTime / 18);
  drawEndingSky(p);
  drawIndustrialBackground();

  for (let i = 0; i < 5; i += 1) {
    const x = 42 + i * 92 - p * 80;
    drawPlainBeam(x, 404 - (i % 2) * 42, i % 2 ? -0.05 : 0.06);
  }

  const hop = Math.min(4, Math.floor(endingTime / 2.4));
  const local = (endingTime % 2.4) / 2.4;
  const catX = 72 + hop * 76 + local * 62 - p * 48;
  const catY = 330 - (hop % 2) * 42 - Math.sin(local * Math.PI) * 80;
  const sleeping = endingTime > 13.2;
  drawEndingCat(sleeping ? 210 : catX, sleeping ? 334 : catY, sleeping ? 0.05 : 0.2);

  if (sleeping) {
    drawPlainBeam(178, 424, 0.04);
    drawEndingCaption("thank you for your playing");
  } else {
    drawEndingCaption("鉄骨から鉄骨へ。夕暮れまで進み続ける。");
  }
}

function drawEndingSea(progress) {
  ctx.fillStyle = progress > 0.42 ? "#2f6f8f" : "#5bb4d8";
  ctx.fillRect(0, 438, W, H - 438);
  ctx.strokeStyle = "rgb(255 255 255 / 0.42)";
  ctx.lineWidth = 3;
  for (let y = 464; y < H; y += 34) {
    ctx.beginPath();
    for (let x = -20; x < W + 20; x += 28) {
      ctx.lineTo(x, y + Math.sin(x * 0.05 + endingTime * 3) * 4);
    }
    ctx.stroke();
  }
}

function drawEndingShip(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = "#d64545";
  ctx.fillRect(-68, -54, 72, 42);
  ctx.fillStyle = "#f0b429";
  ctx.fillRect(-18, -76, 54, 64);
  ctx.fillStyle = "#25333f";
  ctx.beginPath();
  ctx.moveTo(-110, -8);
  ctx.lineTo(108, -8);
  ctx.lineTo(72, 42);
  ctx.lineTo(-84, 42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgb(255 255 255 / 0.65)";
  ctx.fillRect(-6, -62, 18, 16);
  ctx.restore();
}

function drawEndingCraneBeam(x, y) {
  ctx.strokeStyle = "#25333f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 80, 96);
  ctx.lineTo(x + 80, y - 12);
  ctx.stroke();
  drawSteelBeam(x + 80, y, Math.sin(endingTime * 2.6) * 0.08);
}

function drawPlainBeam(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = "#6f7f89";
  ctx.fillRect(-52, -12, 104, 24);
  ctx.fillStyle = "#43525c";
  ctx.fillRect(-58, -22, 116, 9);
  ctx.fillRect(-58, 13, 116, 9);
  ctx.restore();
}

function drawEndingCat(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  if (beamCatSprite.complete && beamCatSprite.naturalWidth > 0) {
    ctx.drawImage(beamCatSprite, -52, -104, 96, 138);
  } else {
    ctx.fillStyle = "#f0b429";
    ctx.beginPath();
    ctx.arc(0, -36, 24, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStormWind() {
  ctx.strokeStyle = "rgb(255 255 255 / 0.72)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  for (let y = 154; y < 382; y += 52) {
    ctx.beginPath();
    ctx.moveTo(W - 28, y);
    ctx.lineTo(52, y + Math.sin(endingTime * 4 + y) * 16);
    ctx.stroke();
  }
}

function drawEndingCaption(text) {
  ctx.fillStyle = "rgb(23 33 43 / 0.72)";
  ctx.fillRect(18, 586, W - 36, 56);
  ctx.fillStyle = "#fff";
  ctx.font = "900 19px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, 621);
  ctx.textAlign = "left";
}

function setScreen(nextScreen) {
  appScreen = nextScreen;
  startScreen.classList.toggle("hidden", nextScreen !== "start");
  stageScreen.classList.toggle("hidden", nextScreen !== "stage");
  tutorialScreen.classList.toggle("hidden", nextScreen !== "tutorial");
  demoLabel.classList.toggle("hidden", !["demo", "stageDemo"].includes(nextScreen));
  shell.classList.toggle("menu-mode", ["start", "stage", "tutorial"].includes(nextScreen));
  shell.classList.toggle("demo-mode", nextScreen === "demo");
  shell.classList.toggle("play-mode", nextScreen === "game" || nextScreen === "stageDemo" || nextScreen === "ending");
  shell.classList.toggle("hard-mode", stageMode === "hard");
  resultPanel.classList.add("hidden");
  if (nextScreen !== "stageDemo") stageDemoAutoClear = false;
  if (nextScreen !== "demo" && nextScreen !== "stageDemo") {
    buttonCue.className = "button-cue hidden";
    buttonCue.textContent = "";
  }
}

function showTitle() {
  stageMode = "normal";
  setScreen("start");
}

function showStageSelect(mode = stageMode) {
  stageMode = mode;
  state.keys.clear();
  state.buttons.clear();
  buildStageGrid();
  setScreen("stage");
}

function startGame(stageNumber = currentStageIndex + 1) {
  if (typeof stageNumber !== "number") stageNumber = currentStageIndex + 1;
  const activeStages = stageMode === "hard" ? hardStages : stages;
  currentStageIndex = Math.max(0, Math.min(activeStages.length - 1, stageNumber - 1));
  currentStage = activeStages[currentStageIndex];
  goalDistance = currentStage.distance || 900;
  reset();
  setScreen("game");
}

function startStageClearDemo() {
  startStageDemo(false);
}

function startStageAutoClear() {
  startStageDemo(true);
}

function startStageDemo(autoClear) {
  reset();
  demoTime = 0;
  demoInput = { x: 0, y: 0, label: "COAST" };
  stageDemoLabelKey = "";
  stageDemoLabelUntil = 0;
  stageDemoRecoveries = 0;
  stageDemoAutoClear = autoClear;
  stageReplayProfile = null;
  stageReplay = buildStageReplay();
  reset();
  demoTime = 0;
  demoLabel.textContent = autoClear
    ? `オートモード: ${currentStage.name} 2倍速で自動クリア`
    : `見本プレイ: ${currentStage.name} 右・上・下の操作タイミング`;
  setScreen("stageDemo");
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
  state.distance = 80;
  state.speed = 0;
  state.accel = 0;
  state.angle = 0;
  state.angularVelocity = 0;
  demoTime = 0;
  demoInput = { x: 0, y: 0, label: "COAST" };
  demoLabel.textContent = "見本運転: 右にチョン押し → 揺れを見て右に長押し";
  setScreen("demo");
}

function syncButtonStates() {
  const input = readInput();
  leftBtn.classList.toggle("is-pressed", input.x < 0);
  rightBtn.classList.toggle("is-pressed", input.x > 0);
  upBtn.classList.toggle("is-pressed", input.y < 0);
  downBtn.classList.toggle("is-pressed", input.y > 0);
  syncDemoCues();
}

function syncDemoCues() {
  if (appScreen === "stageDemo" && stageReplayProfile?.notchStyle === "tapHold") {
    const t = state.stageTime;
    if (t > stageReplayProfile.tapStart && t < stageReplayProfile.tapEnd) {
      buttonCue.textContent = "チョン押し";
      buttonCue.className = "button-cue tap";
    } else if (t > stageReplayProfile.holdStart && t < stageReplayProfile.holdUntil) {
      buttonCue.textContent = "長押し";
      buttonCue.className = "button-cue hold";
    } else {
      buttonCue.className = "button-cue hidden";
      buttonCue.textContent = "";
    }
    return;
  }
  if (appScreen !== "demo") return;
  if (demoTime > 0.5 && demoTime < 0.92) {
    buttonCue.textContent = "チョン押し";
    buttonCue.className = "button-cue tap";
  } else if (demoTime > 1.96 && demoTime < 4.0) {
    buttonCue.textContent = "長押し";
    buttonCue.className = "button-cue hold";
  } else {
    buttonCue.className = "button-cue hidden";
    buttonCue.textContent = "";
  }
}

function hardModePurchased() {
  return localStorage.getItem(hardModePurchasedKey) === "true";
}

function requestHardModePurchase() {
  const confirmed = window.confirm("ガチ追いノッチモード ステージ2〜10は500円購入予定です。\n\n現在はGoogle Play Billing接続前のテスト解除として扱います。解除しますか？");
  if (!confirmed) return;
  localStorage.setItem(hardModePurchasedKey, "true");
  buildStageGrid();
}

function buildStageGrid() {
  stageGrid.innerHTML = "";
  const activeStages = stageMode === "hard" ? hardStages : stages;
  const cleared = activeClearedStages();
  const purchased = stageMode !== "hard" || hardModePurchased();
  stageScreen.querySelector("h2").textContent = stageMode === "hard" ? "ガチ追いノッチ" : "ステージ選択";
  unlockStatus.textContent = stageMode === "hard"
    ? (purchased ? "全10ステージ解除済み。右ボタンだけでリアルな揺れ止めに挑戦。" : "ステージ1は無料。ステージ2〜10は500円購入で解除予定。")
    : "全ステージを選択できます";
  for (let i = 1; i <= activeStages.length; i += 1) {
    const isLocked = stageMode === "hard" && i >= 2 && !purchased;
    const isCleared = cleared.has(i);
    const button = document.createElement("button");
    button.type = "button";
    button.classList.toggle("cleared-stage", isCleared);
    button.classList.toggle("locked-stage", isLocked);
    button.innerHTML = `<span>${activeStages[i - 1].name}<small>${activeStages[i - 1].label || ""}</small></span>${isCleared ? "<b>CLEAR</b>" : ""}`;
    button.addEventListener("click", () => {
      if (isLocked) {
        requestHardModePurchase();
        return;
      }
      startGame(i);
    });
    stageGrid.append(button);
  }
  syncEndingButtons();
}

function syncEndingButtons() {
  if (stageMode === "hard") {
    endingButton.textContent = hardModePurchased() ? "ガチ全解除済み" : "ステージ2〜10解除 ¥500";
    endingButton.disabled = hardModePurchased();
    return;
  }
  endingButton.textContent = "エンディング";
  const endingReady = stages.every((_, index) => clearedStages.has(index + 1));
  endingButton.disabled = !endingReady;
}

function bindMenuAction(button, action) {
  let lastRun = 0;
  const run = (event) => {
    event.preventDefault();
    const now = performance.now();
    if (now - lastRun < 250) return;
    lastRun = now;
    action();
  };
  button.addEventListener("pointerdown", run);
  button.addEventListener("click", run);
}

function bindDirection(button, direction) {
  const start = (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    if (state.result === "running") state.buttons.add(direction);
  };
  const stop = () => {
    state.buttons.delete(direction);
  };
  button.addEventListener("pointerdown", start);
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("selectstart", (event) => event.preventDefault());
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("lostpointercapture", stop);
}

bindDirection(leftBtn, "left");
bindDirection(rightBtn, "right");
bindDirection(upBtn, "up");
bindDirection(downBtn, "down");
bindMenuAction(restartBtn, () => startGame());
bindMenuAction(stageMenuBtn, showStageSelect);
bindMenuAction(resultRestartBtn, () => startGame());
bindMenuAction(resultStageBtn, showStageSelect);
bindMenuAction(resultAutoBtn, startStageAutoClear);
tutorialButton.addEventListener("click", startTutorial);
stageButton.addEventListener("click", () => showStageSelect("normal"));
hardModeButton.addEventListener("click", () => showStageSelect("hard"));
stageBackButton.addEventListener("click", showTitle);
endingButton.addEventListener("click", (event) => {
  if (stageMode === "hard") {
    event.preventDefault();
    requestHardModePurchase();
    return;
  }
  if (!endingButton.disabled) startEnding();
});
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
