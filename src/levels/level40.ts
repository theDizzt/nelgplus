import { SOUND_EFFECTS, assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { clientPointToLocal, type LocalPoint } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const DISPLAY_SPEED_LIMIT = 40;
const SPEEDOMETER_DIVISOR = 30;
const MAX_POINTER_SPEED = DISPLAY_SPEED_LIMIT * SPEEDOMETER_DIVISOR;
const BLOCKER_COUNT = 10;
const SCENE_SEVEN_PASSWORD = "sluggish";

interface Level40Scene {
  readonly title: string;
  readonly body: readonly string[];
  readonly emphasis?: string;
}

interface MazeRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface MazeObstacleDefinition extends MazeRect {
  readonly axis: "x" | "y";
  readonly travel: number;
  readonly duration: number;
  readonly phase: number;
}

interface ActiveMazeObstacle {
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;
  readonly startX: number;
  readonly startY: number;
  readonly axis: "x" | "y";
  readonly travel: number;
  readonly duration: number;
  readonly phase: number;
}

const MAZE_SAFE_PATH: readonly MazeRect[] = [
  { x: 26, y: 25, width: 259, height: 7 },
  { x: 26, y: 32, width: 259, height: 58 },
  { x: 591, y: 32, width: 176, height: 58 },
  { x: 26, y: 90, width: 58, height: 15 },
  { x: 226, y: 90, width: 59, height: 15 },
  { x: 591, y: 90, width: 59, height: 15 },
  { x: 693, y: 90, width: 74, height: 15 },
  { x: 26, y: 105, width: 58, height: 59 },
  { x: 226, y: 105, width: 424, height: 59 },
  { x: 693, y: 105, width: 74, height: 59 },
  { x: 26, y: 164, width: 58, height: 24 },
  { x: 693, y: 164, width: 74, height: 24 },
  { x: 26, y: 188, width: 58, height: 13 },
  { x: 124, y: 188, width: 139, height: 13 },
  { x: 693, y: 188, width: 74, height: 13 },
  { x: 26, y: 201, width: 58, height: 42 },
  { x: 124, y: 201, width: 139, height: 42 },
  { x: 295, y: 201, width: 211, height: 42 },
  { x: 693, y: 201, width: 74, height: 42 },
  { x: 26, y: 243, width: 58, height: 4 },
  { x: 124, y: 243, width: 59, height: 4 },
  { x: 211, y: 243, width: 52, height: 4 },
  { x: 295, y: 243, width: 211, height: 4 },
  { x: 693, y: 243, width: 74, height: 4 },
  { x: 26, y: 247, width: 58, height: 21 },
  { x: 124, y: 247, width: 59, height: 21 },
  { x: 211, y: 247, width: 52, height: 21 },
  { x: 295, y: 247, width: 472, height: 21 },
  { x: 26, y: 268, width: 157, height: 54 },
  { x: 211, y: 268, width: 52, height: 54 },
  { x: 295, y: 268, width: 472, height: 54 },
  { x: 211, y: 322, width: 52, height: 25 },
  { x: 295, y: 322, width: 211, height: 25 },
  { x: 211, y: 347, width: 52, height: 23 },
  { x: 295, y: 347, width: 211, height: 23 },
  { x: 565, y: 347, width: 202, height: 23 },
  { x: 26, y: 370, width: 237, height: 18 },
  { x: 565, y: 370, width: 202, height: 18 },
  { x: 26, y: 388, width: 237, height: 22 },
  { x: 25, y: 390, width: 1, height: 59 },
  { x: 565, y: 388, width: 73, height: 22 },
  { x: 693, y: 388, width: 74, height: 22 },
  { x: 26, y: 410, width: 51, height: 30 },
  { x: 565, y: 410, width: 73, height: 30 },
  { x: 693, y: 410, width: 74, height: 30 },
  { x: 26, y: 440, width: 612, height: 9 },
  { x: 693, y: 440, width: 74, height: 9 },
  { x: 26, y: 449, width: 612, height: 31 },
  { x: 693, y: 449, width: 74, height: 31 },
  { x: 565, y: 480, width: 73, height: 1 },
  { x: 693, y: 480, width: 74, height: 1 },
  { x: 693, y: 481, width: 74, height: 9 },
  { x: 26, y: 490, width: 105, height: 25 },
  { x: 693, y: 490, width: 74, height: 25 },
  { x: 26, y: 515, width: 741, height: 45 },
  { x: 26, y: 560, width: 734, height: 6 },
  { x: 26, y: 566, width: 105, height: 26 },
] as const;

const MAZE_OBSTACLES: readonly MazeObstacleDefinition[] = [
  { x: 118, y: 66, width: 82, height: 82, axis: "x", travel: 90, duration: 2200, phase: 0 },
  { x: 348, y: 182, width: 84, height: 84, axis: "y", travel: 88, duration: 2600, phase: 0.45 },
  { x: 668, y: 216, width: 84, height: 84, axis: "x", travel: -112, duration: 2000, phase: 0.85 },
  { x: 138, y: 382, width: 82, height: 82, axis: "y", travel: -104, duration: 2400, phase: 1.2 },
  { x: 216, y: 396, width: 82, height: 82, axis: "x", travel: 120, duration: 2800, phase: 0.65 },
  { x: 566, y: 382, width: 82, height: 82, axis: "y", travel: 96, duration: 2300, phase: 1.55 },
] as const;

const SCENES: readonly Level40Scene[] = [
  {
    title: "Fury and Speed",
    body: [
      "It's human nature to like",
      "speed, so if you let go for a",
      "moment, the accelerator will",
      "gradually apply more power.",
      "When you are overtaken, you",
      "feel a sense of competition.",
    ],
  },
  {
    title: "Fury and Speed",
    body: [
      "If you have been in a stressful",
      "situation, the problem becomes bigger.",
      "You grip the steering wheel, not",
      "wanting to lose. You get into a rage with",
      "someone you've never seen before. Not",
      "only will you be fined, but if you are not",
      "careful, many people will be put at risk.",
    ],
  },
  {
    title: "Fury and Speed",
    body: [
      "Jerry Diefenbacher, a psychology",
      "professor at Colorado State University,",
      "studied the relationship between anger",
      "and thinking. However, the most",
      "important cause of accidents was not",
      "poor driving skills. ",
    ],
    emphasis: "It was anger.",
  },
  {
    title: "Slow Down",
    body: [
      "A limit is not there to annoy you.",
      "It is there because the world needs time",
      "to react to sudden decisions.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "Move patiently.",
      "Even a small rush can carry you",
      "farther than you intended.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "In this level, speed is the trap.",
      "Keep the cursor calm and steady.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "Do not fight the limit.",
      "Let your hand become slower than",
      "your first instinct.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "You made it this far.",
      "One last careful movement will carry",
      "you through the limitation.",
    ],
  },
] as const;

function renderBody(scene: (typeof SCENES)[number]): string {
  const lines = scene.body.map((line) => `<span>${line}</span>`).join("");
  return scene.emphasis ? `${lines}<span><em>${scene.emphasis}</em></span>` : lines;
}

function renderSpeedometer(): string {
  return `
    <aside class="level-40__speedometer" aria-live="polite">
      <span>Speed:<output data-speed>0.0</output> unit/s</span>
      <span>Max:<output data-max-speed>0.0</output> unit/s</span>
    </aside>`;
}

function renderDiamondButton(className: string, label: string): string {
  return `<button class="${className}" type="button" aria-label="${label}"></button>`;
}

function renderBlockers(): string {
  return Array.from({ length: BLOCKER_COUNT }, (_, index) => `
    <div class="level-40__blocker level-40__blocker--${index + 1}" data-blocker style="--blocker-index:${index}">
      <span></span>
    </div>`).join("");
}

function createMazeObstacles(): ActiveMazeObstacle[] {
  return MAZE_OBSTACLES.map((obstacle) => ({
    ...obstacle,
    startX: obstacle.x,
    startY: obstacle.y,
  }));
}

function renderMaze(obstacles: readonly ActiveMazeObstacle[]): string {
  const renderObstacle = (rect: MazeRect, index: number) =>
    `<i class="level-40__maze-obstacle" data-maze-obstacle="${index}" style="left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px"></i>`;
  const renderSafeRect = (rect: MazeRect) =>
    `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}"></rect>`;
  return `
    <section class="level-40__maze" aria-label="Move through the maze without touching a wall">
      <svg class="level-40__maze-walls" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <mask id="level-40-safe-path" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="600">
            <rect width="800" height="600" fill="white"></rect>
            <g fill="black">${MAZE_SAFE_PATH.map(renderSafeRect).join("")}</g>
          </mask>
        </defs>
        <rect class="level-40__maze-wall-fill" width="800" height="600" mask="url(#level-40-safe-path)"></rect>
      </svg>
      <div class="level-40__maze-obstacles" aria-hidden="true">
        ${obstacles.map(renderObstacle).join("")}
      </div>
      ${renderDiamondButton("level-40__diamond level-40__diamond--maze-exit", "Continue to Scene 6")}
    </section>`;
}

function pointInsideRect(point: LocalPoint, rect: MazeRect): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width
    && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function pointInsideMazePath(point: LocalPoint): boolean {
  return MAZE_SAFE_PATH.some((safeArea) => pointInsideRect(point, safeArea));
}

function movementHitsMaze(
  start: LocalPoint,
  end: LocalPoint,
  obstacles: readonly MazeRect[],
): boolean {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const steps = Math.max(1, Math.ceil(distance / 4));
  for (let step = 0; step <= steps; step += 1) {
    const ratio = step / steps;
    const point = {
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio,
    };
    if (!pointInsideMazePath(point)
      || obstacles.some((obstacle) => pointInsideRect(point, obstacle))) return true;
  }
  return false;
}

function elementsOverlap(first: Element, second: Element): boolean {
  const firstRect = first.getBoundingClientRect();
  const secondRect = second.getBoundingClientRect();
  return firstRect.left < secondRect.right
    && firstRect.right > secondRect.left
    && firstRect.top < secondRect.bottom
    && firstRect.bottom > secondRect.top;
}

export const level40: LevelDefinition = {
  number: 40,
  title: "Limitation",
  scenes: SCENES.map((_, index) => ({ id: String(index + 1), label: `Scene ${index + 1}` })),
  mount({ screen, listen, interval, audio, complete, initialScene }) {
    let sceneIndex = Math.max(0, Math.min(SCENES.length - 1, Number(initialScene ?? "1") - 1));
    let previousPointer: { readonly point: LocalPoint; readonly time: number } | undefined;
    let maximumDisplaySpeed = 0;
    let sluggishPasswordRevealed = false;
    let mazeObstacles: ActiveMazeObstacle[] = [];
    let mazeObstacleElements: HTMLElement[] = [];
    let mazeAnimationStartedAt = 0;
    let activeDrag:
      | {
          readonly element: HTMLElement;
          readonly pointerId: number;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly elementX: number;
          readonly elementY: number;
        }
      | undefined;
    let passwordInput: ReturnType<typeof attachStarMaskedInput> | undefined;

    const renderScene = () => {
      const scene = SCENES[sceneIndex];
      if (!scene) return;
      screen.className = "level-screen level-40";
      screen.dataset.scene = String(sceneIndex + 1);
      screen.style.setProperty(
        "--level-40-bg",
        sceneIndex === 7
          ? "none"
          : `url("${assetUrl(sceneIndex === 6 ? "images/level40bg2.jpg" : "images/level40bg1.png")}")`,
      );
      activeDrag = undefined;
      passwordInput = undefined;
      mazeObstacles = sceneIndex === 4 ? createMazeObstacles() : [];
      mazeObstacleElements = [];
      mazeAnimationStartedAt = performance.now();
      screen.innerHTML = `
        <header class="level-heading level-40__heading" aria-label="Level 40, Limitation">
          <div class="level-heading__number level-40__title">Level 40</div>
          <h1 class="level-40__subtitle">Limitation</h1>
        </header>

        ${sceneIndex < 3 ? `
          <article class="level-40__copy" aria-live="polite">
            <h2>${scene.title}</h2>
            <p>${renderBody(scene)}</p>
          </article>
          <button class="level-40__next" type="button" aria-label="Continue to the next screen"></button>
        ` : ""}
        ${sceneIndex === 3 ? `
          <section class="level-40__drag-puzzle" aria-label="Move every blocker away from the green button">
            ${renderDiamondButton("level-40__diamond level-40__diamond--center", "Continue")}
            ${renderBlockers()}
          </section>
          ${renderSpeedometer()}
        ` : ""}
        ${sceneIndex === 4 ? `
          ${renderMaze(mazeObstacles)}
          ${renderSpeedometer()}
        ` : ""}
        ${sceneIndex === 5 ? `
          ${sluggishPasswordRevealed
            ? ""
            : renderDiamondButton("level-40__diamond level-40__diamond--moving", "Catch the moving button")}
          <p class="level-40__moving-password" data-moving-password ${sluggishPasswordRevealed ? "" : "hidden"}>
            Password = <strong>sluggish</strong>
          </p>
          ${renderSpeedometer()}
        ` : ""}
        ${sceneIndex === 6 ? `
          ${renderDiamondButton("level-40__diamond level-40__diamond--return", "Return to Scene 4")}
          <p class="level-40__crash-message">Don't move<br />more than<br />40 units per second.</p>
          <form class="level-40__password-form" autocomplete="off">
            <input class="nelg-password-input" id="level-40-answer" name="nelg-level-forty-answer"
              data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
              maxlength="16" autocomplete="off" autocapitalize="off" aria-autocomplete="none" spellcheck="false"
              aria-label="Password" />
            <button type="submit">GO</button>
          </form>
        ` : ""}
        ${sceneIndex === 7 ? `
          ${renderDiamondButton("level-40__diamond level-40__diamond--return", "Return to Scene 4")}
          <p class="level-40__wall-message">You got pinned against the damn wall.</p>
        ` : ""}
      `;
      previousPointer = undefined;
      maximumDisplaySpeed = 0;
      if (sceneIndex === 4) {
        mazeObstacleElements = Array.from(screen.querySelectorAll<HTMLElement>("[data-maze-obstacle]"));
      }
      if (sceneIndex === 6) {
        const input = screen.querySelector<HTMLInputElement>("#level-40-answer");
        if (input) passwordInput = attachStarMaskedInput(input, listen);
      }
    };

    const goToScene = (nextSceneIndex: number) => {
      sceneIndex = Math.max(0, Math.min(SCENES.length - 1, nextSceneIndex));
      renderScene();
    };

    const updateSpeedometer = (displaySpeed: number) => {
      maximumDisplaySpeed = Math.max(maximumDisplaySpeed, displaySpeed);
      const speedOutput = screen.querySelector<HTMLOutputElement>("[data-speed]");
      const maxSpeedOutput = screen.querySelector<HTMLOutputElement>("[data-max-speed]");
      if (speedOutput) speedOutput.value = displaySpeed.toFixed(1);
      if (maxSpeedOutput) maxSpeedOutput.value = maximumDisplaySpeed.toFixed(1);
    };

    renderScene();

    interval(() => {
      if (sceneIndex !== 4) return;
      const elapsed = performance.now() - mazeAnimationStartedAt;
      mazeObstacles.forEach((obstacle, index) => {
        const cycle = (elapsed / obstacle.duration + obstacle.phase) % 2;
        const linearProgress = cycle <= 1 ? cycle : 2 - cycle;
        const progress = (1 - Math.cos(linearProgress * Math.PI)) / 2;
        obstacle.x = obstacle.startX + (obstacle.axis === "x" ? obstacle.travel * progress : 0);
        obstacle.y = obstacle.startY + (obstacle.axis === "y" ? obstacle.travel * progress : 0);
        const element = mazeObstacleElements[index];
        if (!element) return;
        element.style.left = `${obstacle.x.toFixed(2)}px`;
        element.style.top = `${obstacle.y.toFixed(2)}px`;
      });

      const pointer = previousPointer;
      if (pointer
        && mazeObstacles.some((obstacle) => pointInsideRect(pointer.point, obstacle))) {
        previousPointer = undefined;
        audio.playEffect(SOUND_EFFECTS.break);
        goToScene(7);
      }
    }, 16);

    listen(screen, "pointermove", (event) => {
      if (sceneIndex < 3 || sceneIndex >= 6) {
        previousPointer = undefined;
        return;
      }
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      const time = event.timeStamp;
      if (previousPointer) {
        const deltaSeconds = Math.max((time - previousPointer.time) / 1000, 0.001);
        const distance = Math.hypot(point.x - previousPointer.point.x, point.y - previousPointer.point.y);
        const rawSpeed = distance / deltaSeconds;
        const displaySpeed = rawSpeed / SPEEDOMETER_DIVISOR;
        updateSpeedometer(displaySpeed);
        if (displaySpeed > DISPLAY_SPEED_LIMIT || rawSpeed > MAX_POINTER_SPEED) {
          audio.playEffect(SOUND_EFFECTS.smack);
          goToScene(6);
          return;
        }
        if (sceneIndex === 4 && movementHitsMaze(previousPointer.point, point, mazeObstacles)) {
          audio.playEffect(SOUND_EFFECTS.break);
          goToScene(7);
          return;
        }
      } else if (sceneIndex === 4 && (!pointInsideMazePath(point)
        || mazeObstacles.some((obstacle) => pointInsideRect(point, obstacle)))) {
        audio.playEffect(SOUND_EFFECTS.break);
        goToScene(7);
        return;
      }
      if (activeDrag && activeDrag.pointerId === event.pointerId) {
        const x = activeDrag.elementX + point.x - activeDrag.pointerX;
        const y = activeDrag.elementY + point.y - activeDrag.pointerY;
        activeDrag.element.style.left = `${Math.max(-40, Math.min(730, x))}px`;
        activeDrag.element.style.top = `${Math.max(130, Math.min(530, y))}px`;
        event.preventDefault();
      }
      previousPointer = { point, time };
    });

    listen(screen, "pointerdown", (event) => {
      const blocker = (event.target as Element).closest<HTMLElement>("[data-blocker]");
      if (!blocker || (sceneIndex !== 3 && sceneIndex !== 5)) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      activeDrag = {
        element: blocker,
        pointerId: event.pointerId,
        pointerX: point.x,
        pointerY: point.y,
        elementX: blocker.offsetLeft,
        elementY: blocker.offsetTop,
      };
      blocker.setPointerCapture(event.pointerId);
      blocker.classList.add("is-dragging");
      event.preventDefault();
    });

    const finishDrag = (event: PointerEvent) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      if (activeDrag.element.hasPointerCapture(event.pointerId)) activeDrag.element.releasePointerCapture(event.pointerId);
      activeDrag.element.classList.remove("is-dragging");
      activeDrag = undefined;
    };

    listen(screen, "pointerup", finishDrag);
    listen(screen, "pointercancel", finishDrag);

    listen(screen, "submit", (event) => {
      const form = event.target instanceof HTMLFormElement ? event.target : undefined;
      if (!form?.matches(".level-40__password-form")) return;
      event.preventDefault();
      if (passwordInput?.getValue().toLowerCase() === SCENE_SEVEN_PASSWORD) {
        complete();
        return;
      }
      form.classList.remove("is-wrong");
      void form.offsetWidth;
      form.classList.add("is-wrong");
      passwordInput?.clear();
      form.querySelector<HTMLInputElement>("input")?.focus();
    });

    listen(screen, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat || sceneIndex !== 6) return;
      const input = event.target instanceof HTMLInputElement ? event.target : undefined;
      if (!input?.matches("#level-40-answer")) return;
      event.preventDefault();
      input.closest<HTMLFormElement>("form")?.requestSubmit();
    });

    listen(screen, "animationend", (event) => {
      const form = event.target instanceof HTMLElement ? event.target.closest(".level-40__password-form") : undefined;
      form?.classList.remove("is-wrong");
    });

    listen(screen, "click", (event) => {
      const target = event.target as Element;
      const sceneButton = target.closest<HTMLButtonElement>(".level-40__next");
      const centerButton = target.closest<HTMLButtonElement>(".level-40__diamond--center");
      const mazeButton = target.closest<HTMLButtonElement>(".level-40__diamond--maze-exit");
      const movingButton = target.closest<HTMLButtonElement>(".level-40__diamond--moving");
      const returnButton = target.closest<HTMLButtonElement>(".level-40__diamond--return");
      const submitButton = target.closest<HTMLButtonElement>(".level-40__password-form button");

      if (sceneButton || centerButton || mazeButton || movingButton || returnButton || submitButton) {
        audio.playEffect(SOUND_EFFECTS.smack);
      }

      if (sceneButton) {
        sceneButton.disabled = true;
        if (sceneIndex >= SCENES.length - 1) {
          complete();
          return;
        }
        goToScene(sceneIndex + 1);
        return;
      }

      if (centerButton) {
        const blocked = Array.from(screen.querySelectorAll<HTMLElement>("[data-blocker]"))
          .some((blocker) => elementsOverlap(centerButton, blocker));
        if (blocked) return;
        centerButton.disabled = true;
        if (sceneIndex >= 5) complete();
        else goToScene(sceneIndex + 1);
        return;
      }

      if (mazeButton) {
        mazeButton.disabled = true;
        goToScene(5);
        return;
      }

      if (movingButton && !sluggishPasswordRevealed) {
        sluggishPasswordRevealed = true;
        movingButton.disabled = true;
        movingButton.remove();
        screen.querySelector<HTMLElement>("[data-moving-password]")?.removeAttribute("hidden");
        return;
      }

      if (returnButton) {
        returnButton.disabled = true;
        goToScene(3);
      }
    });

    listen(screen, "pointerleave", () => {
      previousPointer = undefined;
    });
  },
};
