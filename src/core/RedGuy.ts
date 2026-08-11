import type { LevelContext } from "./types";
import { assetUrl } from "./assets";

export interface RedGuyRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type RedGuyState = "idle" | "walking" | "jumping" | "falling" | "crouching";
export type RedGuyFacing = "left" | "right";

export interface RedGuySnapshot {
  readonly x: number;
  readonly y: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly grounded: boolean;
  readonly facing: RedGuyFacing;
  readonly state: RedGuyState;
}

export interface RedGuyOptions {
  readonly parent: HTMLElement;
  readonly x: number;
  readonly y: number;
  readonly platforms: readonly RedGuyRect[] | (() => readonly RedGuyRect[]);
  readonly bounds?: RedGuyRect;
  readonly bodyWidth?: number;
  readonly bodyHeight?: number;
  readonly moveAcceleration?: number;
  readonly groundDeceleration?: number;
  readonly crouchDeceleration?: number;
  readonly maximumMoveSpeed?: number;
  readonly jumpSpeed?: number;
  readonly gravity?: number;
  readonly maximumFallSpeed?: number;
  readonly onLand?: (impactSpeed: number) => void;
  readonly onStateChange?: (state: RedGuyState) => void;
}

const SPRITES: Readonly<Record<RedGuyState | "walk-alt", string>> = {
  idle: assetUrl("images/red_1.png"),
  walking: assetUrl("images/red_2.png"),
  "walk-alt": assetUrl("images/red_3.png"),
  jumping: assetUrl("images/red_4.png"),
  falling: assetUrl("images/red_5.png"),
  crouching: assetUrl("images/red_6.png"),
};

const VISUAL_WIDTH = 64;
const VISUAL_HEIGHT = 82;
const WALK_FRAME_SECONDS = 0.11;
const COYOTE_TIME_MS = 90;
const JUMP_BUFFER_MS = 110;

function approach(value: number, target: number, maximumChange: number): number {
  if (value < target) return Math.min(value + maximumChange, target);
  if (value > target) return Math.max(value - maximumChange, target);
  return target;
}

function overlaps(minA: number, maxA: number, minB: number, maxB: number): boolean {
  return maxA > minB + 0.001 && minA < maxB - 0.001;
}

function isEditableTarget(target: EventTarget | null): boolean {
  const element = target instanceof HTMLElement ? target : undefined;
  return Boolean(element?.closest("input, textarea, select, [contenteditable='true']"));
}

export class RedGuyController {
  readonly element: HTMLDivElement;

  private readonly sprite: HTMLImageElement;
  private readonly keys = { left: false, right: false, down: false };
  private readonly bounds: RedGuyRect;
  private readonly bodyWidth: number;
  private readonly bodyHeight: number;
  private readonly moveAcceleration: number;
  private readonly groundDeceleration: number;
  private readonly crouchDeceleration: number;
  private readonly maximumMoveSpeed: number;
  private readonly jumpSpeed: number;
  private readonly gravity: number;
  private readonly maximumFallSpeed: number;

  private x: number;
  private y: number;
  private velocityX = 0;
  private velocityY = 0;
  private grounded = false;
  private facing: RedGuyFacing = "right";
  private state: RedGuyState = "idle";
  private walkFrame = 0;
  private walkFrameElapsed = 0;
  private lastTick = performance.now();
  private lastGroundedAt = Number.NEGATIVE_INFINITY;
  private jumpQueuedAt = Number.NEGATIVE_INFINITY;
  private enabled = true;
  private destroyed = false;
  private renderedSprite = "";

