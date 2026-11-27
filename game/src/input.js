// Keyboard, mouse-drag and touch-button input merged into one steering state.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pointer = null;
    this.touch = { up: false, down: false, left: false, right: false, dash: false };
    this.pressed = new Set();
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener("pointerdown", (e) => { this.pointer = this.toGame(e, canvas); this.pressed.add("pointer"); });
    canvas.addEventListener("pointermove", (e) => { if (this.pointer) this.pointer = this.toGame(e, canvas); });
    window.addEventListener("pointerup", () => { this.pointer = null; });
    this.bindButton("btn-up", "up");
    this.bindButton("btn-down", "down");
    this.bindButton("btn-left", "left");
    this.bindButton("btn-right", "right");
    this.bindButton("btn-dash", "dash");
  }
  toGame(e, canvas) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * canvas.width, y: (e.clientY - r.top) / r.height * canvas.height };
  }
  bindButton(id, name) {
    const el = document.getElementById(id);
    if (!el) return;
    const on = (e) => { e.preventDefault(); this.touch[name] = true; this.pressed.add(name); };
    const off = () => { this.touch[name] = false; };
    el.addEventListener("pointerdown", on);
    el.addEventListener("pointerup", off);
    el.addEventListener("pointerleave", off);
    el.addEventListener("pointercancel", off);
  }
  axis() {
    let x = 0, y = 0;
    if (this.keys.has("arrowleft") || this.keys.has("a") || this.touch.left) x -= 1;
    if (this.keys.has("arrowright") || this.keys.has("d") || this.touch.right) x += 1;
    if (this.keys.has("arrowup") || this.keys.has("w") || this.touch.up) y -= 1;
    if (this.keys.has("arrowdown") || this.keys.has("s") || this.touch.down) y += 1;
    return { x, y };
  }
  dashHeld() { return this.keys.has(" ") || this.keys.has("shift") || this.touch.dash; }
  wasPressed(...names) { return names.some((n) => this.pressed.has(n)); }
  endFrame() { this.pressed.clear(); }
}
