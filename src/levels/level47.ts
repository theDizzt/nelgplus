import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import type { LevelDefinition } from "../core/types";

const SCENE_COUNT = 9;
const CURSOR_WIDTH = 30;
const CURSOR_HEIGHT = 44;
const FREEZE_DURATION = 8_000;

interface MazeRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface MazeDefinition {
  readonly safe: readonly MazeRect[];
  readonly start: MazeRect;
  readonly finish: MazeRect;
}

const MAZES: Readonly<Record<2 | 3, MazeDefinition>> = {
  2: {
    safe: [
      { x: 30, y: 454, width: 131, height: 113 },
      { x: 66, y: 155, width: 58, height: 330 },
      { x: 66, y: 155, width: 383, height: 117 },
      { x: 391, y: 240, width: 58, height: 188 },
      { x: 337, y: 427, width: 354, height: 140 },
      { x: 483, y: 155, width: 208, height: 412 },
      { x: 560, y: 21, width: 222, height: 88 },
      { x: 560, y: 21, width: 131, height: 474 },
      { x: 691, y: 311, width: 74, height: 87 },
    ],
    start: { x: 30, y: 454, width: 131, height: 113 },
    finish: { x: 560, y: 21, width: 222, height: 88 },
  },
  3: {
    safe: [
      { x: 47, y: 421, width: 90, height: 70 },
      { x: 137, y: 305, width: 85, height: 186 },
      { x: 137, y: 305, width: 645, height: 70 },
      { x: 690, y: 21, width: 92, height: 553 },
      { x: 47, y: 106, width: 735, height: 69 },
      { x: 137, y: 175, width: 484, height: 85 },
    ],
    start: { x: 47, y: 421, width: 90, height: 70 },
    finish: { x: 690, y: 21, width: 92, height: 85 },
  },
};

function pointInsideRect(x: number, y: number, rect: MazeRect): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function mazeMarkup(scene: 2 | 3): string {
  return `<div class="level-47__maze" aria-label="Frozen cursor maze">
    ${MAZES[scene].safe.map(({ x, y, width, height }) =>
      `<i style="left:${x}px;top:${y}px;width:${width}px;height:${height}px"></i>`).join("")}
  </div>`;
}

function heading(): string {
  return `
    <header class="level-heading level-47__heading" aria-label="Level 47, Blizzard">
      <div class="level-heading__number">Level 47</div>
      <h1>Blizzard</h1>
    </header>
    <img class="level-47__title-snow" src="${assetUrl("images/level47t1.png")}" alt="" aria-hidden="true" />`;
}

function snowMarkup(): string {
  return Array.from({ length: 220 }, (_, index) => {
    const left = (index * 37 + index * index * 11) % 101;
    const size = 3 + (index * 7) % 10;
    const duration = 2.2 + ((index * 13) % 37) / 10;
    const delay = -((index * 29) % 80) / 10;
    const drift = -135 + (index * 19) % 271;
    const opacity = 0.48 + ((index * 17) % 50) / 100;
    return `<i style="--snow-left:${left}%;--snow-size:${size}px;--snow-duration:${duration}s;
      --snow-delay:${delay}s;--snow-drift:${drift}px;--snow-opacity:${opacity}"></i>`;
  }).join("");
}