  constructor(
    private readonly context: LevelContext,
    private readonly options: RedGuyOptions,
  ) {
    this.x = options.x;
    this.y = options.y;
    this.bounds = options.bounds ?? { x: 0, y: 0, width: 800, height: 600 };
    this.bodyWidth = options.bodyWidth ?? 38;
    this.bodyHeight = options.bodyHeight ?? 72;
    this.moveAcceleration = options.moveAcceleration ?? 820;
    this.groundDeceleration = options.groundDeceleration ?? 180;
    this.crouchDeceleration = options.crouchDeceleration ?? 1_500;
    this.maximumMoveSpeed = options.maximumMoveSpeed ?? 240;
    this.jumpSpeed = options.jumpSpeed ?? 520;
    this.gravity = options.gravity ?? 1_050;
    this.maximumFallSpeed = options.maximumFallSpeed ?? 590;

    this.element = document.createElement("div");
    this.element.className = "red-guy";
    this.element.setAttribute("aria-label", "Red Guy player character");
    this.element.setAttribute("role", "img");

    this.sprite = document.createElement("img");
    this.sprite.className = "red-guy__sprite";
    this.sprite.alt = "";
    this.sprite.draggable = false;
    this.element.append(this.sprite);
    options.parent.append(this.element);

    this.bindControls();
    this.render(true);
    context.interval(() => this.tick(), 16);
  }

  getSnapshot(): RedGuySnapshot {
    return {
      x: this.x,
      y: this.y,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      grounded: this.grounded,
      facing: this.facing,
      state: this.state,
    };
  }

  teleport(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.grounded = false;
    this.lastTick = performance.now();
    this.render(true);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keys.left = false;
      this.keys.right = false;
      this.keys.down = false;
      this.jumpQueuedAt = Number.NEGATIVE_INFINITY;
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.element.remove();
  }

  private getPlatforms(): readonly RedGuyRect[] {
    return typeof this.options.platforms === "function" ? this.options.platforms() : this.options.platforms;
  }

  private bindControls(): void {
    this.context.listen(document, "keydown", (event) => {
      if (!this.enabled || isEditableTarget(event.target)) return;
      if (!event.key.startsWith("Arrow")) return;
      event.preventDefault();

      if (event.key === "ArrowLeft") this.keys.left = true;
      if (event.key === "ArrowRight") this.keys.right = true;
      if (event.key === "ArrowDown") this.keys.down = true;
      if (event.key === "ArrowUp" && !event.repeat) this.jumpQueuedAt = performance.now();
    });

    this.context.listen(document, "keyup", (event) => {
      if (!event.key.startsWith("Arrow")) return;
      if (event.key === "ArrowLeft") this.keys.left = false;
      if (event.key === "ArrowRight") this.keys.right = false;
      if (event.key === "ArrowDown") this.keys.down = false;
    });

    this.context.listen(window, "blur", () => {
      this.keys.left = false;
      this.keys.right = false;
      this.keys.down = false;
    });
  }

  private tick(): void {
    if (this.destroyed || !this.enabled) return;
    const now = performance.now();
    const deltaSeconds = Math.min((now - this.lastTick) / 1_000, 0.034);
    this.lastTick = now;

    const direction = Number(this.keys.right) - Number(this.keys.left);
    const crouching = this.grounded && this.keys.down;
    if (direction !== 0) this.facing = direction < 0 ? "left" : "right";

    if (direction !== 0 && !crouching) {
      const airControl = this.grounded ? 1 : 0.58;
      this.velocityX = approach(
        this.velocityX,
        direction * this.maximumMoveSpeed,
        this.moveAcceleration * airControl * deltaSeconds,
      );
    } else {
      const deceleration = this.grounded
        ? crouching
          ? this.crouchDeceleration
          : this.groundDeceleration
        : this.groundDeceleration * 0.08;
      this.velocityX = approach(this.velocityX, 0, deceleration * deltaSeconds);
    }

    if (
      now - this.jumpQueuedAt <= JUMP_BUFFER_MS &&
      (this.grounded || now - this.lastGroundedAt <= COYOTE_TIME_MS)
    ) {
      this.velocityY = -this.jumpSpeed;
      this.grounded = false;
      this.jumpQueuedAt = Number.NEGATIVE_INFINITY;
    }

    this.velocityY = Math.min(this.velocityY + this.gravity * deltaSeconds, this.maximumFallSpeed);
    this.moveHorizontally(this.velocityX * deltaSeconds);
    this.moveVertically(this.velocityY * deltaSeconds, now);
    this.updateAnimation(deltaSeconds);
    this.render();
  }

