// Canvas rendering: autumn farm-to-kitchen scenery, turkey, farmer, hazards and HUD.
import { GOAL_METERS, GROUND_TOP, GROUND_BOTTOM, VIEW_H, VIEW_W } from "./config.js";

const PX = 14;
const TURKEY_X = 360;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = "left", weight = 700, outline = true) {
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  if (outline) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(43,22,8,.85)";
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function screenX(world, wx) { return TURKEY_X + (wx - world.meters) * PX; }
export function laneScreenY(lane) { return GROUND_TOP + lane * (GROUND_BOTTOM - GROUND_TOP); }

function drawSky(ctx, world) {
  const kitchen = world.meters >= 800;
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_TOP);
  if (kitchen) { grad.addColorStop(0, "#5b2a1a"); grad.addColorStop(1, "#a8542a"); }
  else { grad.addColorStop(0, "#f7b267"); grad.addColorStop(0.55, "#f4845f"); grad.addColorStop(1, "#f2cc8f"); }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (!kitchen) {
    ctx.fillStyle = "#fff3b0";
    ctx.beginPath(); ctx.arc(1120, 185, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.75)";
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 330 - world.meters * 2.2) % 1500 + 1500) % 1500 - 110;
      ctx.beginPath(); ctx.ellipse(cx, 150 + (i % 3) * 30, 74, 18, 0, 0, Math.PI * 2); ctx.fill();
    }
    // distant barn and farmhouse silhouettes
    const bx = ((900 - world.meters * 3) % 1600 + 1600) % 1600 - 200;
    ctx.fillStyle = "#8c3b2e";
    ctx.fillRect(bx, 250, 210, 180);
    ctx.beginPath(); ctx.moveTo(bx - 18, 250); ctx.lineTo(bx + 105, 185); ctx.lineTo(bx + 228, 250); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f4e3c1"; ctx.fillRect(bx + 78, 330, 54, 100);
    ctx.fillStyle = "#6d4c2f";
    for (let i = 0; i < 7; i++) {
      const tx = ((i * 260 - world.meters * 5) % 1500 + 1500) % 1500 - 80;
      ctx.fillRect(tx, 330, 12, 100);
      ctx.fillStyle = i % 2 ? "#d97706" : "#b45309";
      ctx.beginPath(); ctx.arc(tx + 6, 315, 44, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6d4c2f";
    }
  } else {
    ctx.fillStyle = "#7c3f21";
    for (let i = 0; i < 6; i++) {
      const wx = ((i * 280 - world.meters * 4) % 1500 + 1500) % 1500 - 100;
      ctx.fillRect(wx, 120, 180, 16);
      ctx.fillStyle = "#d9d9d9";
      ctx.beginPath(); ctx.arc(wx + 40, 170, 20, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx + 110, 175, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7c3f21";
    }
  }
}

function drawGround(ctx, world) {
  const kitchen = world.meters >= 800;
  ctx.fillStyle = kitchen ? "#e8dcc3" : "#7a9a3d";
  ctx.fillRect(0, GROUND_TOP, VIEW_W, VIEW_H - GROUND_TOP);
  if (kitchen) {
    ctx.fillStyle = "#dcc9a3";
    const off = -(world.meters * PX % 90);
    for (let x = off; x < VIEW_W; x += 90) for (let y = GROUND_TOP; y < VIEW_H; y += 45) {
      if (((Math.round(x / 90)) + (y / 45 | 0)) % 2 === 0) ctx.fillRect(x, y, 45, 45);
    }
    ctx.strokeStyle = "rgba(122,74,33,.35)"; ctx.lineWidth = 2;
    for (let x = off; x < VIEW_W; x += 45) { ctx.beginPath(); ctx.moveTo(x, GROUND_TOP); ctx.lineTo(x, VIEW_H); ctx.stroke(); }
  } else {
    ctx.fillStyle = "#9c6b30";
    ctx.fillRect(0, GROUND_TOP + 108, VIEW_W, 66);
    ctx.fillStyle = "#a87b3f";
    const off = -(world.meters * PX % 70);
    for (let x = off; x < VIEW_W; x += 70) ctx.fillRect(x, GROUND_TOP + 118, 34, 8);
    // fence posts rushing past
    ctx.fillStyle = "#7c4a21";
    const fo = -(world.meters * PX % 160);
    for (let x = fo; x < VIEW_W; x += 160) { ctx.fillRect(x, GROUND_TOP - 46, 12, 62); ctx.fillRect(x - 70, GROUND_TOP - 34, 160, 9); }
    // falling leaves
    ctx.fillStyle = "#e76f51";
    for (let i = 0; i < 16; i++) {
      const lx = ((i * 137 + world.time * 60) % 1300);
      const ly = 90 + ((i * 83 + world.time * 45) % 340);
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(world.time + i); ctx.fillRect(-6, -3, 12, 6); ctx.restore();
    }
  }
}

