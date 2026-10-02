import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelContext, LevelDefinition } from "../core/types";

// Web-safe RGB cube: 00, 33, 66, 99, CC, FF; exclude only black.
const CHANNELS = ["00", "33", "66", "99", "cc", "ff"];
export const MATRIX_COLORS = CHANNELS.flatMap(r => CHANNELS.flatMap(g =>
  CHANNELS.map(b => `#${r}${g}${b}`))).filter(color => color !== "#000000");
const CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COLUMNS = 64;
const randomCell = () => ({
  text: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]!,
  color: MATRIX_COLORS[Math.floor(Math.random() * MATRIX_COLORS.length)]!,
});

/** Returns a scene-lifetime cleanup; no timers or canvas drawing survive BACK. */
function startMatrix(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const width = 800, height = 600, rowHeight = 20;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  const streams = Array.from({ length: COLUMNS }, () => ({
    y: -Math.random() * height,
    speed: 75 + Math.random() * 125,
    distance: 0,
    cells: Array.from({ length: 8 + Math.floor(Math.random() * 18) }, randomCell),
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
        stream.cells.unshift(randomCell());
      }
      if (stream.y - stream.cells.length * rowHeight > height) {
        stream.y = -rowHeight - Math.random() * 160;
        stream.speed = 75 + Math.random() * 125;
      }
      stream.cells.forEach((cell, row) => {
        const y = stream.y - row * rowHeight;
        if (y < -rowHeight || y > height) return;
        ctx.fillStyle = cell.color;
        ctx.fillText(cell.text, (column + .5) * width / COLUMNS, y);
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
    { id: "3", label: "Scene 3" },
  ],
  mount({ screen, initialScene }) {
    let events = new AbortController();
    let stopMatrix = () => {};
    const listen: LevelContext["listen"] = (target, type, callback, options) => {
      target.addEventListener(type, callback as EventListener, { ...options, signal: events.signal });
    };
    const show = (scene: number) => {
      stopMatrix();
      events.abort();
      events = new AbortController();
      screen.className = `level-screen level-67 level-67--${scene}`;
      screen.dataset.scene = String(scene);
      screen.setAttribute("aria-label", `Level 67: Annihilate, Scene ${scene}`);
      screen.innerHTML = `
        ${scene === 1 ? `<img class="level-67__decoration" src="${assetUrl("images/level67bg.png")}" alt="" draggable="false">` : ""}
        ${scene === 2 ? '<canvas class="level-67__matrix" aria-hidden="true"></canvas>' : ""}
        <header class="level-heading"><div class="level-heading__number">Level 67</div><h1>Annihilate</h1></header>
        ${scene === 1 ? `<form class="level-08__form level-67__form" autocomplete="off">
          <input class="nelg-password-input" type="text" name="nelg-level-sixty-seven-answer" data-allow-select
            data-form-type="other" data-lpignore="true" data-1p-ignore="true" autocomplete="off"
            autocapitalize="off" aria-autocomplete="none" aria-label="Password" spellcheck="false">
          <button type="submit">GO</button></form>` : ""}
        ${scene === 2 ? '<button type="button" class="level-67__back">BACK</button>' : ""}`;
      if (scene === 1) {
        const form = screen.querySelector<HTMLFormElement>("form")!;
        const input = form.querySelector("input")!;
        attachStarMaskedInput(input, listen);
        // Password, completion and scene-entry rules will be specified later.
        listen(form, "submit", event => event.preventDefault());
        input.focus();
      } else if (scene === 2) {
        stopMatrix = startMatrix(screen.querySelector<HTMLCanvasElement>("canvas")!);
        listen(screen.querySelector<HTMLButtonElement>(".level-67__back")!, "click", () => show(1));
      }
      // Scene 3 is intentionally reserved until its content is specified.
    };
    const requested = Number(initialScene);
    show(Number.isInteger(requested) && requested >= 1 && requested <= 3 ? requested : 1);
    return () => { stopMatrix(); events.abort(); };
  },
};
