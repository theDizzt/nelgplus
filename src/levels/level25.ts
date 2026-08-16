import type { LevelDefinition } from "../core/types";
import { assetUrl } from "../core/assets";

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

function shatteredImageMarkup(): string {
  const columns = 3;
  const rows = 4;
  const startX = 250;
  const startY = 88;
  const pieceWidth = 100;
  const pieceHeight = 112.25;

  return `<div class="level-25__shattered-image" aria-label="The shattered remains of the mouse">${Array.from(
    { length: columns * rows },
    (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const rotation = ((index * 17) % 25) - 12;
      return `<span class="level-25__image-piece" data-level-25-piece data-allow-drag
        style="left:${startX + column * pieceWidth}px;top:${startY + row * pieceHeight}px;
        width:${pieceWidth}px;height:${pieceHeight}px;
        --piece-image:url('${assetUrl("images/level25a.png")}');
        --piece-x:${-column * pieceWidth}px;--piece-y:${-row * pieceHeight}px;
        --piece-rotation:${rotation}deg" role="img" aria-label="Draggable image fragment ${index + 1}"></span>`;
    },
  ).join("")}</div>`;
}

function errorArtworkMarkup(errorScene: Exclude<Scene, "puzzle">): string {
  if (errorScene === "wall") return shatteredImageMarkup();
  const source = errorScene === "box" ? "level25a.png" : errorScene === "order" ? "level25b.png" : "level25c.png";
  return `<img class="level-25__error-art level-25__error-art--${errorScene}"
    src="${assetUrl(`images/${source}`)}" alt="" aria-hidden="true" draggable="false" />`;
}

export const level25: LevelDefinition = {
  number: 25,
  title: "Trial I",
  scenes: [
    { id: "1", label: "Scene 1 - Maze" },
    { id: "2", label: "Scene 2 - Wall failure" },
    { id: "3", label: "Scene 3 - Cheat failure" },
    { id: "4", label: "Scene 4 - Order failure" },
    { id: "5", label: "Scene 5 - Obstacle failure" },
  ],
  mount({ screen, complete, unlockAchievement, listen, interval, initialScene }) {
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
    let draggedPiece: HTMLElement | undefined;
    let draggedPiecePointer = -1;
    let draggedPieceOffset = { x: 0, y: 0 };

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
        ${errorArtworkMarkup(errorScene)}
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

    const gamePoint = (event: PointerEvent) => {
      const bounds = screen.getBoundingClientRect();
      return {
        x: ((event.clientX - bounds.left) / bounds.width) * 800,
        y: ((event.clientY - bounds.top) / bounds.height) * 600,
      };
    };

    const pointerInLane = (x: number, y: number) => {
      const point = new DOMPoint(x, y);
      return hitPaths.some((path) => path.isPointInFill(point));
    };

    const initialErrors: Readonly<Record<string, Exclude<Scene, "puzzle">>> = {
      "2": "wall",
      "3": "escape",
      "4": "order",
      "5": "box",
    };
    const initialError = initialScene ? initialErrors[initialScene] : undefined;
    if (initialError) showError(initialError);
    else renderPuzzle();

    listen(screen, "pointermove", (event) => {
      if (draggedPiece && event.pointerId === draggedPiecePointer) {
        const point = gamePoint(event);
        const width = draggedPiece.offsetWidth;
        const height = draggedPiece.offsetHeight;
        draggedPiece.style.left = `${Math.max(-width * 0.7, Math.min(800 - width * 0.3, point.x - draggedPieceOffset.x))}px`;
        draggedPiece.style.top = `${Math.max(-height * 0.7, Math.min(600 - height * 0.3, point.y - draggedPieceOffset.y))}px`;
        return;
      }
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

    listen(screen, "pointerdown", (event) => {
      const piece = (event.target as Element).closest<HTMLElement>("[data-level-25-piece]");
      if (!piece || scene !== "wall") return;
      const point = gamePoint(event);
      draggedPiece = piece;
      draggedPiecePointer = event.pointerId;
      draggedPieceOffset = { x: point.x - piece.offsetLeft, y: point.y - piece.offsetTop };
      piece.classList.add("level-25__image-piece--dragging");
      piece.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    const stopPieceDrag = (event: PointerEvent) => {
      if (!draggedPiece || event.pointerId !== draggedPiecePointer) return;
      draggedPiece.classList.remove("level-25__image-piece--dragging");
      draggedPiece = undefined;
      draggedPiecePointer = -1;
    };
    listen(screen, "pointerup", stopPieceDrag);
    listen(screen, "pointercancel", stopPieceDrag);

    listen(document, "keydown", (event) => {
      if (scene !== "puzzle" || event.repeat || event.key.length !== 1) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      passwordBuffer = `${passwordBuffer}${event.key}`.slice(-6);
      if (passwordBuffer !== "hidden") return;
      if (awaitingPassword) complete();
      else unlockAchievement(30);
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
