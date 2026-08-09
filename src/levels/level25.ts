import type { LevelDefinition } from "../core/types";

type Scene = "puzzle" | "wall" | "escape" | "order" | "box";

const MAZE_SHAPE = "M41 27 H230 V88 H108 V275 H466 V334 H500 V239 H149 V115 H213 V186 H557 V386 H407 V419 H590 V27 H647 V171 H709 V27 H767 V230 H647 V469 H335 V319 H271 V507 H697 V275 H767 V564 H41 V382 H186 V449 H106 V507 H205 V319 H41 Z";

const PATROL_BOX_HALF_SIZE = 21;

const BRANCHES = [
  { path: "M220 57 H75 V250", x: 185, y: 57, letter: "h", speed: 2700, phase: 0.12 },
  { path: "M181 151 V211 H530 V350", x: 181, y: 151, letter: "i", speed: 2500, phase: 0.42 },
  { path: "M738 58 V200 H618 V390", x: 738, y: 58, letter: "d", speed: 2350, phase: 0.7 },
  { path: "M165 412 H75 V535 H250", x: 155, y: 412, letter: "d", speed: 2750, phase: 0.28 },
  { path: "M618 58 V390", x: 618, y: 58, letter: "e", speed: 2450, phase: 0.58 },
  { path: "M735 310 V535 H515", x: 735, y: 310, letter: "n", speed: 2600, phase: 0.86 },
] as const;

const ERROR_CONTENT: Record<Exclude<Scene, "puzzle">, { message: string; headingColor: string }> = {
  wall: { message: "THE MOUSE HIT A WALL AND SHATTERED INTO 2,048 PIECES!", headingColor: "#000" },
  escape: { message: "DO NOT CHEAT.", headingColor: "#000" },
  order: { message: "CONGRATULATIONS! YOU HAVE THE INTELLIGENCE OF SOMEONE WHO CANNOT COUNT!!!!!!!", headingColor: "#000" },
  box: { message: "THE MOUSE COLLIDED WITH A BOX AND WAS DAMAGED BEYOND RECOGNITION.", headingColor: "#00ff00" },
};

function dicePips(value: number): string {
  return Array.from({ length: value }, () => "<i></i>").join("");
}

