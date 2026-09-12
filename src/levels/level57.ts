import type { LevelDefinition } from "../core/types";
import { clientPointToLocal } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { mountLevel57NoWay } from "./level57NoWay";

// Grid coordinates from the reference: 400px rooms, separated by 100px.
const ROOMS = [
  [3, 0], [6, 0],
  [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
  [3, 2], [6, 2], [7, 2],
  [0, 3], [1, 3], [2, 3], [3, 3],
  [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],
  [6, 4], [9, 4], [11, 4],
  [10, 5], [11, 5], [11, 6],
] as const;
const QUESTIONS = new Set(["7,2", "9,4", "10,5"]);
const BLUE_ROOMS = new Set(["6,1", "8,3", "11,6", ...QUESTIONS]);
const ARROWS: Readonly<Record<string, string>> = {
  "3,0": "down", "6,0": "down", "3,1": "right",
  "6,1": "diagonal", "0,3": "right", "6,3": "right", "11,3": "down",
};

function boardMarkup(): string {
  const connected = new Set(ROOMS.map(([x, y]) => `${x},${y}`).filter(key => !QUESTIONS.has(key)));
  const bridges = ROOMS.flatMap(([x, y]) => {
    if (!connected.has(`${x},${y}`)) return [];
    const result: string[] = [];
    if (connected.has(`${x + 1},${y}`)) result.push(`<rect x="${x * 500 + 400}" y="${y * 500 + 100}" width="100" height="200" />`);
    if (connected.has(`${x},${y + 1}`)) result.push(`<rect x="${x * 500 + 100}" y="${y * 500 + 400}" width="200" height="100" />`);
    return result;
  }).join("");
  const rooms = ROOMS.map(([x, y]) => {
    const key = `${x},${y}`;
    const arrow = ARROWS[key];
    const rotation = arrow === "down" ? 90 : arrow === "diagonal" ? 45 : 0;
    return `<g transform="translate(${x * 500} ${y * 500})">
      <rect width="400" height="400" fill="${BLUE_ROOMS.has(key) ? "#609fff" : "#a6a6a6"}" />
      ${QUESTIONS.has(key) ? '<text x="200" y="290" text-anchor="middle" font-size="300">?</text>' : ""}
      ${key === "6,1" ? '<text x="90" y="150" font-size="80">PW</text>' : ""}
      ${arrow ? `<path transform="translate(${arrow === "diagonal" ? "270 260" : `210 ${arrow === "right" ? 295 : 210}`}) rotate(${rotation}) scale(${arrow === "diagonal" ? 0.7 : 1})" d="M-130 -15 H45 V-48 L140 0 45 48 V15 H-130 Z" />` : ""}
    </g>`;
  }).join("");
  return `<svg class="level-57__board" width="5900" height="3400" viewBox="0 0 5900 3400"
    aria-label="Connected gray and blue squares, arrows, PW and question marks">
    <g fill="#555">${bridges}</g><g fill="#000">${rooms}</g>
  </svg>`;
}

export const level57: LevelDefinition = {
  number: 57,
  title: "Words",
  scenes: [
    { id: "A", label: "Level 57A - Words" },
    { id: "B", label: "Level 57B - NO WAY" },
  ],
  mount(context) {
    if (context.initialScene === "B") return mountLevel57NoWay(context);
    const { screen, listen, goToLevel } = context;
    screen.className = "level-screen level-57";
    screen.dataset.scene = "A";
    screen.setAttribute("aria-label", "Level 57: Words");
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 57</div>
        <h1>Words</h1>
      </header>
      <p class="level-57__credit">Highstrike's masterpiece!!!</p>
      <div class="level-57__viewport" data-allow-drag tabindex="0" aria-label="Draggable word puzzle. Use arrow keys to move the puzzle.">
        ${boardMarkup()}
      </div>
      <form class="level-08__form level-57__form" autocomplete="off">
        <input class="nelg-password-input" id="level-57-answer" name="nelg-level-fifty-seven-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="24" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <button type="submit">GO</button>
      </form>
    `;
    const viewport = screen.querySelector<HTMLElement>(".level-57__viewport")!;
    const board = screen.querySelector<SVGSVGElement>(".level-57__board")!;
    const form = screen.querySelector<HTMLFormElement>(".level-57__form")!;
    const input = screen.querySelector<HTMLInputElement>("#level-57-answer")!;
    const masked = attachStarMaskedInput(input, listen);
    let x = -2800;
    let y = -380;
    let drag: { id: number; x: number; y: number } | undefined;
    let solved = false;
    const render = () => {
      x = Math.max(80 - 5900, Math.min(viewport.clientWidth - 80, x));
      y = Math.max(80 - 3400, Math.min(viewport.clientHeight - 80, y));
      board.style.transform = `translate(${x}px, ${y}px)`;
    };
    listen(viewport, "pointerdown", event => {
      if (event.button !== 0 || drag) return;
      event.preventDefault();
      const point = clientPointToLocal(viewport, event.clientX, event.clientY);
      drag = { id: event.pointerId, x: point.x, y: point.y };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add("is-dragging");
      viewport.focus({ preventScroll: true });
    });
    listen(viewport, "pointermove", event => {
      if (!drag || drag.id !== event.pointerId) return;
      const point = clientPointToLocal(viewport, event.clientX, event.clientY);
      x += point.x - drag.x;
      y += point.y - drag.y;
      drag.x = point.x;
      drag.y = point.y;
      render();
    });
    const stopDrag = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) return;
      drag = undefined;
      viewport.classList.remove("is-dragging");
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    };
    listen(viewport, "pointerup", stopDrag);
    listen(viewport, "pointercancel", stopDrag);
    listen(viewport, "lostpointercapture", stopDrag);
    listen(viewport, "keydown", event => {
      const steps: Record<string, [number, number]> = {
        ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80],
      };
      const step = steps[event.key];
      if (!step) return;
      event.preventDefault();
      x += step[0]; y += step[1]; render();
    });
    listen(input, "keydown", event => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", event => {
      event.preventDefault();
      if (solved) return;
      const answer = masked.getValue().trim().toLowerCase();
      if (answer === "endure") {
        solved = true;
        goToLevel(58, "A");
      } else input.focus();
    });
    render();
  },
};