export const level47: LevelDefinition = {
  number: 47,
  title: "Blizzard",
  scenes: Array.from({ length: SCENE_COUNT }, (_, index) => ({
    id: String(index + 1),
    label: index === 0 ? "Scene 1 - Start Screen" : `Scene ${index + 1}`,
  })),
  mount(context) {
    const { screen, initialScene, listen, audio } = context;
    const parsedScene = Number(initialScene ?? "1");
    let sceneNumber = Number.isInteger(parsedScene) && parsedScene >= 1 && parsedScene <= SCENE_COUNT
      ? parsedScene
      : 1;
    let targetHovered = false;
    let maskedInput: ReturnType<typeof attachStarMaskedInput> | undefined;

    void audio.playMusic("music/level47.mp3", true);

    screen.dataset.customCursorRoot = "";
    screen.className = "level-screen level-47";
    screen.innerHTML = `
      <div class="level-47__stage"></div>
      <span class="custom-cursor custom-cursor--top-left level-47__cursor" aria-hidden="true" hidden>
        <img class="level-47__cursor-base" src="${assetUrl("cursor/level47a.png")}" alt="" draggable="false" />
        <img class="level-47__cursor-ice" src="${assetUrl("cursor/level47b.png")}" alt="" draggable="false" />
      </span>
      <div class="level-47__snow" aria-hidden="true">${snowMarkup()}</div>
    `;

    const stage = screen.querySelector<HTMLElement>(".level-47__stage");
    const cursor = screen.querySelector<HTMLElement>(".level-47__cursor");
    const cursorIce = screen.querySelector<HTMLImageElement>(".level-47__cursor-ice");
    if (!stage || !cursor || !cursorIce) return;

    let cursorVisible = false;
    let cursorInitialized = false;
    let targetX = 0;
    let targetY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let freezeStartedAt = 0;
    let mazeStarted = false;
    let animationFrame = 0;

    const isGameScene = () => sceneNumber >= 2 && sceneNumber <= 5;

    const moveTarget = (event: PointerEvent) => {
      const bounds = screen.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width) * screen.clientWidth;
      targetY = ((event.clientY - bounds.top) / bounds.height) * screen.clientHeight;
      if (!cursorInitialized || !isGameScene()) {
        cursorX = targetX;
        cursorY = targetY;
        cursorInitialized = true;
      }
      cursorVisible = true;
      cursor.hidden = false;
    };

    listen(screen, "pointerenter", moveTarget);
    listen(screen, "pointermove", moveTarget);
    listen(screen, "pointerleave", () => {
      cursorVisible = false;
      cursor.hidden = true;
    });

    const animateCursor = (now: number) => {
      if (cursorVisible) {
        if (isGameScene()) {
          cursorX += (targetX - cursorX) * 0.075;
          cursorY += (targetY - cursorY) * 0.075;
        } else {
          cursorX = targetX;
          cursorY = targetY;
        }
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        if (isGameScene() && (sceneNumber === 2 || sceneNumber === 3)) {
          const frozen = Math.min(1, (now - freezeStartedAt) / FREEZE_DURATION);
          if (frozen < 1) {
            const maze = MAZES[sceneNumber];
            const centerX = cursorX + CURSOR_WIDTH / 2;
            const centerY = cursorY + CURSOR_HEIGHT / 2;
            const onSafePath = maze.safe.some((rect) => pointInsideRect(centerX, centerY, rect));
            if (!mazeStarted && pointInsideRect(centerX, centerY, maze.start)) mazeStarted = true;
            if (mazeStarted && !onSafePath) {
              sceneNumber = 7;
              renderScene();
            } else if (mazeStarted && pointInsideRect(centerX, centerY, maze.finish)) {
              sceneNumber += 1;
              renderScene();
            }
          }
        }
      }
      if (isGameScene()) {
        const frozen = Math.min(1, (now - freezeStartedAt) / FREEZE_DURATION);
        cursorIce.style.opacity = String(frozen);
        if (frozen >= 1) {
          sceneNumber = 6;
          renderScene();
        }
      }
      animationFrame = window.requestAnimationFrame(animateCursor);
    };

    const renderScene = () => {
      targetHovered = false;
      maskedInput = undefined;
      screen.dataset.scene = String(sceneNumber);
      screen.className = `level-screen level-47 level-47--scene-${sceneNumber}`;
      mazeStarted = false;
      cursor.classList.toggle("is-lagging", isGameScene());
      cursorIce.style.opacity = "0";
      freezeStartedAt = performance.now();

      if (sceneNumber === 2 || sceneNumber === 3) {
        stage.innerHTML = mazeMarkup(sceneNumber);
        return;
      }

      if (sceneNumber >= 4 && sceneNumber <= 5) {
        stage.innerHTML = `<div class="level-47__game-field"></div>`;
        return;
      }

      if (sceneNumber !== 1) {
        stage.innerHTML = heading();
        return;
      }

      stage.innerHTML = `
        ${heading()}
        <div class="level-47__target" aria-label="Red gradient square"></div>
        <form class="level-47__form" autocomplete="off">
          <div class="level-47__controls">
            <input class="nelg-password-input" id="level-47-answer" name="nelg-level-forty-seven-answer"
              data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
              type="text" maxlength="24" autocomplete="off" autocapitalize="off"
              aria-autocomplete="none" spellcheck="false" aria-label="Password" />
            <button type="submit">GO</button>
          </div>
        </form>
        <img class="level-47__form-snow" src="${assetUrl("images/level47t2.png")}" alt="" aria-hidden="true" />
      `;

      const target = stage.querySelector<HTMLElement>(".level-47__target");
      const form = stage.querySelector<HTMLFormElement>(".level-47__form");
      const input = stage.querySelector<HTMLInputElement>("#level-47-answer");
      if (!target || !form || !input) return;

      maskedInput = attachStarMaskedInput(input, listen);
      input.focus();

      listen(target, "pointerenter", () => {
        targetHovered = true;
        target.classList.add("is-hovered");
      });
      listen(target, "pointerleave", () => {
        targetHovered = false;
        target.classList.remove("is-hovered");
      });
      listen(input, "keydown", (event) => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        form.requestSubmit();
      });
      listen(form, "submit", (event) => {
        event.preventDefault();
        const answer = maskedInput?.getValue().trim().toLowerCase() ?? "";
        if (targetHovered && answer === "hidden") {
          sceneNumber = 2;
          renderScene();
          return;
        }

        maskedInput?.clear();
        input.focus();
      });
    };

    renderScene();
    animationFrame = window.requestAnimationFrame(animateCursor);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      delete screen.dataset.customCursorRoot;
    };
  },
};
