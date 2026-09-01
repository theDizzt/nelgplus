import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import type { LevelDefinition } from "../core/types";

const SCENE_COUNT = 9;
const CURSOR_WIDTH = 15;
const CURSOR_HEIGHT = 22;
const MAX_TEMPERATURE = 100;
const COOLING_RATE = (50 / 6);
const WARMING_RATE = (50 / 8);
const INVINCIBLE_CODE = "melonsoda84";

const SCENE_TWO_FIRE = { x: 358, y: 432, radius: 64 } as const;
const SCENE_TWO_DESTINATION = { x: 714, y: 37, width: 50, height: 50 } as const;
const SCENE_TWO_WALLS = [
  { x: 482, y: 241, width: 87, height: 187 },
] as const;
const SCENE_TWO_OBSTACLES = [
  { y: 162, width: 52, height: 50, startX: 80, travel: 300, speed: 1.45, offset: 0 },
  { y: 212, width: 50, height: 52, startX: 89, travel: 292, speed: 1.9, offset: 1.8 },
] as const;
const SCENE_TWO_PRESS = { x: 560, width: 132, height: 548, cycleSeconds: 1.5 } as const;

const SCENE_THREE_FIRE = { x: 672, y: 8, radius: 64 } as const;
const SCENE_THREE_DESTINATION = { x: 54, y: 429, width: 50, height: 50 } as const;
const SCENE_THREE_TOP_OBSTACLE = {
  y: 112, width: 50, height: 50, startX: 147, travel: 410, speed: 1.25,
} as const;
const SCENE_THREE_PRESSES = [
  { x: 150, top: -160, width: 132, height: 420, travel: 220, wellTop: 106, wellHeight: 154, delay: 0.64 },
  { x: 312, top: -160, width: 132, height: 420, travel: 220, wellTop: 106, wellHeight: 154, delay: 0.32 },
  { x: 474, top: -160, width: 132, height: 420, travel: 220, wellTop: 106, wellHeight: 154, delay: 0 },
] as const;
const SCENE_THREE_PRESS_CYCLE_SECONDS = 3.6;
const SCENE_THREE_PADS = {
  cyan: { x: 61, y: 112, width: 50, height: 50 },
  magenta: { x: 711, y: 515, width: 50, height: 50 },
} as const;
const SCENE_THREE_DOORS = {
  cyan: { x: 690, y: 276, width: 92, height: 24 },
  magenta: { x: 112, y: 419, width: 22, height: 72 },
} as const;
const SCENE_THREE_LOOP = {
  left: 170, right: 735, top: 343, bottom: 458, size: 50, speed: 126,
} as const;

const SCENE_FOUR_FIRES = [
  { x: 14, y: 10, radius: 60 },
  { x: 18, y: 447, radius: 60 },
  { x: 626, y: 240, radius: 60 },
] as const;
const SCENE_FOUR_PAD = { x: 54, y: 46, width: 46, height: 46 } as const;
const SCENE_FOUR_DESTINATION = { x: 308, y: 332, width: 48, height: 48 } as const;
const SCENE_FOUR_BARS = [
  { x: 152, y: 25, width: 179, height: 16, travel: 48, speed: 0.72, offset: 0 },
  { x: 398, y: 40, width: 182, height: 16, travel: 52, speed: 0.82, offset: 1.7 },
  { x: 285, y: 315, width: 233, height: 16, travel: 130, speed: 0.56, offset: 3.2 },
] as const;
const SCENE_FOUR_SNOWBALL = {
  y: 170, size: 100, startX: 152, travel: 230, speed: 0.78,
} as const;
const SCENE_FOUR_CROSSES = [
  { x: 685, y: 181, armLength: 168, thickness: 16, speed: 22 },
  { x: 685, y: 432, armLength: 168, thickness: 16, speed: -18 },
] as const;

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

const MAZES: Readonly<Record<2 | 3 | 4, MazeDefinition>> = {
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
      { x: 137, y: 421, width: 645, height: 70 },
    ],
    start: { x: 690, y: 21, width: 92, height: 85 },
    finish: { x: 47, y: 421, width: 90, height: 70 },
  },
  4: {
    safe: [
      { x: 21, y: 19, width: 111, height: 96 },
      { x: 132, y: 40, width: 467, height: 51 },
      { x: 599, y: 19, width: 165, height: 547 },
      { x: 21, y: 171, width: 446, height: 96 },
      { x: 243, y: 130, width: 83, height: 41 },
      { x: 21, y: 267, width: 37, height: 299 },
      { x: 58, y: 403, width: 74, height: 163 },
      { x: 132, y: 267, width: 84, height: 42 },
      { x: 424, y: 267, width: 134, height: 205 },
      { x: 291, y: 314, width: 176, height: 158 },
      { x: 291, y: 472, width: 59, height: 43 },
      { x: 291, y: 515, width: 473, height: 51 },
    ],
    start: { x: 21, y: 403, width: 111, height: 163 },
    finish: { x: 21, y: 19, width: 111, height: 96 },
  },
};