function drawCorn(ctx, x, y, golden, t) {
  const bob = Math.sin(t * 4 + x * 0.05) * 3;
  ctx.save(); ctx.translate(x, y + bob);
  ctx.fillStyle = golden ? "#ffd93b" : "#f4c542";
  ctx.beginPath(); ctx.ellipse(0, 0, 10, 17, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#c98f1b"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(4, 12); ctx.moveTo(2, -14); ctx.lineTo(9, 8); ctx.stroke();
  ctx.fillStyle = "#5da244";
  ctx.beginPath(); ctx.moveTo(-4, 12); ctx.quadraticCurveTo(-18, 22, -8, 26); ctx.quadraticCurveTo(-2, 20, 0, 14); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, 12); ctx.quadraticCurveTo(18, 20, 10, 27); ctx.quadraticCurveTo(3, 20, 1, 14); ctx.fill();
  if (golden) { ctx.fillStyle = "rgba(255,240,150,.9)"; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function drawKnife(ctx, x, y, spin) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
  ctx.fillStyle = "#e8edf2";
  ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(10, -4, 4, 12); ctx.lineTo(-5, 12); ctx.quadraticCurveTo(-7, -6, 0, -26); ctx.fill();
  ctx.fillStyle = "#5b3a1e"; ctx.fillRect(-4, 12, 8, 16);
  ctx.restore();
}

function drawTurkey(ctx, world) {
  const t = world.turkey;
  const x = TURKEY_X;
  const y = laneScreenY(t.y);
  const blink = t.invulnT > 0 && Math.floor(world.time * 14) % 2 === 0;
  ctx.save();
  ctx.translate(x, y);
  if (blink) ctx.globalAlpha = 0.45;
  if (t.dashT > 0) { ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.ellipse(-52, 6, 44, 10, 0, 0, Math.PI * 2); ctx.fill(); }
  // tail fan
  const fan = ["#b45309", "#d97706", "#92400e", "#e76f51", "#b45309"];
  for (let i = 0; i < 5; i++) {
    const a = -0.78 + i * 0.39 + Math.sin(t.runPhase * 0.6) * 0.05;
    ctx.save(); ctx.rotate(a);
    ctx.fillStyle = fan[i];
    ctx.beginPath(); ctx.ellipse(-34, 0, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // legs
  ctx.strokeStyle = "#e09f3e"; ctx.lineWidth = 5;
  const legSwing = Math.sin(t.runPhase) * 14;
  ctx.beginPath(); ctx.moveTo(-6, 20); ctx.lineTo(-6 + legSwing, 38); ctx.moveTo(12, 20); ctx.lineTo(12 - legSwing, 38); ctx.stroke();
  // body
  ctx.fillStyle = "#8a5a2b";
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 27, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#a9713a";
  ctx.beginPath(); ctx.ellipse(-4, 4, 26, 16, -0.2, 0, Math.PI * 2); ctx.fill();
  // wing
  ctx.fillStyle = "#6d4420";
  ctx.beginPath(); ctx.ellipse(-6, 2 + Math.sin(t.runPhase * 1.4) * 3, 20, 10, 0.4, 0, Math.PI * 2); ctx.fill();
  // neck and head
  ctx.fillStyle = "#8a5a2b";
  ctx.beginPath(); ctx.ellipse(34, -18, 13, 20, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c97b4a";
  ctx.beginPath(); ctx.arc(44, -34, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f4c542";
  ctx.beginPath(); ctx.moveTo(55, -36); ctx.lineTo(70, -31); ctx.lineTo(55, -27); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#d64541";
  ctx.beginPath(); ctx.ellipse(50, -20, 5, 9, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(47, -37, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(49, -37, 2.6, 0, Math.PI * 2); ctx.fill();
  if (t.hidden) text(ctx, "hidden…", 0, -58, 17, "#b6ff9e", "center");
  ctx.restore();
}

function drawFarmer(ctx, world) {
  const f = world.farmer;
  const x = TURKEY_X - f.gap;
  if (x < -160) return;
  const y = laneScreenY(f.y);
  ctx.save(); ctx.translate(x, y);
  const swing = Math.sin(f.runPhase) * 16;
  ctx.strokeStyle = "#33526e"; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(-6 + swing, 42); ctx.moveTo(10, 6); ctx.lineTo(10 - swing, 42); ctx.stroke();
  ctx.fillStyle = "#33526e"; ctx.fillRect(-16, -34, 34, 44);
  ctx.fillStyle = "#c0392b"; ctx.fillRect(-18, -58, 38, 28);
  ctx.strokeStyle = "#c0392b"; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(14, -46); ctx.lineTo(38, -30 + Math.sin(f.runPhase) * 5); ctx.stroke();
  // net in hand
  ctx.strokeStyle = "#8a6d3b"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(38, -30); ctx.lineTo(62, -44); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(74, -48, 16, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, -58); ctx.lineTo(88, -38); ctx.moveTo(88, -58); ctx.lineTo(60, -38); ctx.stroke();
  // head + hat
  ctx.fillStyle = "#f2c29b";
  ctx.beginPath(); ctx.arc(2, -72, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e9c46a";
  ctx.fillRect(-20, -84, 44, 7);
  ctx.fillRect(-11, -98, 24, 15);
  ctx.fillStyle = "#222";
  ctx.fillRect(-8, -74, 5, 3); ctx.fillRect(5, -74, 5, 3);
  ctx.strokeStyle = "#222"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(1, -60, 6, 0.2, Math.PI - 0.4); ctx.stroke();
  if (!f.spotted) text(ctx, "where'd it go?!", 6, -116, 17, "#fff", "center");
  else if (f.gap < 150) text(ctx, "GOTCHA SOON!", 6, -116, 17, "#ff8a7a", "center");
  ctx.restore();
}

function drawEntities(ctx, world) {
  for (const p of world.puddles) {
    const x = screenX(world, p.x + p.w / 2);
    if (x < -120 || x > VIEW_W + 120) continue;
    ctx.fillStyle = "rgba(70,130,180,.75)";
    ctx.beginPath(); ctx.ellipse(x, laneScreenY(p.lane) + 16, p.w * PX * 0.5, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (const h of world.hays) {
    const x = screenX(world, h.x + h.w / 2);
    if (x < -140 || x > VIEW_W + 140) continue;
    ctx.fillStyle = "#e9c46a";
    ctx.beginPath(); ctx.ellipse(x, laneScreenY(h.lane) + 6, h.w * PX * 0.5, 26, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = "#c9a13b"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 40, laneScreenY(h.lane) - 8); ctx.lineTo(x + 40, laneScreenY(h.lane) - 14); ctx.stroke();
    text(ctx, "HAY = HIDE", x, laneScreenY(h.lane) - 34, 13, "#fff7cc", "center");
  }
  for (const c of world.crates) {
    const x = screenX(world, c.x);
    if (x < -80 || x > VIEW_W + 80) continue;
    const y = laneScreenY(c.lane);
    ctx.fillStyle = c.hit ? "#8a6d3b" : "#b07d3c";
    ctx.fillRect(x - 22, y - 18, 44, 40);
    ctx.strokeStyle = "#6d4c2f"; ctx.lineWidth = 4;
    ctx.strokeRect(x - 22, y - 18, 44, 40);
    ctx.beginPath(); ctx.moveTo(x - 22, y - 18); ctx.lineTo(x + 22, y + 22); ctx.moveTo(x + 22, y - 18); ctx.lineTo(x - 22, y + 22); ctx.stroke();
  }
  for (const fl of world.flames) {
    const x = screenX(world, fl.x);
    if (x < -100 || x > VIEW_W + 100) continue;
    const y = laneScreenY(fl.lane);
    // little oven
    ctx.fillStyle = "#444";
    ctx.fillRect(x - 30, y + 8, 60, 34);
    ctx.fillStyle = "#222"; ctx.fillRect(x - 20, y + 16, 40, 18);
    if (fl.active) {
      for (let i = 0; i < 4; i++) {
        const fx = x - 18 + i * 12;
        const fh = 34 + Math.sin(world.time * 12 + i * 2) * 10;
        ctx.fillStyle = i % 2 ? "#ff7b33" : "#ffb347";
        ctx.beginPath(); ctx.moveTo(fx - 7, y + 10); ctx.quadraticCurveTo(fx, y + 10 - fh, fx + 7, y + 10); ctx.fill();
      }
    } else {
      text(ctx, "oven…", x, y - 6, 13, "#ffe8c2", "center");
    }
  }
  for (const c of world.corns) {
    if (c.taken) continue;
    const x = screenX(world, c.x);
    if (x < -60 || x > VIEW_W + 60) continue;
    drawCorn(ctx, x, laneScreenY(c.lane), c.golden, world.time);
  }
  for (const k of world.knives) drawKnife(ctx, screenX(world, k.x), laneScreenY(k.lane), k.spin);
  // escape gate
  const gx = screenX(world, GOAL_METERS);
  if (gx > -160 && gx < VIEW_W + 160) {
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(gx - 8, GROUND_TOP - 120, 16, 300);
    ctx.fillRect(gx + 90, GROUND_TOP - 120, 16, 300);
    ctx.fillStyle = "#43a047";
    ctx.fillRect(gx - 20, GROUND_TOP - 150, 148, 36);
    text(ctx, "ESCAPE!", gx + 54, GROUND_TOP - 124, 24, "#eaffea", "center");
  }
}

function drawHud(ctx, world, showBanner = true) {
  ctx.fillStyle = "rgba(43,22,8,.78)";
  roundRect(ctx, 14, 12, VIEW_W - 28, 74, 14); ctx.fill();
  text(ctx, `SCORE ${world.score}`, 32, 44, 26, "#ffe27a");
  text(ctx, `🌽 ${world.cornCount}`, 32, 74, 19, "#fff");
  const lives = "🦃".repeat(Math.max(0, world.lives));
  text(ctx, `LIVES ${lives}`, 250, 44, 21, "#ffb3a0");
  text(ctx, `${Math.floor(world.meters)}m / ${GOAL_METERS}m`, 250, 74, 19, "#fff");
  text(ctx, `TIME ${Math.max(0, Math.ceil(world.timeLeft))}`, 1030, 44, 26, world.timeLeft < 12 ? "#ff8a7a" : "#fff");
  text(ctx, world.stageName, 1030, 74, 19, "#ffd9a0");
  // progress bar
  ctx.fillStyle = "rgba(255,255,255,.25)";
  roundRect(ctx, 480, 30, 500, 16, 8); ctx.fill();
  ctx.fillStyle = "#7ddc5a";
  roundRect(ctx, 480, 30, 500 * Math.min(1, world.meters / GOAL_METERS), 16, 8); ctx.fill();
  text(ctx, "🏁 ESCAPE GATE", 730, 70, 15, "#eaffea", "center");
  // farmer proximity + stamina
  const danger = 1 - world.farmer.gap / 520;
  ctx.fillStyle = "rgba(255,255,255,.25)";
  roundRect(ctx, 480, 96, 220, 12, 6); ctx.fill();
  ctx.fillStyle = danger > 0.7 ? "#ff5347" : "#ffb347";
  roundRect(ctx, 480, 96, 220 * danger, 12, 6); ctx.fill();
  text(ctx, "FARMER", 480, 124, 13, "#fff");
  ctx.fillStyle = "rgba(255,255,255,.25)";
  roundRect(ctx, 760, 96, 220, 12, 6); ctx.fill();
  ctx.fillStyle = "#54c8ff";
  roundRect(ctx, 760, 96, 220 * world.turkey.stamina, 12, 6); ctx.fill();
  text(ctx, "DASH (SPACE)", 760, 124, 13, "#fff");
  if (world.farmer.gap < 150 && world.farmer.spotted) text(ctx, "⚠ FARMER CLOSE — DASH OR HIDE IN HAY!", 640, 150, 22, "#ff8a7a", "center");
  if (showBanner && world.bannerT > 0) {
    ctx.fillStyle = "rgba(43,22,8,.65)";
    roundRect(ctx, 290, 170, 700, 54, 14); ctx.fill();
    text(ctx, world.banner, 640, 207, 28, "#ffe27a", "center");
  }
  for (const p of world.popups) {
    text(ctx, p.text, screenX(world, p.wx), laneScreenY(p.lane) - p.t * 34, 20, p.color, "center");
  }
}

export function drawWorld(ctx, world, showBanner = true) {
  ctx.save();
  if (world.shake > 0) ctx.translate((Math.sin(world.time * 70) * world.shake) / 2, (Math.cos(world.time * 63) * world.shake) / 2);
  drawSky(ctx, world);
  drawGround(ctx, world);
  drawEntities(ctx, world);
  drawFarmer(ctx, world);
  drawTurkey(ctx, world);
  ctx.restore();
  drawHud(ctx, world, showBanner);
}

export function drawTitle(ctx, world) {
  drawSky(ctx, world);
  drawGround(ctx, world);
  drawEntities(ctx, world);
  drawFarmer(ctx, world);
  drawTurkey(ctx, world);
  ctx.fillStyle = "rgba(43,22,8,.62)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, "GOBBLE DASH", 640, 180, 84, "#ffe27a", "center", 900);
  text(ctx, "THANKSGIVING ESCAPE", 640, 232, 36, "#ffb347", "center", 800);
  text(ctx, "You are the turkey. Dinner is coming — RUN!", 640, 288, 26, "#fff", "center");
  ctx.fillStyle = "rgba(255,255,255,.92)";
  roundRect(ctx, 340, 320, 600, 196, 16); ctx.fill();
  text(ctx, "Arrows / WASD — steer      SPACE — dash", 640, 362, 22, "#5b3413", "center", 700, false);
  text(ctx, "Collect corn 🌽  Dodge knives & oven flames", 640, 398, 22, "#5b3413", "center", 700, false);
  text(ctx, "Hide in hay to shake the farmer", 640, 434, 22, "#5b3413", "center", 700, false);
  text(ctx, "Reach the ESCAPE GATE at 1200m!", 640, 470, 22, "#2e7d32", "center", 700, false);
  ctx.fillStyle = "#d97706";
  roundRect(ctx, 500, 548, 280, 62, 14); ctx.fill();
  text(ctx, "▶  START RUNNING", 640, 590, 26, "#fff", "center", 800);
  text(ctx, "Press ENTER or click START  •  M mute  •  P pause", 640, 648, 17, "#ffe8c2", "center");
}

export function drawEnd(ctx, world) {
  drawWorld(ctx, world, false);
  ctx.fillStyle = "rgba(43,22,8,.68)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const won = world.outcome === "escaped";
  text(ctx, won ? "🦃 YOU ESCAPED!" : "🍗 CAUGHT FOR DINNER!", 640, 220, 62, won ? "#b6ff9e" : "#ff8a7a", "center", 900);
  text(ctx, won ? "The turkey lives to gobble another day." : "The farmer wins this Thanksgiving…", 640, 272, 26, "#fff", "center");
  ctx.fillStyle = "rgba(255,255,255,.94)";
  roundRect(ctx, 390, 306, 500, 190, 16); ctx.fill();
  text(ctx, `FINAL SCORE  ${world.score}`, 640, 352, 28, "#5b3413", "center", 800, false);
  text(ctx, `Distance ${Math.floor(world.meters)}m   Corn 🌽 ${world.cornCount}`, 640, 392, 21, "#5b3413", "center", 700, false);
  text(ctx, `Near misses ${world.nearMisses}   Lives left ${Math.max(0, world.lives)}`, 640, 426, 21, "#5b3413", "center", 700, false);
  text(ctx, won ? "Try again: more corn, fewer scratches!" : "Tip: dash early, hide in hay, watch the knives.", 640, 466, 19, "#7a4a1e", "center", 700, false);
  ctx.fillStyle = "#d97706";
  roundRect(ctx, 500, 528, 280, 62, 14); ctx.fill();
  text(ctx, "↻  RUN AGAIN", 640, 570, 26, "#fff", "center", 800);
  text(ctx, "Press R or ENTER to restart", 640, 632, 17, "#ffe8c2", "center");
}

export function drawPaused(ctx, world) {
  drawWorld(ctx, world);
  ctx.fillStyle = "rgba(43,22,8,.6)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, "PAUSED", 640, 330, 56, "#ffe27a", "center", 900);
  text(ctx, "Press P to keep running", 640, 380, 24, "#fff", "center");
}
