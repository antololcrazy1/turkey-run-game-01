// World simulation: turkey, chasing farmer, corn, knives, oven flames and hay cover.
import { GOAL_METERS, GROUND_TOP, GROUND_BOTTOM, SCORE, START_LIVES, TIME_LIMIT, stageAt } from "./config.js";
import { makeRng } from "./random.js";

const PX_PER_METER = 14;

export class World {
  constructor(seed = 1) { this.reset(seed); }
  reset(seed = 1) {
    this.rng = makeRng(seed * 7919 + 13);
    this.time = 0;
    this.timeLeft = TIME_LIMIT;
    this.score = 0;
    this.cornCount = 0;
    this.lives = START_LIVES;
    this.meters = 0;
    this.stageName = "FARMYARD";
    this.banner = "";
    this.bannerT = 0;
    this.turkey = { x: 40, y: 0.55, vx: 0, runPhase: 0, dashT: 0, stamina: 1, invulnT: 0, boostT: 0, hidden: false };
    this.farmer = { gap: 260, y: 0.55, searchT: 0, throwT: 2.2, runPhase: 0, spotted: true };
    this.knives = [];
    this.corns = [];
    this.crates = [];
    this.puddles = [];
    this.hays = [];
    this.flames = [];
    this.popups = [];
    this.spawnX = 18;
    this.shake = 0;
    this.events = [];
    this.outcome = null;
    this.nearMisses = 0;
  }
  laneY(lane) { return GROUND_TOP + lane * (GROUND_BOTTOM - GROUND_TOP); }
  stage() { return stageAt(this.meters); }
  emit(name, data = {}) { this.events.push({ name, ...data }); }
  popup(text, wx, lane, color = "#ffe27a") { this.popups.push({ text, wx, lane, t: 0, color }); }

  ensureSpawns() {
    while (this.spawnX < this.meters + 110) {
      const x = this.spawnX;
      const roll = this.rng.next();
      if (roll < 0.44) {
        const lane = this.rng.range(0.08, 0.92);
        const n = this.rng.int(3, 5);
        for (let i = 0; i < n; i++) this.corns.push({ x: x + i * 2.2, lane: Math.min(0.95, Math.max(0.05, lane + Math.sin(i) * 0.08)), golden: false, taken: false });
      } else if (roll < 0.42) {
        this.corns.push({ x, lane: this.rng.range(0.1, 0.9), golden: true, taken: false });
      } else if (roll < 0.58) {
        this.crates.push({ x, lane: this.rng.range(0.1, 0.9), hit: false });
      } else if (roll < 0.72) {
        this.puddles.push({ x, lane: this.rng.range(0.1, 0.9), w: this.rng.range(4, 7) });
      } else if (roll < 0.86) {
        this.hays.push({ x, lane: this.rng.range(0.12, 0.88), w: 7 });
      } else if (x > 800) {
        this.flames.push({ x, lane: this.rng.range(0.08, 0.92), phase: this.rng.range(0, 3), hit: false });
      } else {
        this.corns.push({ x, lane: this.rng.range(0.1, 0.9), golden: false, taken: false });
      }
      this.spawnX += this.rng.range(9, 16);
    }
    const cut = this.meters - 30;
    this.corns = this.corns.filter((c) => !c.taken && c.x > cut);
    this.crates = this.crates.filter((c) => c.x > cut);
    this.puddles = this.puddles.filter((c) => c.x + c.w > cut);
    this.hays = this.hays.filter((c) => c.x + c.w > cut);
    this.flames = this.flames.filter((c) => c.x > cut);
  }

  update(dt, input) {
    if (this.outcome) return;
    this.time += dt;
    this.timeLeft -= dt;
    const stage = this.stage();
    if (stage.name !== this.stageName) {
      this.stageName = stage.name;
      this.banner = stage.banner;
      this.bannerT = 2.6;
      if (this.lives < START_LIVES) {
        this.lives += 1;
        this.popup("STAGE BONUS +1 LIFE", this.meters + 4, 0.3, "#b6ff9e");
      }
      this.emit("stage");
    }
    if (this.bannerT > 0) this.bannerT -= dt;
    const t = this.turkey;
    const axis = input.axis();
    let steerY = axis.y;
    let speedBoost = axis.x * 3.2;
    if (input.pointer) {
      const ty = this.laneY(t.y);
      steerY = Math.max(-1, Math.min(1, (input.pointer.y - ty) / 90));
      speedBoost = Math.max(-3, Math.min(3.4, (input.pointer.x - 360) / 160));
    }
    t.y = Math.max(0.04, Math.min(0.96, t.y + steerY * dt * 1.15));
    let speed = 8.6 + speedBoost + (t.boostT > 0 ? 2.6 : 0);
    const dashing = input.dashHeld() && t.stamina > 0.05;
    if (dashing) {
      speed += 6.5;
      t.stamina = Math.max(0, t.stamina - dt * 0.55);
      if (t.dashT <= 0) this.emit("dash");
      t.dashT = 0.18;
    } else {
      t.stamina = Math.min(1, t.stamina + dt * 0.3);
      t.dashT = Math.max(0, t.dashT - dt);
    }
    if (t.boostT > 0) t.boostT -= dt;
    if (t.invulnT > 0) t.invulnT -= dt;
    t.hidden = this.hays.some((h) => this.meters >= h.x && this.meters <= h.x + h.w && Math.abs(t.y - h.lane) < 0.2) && !dashing;
    const slowed = this.puddles.some((p) => this.meters >= p.x && this.meters <= p.x + p.w && Math.abs(t.y - p.lane) < 0.14);
    if (slowed) speed *= 0.45;
    const before = this.meters;
    this.meters += speed * dt;
    this.score += Math.floor(this.meters) - Math.floor(before);
    t.runPhase += dt * (6 + speed);
    this.ensureSpawns();
    this.updateFarmer(dt, speed, stage);
    this.updateHazards(dt);
    this.updatePickups();
    this.popups = this.popups.filter((p) => (p.t += dt) < 1.1);
    this.shake = Math.max(0, this.shake - dt * 26);
    if (this.meters >= GOAL_METERS) {
      this.score += SCORE.winBonus + Math.round(this.timeLeft) * 2 + this.lives * 40;
      this.outcome = "escaped";
      this.emit("win");
    } else if (this.lives <= 0) {
      this.outcome = "caught";
      this.emit("lose");
    } else if (this.timeLeft <= 0) {
      this.outcome = "caught";
      this.emit("lose");
    }
  }

