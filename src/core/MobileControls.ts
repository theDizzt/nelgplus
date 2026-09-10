const VIRTUAL_POINTER_ID = 9184;
const CURSOR_STEP = 5.5;

type Direction = "up" | "down" | "left" | "right";
type MobileControlEvent = Event & { __nelgMobileControl?: boolean };

const DIRECTION_KEYS: Record<Direction, string> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

function markMobileEvent<T extends Event>(event: T): T {
  (event as MobileControlEvent).__nelgMobileControl = true;
  return event;
}

export class MobileControls {
  private controller?: AbortController;
  private cursorX = 400;
  private cursorY = 300;
  private hoverTarget?: Element;
  private primaryTarget?: Element;
  private primaryPointerId = VIRTUAL_POINTER_ID;
  private cursorMovedWhilePressed = false;
  private animationFrame?: number;
  private readonly directions = new Set<Direction>();
  private readonly directionPointers = new Map<number, Direction>();
  private readonly spacePointers = new Set<number>();

  constructor(private readonly root: HTMLElement) {}

  mount(): void {
    this.unmount();

    const panel = document.createElement("section");
    panel.className = "mobile-controls";
    panel.setAttribute("aria-label", "Mobile game controls");
    panel.innerHTML = `
      <div class="mobile-controls__dpad" aria-label="Direction controls">
        <button class="mobile-control mobile-control--up" type="button" data-direction="up" aria-label="Up">▲</button>
        <button class="mobile-control mobile-control--left" type="button" data-direction="left" aria-label="Left">◀</button>
        <button class="mobile-control mobile-control--center" type="button" data-mobile-action="keyboard" aria-label="Open keyboard">⌨</button>
        <button class="mobile-control mobile-control--right" type="button" data-direction="right" aria-label="Right">▶</button>
        <button class="mobile-control mobile-control--down" type="button" data-direction="down" aria-label="Down">▼</button>
      </div>
      <div class="mobile-controls__actions" aria-label="Action controls">
        <button class="mobile-control mobile-control--small" type="button" data-mobile-action="wheel-up" aria-label="Scroll up">＋</button>
        <button class="mobile-control mobile-control--small" type="button" data-mobile-action="wheel-down" aria-label="Scroll down">−</button>
        <button class="mobile-control mobile-control--secondary" type="button" data-mobile-action="secondary" aria-label="Right click">B</button>
        <button class="mobile-control mobile-control--primary" type="button" data-mobile-action="primary" aria-label="Click or hold">A</button>
        <button class="mobile-control mobile-control--space" type="button" data-mobile-action="space" aria-label="Space key">SPACE</button>
      </div>
      <div class="mobile-controls__cursor" aria-hidden="true"></div>
      <input class="mobile-controls__keyboard" type="text" inputmode="text" autocomplete="off"
        autocapitalize="none" spellcheck="false" aria-label="Mobile keyboard input" />
    `;
    this.root.append(panel);

    const controller = new AbortController();
    this.controller = controller;
    const signal = controller.signal;
    panel.addEventListener("pointerdown", (event) => this.handlePointerDown(event), { signal });
    window.addEventListener("pointerup", (event) => this.handlePointerUp(event), { signal });
    window.addEventListener("pointercancel", (event) => this.handlePointerUp(event), { signal });
    panel.addEventListener("contextmenu", (event) => event.preventDefault(), { signal });

    const keyboard = panel.querySelector<HTMLInputElement>(".mobile-controls__keyboard");
    keyboard?.addEventListener("input", () => {
      const characters = Array.from(keyboard.value);
      keyboard.value = "";
      characters.forEach((character) => this.tapKey(character, character === " " ? "Space" : undefined));
    }, { signal });
    keyboard?.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key.length !== 1) {
        event.preventDefault();
        this.tapKey(event.key, event.code);
      }
    }, { signal });

    this.updateCursor();
    this.updateHoverTarget();
  }

  unmount(): void {
    this.controller?.abort();
    this.controller = undefined;
    if (this.animationFrame !== undefined) window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = undefined;
    this.releaseAllKeys();
    this.root.querySelector(".mobile-controls")?.remove();
    this.hoverTarget = undefined;
    this.primaryTarget = undefined;
  }

  private handlePointerDown(event: PointerEvent): void {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    const direction = button.dataset.direction as Direction | undefined;
    if (direction) {
      this.directionPointers.set(event.pointerId, direction);
      if (!this.directions.has(direction)) this.dispatchKey("keydown", DIRECTION_KEYS[direction]);
      this.directions.add(direction);
      this.startMoving();
      return;
    }

    switch (button.dataset.mobileAction) {
      case "primary":
        this.pressPrimary(event.pointerId);
        break;
      case "secondary":
        this.secondaryClick();
        break;
      case "space":
        this.spacePointers.add(event.pointerId);
        if (this.spacePointers.size === 1) this.dispatchKey("keydown", " ", "Space");
        break;
      case "keyboard":
        this.root.querySelector<HTMLInputElement>(".mobile-controls__keyboard")?.focus({ preventScroll: true });
        break;
      case "wheel-up":
        this.dispatchWheel(-120);
        break;
      case "wheel-down":
        this.dispatchWheel(120);
        break;
    }
  }

  private handlePointerUp(event: PointerEvent): void {
    const direction = this.directionPointers.get(event.pointerId);
    if (direction) {
      this.directionPointers.delete(event.pointerId);
      const stillPressed = Array.from(this.directionPointers.values()).includes(direction);
      if (!stillPressed) {
        this.directions.delete(direction);
        this.dispatchKey("keyup", DIRECTION_KEYS[direction]);
      }
    }
    if (event.pointerId === this.primaryPointerId && this.primaryTarget) this.releasePrimary();
    if (this.spacePointers.delete(event.pointerId) && this.spacePointers.size === 0) {
      this.dispatchKey("keyup", " ", "Space");
    }
  }

  private startMoving(): void {
    if (this.animationFrame !== undefined) return;
    let previousTime = performance.now();
    const move = (time: number) => {
      const elapsed = Math.min(32, time - previousTime);
      previousTime = time;
      const distance = CURSOR_STEP * (elapsed / 16.67);
      if (this.directions.has("left")) this.cursorX -= distance;
      if (this.directions.has("right")) this.cursorX += distance;
      if (this.directions.has("up")) this.cursorY -= distance;
      if (this.directions.has("down")) this.cursorY += distance;
      this.cursorX = Math.max(0, Math.min(799, this.cursorX));
      this.cursorY = Math.max(0, Math.min(599, this.cursorY));
      this.updateCursor();
      this.updateHoverTarget();
      this.dispatchPointer("pointermove", this.primaryTarget ?? this.hoverTarget, this.primaryTarget ? 1 : 0);
      if (this.primaryTarget) this.cursorMovedWhilePressed = true;
      if (this.directions.size > 0) this.animationFrame = window.requestAnimationFrame(move);
      else this.animationFrame = undefined;
    };
    this.animationFrame = window.requestAnimationFrame(move);
  }

  private pressPrimary(pointerId: number): void {
    const target = this.elementAtCursor();
    if (!target) return;
    this.primaryTarget = target;
    this.primaryPointerId = pointerId;
    this.cursorMovedWhilePressed = false;
    this.dispatchPointer("pointerdown", target, 1, 0, pointerId);
    try {
      if ("releasePointerCapture" in target) {
        (target as Element & { releasePointerCapture(pointerId: number): void }).releasePointerCapture(pointerId);
      }
    } catch {
      // Synthetic pointer capture is not supported consistently across mobile browsers.
    }
  }

  private releasePrimary(): void {
    const target = this.primaryTarget;
    if (!target) return;
    this.dispatchPointer("pointerup", target, 0, 0, this.primaryPointerId);
    if (!this.cursorMovedWhilePressed) {
      target.dispatchEvent(markMobileEvent(new MouseEvent("click", {
        ...this.pointerCoordinates(), bubbles: true, cancelable: true, button: 0,
      })));
    }
    this.primaryTarget = undefined;
    this.primaryPointerId = VIRTUAL_POINTER_ID;
  }

  private secondaryClick(): void {
    const target = this.elementAtCursor();
    if (!target) return;
    this.dispatchPointer("pointerdown", target, 2, 2);
    this.dispatchPointer("pointerup", target, 0, 2);
    target.dispatchEvent(markMobileEvent(new MouseEvent("contextmenu", {
      ...this.pointerCoordinates(), bubbles: true, cancelable: true, button: 2, buttons: 0,
    })));
  }

  private dispatchWheel(deltaY: number): void {
    this.elementAtCursor()?.dispatchEvent(markMobileEvent(new WheelEvent("wheel", {
      ...this.pointerCoordinates(), bubbles: true, cancelable: true,
      deltaMode: WheelEvent.DOM_DELTA_PIXEL, deltaY,
    })));
  }

  private tapKey(key: string, code?: string): void {
    this.dispatchKey("keydown", key, code);
    this.dispatchKey("keyup", key, code);
  }

  private dispatchKey(type: "keydown" | "keyup", key: string, code = key): void {
    document.dispatchEvent(markMobileEvent(new KeyboardEvent(type, {
      key, code, bubbles: true, cancelable: true,
    })));
  }

  private releaseAllKeys(): void {
    this.directions.forEach((direction) => this.dispatchKey("keyup", DIRECTION_KEYS[direction]));
    this.directions.clear();
    this.directionPointers.clear();
    this.spacePointers.clear();
    this.dispatchKey("keyup", " ", "Space");
  }

  private dispatchPointer(
    type: string,
    target: Element | undefined,
    buttons: number,
    button = -1,
    pointerId = this.primaryTarget ? this.primaryPointerId : VIRTUAL_POINTER_ID,
  ): void {
    target?.dispatchEvent(markMobileEvent(new PointerEvent(type, {
      ...this.pointerCoordinates(), bubbles: true, cancelable: true, pointerId,
      pointerType: "touch", isPrimary: true, button, buttons,
    })));
  }

  private updateHoverTarget(): void {
    const nextTarget = this.elementAtCursor();
    if (nextTarget === this.hoverTarget) return;
    if (this.hoverTarget) {
      this.dispatchPointer("pointerout", this.hoverTarget, 0);
      this.dispatchPointer("pointerleave", this.hoverTarget, 0);
    }
    this.hoverTarget = nextTarget;
    if (nextTarget) {
      this.dispatchPointer("pointerover", nextTarget, 0);
      this.dispatchPointer("pointerenter", nextTarget, 0);
    }
  }

  private elementAtCursor(): Element | undefined {
    const { clientX, clientY } = this.pointerCoordinates();
    const panel = this.root.querySelector<HTMLElement>(".mobile-controls");
    if (panel) panel.style.visibility = "hidden";
    const target = document.elementFromPoint(clientX, clientY) ?? undefined;
    if (panel) panel.style.visibility = "";
    return target?.closest(".mobile-controls") ? undefined : target;
  }

  private pointerCoordinates(): { clientX: number; clientY: number; screenX: number; screenY: number } {
    const frame = this.root.querySelector<HTMLElement>(".game-frame");
    const rect = frame?.getBoundingClientRect();
    const scaleX = rect ? rect.width / 800 : 1;
    const scaleY = rect ? rect.height / 600 : 1;
    const clientX = (rect?.left ?? 0) + this.cursorX * scaleX;
    const clientY = (rect?.top ?? 0) + this.cursorY * scaleY;
    return { clientX, clientY, screenX: clientX, screenY: clientY };
  }

  private updateCursor(): void {
    const cursor = this.root.querySelector<HTMLElement>(".mobile-controls__cursor");
    if (!cursor) return;
    const rootRect = this.root.getBoundingClientRect();
    const { clientX, clientY } = this.pointerCoordinates();
    cursor.style.translate = `${clientX - rootRect.left}px ${clientY - rootRect.top}px`;
  }
}
