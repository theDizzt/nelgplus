import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelContext, LevelDefinition } from "../core/types";
import { mountCounters } from "./level67Counters";

// Web-safe RGB cube: 00, 33, 66, 99, CC, FF; exclude only black.
const CHANNELS = ["00", "33", "66", "99", "cc", "ff"];
export const MATRIX_COLORS = CHANNELS.flatMap(r => CHANNELS.flatMap(g =>
  CHANNELS.map(b => `#${r}${g}${b}`))).filter(color => color !== "#000000");
const CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COLUMNS = 64;
const randomCell = (red: boolean) => ({
  text: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]!,
  color: red ? "#ff0000" : MATRIX_COLORS[Math.floor(Math.random() * MATRIX_COLORS.length)]!,
});

/** Returns a scene-lifetime cleanup; no timers or canvas drawing survive BACK. */
function startMatrix(canvas: HTMLCanvasElement, continuousRed: boolean, message = ""): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const width = 800, height = 600, rowHeight = 20;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  const mask = document.createElement("canvas");
  mask.width = width; mask.height = height;
  const ink = mask.getContext("2d")!;
  ink.font = `bold ${message === "67" ? 340 : 260}px monospace`;
  ink.textAlign = "center"; ink.textBaseline = "middle";
  ink.fillText(message, 400, 335);
  ink.lineWidth = 8;
  ink.strokeText(message, 400, 335);
  const pixels = ink.getImageData(0, 0, width, height).data;
  const streams = Array.from({ length: COLUMNS }, () => ({
    y: -Math.random() * height,
    speed: 75 + Math.random() * 125,
    distance: 0,
    // Two extra rows cover both edges throughout each row's downward movement.
    cells: Array.from({ length: continuousRed ? Math.ceil(height / rowHeight) + 2 : 8 + Math.floor(Math.random() * 18) }, () => randomCell(continuousRed)),
  }));
  let frame = 0;
  let previous = performance.now();
  const draw = (now: number) => {
    const dt = Math.min((now - previous) / 1000, .05);
    previous = now;
    ctx.clearRect(0, 0, width, height);
    ctx.font = '18px "NELG Courier", Courier, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    streams.forEach((stream, column) => {
      const movement = dt * stream.speed;
      stream.y += movement;
      stream.distance += movement;
      while (stream.distance >= rowHeight) {
        stream.distance -= rowHeight;
        stream.cells.pop();
        stream.cells.unshift(randomCell(continuousRed));
      }
      if (!continuousRed && stream.y - stream.cells.length * rowHeight > height) {
        stream.y = -rowHeight - Math.random() * 160;
        stream.speed = 75 + Math.random() * 125;
      }
      stream.cells.forEach((cell, row) => {
        const y = continuousRed ? (row - 1) * rowHeight + stream.distance : stream.y - row * rowHeight;
        if (y < -rowHeight || y > height) return;
        const x = (column + .5) * width / COLUMNS;
        const inMask = message && pixels[(Math.min(599, Math.max(0, Math.floor(y + 9))) * width + Math.floor(x)) * 4 + 3]! > 0;
        ctx.fillStyle = message === "67" ? (inMask ? "#bbffbb" : "#004d12")
          : message ? (inMask ? "#ff5555" : "#440000") : cell.color;
        ctx.fillText(message === "ZER0" && inMask ? "0" : message === "ZER0" && cell.text === "0" ? "O" : cell.text, x, y);
      });
    });
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(frame);
}

export const level67: LevelDefinition = {
  number: 67,
  title: "Annihilate",
  scenes: [
    { id: "1", label: "Scene 1 - Zero" },
    { id: "2", label: "Scene 2 - One" },
    { id: "2-optimal", label: "Scene 2 - One (Correct / ZER0)" },
    { id: "3", label: "Scene 3 - 67" },
  ],
  mount(context) {
    const { screen, initialScene } = context;
    let events = new AbortController();
    let stopMatrix = () => {};
    let stopCounters = () => {};
    const listen: LevelContext["listen"] = (target, type, callback, options) => {
      target.addEventListener(type, callback as EventListener, { ...options, signal: events.signal });
    };
    const show = (scene: number, optimal = false) => {
      stopMatrix();
      stopCounters();
      events.abort();
      events = new AbortController();
      screen.className = `level-screen level-67 level-67--${scene}`;
      screen.dataset.scene = String(scene);
      screen.dataset.optimal = String(optimal);
      screen.setAttribute("aria-label", `Level 67: Annihilate, Scene ${scene}`);
      screen.innerHTML = `
        <canvas class="level-67__matrix" aria-hidden="true"></canvas>
        <header class="level-heading"><div class="level-heading__number">Level 67</div><h1>Annihilate</h1></header>
        ${scene === 1 ? `<form class="level-08__form level-67__form" autocomplete="off">
          <input class="nelg-password-input" type="text" name="nelg-level-sixty-seven-answer" data-allow-select
            data-form-type="other" data-lpignore="true" data-1p-ignore="true" autocomplete="off"
            autocapitalize="off" aria-autocomplete="none" aria-label="Password" spellcheck="false">
          <button type="submit">GO</button></form>` : ""}
        ${scene !== 1 ? '<button type="button" class="level-67__back">BACK</button>' : ""}`;
      stopMatrix = startMatrix(screen.querySelector<HTMLCanvasElement>("canvas")!, scene !== 1, scene === 3 ? "67" : optimal ? "ZER0" : "");
      if (scene === 1) {
        const form = screen.querySelector<HTMLFormElement>("form")!;
        const input = form.querySelector("input")!;
        attachStarMaskedInput(input, listen);
        // Password, completion and scene-entry rules will be specified later.
        listen(form, "submit", event => event.preventDefault());
        input.focus();
        stopCounters = mountCounters(context, listen, show);
      } else {
        listen(screen.querySelector<HTMLButtonElement>(".level-67__back")!, "click", () => show(1));
      }
    };
    const requested = Number(initialScene);
    if (initialScene === "2-optimal") show(2, true);
    else show(Number.isInteger(requested) && requested >= 1 && requested <= 3 ? requested : 1);
    return () => { stopMatrix(); stopCounters(); events.abort(); };
  },
};
