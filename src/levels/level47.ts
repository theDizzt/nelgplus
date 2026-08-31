import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import type { LevelDefinition } from "../core/types";

const SCENE_COUNT = 9;
const CURSOR_WIDTH = 15;
const CURSOR_HEIGHT = 22;
const MAX_TEMPERATURE = 100;
const COOLING_RATE = (50 / 6);
const WARMING_RATE = (50 / 8);

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
    ` : ""}
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
    let temperatureBar: HTMLElement | undefined;
    let temperatureValue: HTMLElement | undefined;
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
    const triggerCheatScene = (event?: Event) => {
      if (!isGameScene()) return;
      event?.preventDefault();
      sceneNumber = 9;
      renderScene();
    };
    listen(screen, "contextmenu", (event) => triggerCheatScene(event));
    listen(document, "keydown", (event) => {
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

    const animateCursor = (now: number) => {
      const deltaSeconds = Math.min(0.034, Math.max(0.001, (now - previousAnimationTime) / 1_000));
      previousAnimationTime = now;
      let transitioned = false;
      let inFire = false;
      let inDestination = false;
      const previousCursorX = cursorX;
      const previousCursorY = cursorY;
      const sceneTwoHazards = sceneNumber === 2 ? updateSceneTwoObstacles(now) : undefined;
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

        if (sceneNumber === 2 || sceneNumber === 3) {
          const maze = MAZES[sceneNumber];
          const centerX = cursorX + CURSOR_WIDTH / 2;
          const centerY = cursorY + CURSOR_HEIGHT / 2;
          const movementBounds: MazeRect = {
            x: Math.min(previousCursorX, cursorX),
            y: Math.min(previousCursorY, cursorY),
            width: Math.abs(cursorX - previousCursorX) + CURSOR_WIDTH,
            height: Math.abs(cursorY - previousCursorY) + CURSOR_HEIGHT,
          };
          if (!mazeStarted && (pointInsideRect(centerX, centerY, maze.start) || cursorFitsSafePath(maze))) {
            mazeStarted = true;
          }
          if (sceneNumber === 2 && mazeStarted) {
            inFire = Math.hypot(centerX - (SCENE_TWO_FIRE.x + SCENE_TWO_FIRE.radius),
              centerY - (SCENE_TWO_FIRE.y + SCENE_TWO_FIRE.radius)) <= SCENE_TWO_FIRE.radius;
            inDestination = pointInsideRect(centerX, centerY, SCENE_TWO_DESTINATION);
          }

          if (mazeStarted && !cursorFitsSafePath(maze)) {
            changeScene(7);
          } else if (mazeStarted && sceneTwoHazards
            && (sceneTwoHazards.obstacleBounds.some((obstacle) => rectanglesOverlap(movementBounds, obstacle))
              || rectanglesOverlap(movementBounds, sceneTwoHazards.pressBounds)
              || SCENE_TWO_WALLS.some((wall) => rectanglesOverlap(movementBounds, wall)))) {
            changeScene(7);
          } else if (mazeStarted && sceneNumber === 3 && pointInsideRect(centerX, centerY, maze.finish)) {
            changeScene(4);
          }
        }
      }

      if (!transitioned && isGameScene()) {
        if (sceneNumber === 2 && inFire) temperature += WARMING_RATE * deltaSeconds;
        else if (!(sceneNumber === 2 && inDestination)) temperature -= COOLING_RATE * deltaSeconds;
        temperature = Math.max(0, Math.min(MAX_TEMPERATURE, temperature));

        overheatHoldSeconds = sceneNumber === 2 && inFire && temperature >= MAX_TEMPERATURE - 0.001
          ? overheatHoldSeconds + deltaSeconds
          : 0;
        destinationHoldSeconds = sceneNumber === 2 && inDestination
          ? destinationHoldSeconds + deltaSeconds
          : 0;

        updateTemperatureDisplay();
        if (overheatHoldSeconds >= 8) changeScene(8);
        else if (destinationHoldSeconds >= 3) changeScene(3);
        else if (temperature <= 0) changeScene(6);
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
      screen.className = `level-screen level-47 level-47--scene-${sceneNumber}`;
      obstacleElements = [];
      pressElement = undefined;
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

      if (sceneNumber === 2 || sceneNumber === 3) {
        stage.innerHTML = `${mazeMarkup(sceneNumber)}${heading()}${temperatureMarkup()}`;
        obstacleElements = Array.from(stage.querySelectorAll<HTMLElement>("[data-level-47-obstacle]"));
        pressElement = stage.querySelector<HTMLElement>("[data-level-47-press]") ?? undefined;
        temperatureBar = stage.querySelector<HTMLElement>("[data-level-47-temperature-bar]") ?? undefined;
        temperatureValue = stage.querySelector<HTMLElement>("[data-level-47-temperature-value]") ?? undefined;
        updateTemperatureDisplay();
        return;
      }

      if (sceneNumber >= 4 && sceneNumber <= 5) {
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
