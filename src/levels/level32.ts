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

interface EnemyRect extends PortalRect {
  readonly variant?: "large" | "small";
  readonly rotation?: number;
  readonly rotationOrigin?: "bottom" | "center";
  readonly hitboxes?: readonly PortalRect[];
}

interface FallingBlockLayout {
  readonly x: number;
  readonly size: number;
  readonly speed: number;
  readonly offset: number;
}

interface FallingBlockState extends FallingBlockLayout {
  y: number;
}

interface EnemyMask {
  readonly alpha: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

interface PlayerScene {
  readonly number: 1 | 2 | 3 | 4 | 5 | 6;
  readonly className: string;
  readonly backgroundImage: string;
  readonly platforms: readonly PlatformLayout[];
  readonly portal: PortalRect;
  readonly start: { readonly x: number; readonly y: number };
  readonly bounds: RedGuyRect;
  readonly walls?: readonly RedGuyRect[];
  readonly enemies?: readonly EnemyRect[];
  readonly fallingBlocks?: readonly FallingBlockLayout[];
  readonly portalIsFatal?: boolean;
  readonly dieAction?: () => void;
  readonly jumpSpeed?: number;
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

const SCENE_WALLS: readonly RedGuyRect[] = [
  { x: -28, y: 0, width: 28, height: 600 },
  { x: 800, y: 0, width: 28, height: 600 },
];

const SCENE_FOUR_WALLS: readonly RedGuyRect[] = [
  { x: -190, y: -140, width: 40, height: 740 },
  { x: -40, y: 16, width: 40, height: 117 },
  { x: 800, y: -140, width: 28, height: 740 },
];

const SCENE_FOUR_PLATFORMS: readonly PlatformLayout[] = [
  { x: -150, y: 558, width: 950, height: 28 },
  { x: -40, y: 133, width: 450, height: 28 },
  { x: -4, y: -28, width: 694, height: 28 },
];

const SCENE_FIVE_PLATFORMS: readonly PlatformLayout[] = [
  { x: 180, y: 530, width: 60, height: 28 },
  { x: 330, y: 485, width: 95, height: 28 },
  { x: 475, y: 445, width: 110, height: 28 },
  { x: 630, y: 365, width: 142, height: 28 },
  { x: 28, y: 270, width: 532, height: 28 },
];

const SCENE_SIX_PLATFORMS: readonly PlatformLayout[] = [
  { x: 72, y: 520, width: 150, height: 28 },
  { x: 185, y: 405, width: 150, height: 28, drops: true },
  { x: 405, y: 330, width: 150, height: 28 },
  { x: 610, y: 250, width: 162, height: 28, drops: true },
  { x: 300, y: 205, width: 145, height: 28, drops: true },
];

const SCENE_FIVE_BLOCKS: readonly FallingBlockLayout[] = [
  { x: 72, size: 38, speed: 150, offset: 30 },
  { x: 170, size: 38, speed: 215, offset: 145 },
  { x: 268, size: 38, speed: 178, offset: 260 },
  { x: 366, size: 38, speed: 260, offset: 80 },
  { x: 464, size: 38, speed: 195, offset: 330 },
  { x: 562, size: 38, speed: 235, offset: 205 },
  { x: 660, size: 38, speed: 168, offset: 420 },
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

function touchesEnemyMask(
  player: { readonly x: number; readonly y: number },
  enemy: EnemyRect,
  mask: EnemyMask,
): boolean {
  const radians = ((enemy.rotation ?? 0) * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const originX = enemy.x + enemy.width / 2;
  const localOriginY = enemy.rotationOrigin === "center" ? enemy.height / 2 : enemy.height;
  const originY = enemy.y + localOriginY;
  const imageScale = Math.min(enemy.width / mask.width, enemy.height / mask.height);
  const renderedWidth = mask.width * imageScale;
  const renderedHeight = mask.height * imageScale;
  const imageOffsetX = (enemy.width - renderedWidth) / 2;
  const imageOffsetY = enemy.height - renderedHeight;

  for (let sampleY = player.y + 2; sampleY < player.y + PLAYER_HEIGHT - 1; sampleY += 3) {
    for (let sampleX = player.x + 2; sampleX < player.x + PLAYER_WIDTH - 1; sampleX += 3) {
      const deltaX = sampleX - originX;
      const deltaY = sampleY - originY;
      const localX = cosine * deltaX + sine * deltaY + enemy.width / 2;
      const localY = -sine * deltaX + cosine * deltaY + localOriginY;
      const imageX = Math.floor((localX - imageOffsetX) / imageScale);
      const imageY = Math.floor((localY - imageOffsetY) / imageScale);
      if (imageX < 0 || imageY < 0 || imageX >= mask.width || imageY >= mask.height) continue;
      if ((mask.alpha[imageY * mask.width + imageX] ?? 0) > 32) return true;
    }
  }
  return false;
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

    const renderPendingSceneSeven = () => {
      clearScene();
      screen.className = "level-screen level-32 level-32--scene-7";
      screen.style.removeProperty("--level-32-background");
      screen.innerHTML = `${heading()}<div class="level-32__scene-pending" aria-label="Scene 7"></div>`;
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

    const renderPlayerScene = ({
      number,
      className,
      backgroundImage,
      platforms: layout,
      portal,
      start,
      bounds,
      walls = [],
      enemies = [],
      fallingBlocks = [],
      portalIsFatal = false,
      dieAction = renderFail,
      jumpSpeed,
      next,
    }: PlayerScene) => {
      clearScene();
      screen.className = `level-screen level-32 ${className}`;
      screen.style.setProperty("--level-32-background", `url("${assetUrl(`images/${backgroundImage}`)}")`);

      const platforms: PlatformState[] = layout.map((platform, id) => ({ ...platform, id, fallSpeed: 0 }));
      const fallingBlockStates: FallingBlockState[] = fallingBlocks.map((block) => ({ ...block, y: -block.size - block.offset }));
      screen.innerHTML = `
        ${heading()}
        <button class="level-32__die" type="button">DIE</button>
        ${portalMarkup(portal)}
        <div class="level-32__walls" aria-hidden="true">
          ${walls.map((wall) => `<i class="level-32__wall" style="left:${wall.x}px;top:${wall.y}px;width:${wall.width}px;height:${wall.height}px"></i>`).join("")}
        </div>
        <div class="level-32__platforms">
          ${platforms.map((platform) => `
            <div class="level-32__platform${platform.drops ? " level-32__platform--unstable" : ""}${platform.draggable ? " level-32__platform--draggable" : ""}"
              data-platform-id="${platform.id}" ${platform.draggable ? 'data-allow-drag role="button" aria-label="Draggable platform"' : 'aria-hidden="true"'}
              style="left:${platform.x}px;top:${platform.y}px;width:${platform.width}px;height:${platform.height}px"></div>
          `).join("")}
        </div>
        <div class="level-32__enemies" aria-hidden="true">
          ${enemies.map((enemy, index) => `<img class="level-32__steve level-32__steve--${enemy.variant ?? "large"}"
            data-enemy-index="${index}"
            src="${assetUrl("images/Steve.gif")}" alt=""
            style="left:${enemy.x}px;top:${enemy.y}px;width:${enemy.width}px;height:${enemy.height}px;--level-32-steve-rotation:${enemy.rotation ?? 0}deg" />`).join("")}
        </div>
        <div class="level-32__falling-blocks" aria-hidden="true">
          ${fallingBlockStates.map((block, index) => `<i class="level-32__falling-block" data-falling-block="${index}"
            style="left:${block.x}px;top:${block.y}px;width:${block.size}px;height:${block.size}px"></i>`).join("")}
        </div>
      `;

      screen.querySelector<HTMLButtonElement>(".level-32__die")?.addEventListener("click", dieAction, { once: true });

      const platformElements = new Map<number, HTMLElement>();
      screen.querySelectorAll<HTMLElement>("[data-platform-id]").forEach((element) => {
        const id = Number(element.dataset.platformId);
        platformElements.set(id, element);
        const platform = platforms[id];
        if (platform?.draggable) bindDraggablePlatform(platform, element);
      });

      const fallingPlatforms = new Set<number>();
      const triggeredPlatforms = new Set<number>();
      const fallingBlockElements = [...screen.querySelectorAll<HTMLElement>("[data-falling-block]")];
      const enemyMasks = new Map<number, EnemyMask>();
      screen.querySelectorAll<HTMLImageElement>("[data-enemy-index]").forEach((image) => {
        const captureMask = () => {
          if (!image.naturalWidth || !image.naturalHeight) return;
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const canvasContext = canvas.getContext("2d", { willReadFrequently: true });
          if (!canvasContext) return;
          canvasContext.drawImage(image, 0, 0);
          const pixels = canvasContext.getImageData(0, 0, canvas.width, canvas.height).data;
          const alpha = new Uint8ClampedArray(canvas.width * canvas.height);
          for (let index = 0; index < alpha.length; index += 1) alpha[index] = pixels[index * 4 + 3] ?? 0;
          enemyMasks.set(Number(image.dataset.enemyIndex), { alpha, width: canvas.width, height: canvas.height });
        };
        if (image.complete) captureMask();
        else image.addEventListener("load", captureMask, { once: true });
      });
      let lastFrame = performance.now();
      let transitioning = false;

      activeRedGuy = createRedGuy(context, {
        parent: screen,
        x: start.x,
        y: start.y,
        bodyWidth: PLAYER_WIDTH,
        bodyHeight: PLAYER_HEIGHT,
        platforms: () => platforms as readonly RedGuyRect[],
        solidObstacles: walls,
        oneWayPlatforms: true,
        jumpSpeed,
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

        fallingBlockStates.forEach((block, index) => {
          block.y += block.speed * deltaSeconds;
          if (block.y > 610) block.y = -block.size - block.offset;
          const element = fallingBlockElements[index];
          if (element) element.style.top = `${block.y}px`;
        });

        const player = activeRedGuy.getSnapshot();
        if (player.y > 610) {
          transitioning = true;
          renderFail();
          return;
        }

        const hitEnemy = enemies.some((enemy, index) => {
          const mask = enemyMasks.get(index);
          if (mask) return touchesEnemyMask(player, enemy, mask);
          return (enemy.hitboxes ?? [enemy]).some((hitbox) =>
            overlaps(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, hitbox.x, hitbox.y, hitbox.width, hitbox.height),
          );
        });
        const hitFallingBlock = fallingBlockStates.some((block) =>
          overlaps(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, block.x, block.y, block.size, block.size),
        );
        if (hitEnemy || hitFallingBlock) {
          transitioning = true;
          renderFail();
          return;
        }

        if (overlaps(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, portal.x, portal.y, portal.width, portal.height)) {
          transitioning = true;
          if (portalIsFatal) renderFail();
          else next();
          return;
        }

        if ((number !== 1 && number !== 6) || !player.grounded) return;
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
        backgroundImage: "level32bg1.jpg",
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
        backgroundImage: "level32bg1.jpg",
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
        backgroundImage: "level32bg1.jpg",
        platforms: [],
        portal: { x: 260, y: 512, width: 58, height: 58 },
        start: { x: 430, y: -105 },
        bounds: { x: 0, y: -140, width: 800, height: 900 },
        next: renderSceneFour,
      });
    }

    function renderSceneFour() {
      renderPlayerScene({
        number: 4,
        className: "level-32--scene-4",
        backgroundImage: "level32bg2.jpg",
        platforms: SCENE_FOUR_PLATFORMS,
        portal: { x: 22, y: 430, width: 58, height: 58 },
        start: { x: 36, y: 133 - PLAYER_HEIGHT },
        bounds: { x: -190, y: -140, width: 1_018, height: 880 },
        walls: SCENE_FOUR_WALLS,
        jumpSpeed: 700,
        enemies: [{
          x: 400,
          y: 125,
          width: 440,
          height: 435,
          variant: "large",
          hitboxes: [
            { x: 510, y: 180, width: 210, height: 125 },
            { x: 495, y: 305, width: 235, height: 220 },
            { x: 425, y: 285, width: 82, height: 150 },
            { x: 725, y: 275, width: 75, height: 185 },
          ],
        }],
        next: renderSceneFive,
      });
    }

    function renderSceneFive() {
      renderPlayerScene({
        number: 5,
        className: "level-32--scene-5",
        backgroundImage: "level32bg3.jpg",
        platforms: SCENE_FIVE_PLATFORMS,
        portal: { x: 180, y: 190, width: 58, height: 58 },
        start: { x: 190, y: 530 - PLAYER_HEIGHT },
        bounds: { x: 0, y: 0, width: 800, height: 760 },
        walls: SCENE_WALLS,
        enemies: [
          {
            x: 600,
            y: 430,
            width: 225,
            height: 190,
            variant: "large",
            rotation: 40,
            rotationOrigin: "center",
            hitboxes: [
              { x: 620, y: 468, width: 150, height: 105 },
              { x: 755, y: 455, width: 42, height: 78 },
            ],
          },
          {
            x: 704,
            y: 290,
            width: 68,
            height: 62,
            variant: "small",
            hitboxes: [{ x: 714, y: 300, width: 44, height: 44 }],
          },
        ],
        fallingBlocks: SCENE_FIVE_BLOCKS,
        next: renderSceneSix,
      });
    }

    function renderSceneSix() {
      renderPlayerScene({
        number: 6,
        className: "level-32--scene-6",
        backgroundImage: "level32bg4.jpg",
        platforms: SCENE_SIX_PLATFORMS,
        portal: { x: 22, y: 16, width: 58, height: 58 },
        start: { x: 86, y: 520 - PLAYER_HEIGHT },
        bounds: { x: 0, y: 0, width: 800, height: 760 },
        walls: SCENE_WALLS,
        portalIsFatal: true,
        dieAction: renderPendingSceneSeven,
        next: renderFail,
      });
    }

    renderSceneOne();
    return () => {
      clearScene();
      audio.stopMusic();
    };
  },
};