function pointInsideRect(x: number, y: number, rect: MazeRect): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function mazeMarkup(scene: 2 | 3 | 4): string {
  return `<div class="level-47__maze" aria-label="Frozen cursor maze">
    ${MAZES[scene].safe.map(({ x, y, width, height }) =>
      `<i class="level-47__safe-path" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px"></i>`).join("")}
    ${scene === 2 ? `
      <div class="level-47__moving-obstacle" data-level-47-obstacle="0"></div>
      <div class="level-47__moving-obstacle" data-level-47-obstacle="1"></div>
      <div class="level-47__fire-zone" aria-label="Campfire warming area">
        <span class="level-47__campfire" aria-hidden="true"><i></i><i></i><b></b><b></b></span>
      </div>
      ${SCENE_TWO_WALLS.map(({ x, y, width, height }) =>
        `<div class="level-47__maze-wall" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px"></div>`).join("")}
      <div class="level-47__press-well" aria-hidden="true"></div>
      <div class="level-47__press" data-level-47-press aria-label="Descending press"></div>
      <div class="level-47__destination" aria-label="Maze destination"></div>
    ` : scene === 3 ? `
      <div class="level-47__fire-zone level-47__fire-zone--scene-3" aria-label="Campfire warming area">
        <span class="level-47__campfire" aria-hidden="true"><i></i><i></i><b></b><b></b></span>
      </div>
      <div class="level-47__moving-obstacle level-47__moving-obstacle--scene-3-top"
        data-level-47-scene-3-top-obstacle></div>
      ${SCENE_THREE_PRESSES.map(({ x, top, width, height, wellTop, wellHeight }, index) => `
        <div class="level-47__press-well level-47__press-well--scene-3"
          style="left:${x}px;top:${wellTop}px;width:${width}px;height:${wellHeight}px" aria-hidden="true"></div>
        <div class="level-47__press level-47__press--scene-3" data-level-47-scene-3-press="${index}"
          style="left:${x}px;top:${top}px;width:${width}px;height:${height}px"
          aria-label="Descending press ${index + 1}"></div>
      `).join("")}
      ${Array.from({ length: 6 }, (_, index) => `
        <div class="level-47__moving-obstacle level-47__moving-obstacle--scene-3-loop"
          data-level-47-scene-3-loop-obstacle="${index}"></div>
      `).join("")}
      <div class="level-47__door-pad level-47__door-pad--cyan" data-level-47-door-pad="cyan"
        aria-label="Cyan door control"></div>
      <div class="level-47__door-pad level-47__door-pad--magenta" data-level-47-door-pad="magenta"
        aria-label="Magenta door control"></div>
      <div class="level-47__maze-door level-47__maze-door--cyan" data-level-47-door="cyan"></div>
      <div class="level-47__maze-door level-47__maze-door--magenta" data-level-47-door="magenta"></div>
      <div class="level-47__destination level-47__destination--scene-3" aria-label="Maze destination"></div>
    ` : `
      ${SCENE_FOUR_FIRES.map(({ x, y, radius }, index) => `
        <div class="level-47__fire-zone level-47__fire-zone--scene-4"
          style="left:${x}px;top:${y}px;width:${radius * 2}px;height:${radius * 2}px"
          aria-label="Campfire warming area ${index + 1}">
          <span class="level-47__campfire" aria-hidden="true"><i></i><i></i><b></b><b></b></span>
        </div>
      `).join("")}
      ${SCENE_FOUR_BARS.map((_, index) => `
        <div class="level-47__scene-4-bar" data-level-47-scene-4-bar="${index}"
          aria-label="Moving bar obstacle ${index + 1}"></div>
      `).join("")}
      <div class="level-47__snowball" data-level-47-scene-4-snowball aria-label="Rolling snowball"></div>
      ${SCENE_FOUR_CROSSES.map((_, index) => `
        <div class="level-47__rotating-cross" data-level-47-scene-4-cross="${index}"
          aria-label="Rotating cross obstacle ${index + 1}"><i></i><i></i></div>
      `).join("")}
      <div class="level-47__door-pad level-47__door-pad--scene-4" data-level-47-scene-4-pad
        aria-label="Magenta portal control"></div>
      <div class="level-47__destination level-47__destination--scene-4 is-locked"
        data-level-47-scene-4-destination aria-label="Inactive maze destination"></div>
    `}
  </div>`;
}

function temperatureMarkup(): string {
  return `<div class="level-47__temperature" aria-label="Cursor temperature">
    <div class="level-47__temperature-track"><i data-level-47-temperature-bar></i></div>
    <strong data-level-47-temperature-value>100°C</strong>
  </div>`;
}

function rectanglesOverlap(a: MazeRect, b: MazeRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}

function rotatedRectOverlaps(
  rect: MazeRect,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  angle: number,
): boolean {
  const halfRectWidth = rect.width / 2;
  const halfRectHeight = rect.height / 2;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const rectCenterX = rect.x + halfRectWidth;
  const rectCenterY = rect.y + halfRectHeight;
  const deltaX = rectCenterX - centerX;
  const deltaY = rectCenterY - centerY;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return Math.abs(deltaX) <= halfRectWidth + halfWidth * Math.abs(cosine) + halfHeight * Math.abs(sine)
    && Math.abs(deltaY) <= halfRectHeight + halfWidth * Math.abs(sine) + halfHeight * Math.abs(cosine)
    && Math.abs(deltaX * cosine + deltaY * sine)
      <= halfWidth + halfRectWidth * Math.abs(cosine) + halfRectHeight * Math.abs(sine)
    && Math.abs(-deltaX * sine + deltaY * cosine)
      <= halfHeight + halfRectWidth * Math.abs(sine) + halfRectHeight * Math.abs(cosine);
}

function circleOverlapsRect(centerX: number, centerY: number, radius: number, rect: MazeRect): boolean {
  const closestX = Math.max(rect.x, Math.min(centerX, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(centerY, rect.y + rect.height));
  return Math.hypot(centerX - closestX, centerY - closestY) <= radius;
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
    let cursorVelocityX = 0;
    let cursorVelocityY = 0;
    let previousAnimationTime = performance.now();
    let sceneStartedAt = performance.now();
    let mazeStarted = false;
    let temperature = MAX_TEMPERATURE;
    let destinationHoldSeconds = 0;
    let overheatHoldSeconds = 0;
    let lastPressSlamCycle = -1;
    let obstacleElements: HTMLElement[] = [];
    let pressElement: HTMLElement | undefined;
    let sceneThreeTopObstacle: HTMLElement | undefined;
    let sceneThreeLoopObstacles: HTMLElement[] = [];
    let sceneThreePressElements: HTMLElement[] = [];
    let sceneThreeCyanPad: HTMLElement | undefined;
    let sceneThreeMagentaPad: HTMLElement | undefined;
    let sceneThreeCyanDoor: HTMLElement | undefined;
    let sceneThreeMagentaDoor: HTMLElement | undefined;
    let sceneThreeCyanHoldSeconds = 0;
    let sceneThreeMagentaHoldSeconds = 0;
    let sceneThreeCyanOpen = false;
    let sceneThreeMagentaOpen = false;
    let sceneThreeLastPressCycles = [-1, -1, -1];
    let sceneFourBarElements: HTMLElement[] = [];
    let sceneFourSnowball: HTMLElement | undefined;
    let sceneFourCrossElements: HTMLElement[] = [];
    let sceneFourPad: HTMLElement | undefined;
    let sceneFourDestination: HTMLElement | undefined;
    let sceneFourPadHoldSeconds = 0;
    let sceneFourPortalActive = false;
    let temperatureBar: HTMLElement | undefined;
    let temperatureValue: HTMLElement | undefined;
    let animationFrame = 0;
    let invincible = false;
    let invincibleCodeBuffer = "";

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
    const triggerCheatScene = (event?: Event) => {
      if (!isGameScene()) return;
      event?.preventDefault();
      if (invincible) return;
      sceneNumber = 9;
      renderScene();
    };
    listen(screen, "contextmenu", (event) => triggerCheatScene(event));
    listen(document, "keydown", (event) => {
      if (isGameScene() && !invincible && event.key.length === 1
        && !event.ctrlKey && !event.metaKey && !event.altKey) {
        invincibleCodeBuffer = `${invincibleCodeBuffer}${event.key.toLowerCase()}`
          .slice(-INVINCIBLE_CODE.length);
        if (invincibleCodeBuffer === INVINCIBLE_CODE) {
          invincible = true;
          invincibleCodeBuffer = "";
          screen.dataset.invincible = "true";
          screen.classList.add("level-47--invincible");
          audio.playEffect(SOUND_EFFECTS.pop);
        }
      }
      if (event.key === "Meta" || (event.altKey && event.key === "Tab")) triggerCheatScene(event);
    });
    listen(window, "blur", () => triggerCheatScene());

    const cursorBounds = (): MazeRect => ({
      x: cursorX,
      y: cursorY,
      width: CURSOR_WIDTH,
      height: CURSOR_HEIGHT,
    });

    const cursorFitsSafePath = (maze: MazeDefinition): boolean => {
      const bounds = cursorBounds();
      const corners = [
        [bounds.x, bounds.y],
        [bounds.x + bounds.width, bounds.y],
        [bounds.x, bounds.y + bounds.height],
        [bounds.x + bounds.width, bounds.y + bounds.height],
      ] as const;
      return corners.every(([x, y]) => maze.safe.some((rect) => pointInsideRect(x, y, rect)));
    };

    const updateTemperatureDisplay = () => {
      const percentage = Math.max(0, Math.min(100, (temperature / MAX_TEMPERATURE) * 100));
      if (temperatureBar) temperatureBar.style.width = `${percentage}%`;
      if (temperatureValue) temperatureValue.textContent = `${Math.round(temperature)}°C`;
      cursorIce.style.opacity = String(1 - percentage / 100);
    };

    const updateSceneTwoObstacles = (now: number) => {
      const elapsedSeconds = (now - sceneStartedAt) / 1_000;
      const obstacleBounds = SCENE_TWO_OBSTACLES.map((obstacle, index) => {
        const progress = (Math.sin(elapsedSeconds * obstacle.speed + obstacle.offset) + 1) / 2;
        const x = obstacle.startX + obstacle.travel * progress;
        const element = obstacleElements[index];
        if (element) {
          element.style.left = `${x}px`;
          element.style.top = `${obstacle.y}px`;
          element.style.width = `${obstacle.width}px`;
          element.style.height = `${obstacle.height}px`;
        }
        return { x, y: obstacle.y, width: obstacle.width, height: obstacle.height };
      });

      const cycle = Math.floor(elapsedSeconds / SCENE_TWO_PRESS.cycleSeconds);
      const phase = (elapsedSeconds % SCENE_TWO_PRESS.cycleSeconds) / SCENE_TWO_PRESS.cycleSeconds;
      let pressY = -SCENE_TWO_PRESS.height;
      if (phase >= 0.55 && phase < 0.67) {
        pressY = -SCENE_TWO_PRESS.height * (1 - (phase - 0.55) / 0.12);
      } else if (phase >= 0.67 && phase < 0.82) {
        pressY = 0;
      } else if (phase >= 0.82) {
        pressY = -SCENE_TWO_PRESS.height * ((phase - 0.82) / 0.18);
      }
      if (pressElement) {
        pressElement.style.translate = `0 ${pressY}px`;
        pressElement.classList.toggle("is-slammed", phase >= 0.67 && phase < 0.75);
      }
      if (phase >= 0.67 && phase < 0.75 && lastPressSlamCycle !== cycle) {
        lastPressSlamCycle = cycle;
        audio.playEffect("sounds/thump.mp3");
      }
      return {
        obstacleBounds,
        pressBounds: { x: SCENE_TWO_PRESS.x, y: pressY, width: SCENE_TWO_PRESS.width, height: SCENE_TWO_PRESS.height },
      };
    };

    const updateSceneThreeHazards = (now: number) => {
      const elapsedSeconds = (now - sceneStartedAt) / 1_000;
      const topProgress = (Math.sin(elapsedSeconds * SCENE_THREE_TOP_OBSTACLE.speed) + 1) / 2;
      const topX = SCENE_THREE_TOP_OBSTACLE.startX + SCENE_THREE_TOP_OBSTACLE.travel * topProgress;
      if (sceneThreeTopObstacle) {
        sceneThreeTopObstacle.style.left = `${topX}px`;
        sceneThreeTopObstacle.style.top = `${SCENE_THREE_TOP_OBSTACLE.y}px`;
      }

      const pressBounds = SCENE_THREE_PRESSES.map((press, index) => {
        const cyclePosition = elapsedSeconds - press.delay;
        const phaseSeconds = ((cyclePosition % SCENE_THREE_PRESS_CYCLE_SECONDS)
          + SCENE_THREE_PRESS_CYCLE_SECONDS) % SCENE_THREE_PRESS_CYCLE_SECONDS;
        const phase = phaseSeconds / SCENE_THREE_PRESS_CYCLE_SECONDS;
        let translateY = -press.travel;
        if (phase >= 0.18 && phase < 0.3) {
          translateY = -press.travel * (1 - (phase - 0.18) / 0.12);
        } else if (phase >= 0.3 && phase < 0.5) {
          translateY = 0;
        } else if (phase >= 0.5 && phase < 0.68) {
          translateY = -press.travel * ((phase - 0.5) / 0.18);
        }
        const element = sceneThreePressElements[index];
        if (element) {
          element.style.translate = `0 ${translateY}px`;
          element.classList.toggle("is-slammed", phase >= 0.3 && phase < 0.38);
        }
        const cycle = Math.floor(cyclePosition / SCENE_THREE_PRESS_CYCLE_SECONDS);
        if (phase >= 0.3 && phase < 0.38 && sceneThreeLastPressCycles[index] !== cycle) {
          sceneThreeLastPressCycles[index] = cycle;
          audio.playEffect("sounds/thump.mp3");
        }
        return {
          x: press.x,
          y: press.top + translateY,
          width: press.width,
          height: press.height,
        };
      });

      const horizontal = SCENE_THREE_LOOP.right - SCENE_THREE_LOOP.left;
      const vertical = SCENE_THREE_LOOP.bottom - SCENE_THREE_LOOP.top;
      const perimeter = 2 * (horizontal + vertical);
      const loopBounds = sceneThreeLoopObstacles.map((element, index) => {
        let distance = (elapsedSeconds * SCENE_THREE_LOOP.speed + index * perimeter / 6) % perimeter;
        let centerX: number = SCENE_THREE_LOOP.right;
        let centerY: number = SCENE_THREE_LOOP.top;
        if (distance <= horizontal) {
          centerX -= distance;
        } else if ((distance -= horizontal) <= vertical) {
          centerX = SCENE_THREE_LOOP.left;
          centerY += distance;
        } else if ((distance -= vertical) <= horizontal) {
          centerX = SCENE_THREE_LOOP.left + distance;
          centerY = SCENE_THREE_LOOP.bottom;
        } else {
          distance -= horizontal;
          centerX = SCENE_THREE_LOOP.right;
          centerY = SCENE_THREE_LOOP.bottom - distance;
        }
        const x = centerX - SCENE_THREE_LOOP.size / 2;
        const y = centerY - SCENE_THREE_LOOP.size / 2;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        return { x, y, width: SCENE_THREE_LOOP.size, height: SCENE_THREE_LOOP.size };
      });

      return {
        obstacleBounds: [
          {
            x: topX,
            y: SCENE_THREE_TOP_OBSTACLE.y,
            width: SCENE_THREE_TOP_OBSTACLE.width,
            height: SCENE_THREE_TOP_OBSTACLE.height,
          },
          ...loopBounds,
        ],
        pressBounds,
      };
    };

    const updateSceneFourHazards = (now: number) => {
      const elapsedSeconds = (now - sceneStartedAt) / 1_000;
      const barBounds = SCENE_FOUR_BARS.map((bar, index) => {
        const progress = (Math.sin(elapsedSeconds * bar.speed + bar.offset) + 1) / 2;
        const y = bar.y + bar.travel * progress;
        const element = sceneFourBarElements[index];
        if (element) {
          element.style.left = `${bar.x}px`;
          element.style.top = `${y}px`;
          element.style.width = `${bar.width}px`;
          element.style.height = `${bar.height}px`;
        }
        return { x: bar.x, y, width: bar.width, height: bar.height };
      });

      const snowballProgress = (Math.sin(elapsedSeconds * SCENE_FOUR_SNOWBALL.speed) + 1) / 2;
      const snowballX = SCENE_FOUR_SNOWBALL.startX + SCENE_FOUR_SNOWBALL.travel * snowballProgress;
      if (sceneFourSnowball) {
        sceneFourSnowball.style.left = `${snowballX}px`;
        sceneFourSnowball.style.top = `${SCENE_FOUR_SNOWBALL.y}px`;
        const rollAngle = (snowballX - SCENE_FOUR_SNOWBALL.startX) / (SCENE_FOUR_SNOWBALL.size / 2);
        sceneFourSnowball.style.rotate = `${rollAngle}rad`;
      }

      const crosses = SCENE_FOUR_CROSSES.map((cross, index) => {
        const angle = elapsedSeconds * cross.speed * Math.PI / 180;
        const element = sceneFourCrossElements[index];
        if (element) {
          element.style.left = `${cross.x}px`;
          element.style.top = `${cross.y}px`;
          element.style.rotate = `${angle}rad`;
        }
        return { ...cross, angle };
      });

      return {
        barBounds,
        snowballBounds: {
          x: snowballX,
          y: SCENE_FOUR_SNOWBALL.y,
          width: SCENE_FOUR_SNOWBALL.size,
          height: SCENE_FOUR_SNOWBALL.size,
        },
        crosses,
      };
    };

    const animateCursor = (now: number) => {
      const deltaSeconds = Math.min(0.034, Math.max(0.001, (now - previousAnimationTime) / 1_000));
      previousAnimationTime = now;
      let transitioned = false;
      let inFire = false;
      let inDestination = false;
      const previousCursorX = cursorX;
      const previousCursorY = cursorY;
      const sceneTwoHazards = sceneNumber === 2 ? updateSceneTwoObstacles(now) : undefined;
      const sceneThreeHazards = sceneNumber === 3 ? updateSceneThreeHazards(now) : undefined;
      const sceneFourHazards = sceneNumber === 4 ? updateSceneFourHazards(now) : undefined;
      const changeScene = (nextScene: number) => {
        sceneNumber = nextScene;
        renderScene();
        transitioned = true;
      };

      if (cursorVisible) {
        if (isGameScene()) {
          const springStrength = 24;
          const damping = Math.exp(-6.2 * deltaSeconds);
          cursorVelocityX = (cursorVelocityX + (targetX - cursorX) * springStrength * deltaSeconds) * damping;
          cursorVelocityY = (cursorVelocityY + (targetY - cursorY) * springStrength * deltaSeconds) * damping;
          cursorX += cursorVelocityX * deltaSeconds;
          cursorY += cursorVelocityY * deltaSeconds;
        } else {
          cursorX = targetX;
          cursorY = targetY;
          cursorVelocityX = 0;
          cursorVelocityY = 0;
        }
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        if (sceneNumber === 2 || sceneNumber === 3 || sceneNumber === 4) {
          const maze = MAZES[sceneNumber];
          const centerX = cursorX + CURSOR_WIDTH / 2;
          const centerY = cursorY + CURSOR_HEIGHT / 2;
          const movementBounds: MazeRect = {
            x: Math.min(previousCursorX, cursorX),
            y: Math.min(previousCursorY, cursorY),
            width: Math.abs(cursorX - previousCursorX) + CURSOR_WIDTH,
            height: Math.abs(cursorY - previousCursorY) + CURSOR_HEIGHT,
          };
          let collisionBounds = movementBounds;
          if (!mazeStarted && (pointInsideRect(centerX, centerY, maze.start)
            || (sceneNumber === 4 && cursorFitsSafePath(maze)))) {
            mazeStarted = true;
            collisionBounds = cursorBounds();
          }
          if (sceneNumber === 2 && mazeStarted) {
            inFire = Math.hypot(centerX - (SCENE_TWO_FIRE.x + SCENE_TWO_FIRE.radius),
              centerY - (SCENE_TWO_FIRE.y + SCENE_TWO_FIRE.radius)) <= SCENE_TWO_FIRE.radius;
            inDestination = pointInsideRect(centerX, centerY, SCENE_TWO_DESTINATION);
          } else if (sceneNumber === 3 && mazeStarted) {
            inFire = Math.hypot(centerX - (SCENE_THREE_FIRE.x + SCENE_THREE_FIRE.radius),
              centerY - (SCENE_THREE_FIRE.y + SCENE_THREE_FIRE.radius)) <= SCENE_THREE_FIRE.radius;
            inDestination = pointInsideRect(centerX, centerY, SCENE_THREE_DESTINATION);

            const updateDoorControl = (
              inside: boolean,
              holdSeconds: number,
              pad: HTMLElement | undefined,
              door: HTMLElement | undefined,
              opened: boolean,
            ) => {
              const nextHold = opened ? 3 : (inside ? holdSeconds + deltaSeconds : 0);
              const nextOpened = opened || nextHold >= 3;
              pad?.style.setProperty("--door-hold", `${Math.min(1, nextHold / 3)}`);
              pad?.classList.toggle("is-complete", nextOpened);
              door?.classList.toggle("is-open", nextOpened);
              return { hold: nextHold, opened: nextOpened };
            };
            const cyan = updateDoorControl(
              pointInsideRect(centerX, centerY, SCENE_THREE_PADS.cyan),
              sceneThreeCyanHoldSeconds,
              sceneThreeCyanPad,
              sceneThreeCyanDoor,
              sceneThreeCyanOpen,
            );
            sceneThreeCyanHoldSeconds = cyan.hold;
            sceneThreeCyanOpen = cyan.opened;
            const magenta = updateDoorControl(
              pointInsideRect(centerX, centerY, SCENE_THREE_PADS.magenta),
              sceneThreeMagentaHoldSeconds,
              sceneThreeMagentaPad,
              sceneThreeMagentaDoor,
              sceneThreeMagentaOpen,
            );
            sceneThreeMagentaHoldSeconds = magenta.hold;
            sceneThreeMagentaOpen = magenta.opened;
          } else if (sceneNumber === 4 && mazeStarted) {
            inFire = SCENE_FOUR_FIRES.some((fire) => Math.hypot(
              centerX - (fire.x + fire.radius),
              centerY - (fire.y + fire.radius),
            ) <= fire.radius);
            const onPad = pointInsideRect(centerX, centerY, SCENE_FOUR_PAD);
            sceneFourPadHoldSeconds = sceneFourPortalActive
              ? 3
              : (onPad ? sceneFourPadHoldSeconds + deltaSeconds : 0);
            sceneFourPortalActive = sceneFourPortalActive || sceneFourPadHoldSeconds >= 3;
            sceneFourPad?.style.setProperty("--door-hold", `${Math.min(1, sceneFourPadHoldSeconds / 3)}`);
            sceneFourPad?.classList.toggle("is-complete", sceneFourPortalActive);
            sceneFourDestination?.classList.toggle("is-locked", !sceneFourPortalActive);
            sceneFourDestination?.classList.toggle("is-active", sceneFourPortalActive);
            sceneFourDestination?.setAttribute(
              "aria-label",
              sceneFourPortalActive ? "Active maze destination" : "Inactive maze destination",
            );
            inDestination = sceneFourPortalActive
              && pointInsideRect(centerX, centerY, SCENE_FOUR_DESTINATION);
          }

          if (!invincible) {
            if (mazeStarted && !cursorFitsSafePath(maze)) {
              changeScene(7);
            } else if (mazeStarted && sceneTwoHazards
              && (sceneTwoHazards.obstacleBounds.some((obstacle) => rectanglesOverlap(collisionBounds, obstacle))
                || rectanglesOverlap(collisionBounds, sceneTwoHazards.pressBounds)
                || SCENE_TWO_WALLS.some((wall) => rectanglesOverlap(collisionBounds, wall)))) {
              changeScene(7);
            } else if (mazeStarted && sceneThreeHazards
              && (sceneThreeHazards.obstacleBounds.some((obstacle) => rectanglesOverlap(collisionBounds, obstacle))
                || sceneThreeHazards.pressBounds.some((press) => rectanglesOverlap(collisionBounds, press))
                || (!sceneThreeCyanOpen && rectanglesOverlap(collisionBounds, SCENE_THREE_DOORS.cyan))
                || (!sceneThreeMagentaOpen && rectanglesOverlap(collisionBounds, SCENE_THREE_DOORS.magenta)))) {
              changeScene(7);
            } else if (mazeStarted && sceneFourHazards
              && (sceneFourHazards.barBounds.some((bar) => rectanglesOverlap(collisionBounds, bar))
                || circleOverlapsRect(
                  sceneFourHazards.snowballBounds.x + SCENE_FOUR_SNOWBALL.size / 2,
                  sceneFourHazards.snowballBounds.y + SCENE_FOUR_SNOWBALL.size / 2,
                  SCENE_FOUR_SNOWBALL.size / 2,
                  collisionBounds,
                )
                || sceneFourHazards.crosses.some((cross) => (
                  rotatedRectOverlaps(
                    collisionBounds,
                    cross.x,
                    cross.y,
                    cross.armLength,
                    cross.thickness,
                    cross.angle,
                  )
                  || rotatedRectOverlaps(
                    collisionBounds,
                    cross.x,
                    cross.y,
                    cross.thickness,
                    cross.armLength,
                    cross.angle,
                  )
                )))) {
              changeScene(7);
            }
          }
        }
      }

      if (!transitioned && isGameScene()) {
        const usesMazeTemperature = sceneNumber === 2 || sceneNumber === 3 || sceneNumber === 4;
        if (usesMazeTemperature && inFire) temperature += WARMING_RATE * deltaSeconds;
        else if (!(usesMazeTemperature && inDestination)) temperature -= COOLING_RATE * deltaSeconds;
        temperature = Math.max(0, Math.min(MAX_TEMPERATURE, temperature));

        overheatHoldSeconds = usesMazeTemperature
          && inFire && temperature >= MAX_TEMPERATURE - 0.001
          ? overheatHoldSeconds + deltaSeconds
          : 0;
        destinationHoldSeconds = usesMazeTemperature && inDestination
          ? destinationHoldSeconds + deltaSeconds
          : 0;

        updateTemperatureDisplay();
        if (!invincible && overheatHoldSeconds >= 8) changeScene(8);
        else if (destinationHoldSeconds >= 3) changeScene(sceneNumber + 1);
        else if (!invincible && temperature <= 0) changeScene(6);
      }
      animationFrame = window.requestAnimationFrame(animateCursor);
    };

    const bindRestartTarget = () => {
      const restartTarget = stage.querySelector<HTMLButtonElement>(".level-47__restart-target");
      if (!restartTarget) return;
      listen(restartTarget, "pointerenter", () => audio.playEffect(SOUND_EFFECTS.pop));
      listen(restartTarget, "click", () => {
        temperature = MAX_TEMPERATURE;
        sceneNumber = 2;
        renderScene();
      });
    };

    const renderScene = () => {
      targetHovered = false;
      maskedInput = undefined;
      screen.dataset.scene = String(sceneNumber);
      screen.className = `level-screen level-47 level-47--scene-${sceneNumber}${invincible ? " level-47--invincible" : ""}`;
      obstacleElements = [];
      pressElement = undefined;
      sceneThreeTopObstacle = undefined;
      sceneThreeLoopObstacles = [];
      sceneThreePressElements = [];
      sceneThreeCyanPad = undefined;
      sceneThreeMagentaPad = undefined;
      sceneThreeCyanDoor = undefined;
      sceneThreeMagentaDoor = undefined;
      sceneThreeCyanHoldSeconds = 0;
      sceneThreeMagentaHoldSeconds = 0;
      sceneThreeCyanOpen = false;
      sceneThreeMagentaOpen = false;
      sceneThreeLastPressCycles = [-1, -1, -1];
      sceneFourBarElements = [];
      sceneFourSnowball = undefined;
      sceneFourCrossElements = [];
      sceneFourPad = undefined;
      sceneFourDestination = undefined;
      sceneFourPadHoldSeconds = 0;
      sceneFourPortalActive = false;
      temperatureBar = undefined;
      temperatureValue = undefined;
      mazeStarted = false;
      cursor.classList.toggle("is-lagging", isGameScene());
      cursorIce.style.opacity = sceneNumber === 1 || sceneNumber === 6 ? "1" : "0";
      cursorVelocityX = 0;
      cursorVelocityY = 0;
      destinationHoldSeconds = 0;
      overheatHoldSeconds = 0;
      lastPressSlamCycle = -1;
      sceneStartedAt = performance.now();

      if (sceneNumber === 2 || sceneNumber === 3 || sceneNumber === 4) {
        stage.innerHTML = `${mazeMarkup(sceneNumber)}${heading()}${temperatureMarkup()}`;
        obstacleElements = Array.from(stage.querySelectorAll<HTMLElement>("[data-level-47-obstacle]"));
        pressElement = stage.querySelector<HTMLElement>("[data-level-47-press]") ?? undefined;
        if (sceneNumber === 3) {
          sceneThreeTopObstacle = stage.querySelector<HTMLElement>("[data-level-47-scene-3-top-obstacle]") ?? undefined;
          sceneThreeLoopObstacles = Array.from(
            stage.querySelectorAll<HTMLElement>("[data-level-47-scene-3-loop-obstacle]"),
          );
          sceneThreePressElements = Array.from(
            stage.querySelectorAll<HTMLElement>("[data-level-47-scene-3-press]"),
          );
          sceneThreeCyanPad = stage.querySelector<HTMLElement>('[data-level-47-door-pad="cyan"]') ?? undefined;
          sceneThreeMagentaPad = stage.querySelector<HTMLElement>('[data-level-47-door-pad="magenta"]') ?? undefined;
          sceneThreeCyanDoor = stage.querySelector<HTMLElement>('[data-level-47-door="cyan"]') ?? undefined;
          sceneThreeMagentaDoor = stage.querySelector<HTMLElement>('[data-level-47-door="magenta"]') ?? undefined;
        } else if (sceneNumber === 4) {
          sceneFourBarElements = Array.from(
            stage.querySelectorAll<HTMLElement>("[data-level-47-scene-4-bar]"),
          );
          sceneFourSnowball = stage.querySelector<HTMLElement>("[data-level-47-scene-4-snowball]") ?? undefined;
          sceneFourCrossElements = Array.from(
            stage.querySelectorAll<HTMLElement>("[data-level-47-scene-4-cross]"),
          );
          sceneFourPad = stage.querySelector<HTMLElement>("[data-level-47-scene-4-pad]") ?? undefined;
          sceneFourDestination = stage.querySelector<HTMLElement>(
            "[data-level-47-scene-4-destination]",
          ) ?? undefined;
        }
        temperatureBar = stage.querySelector<HTMLElement>("[data-level-47-temperature-bar]") ?? undefined;
        temperatureValue = stage.querySelector<HTMLElement>("[data-level-47-temperature-value]") ?? undefined;
        updateTemperatureDisplay();
        return;
      }

      if (sceneNumber === 5) {
        stage.innerHTML = `<div class="level-47__game-field"></div>${heading()}${temperatureMarkup()}`;
        temperatureBar = stage.querySelector<HTMLElement>("[data-level-47-temperature-bar]") ?? undefined;
        temperatureValue = stage.querySelector<HTMLElement>("[data-level-47-temperature-value]") ?? undefined;
        updateTemperatureDisplay();
        return;
      }

      if (sceneNumber >= 6 && sceneNumber <= 9) {
        const labels: Readonly<Record<number, string>> = {
          6: "FROZEN",
          7: "CRUSHED",
          8: "OVERHEATED",
          9: "DO NOT CHEAT",
        };
        const cursorEffects: Readonly<Record<number, string>> = {
          6: "frozen",
          7: "crushed",
          8: "heated",
        };
        const effectImage = cursorEffects[sceneNumber]
          ? `<img class="level-47__death-cursor level-47__death-cursor--${cursorEffects[sceneNumber]}"
              src="${assetUrl("images/level47a2.png")}" alt="Failed cursor" draggable="false" />`
          : "";
        stage.innerHTML = `
          ${heading()}
          <p class="level-47__death-label level-47__death-label--scene-${sceneNumber}">${labels[sceneNumber]}</p>
          ${effectImage}
          <button class="level-47__target level-47__restart-target" type="button" aria-label="Restart maze"></button>
        `;
        if (sceneNumber === 7) audio.playEffect(SOUND_EFFECTS.smack);
        bindRestartTarget();
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
        audio.playEffect(SOUND_EFFECTS.pop);
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

        input.focus();
      });
    };

    renderScene();
    animationFrame = window.requestAnimationFrame(animateCursor);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      delete screen.dataset.customCursorRoot;
      delete screen.dataset.invincible;
    };
  },
};
