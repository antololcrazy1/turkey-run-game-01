// Gobble Dash entry: state machine, fixed-step loop, buttons and screenshot scenes.
import { Input } from "./input.js";
import { SoundBank } from "./audio.js";
import { World } from "./world.js";
import { drawEnd, drawPaused, drawTitle, drawWorld } from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const params = new URLSearchParams(location.search);
const seed = Number(params.get("seed") || 7);
const shot = params.get("shot");

const input = new Input(canvas);
const sound = new SoundBank();
const world = new World(seed);
let state = "title";
let last = performance.now();
let accumulator = 0;

function announce(msg) { if (statusEl) statusEl.textContent = msg; }
function startRun() {
  world.reset(seed + Math.floor(Math.random() * 1000));
  state = "playing";
  sound.ensure();
  sound.gobble();
  announce("Run started. Reach the escape gate at 1200 metres.");
}
function inButton(x, y, bx, by, bw, bh) { return x >= bx && x <= bx + bw && y >= by && y <= by + bh; }

function stageShotScene(name) {
  world.reset(seed);
  if (name === "title") { state = "title"; world.meters = 60; world.turkey.y = 0.78; world.farmer.y = 0.72; world.ensureSpawns(); return; }
  if (name === "play") {
    state = "playing";
    world.meters = 520;
    world.score = 486;
    world.cornCount = 17;
    world.timeLeft = 64;
    world.turkey.y = 0.48;
    world.turkey.dashT = 0.18;
    world.turkey.stamina = 0.72;
    world.farmer.gap = 150;
    world.farmer.y = 0.52;
    world.ensureSpawns();
    world.knives.push({ x: 527, lane: 0.62, vx: 17, spin: 2.4, passed: false });
    world.knives.push({ x: 531, lane: 0.34, vx: 17, spin: 5.1, passed: false });
    world.banner = "THE BARN — knives incoming!";
    world.bannerT = 2;
    return;
  }
  if (name === "kitchen") {
    state = "playing";
    world.meters = 940;
    world.score = 913;
    world.cornCount = 31;
    world.lives = 2;
    world.timeLeft = 38;
    world.turkey.y = 0.62;
    world.farmer.gap = 215;
    world.farmer.y = 0.58;
    world.ensureSpawns();
    world.flames.push({ x: 959, lane: 0.52, phase: 0.6, hit: false, active: true });
    world.flames.push({ x: 968, lane: 0.28, phase: 1.1, hit: false, active: true });
    world.banner = "KITCHEN — dodge the oven flames!";
    world.bannerT = 2;
    return;
  }
  if (name === "end") {
    state = "ended";
    world.meters = 1200;
    world.score = 1548;
    world.cornCount = 42;
    world.lives = 2;
    world.nearMisses = 6;
    world.stageName = "KITCHEN";
    world.timeLeft = 24;
    world.outcome = "escaped";
    world.ensureSpawns();
  }
}

if (shot) stageShotScene(shot);

function handleEvents() {
  for (const e of world.drainEvents()) {
    if (e.name === "corn") sound.corn();
    else if (e.name === "golden") sound.golden();
    else if (e.name === "hit") { sound.hit(); sound.gobble(); announce(`Hit. ${world.lives} lives left.`); }
    else if (e.name === "dash") sound.dash();
    else if (e.name === "knife") sound.knife();
    else if (e.name === "nearMiss") sound.nearMiss();
    else if (e.name === "win") { sound.win(); state = "ended"; announce("You escaped."); }
    else if (e.name === "lose") { sound.lose(); state = "ended"; announce("Caught for dinner."); }
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (input.wasPressed("m")) { sound.muted = !sound.muted; announce(sound.muted ? "Sound off." : "Sound on."); }
  if (state === "title") {
    world.time += dt;
    world.turkey.runPhase += dt * 8;
    if (input.wasPressed("enter", " ", "pointer") || input.touch.dash) startRun();
    drawTitle(ctx, world);
  } else if (state === "playing") {
    if (input.wasPressed("p", "escape")) state = "paused";
    accumulator += dt;
    const step = 1 / 120;
    while (accumulator >= step) {
      world.update(step, input);
      accumulator -= step;
      if (world.outcome) break;
    }
    handleEvents();
    sound.tickMusic(dt, state === "playing");
    drawWorld(ctx, world);
  } else if (state === "paused") {
    if (input.wasPressed("p", "escape", "enter")) state = "playing";
    drawPaused(ctx, world);
  } else if (state === "ended") {
    if (input.wasPressed("r", "enter", "pointer")) startRun();
    drawEnd(ctx, world);
  }
  input.endFrame();
}

canvas.addEventListener("pointerdown", (e) => {
  sound.ensure();
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * canvas.width;
  const y = (e.clientY - r.top) / r.height * canvas.height;
  if (state === "title" && inButton(x, y, 500, 548, 280, 62)) startRun();
  if (state === "ended" && inButton(x, y, 500, 528, 280, 62)) startRun();
});

window.__gobble = { world, getState: () => state, startRun };
announce("Gobble Dash. Press Enter to start running.");
requestAnimationFrame(frame);