export const level25: LevelDefinition = {
  number: 25,
  title: "Trial I",
  mount({ screen, complete, listen, interval }) {
    let scene: Scene = "puzzle";
    let armed = false;
    let awaitingPassword = false;
    let expectedButton = 1;
    let passwordBuffer = "";
    let lastPointer: { x: number; y: number } | undefined;
    let hitPaths: SVGPathElement[] = [];
    let patrolPaths: SVGPathElement[] = [];
    let boxes: HTMLElement[] = [];
    let puzzleStartedAt = performance.now();
    let boxCollisionGraceUntil = performance.now();

    const renderPuzzle = (startArmed = false) => {
      scene = "puzzle";
      armed = startArmed;
      awaitingPassword = false;
      expectedButton = 1;
      passwordBuffer = "";
      lastPointer = undefined;
      puzzleStartedAt = performance.now();
      boxCollisionGraceUntil = puzzleStartedAt + 650;

      const patrolRoutes = BRANCHES.map(
        ({ path }, index) => `<path class="level-25__patrol-path" data-patrol-route="${index}" d="${path}" />`,
      ).join("");
      const buttons = BRANCHES.map(
        ({ x, y }, index) => `
          <button class="level-25__dice level-25__dice--${index + 1}" data-dice="${index + 1}"
            type="button" style="left:${x - 21}px;top:${y - 21}px" aria-label="Dice button ${index + 1}">
            ${dicePips(index + 1)}
          </button>
        `,
      ).join("");
      const patrolBoxes = BRANCHES.map(
        ({ letter }, index) => `<span class="level-25__patrol-box" data-box="${index}" aria-hidden="true">${letter}</span>`,
      ).join("");

      screen.className = "level-screen level-25 level-25--puzzle";
      screen.innerHTML = `
        <header class="level-heading level-25__heading">
          <div class="level-heading__number">Level 25</div>
          <h1>Trial I</h1>
        </header>
        <svg class="level-25__maze" viewBox="0 0 800 600" aria-label="Six-way mouse maze">
          <defs>
            <linearGradient id="level-25-maze-rainbow" gradientUnits="userSpaceOnUse" x1="65" y1="0" x2="735" y2="0">
              <stop offset="0" stop-color="#ff1b00" />
              <stop offset=".16" stop-color="#fff000" />
              <stop offset=".32" stop-color="#25ff00" />
              <stop offset=".49" stop-color="#00f5ff" />
              <stop offset=".67" stop-color="#0051ff" />
              <stop offset=".84" stop-color="#d000ff" />
              <stop offset="1" stop-color="#ff006a" />
            </linearGradient>
          </defs>
          <path class="level-25__maze-shape" d="${MAZE_SHAPE}" />
          <path class="level-25__route-hit" data-route="0" d="${MAZE_SHAPE}" />
          ${patrolRoutes}
        </svg>
        <div class="level-25__dice-buttons">${buttons}</div>
        <div class="level-25__patrol-boxes">${patrolBoxes}</div>
        <p class="level-25__password-prompt" role="status" hidden>TYPE THE PASSWORD ON YOUR KEYBOARD!</p>
      `;

      hitPaths = [...screen.querySelectorAll<SVGPathElement>(".level-25__route-hit")];
      patrolPaths = [...screen.querySelectorAll<SVGPathElement>(".level-25__patrol-path")];
      boxes = [...screen.querySelectorAll<HTMLElement>(".level-25__patrol-box")];
    };

    const showError = (errorScene: Exclude<Scene, "puzzle">) => {
      scene = errorScene;
      armed = false;
      lastPointer = undefined;
      const { message, headingColor } = ERROR_CONTENT[errorScene];
      screen.className = `level-screen level-25 level-25--error level-25--error-${errorScene}`;
      screen.style.setProperty("--level-25-error-heading", headingColor);
      screen.innerHTML = `
        <header class="level-heading level-25__heading level-25__heading--error">
          <div class="level-heading__number">Level 25</div>
          <h1>Trial I</h1>
        </header>
        <p class="level-25__error-message" role="alert">${message}</p>
        <button class="level-25__try-again" type="button">Try Again</button>
      `;
      hitPaths = [];
      patrolPaths = [];
      boxes = [];
    };

    const pointerInLane = (x: number, y: number) => {
      const point = new DOMPoint(x, y);
      return hitPaths.some((path) => path.isPointInFill(point));
    };

    renderPuzzle();

    listen(screen, "pointermove", (event) => {
      if (scene !== "puzzle" || awaitingPassword) return;
      const bounds = screen.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 800;
      const y = ((event.clientY - bounds.top) / bounds.height) * 600;
      lastPointer = { x: event.clientX, y: event.clientY };

      if (!armed) {
        if (pointerInLane(x, y)) armed = true;
        return;
      }
      if (!pointerInLane(x, y)) showError("wall");
    });

    listen(screen, "pointerleave", () => {
      if (scene === "puzzle" && armed && !awaitingPassword) showError("escape");
    });

    listen(window, "blur", () => {
      if (scene === "puzzle" && armed && !awaitingPassword) showError("escape");
    });

    listen(document, "visibilitychange" as keyof HTMLElementEventMap, () => {
      if (document.hidden && scene === "puzzle" && armed && !awaitingPassword) showError("escape");
    });

    listen(screen, "click", (event) => {
      const retry = (event.target as Element).closest<HTMLButtonElement>(".level-25__try-again");
      if (retry) {
        renderPuzzle(false);
        return;
      }

      const button = (event.target as Element).closest<HTMLButtonElement>(".level-25__dice");
      if (!button || scene !== "puzzle" || awaitingPassword) return;
      if (!armed) {
        showError("escape");
        return;
      }
      const number = Number(button.dataset.dice);
      if (number !== expectedButton) {
        showError("order");
        return;
      }
      button.classList.add("level-25__dice--pressed");
      expectedButton += 1;
      boxCollisionGraceUntil = performance.now() + 450;
      if (expectedButton === 7) {
        awaitingPassword = true;
        const prompt = screen.querySelector<HTMLElement>(".level-25__password-prompt");
        if (prompt) prompt.hidden = false;
      }
    });

    listen(document, "keydown", (event) => {
      if (scene !== "puzzle" || !awaitingPassword || event.repeat || event.key.length !== 1) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      passwordBuffer = `${passwordBuffer}${event.key}`.slice(-6);
      if (passwordBuffer === "hidden") complete();
    });

    interval(() => {
      if (scene !== "puzzle" || awaitingPassword || patrolPaths.length !== BRANCHES.length) return;
      const now = performance.now();
      boxes.forEach((box, index) => {
        const route = patrolPaths[index];
        const settings = BRANCHES[index];
        if (!route || !settings) return;
        const cycle = ((now - puzzleStartedAt) / settings.speed + settings.phase) % 2;
        const progress = cycle <= 1 ? cycle : 2 - cycle;
        const patrolProgress = 0.3 + progress * 0.7;
        const point = route.getPointAtLength(route.getTotalLength() * patrolProgress);
        box.style.left = `${point.x - PATROL_BOX_HALF_SIZE}px`;
        box.style.top = `${point.y - PATROL_BOX_HALF_SIZE}px`;
      });

      if (!armed || !lastPointer || now < boxCollisionGraceUntil) return;
      for (const box of boxes) {
        const bounds = box.getBoundingClientRect();
        if (
          lastPointer.x >= bounds.left && lastPointer.x <= bounds.right &&
          lastPointer.y >= bounds.top && lastPointer.y <= bounds.bottom
        ) {
          showError("box");
          return;
        }
      }
    }, 30);
  },
};
