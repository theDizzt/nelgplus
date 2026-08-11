import { createRedGuy, type RedGuyController, type RedGuyRect } from "../core/RedGuy";
import { assetUrl } from "../core/assets";
import type { LevelDefinition } from "../core/types";

interface PlatformLayout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly drops?: boolean;
  readonly draggable?: boolean;
}

interface PlatformState extends PlatformLayout {
  readonly id: number;
  x: number;
  y: number;
  fallSpeed: number;
}

interface PortalRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface PlayerScene {
  readonly number: 1 | 2 | 3;
  readonly className: string;
  readonly platforms: readonly PlatformLayout[];
  readonly portal: PortalRect;
  readonly start: { readonly x: number; readonly y: number };
  readonly bounds: RedGuyRect;
  readonly next: () => void;
}

const PLAYER_WIDTH = 38;
const PLAYER_HEIGHT = 72;

const SCENE_ONE_PLATFORMS: readonly PlatformLayout[] = [
  { x: 635, y: 518, width: 165, height: 24 },
  { x: 470, y: 430, width: 150, height: 24, drops: true },
  { x: 290, y: 350, width: 150, height: 24 },
  { x: 110, y: 430, width: 135, height: 24, drops: true },
  { x: 0, y: 310, width: 155, height: 24 },
  { x: 75, y: 205, width: 155, height: 24, drops: true },
  { x: 270, y: 260, width: 145, height: 24 },
  { x: 455, y: 180, width: 150, height: 24, drops: true },
  { x: 630, y: 115, width: 170, height: 24 },
];

const SCENE_TWO_PLATFORMS: readonly PlatformLayout[] = [
  { x: 30, y: 535, width: 170, height: 28 },
  { x: 245, y: 468, width: 190, height: 28, draggable: true },
  { x: 590, y: 334, width: 210, height: 28 },
  { x: 0, y: 205, width: 210, height: 28 },
];

function overlaps(
  leftA: number,
  topA: number,
  widthA: number,
  heightA: number,
  leftB: number,
  topB: number,
  widthB: number,
  heightB: number,
): boolean {
  return leftA < leftB + widthB && leftA + widthA > leftB && topA < topB + heightB && topA + heightA > topB;
}