  private moveHorizontally(distance: number): void {
    const previousX = this.x;
    let nextX = previousX + distance;
    const bodyTop = this.y;
    const bodyBottom = this.y + this.bodyHeight;

    for (const platform of this.getPlatforms()) {
      if (!overlaps(bodyTop, bodyBottom, platform.y, platform.y + platform.height)) continue;
      if (distance > 0 && previousX + this.bodyWidth <= platform.x && nextX + this.bodyWidth > platform.x) {
        nextX = Math.min(nextX, platform.x - this.bodyWidth);
        this.velocityX = 0;
      } else if (distance < 0 && previousX >= platform.x + platform.width && nextX < platform.x + platform.width) {
        nextX = Math.max(nextX, platform.x + platform.width);
        this.velocityX = 0;
      }
    }

    const minimumX = this.bounds.x;
    const maximumX = this.bounds.x + this.bounds.width - this.bodyWidth;
    const boundedX = Math.max(minimumX, Math.min(nextX, maximumX));
    if (boundedX !== nextX) this.velocityX = 0;
    this.x = boundedX;
  }

  private moveVertically(distance: number, now: number): void {
    const previousY = this.y;
    let nextY = previousY + distance;
    const bodyLeft = this.x;
    const bodyRight = this.x + this.bodyWidth;
    let landed = false;
    let impactSpeed = 0;

    for (const platform of this.getPlatforms()) {
      if (!overlaps(bodyLeft, bodyRight, platform.x, platform.x + platform.width)) continue;
      if (
        distance >= 0 &&
        previousY + this.bodyHeight <= platform.y + 0.5 &&
        nextY + this.bodyHeight >= platform.y
      ) {
        nextY = Math.min(nextY, platform.y - this.bodyHeight);
        impactSpeed = Math.max(impactSpeed, this.velocityY);
        this.velocityY = 0;
        landed = true;
      } else if (
        distance < 0 &&
        previousY >= platform.y + platform.height &&
        nextY <= platform.y + platform.height
      ) {
        nextY = Math.max(nextY, platform.y + platform.height);
        this.velocityY = 0;
      }
    }

    const minimumY = this.bounds.y;
    const floorY = this.bounds.y + this.bounds.height - this.bodyHeight;
    if (nextY < minimumY) {
      nextY = minimumY;
      this.velocityY = 0;
    }
    if (nextY >= floorY) {
      impactSpeed = Math.max(impactSpeed, this.velocityY);
      nextY = floorY;
      this.velocityY = 0;
      landed = true;
    }

    const wasGrounded = this.grounded;
    this.grounded = landed;
    if (landed) {
      this.lastGroundedAt = now;
      if (!wasGrounded && impactSpeed > 35) this.options.onLand?.(impactSpeed);
    }
    this.y = nextY;
  }

  private updateAnimation(deltaSeconds: number): void {
    let nextState: RedGuyState;
    if (!this.grounded) nextState = this.velocityY < -15 ? "jumping" : "falling";
    else if (this.keys.down) nextState = "crouching";
    else if (Math.abs(this.velocityX) > 12) nextState = "walking";
    else nextState = "idle";

    if (nextState === "walking") {
      this.walkFrameElapsed += deltaSeconds;
      if (this.walkFrameElapsed >= WALK_FRAME_SECONDS) {
        this.walkFrameElapsed %= WALK_FRAME_SECONDS;
        this.walkFrame = this.walkFrame === 0 ? 1 : 0;
      }
    } else {
      this.walkFrame = 0;
      this.walkFrameElapsed = 0;
    }

    if (nextState !== this.state) {
      this.state = nextState;
      this.options.onStateChange?.(nextState);
    }
  }

  private render(force = false): void {
    const visualX = this.x + this.bodyWidth / 2 - VISUAL_WIDTH / 2;
    const visualY = this.y + this.bodyHeight - VISUAL_HEIGHT;
    this.element.style.transform = `translate3d(${visualX}px, ${visualY}px, 0)`;
    this.element.dataset.state = this.state;
    this.element.dataset.facing = this.facing;

    const spriteSource = this.state === "walking" && this.walkFrame === 1 ? SPRITES["walk-alt"] : SPRITES[this.state];
    if (force || spriteSource !== this.renderedSprite) {
      this.renderedSprite = spriteSource;
      this.sprite.src = spriteSource;
    }
  }
}

export function createRedGuy(context: LevelContext, options: RedGuyOptions): RedGuyController {
  return new RedGuyController(context, options);
}