  updateFarmer(dt, turkeySpeed, stage) {
    const f = this.farmer;
    const t = this.turkey;
    f.runPhase += dt * 9;
    f.spotted = !t.hidden;
    if (t.hidden) {
      f.searchT += dt;
      f.gap += dt * 26;
      if (f.searchT > 0.4 && f.searchT < 0.5) this.popup("HIDDEN!", this.meters, t.y - 0.16, "#b6ff9e");
    } else {
      f.searchT = 0;
      const rubber = f.gap > 340 ? 14 : f.gap < 150 ? -10 : 0;
      const farmerMeters = (stage.farmerSpeed + rubber) / PX_PER_METER;
      f.gap += (turkeySpeed - farmerMeters) * PX_PER_METER * dt;
      f.y += Math.max(-1, Math.min(1, (t.y - f.y) * 2.2)) * dt * 0.9;
    }
    f.gap = Math.max(0, Math.min(520, f.gap));
    f.throwT -= dt;
    if (f.throwT <= 0 && f.spotted && f.gap < 430) {
      f.throwT = stage.knifeEvery * this.rng.range(0.8, 1.25);
      const lead = this.rng.range(-0.06, 0.1);
      this.knives.push({ x: this.meters - f.gap / PX_PER_METER + 3, lane: Math.max(0.03, Math.min(0.97, t.y + lead)), vx: 17, spin: 0, passed: false });
      this.emit("knife");
    }
    if (f.gap <= 26 && Math.abs(f.y - t.y) < 0.17 && t.invulnT <= 0) {
      this.hurt("CAUGHT!");
      f.gap = 230;
    }
  }

  updateHazards(dt) {
    const t = this.turkey;
    for (const k of this.knives) {
      k.x += k.vx * dt;
      k.spin += dt * 14;
      if (!k.passed && k.x > this.meters + 0.6) {
        k.passed = true;
        if (Math.abs(k.lane - t.y) < 0.22 && Math.abs(k.lane - t.y) >= 0.1) {
          this.score += SCORE.nearMiss;
          this.nearMisses += 1;
          this.popup("NEAR MISS +15", this.meters + 2, t.y - 0.14, "#9ee7ff");
          this.emit("nearMiss");
        }
      }
      if (Math.abs(k.x - this.meters) < 0.9 && Math.abs(k.lane - t.y) < 0.085 && t.invulnT <= 0) {
        k.x = -999;
        this.hurt("OUCH! KNIFE!");
      }
    }
    this.knives = this.knives.filter((k) => k.x > this.meters - 40 && k.x < this.meters + 40);
    for (const c of this.crates) {
      if (!c.hit && Math.abs(c.x - this.meters) < 1 && Math.abs(c.lane - t.y) < 0.11 && t.invulnT <= 0) {
        c.hit = true;
        this.hurt("CRATE CRASH!");
      }
    }
    for (const fl of this.flames) {
      const active = Math.sin(this.time * 2.2 + fl.phase) > -0.15;
      fl.active = active;
      if (active && !fl.hit && Math.abs(fl.x - this.meters) < 1.1 && Math.abs(fl.lane - t.y) < 0.13 && t.invulnT <= 0) {
        fl.hit = true;
        this.hurt("OVEN FLAMES!");
      }
    }
  }

  updatePickups() {
    const t = this.turkey;
    for (const c of this.corns) {
      if (!c.taken && Math.abs(c.x - this.meters) < 1.5 && Math.abs(c.lane - t.y) < 0.19) {
        c.taken = true;
        this.cornCount += 1;
        if (c.golden) {
          this.score += SCORE.golden;
          t.boostT = 2.4;
          this.popup("GOLDEN CORN +50", c.x, c.lane - 0.14, "#ffd93b");
          this.emit("golden");
        } else {
          this.score += SCORE.corn;
          this.popup("+10", c.x, c.lane - 0.12);
          this.emit("corn");
        }
      }
    }
  }

  hurt(label) {
    this.lives -= 1;
    this.turkey.invulnT = 1.6;
    this.shake = 10;
    this.popup(label, this.meters + 2, this.turkey.y - 0.18, "#ff8a7a");
    this.emit("hit");
  }

  drainEvents() {
    const out = this.events;
    this.events = [];
    return out;
  }
}