export const level32: LevelDefinition = {
  number: 32,
  title: "Wormhole",
  mount(context) {
    const { screen, audio } = context;
    let activeRedGuy: RedGuyController | undefined;
    const sceneTimeouts = new Set<number>();
    const sceneIntervals = new Set<number>();

    void audio.playMusic("/assets/music/level32.mp3", true);

    const clearScene = () => {
      activeRedGuy?.destroy();
      activeRedGuy = undefined;
      sceneTimeouts.forEach((timer) => window.clearTimeout(timer));
      sceneIntervals.forEach((timer) => window.clearInterval(timer));
      sceneTimeouts.clear();
      sceneIntervals.clear();
    };

    const sceneTimeout = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        sceneTimeouts.delete(timer);
        callback();
      }, delay);
      sceneTimeouts.add(timer);
      return timer;
    };

    const sceneInterval = (callback: () => void, delay: number) => {
      const timer = window.setInterval(callback, delay);
      sceneIntervals.add(timer);
      return timer;
    };

    const heading = () => `
      <header class="level-heading level-32__heading">
        <div class="level-heading__number">Level 32</div>
        <h1>Wormhole</h1>
      </header>
    `;

    const portalMarkup = (portal: PortalRect) => `
      <div class="level-32__portal" aria-label="Flashing wormhole portal"
        style="left:${portal.x}px;top:${portal.y}px;width:${portal.width}px;height:${portal.height}px">
        <i></i><i></i><i></i><i></i>
      </div>
    `;

    const renderPendingSceneFour = () => {
      clearScene();
      screen.className = "level-screen level-32 level-32--scene-4";
      screen.style.removeProperty("--level-32-background");
      screen.innerHTML = `${heading()}<div class="level-32__scene-pending" aria-label="Scene 4"></div>`;
    };

    const renderFail = () => {
      clearScene();
      screen.className = "level-screen level-32 level-32--fail";
      screen.style.removeProperty("--level-32-background");
      screen.innerHTML = `${heading()}<p class="level-32__death-message">YOU DIED</p>`;
      sceneTimeout(renderSceneOne, 3_000);
    };

    const bindDraggablePlatform = (platform: PlatformState, element: HTMLElement) => {
      let pointerId: number | undefined;
      let startPointerX = 0;
      let startPointerY = 0;
      let startX = 0;
      let startY = 0;

      element.addEventListener("pointerdown", (event) => {
        const bounds = screen.getBoundingClientRect();
        const scaleX = screen.clientWidth / bounds.width;
        const scaleY = screen.clientHeight / bounds.height;
        pointerId = event.pointerId;
        startPointerX = (event.clientX - bounds.left) * scaleX;
        startPointerY = (event.clientY - bounds.top) * scaleY;
        startX = platform.x;
        startY = platform.y;
        element.setPointerCapture(event.pointerId);
        element.classList.add("is-dragging");
        event.preventDefault();
      });

      element.addEventListener("pointermove", (event) => {
        if (pointerId !== event.pointerId) return;
        const bounds = screen.getBoundingClientRect();
        const scaleX = screen.clientWidth / bounds.width;
        const scaleY = screen.clientHeight / bounds.height;
        const pointerX = (event.clientX - bounds.left) * scaleX;
        const pointerY = (event.clientY - bounds.top) * scaleY;
        const nextX = Math.max(0, Math.min(800 - platform.width, startX + pointerX - startPointerX));
        const nextY = Math.max(145, Math.min(570 - platform.height, startY + pointerY - startPointerY));
        const player = activeRedGuy?.getSnapshot();
        const playerIsStanding = Boolean(
          player?.grounded &&
          Math.abs(player.y + PLAYER_HEIGHT - platform.y) <= 3 &&
          player.x + PLAYER_WIDTH > platform.x &&
          player.x < platform.x + platform.width,
        );
        const verticalChange = nextY - platform.y;
        platform.x = nextX;
        platform.y = nextY;
        element.style.left = `${platform.x}px`;
        element.style.top = `${platform.y}px`;
        if (playerIsStanding && verticalChange < 0) activeRedGuy?.carryUp(verticalChange);
        event.preventDefault();
      });

      const finishDrag = (event: PointerEvent) => {
        if (pointerId !== event.pointerId) return;
        if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
        element.classList.remove("is-dragging");
        pointerId = undefined;
      };
      element.addEventListener("pointerup", finishDrag);
      element.addEventListener("pointercancel", finishDrag);
    };

    const renderPlayerScene = ({ number, className, platforms: layout, portal, start, bounds, next }: PlayerScene) => {
      clearScene();
      screen.className = `level-screen level-32 ${className}`;
      screen.style.setProperty("--level-32-background", `url("${assetUrl("images/level32bg1.jpg")}")`);

      const platforms: PlatformState[] = layout.map((platform, id) => ({ ...platform, id, fallSpeed: 0 }));
      screen.innerHTML = `
        ${heading()}
        <button class="level-32__die" type="button">DIE</button>
        ${portalMarkup(portal)}
        <div class="level-32__platforms">
          ${platforms.map((platform) => `
            <div class="level-32__platform${platform.drops ? " level-32__platform--unstable" : ""}${platform.draggable ? " level-32__platform--draggable" : ""}"
              data-platform-id="${platform.id}" ${platform.draggable ? 'data-allow-drag role="button" aria-label="Draggable platform"' : 'aria-hidden="true"'}
              style="left:${platform.x}px;top:${platform.y}px;width:${platform.width}px;height:${platform.height}px"></div>
          `).join("")}
        </div>
      `;

      screen.querySelector<HTMLButtonElement>(".level-32__die")?.addEventListener("click", renderFail, { once: true });

      const platformElements = new Map<number, HTMLElement>();
      screen.querySelectorAll<HTMLElement>("[data-platform-id]").forEach((element) => {
        const id = Number(element.dataset.platformId);
        platformElements.set(id, element);
        const platform = platforms[id];
        if (platform?.draggable) bindDraggablePlatform(platform, element);
      });

      const fallingPlatforms = new Set<number>();
      const triggeredPlatforms = new Set<number>();
      let lastFrame = performance.now();
      let transitioning = false;

      activeRedGuy = createRedGuy(context, {
        parent: screen,
        x: start.x,
        y: start.y,
        bodyWidth: PLAYER_WIDTH,
        bodyHeight: PLAYER_HEIGHT,
        platforms: () => platforms as readonly RedGuyRect[],
        oneWayPlatforms: true,
        bounds,
      });

      sceneInterval(() => {
        if (!activeRedGuy || transitioning) return;
        const now = performance.now();
        const deltaSeconds = Math.min((now - lastFrame) / 1_000, 0.034);
        lastFrame = now;

        fallingPlatforms.forEach((id) => {
          const platform = platforms[id];
          if (!platform) return;
          platform.fallSpeed = Math.min(platform.fallSpeed + 1_850 * deltaSeconds, 820);
          platform.y += platform.fallSpeed * deltaSeconds;
          const element = platformElements.get(id);
          if (element) element.style.top = `${platform.y}px`;
        });

        const player = activeRedGuy.getSnapshot();
        if (player.y > 610) {
          transitioning = true;
          renderFail();
          return;
        }

        if (overlaps(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, portal.x, portal.y, portal.width, portal.height)) {
          transitioning = true;
          next();
          return;
        }

        if (number !== 1 || !player.grounded) return;
        for (const platform of platforms) {
          if (!platform.drops || triggeredPlatforms.has(platform.id)) continue;
          const standingOnPlatform =
            Math.abs(player.y + PLAYER_HEIGHT - platform.y) <= 3 &&
            player.x + PLAYER_WIDTH > platform.x &&
            player.x < platform.x + platform.width;
          if (!standingOnPlatform) continue;

          triggeredPlatforms.add(platform.id);
          platformElements.get(platform.id)?.classList.add("is-triggered");
          sceneTimeout(() => {
            platform.fallSpeed = 250;
            fallingPlatforms.add(platform.id);
            platformElements.get(platform.id)?.classList.add("is-falling");
          }, 120);
        }
      }, 16);
    };

    function renderSceneOne() {
      renderPlayerScene({
        number: 1,
        className: "level-32--scene-1",
        platforms: SCENE_ONE_PLATFORMS,
        portal: { x: 650, y: 47, width: 58, height: 58 },
        start: { x: 690, y: 518 - PLAYER_HEIGHT },
        bounds: { x: 0, y: 0, width: 800, height: 760 },
        next: renderSceneTwo,
      });
    }

    function renderSceneTwo() {
      renderPlayerScene({
        number: 2,
        className: "level-32--scene-2",
        platforms: SCENE_TWO_PLATFORMS,
        portal: { x: 42, y: 112, width: 58, height: 58 },
        start: { x: 82, y: 535 - PLAYER_HEIGHT },
        bounds: { x: 0, y: 0, width: 800, height: 760 },
        next: renderSceneThree,
      });
    }

    function renderSceneThree() {
      renderPlayerScene({
        number: 3,
        className: "level-32--scene-3",
        platforms: [],
        portal: { x: 260, y: 512, width: 58, height: 58 },
        start: { x: 430, y: -105 },
        bounds: { x: 0, y: -140, width: 800, height: 900 },
        next: renderPendingSceneFour,
      });
    }

    renderSceneOne();
    return () => {
      clearScene();
      audio.stopMusic();
    };
  },
};
