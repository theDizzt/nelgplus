const VIRTUAL_POINTER_ID = 9184;
const CURSOR_STEP = 5.5;
const JOYSTICK_DEAD_ZONE = 0.22;
const MOBILE_CONTROL_MODE_KEY = "nelg-mobile-control-mode";

type Direction = "up" | "down" | "left" | "right";
type MobileControlMode = "dpad" | "joystick";
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
  private panel?: HTMLElement;
  private cursorX = 400;
  private cursorY = 300;
  private hoverTarget?: Element;
  private primaryTarget?: Element;
  private keyboardTarget?: Element;
  private primaryPointerId = VIRTUAL_POINTER_ID;
  private cursorMovedWhilePressed = false;
  private animationFrame?: number;
  private panelHidden = false;
  private controlMode: MobileControlMode = this.loadControlMode();
  private joystickPointerId?: number;
  private joystickX = 0;
  private joystickY = 0;
  private readonly directions = new Set<Direction>();
  private readonly directionPointers = new Map<number, Direction>();
  private readonly spacePointers = new Set<number>();

  constructor(private readonly root: HTMLElement) {}

  mount(): void {
    this.unmount();

    const panel = document.createElement("section");
    panel.className = "mobile-controls";
    panel.dataset.controlMode = this.controlMode;
    panel.setAttribute("aria-label", "Mobile game controls");
    panel.innerHTML = `
      <button class="mobile-control mobile-controls__toggle" type="button" aria-controls="mobile-controls-panel" aria-expanded="${!this.panelHidden}">${this.panelHidden ? "Show controls" : "Hide controls"}</button>
      <div id="mobile-controls-panel" ${this.panelHidden ? "hidden" : ""}>
      <div class="mobile-controls__dpad" aria-label="Direction controls">
        <button class="mobile-control mobile-control--up" type="button" data-direction="up" aria-label="Up">▲</button>
        <button class="mobile-control mobile-control--left" type="button" data-direction="left" aria-label="Left">◀</button>
        <button class="mobile-control mobile-control--right" type="button" data-direction="right" aria-label="Right">▶</button>
        <button class="mobile-control mobile-control--down" type="button" data-direction="down" aria-label="Down">▼</button>
      </div>
      <div class="mobile-controls__joystick" data-mobile-joystick role="button" tabindex="0"
        aria-label="Move virtual cursor">
        <span class="mobile-controls__joystick-knob" aria-hidden="true"></span>
      </div>
      <div class="mobile-controls__actions" aria-label="Action controls">
        <button class="mobile-control mobile-control--mode" type="button" data-mobile-action="mode" aria-label="Switch movement controls">${this.controlMode === "joystick" ? "PAD" : "STICK"}</button>
        <button class="mobile-control mobile-control--small mobile-control--wheel-up" type="button" data-mobile-action="wheel-up" aria-label="Scroll up">＋</button>
        <button class="mobile-control mobile-control--small mobile-control--wheel-down" type="button" data-mobile-action="wheel-down" aria-label="Scroll down">−</button>
        <button class="mobile-control mobile-control--keyboard" type="button" data-mobile-action="keyboard" aria-label="Open keyboard">⌨</button>
        <button class="mobile-control mobile-control--secondary" type="button" data-mobile-action="secondary" aria-label="Right click">B</button>
        <button class="mobile-control mobile-control--primary" type="button" data-mobile-action="primary" aria-label="Click or hold">A</button>
        <button class="mobile-control mobile-control--space" type="button" data-mobile-action="space" aria-label="Space key">SPACE</button>
        <button class="mobile-control mobile-control--enter" type="button" data-mobile-action="enter" aria-label="Enter key">ENTER</button>
      </div>
      <div class="mobile-controls__cursor" aria-hidden="true"></div>
      <input class="mobile-controls__keyboard" type="text" inputmode="text" autocomplete="off"
        autocapitalize="none" spellcheck="false" aria-label="Mobile keyboard input" />
      </div>
    `;
    document.documentElement.classList.add("mobile-controls-active");
    document.body.append(panel);
    this.panel = panel;

    const controller = new AbortController();
    this.controller = controller;
    const signal = controller.signal;
    panel.addEventListener("pointerdown", (event) => this.handlePointerDown(event), { signal });
    panel.addEventListener("pointermove", (event) => this.handlePointerMove(event), { signal });
    window.addEventListener("pointermove", (event) => this.handlePointerMove(event), { signal });
    window.addEventListener("pointerup", (event) => this.handlePointerUp(event), { signal });
    window.addEventListener("pointercancel", (event) => this.handlePointerUp(event), { signal });
    panel.addEventListener("lostpointercapture", (event) => this.handleLostPointerCapture(event), { signal });
    panel.addEventListener("contextmenu", (event) => event.preventDefault(), { signal });

    const toggle = panel.querySelector<HTMLButtonElement>(".mobile-controls__toggle")!;
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      this.panelHidden = !this.panelHidden;
      if (this.panelHidden) {
        if (this.animationFrame !== undefined) window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = undefined;
        this.releaseAllKeys();
        this.releasePrimary(false);
        panel.querySelector<HTMLInputElement>(".mobile-controls__keyboard")?.blur();
        this.dispatchPointer("pointerout", this.hoverTarget, 0);
        this.dispatchPointer("pointerleave", this.hoverTarget, 0);
        this.hoverTarget = undefined;
      }
      panel.querySelector<HTMLElement>("#mobile-controls-panel")!.hidden = this.panelHidden;
      toggle.setAttribute("aria-expanded", String(!this.panelHidden));
      toggle.textContent = this.panelHidden ? "Show controls" : "Hide controls";
      if (!this.panelHidden) {
        this.updateCursor();
        this.updateHoverTarget();
      }
    }, { signal });
    toggle.addEventListener("keydown", (event) => event.stopPropagation(), { signal });
    toggle.addEventListener("keyup", (event) => event.stopPropagation(), { signal });

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
    if (!this.panelHidden) this.updateHoverTarget();
  }

  unmount(): void {
    this.controller?.abort();
    this.controller = undefined;
    if (this.animationFrame !== undefined) window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = undefined;
    this.releaseAllKeys();
    this.panel?.remove();
    this.panel = undefined;
    document.documentElement.classList.remove("mobile-controls-active");
    this.hoverTarget = undefined;
    this.primaryTarget = undefined;
    this.keyboardTarget = undefined;
  }

  private loadControlMode(): MobileControlMode {
    try {
      return localStorage.getItem(MOBILE_CONTROL_MODE_KEY) === "dpad" ? "dpad" : "joystick";
    } catch {
      return "joystick";
    }
  }

  private saveControlMode(): void {
    try {
      localStorage.setItem(MOBILE_CONTROL_MODE_KEY, this.controlMode);
    } catch {
      // Mobile controls should still work when storage is unavailable.
    }
  }

  private handlePointerDown(event: PointerEvent): void {
    const joystick = (event.target as Element).closest<HTMLElement>("[data-mobile-joystick]");
    if (joystick && this.controlMode === "joystick") {
      event.stopPropagation();
      event.preventDefault();
      this.joystickPointerId = event.pointerId;
      if (joystick.setPointerCapture) {
        try {
          joystick.setPointerCapture(event.pointerId);
        } catch {
          // Some mobile browsers reject pointer capture for synthetic overlays.
        }
      }
      this.updateJoystick(event, joystick);
      this.startMoving();
      return;
    }

    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    event.stopPropagation();
    if (button.classList.contains("mobile-controls__toggle")) return;
    event.preventDefault();

    const direction = button.dataset.direction as Direction | undefined;
    if (direction && this.controlMode === "dpad") {
      this.directionPointers.set(event.pointerId, direction);
      const nextDirections = new Set(this.directions);
      nextDirections.add(direction);
      this.setDirections(nextDirections);
      this.startMoving();
      return;
    }

    switch (button.dataset.mobileAction) {
      case "mode":
        this.toggleControlMode(button);
        break;
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
      case "enter":
        this.keyboardTarget = this.findKeyboardTarget() ?? this.keyboardTarget;
        this.tapKey("Enter", "Enter");
        break;
      case "keyboard":
        this.keyboardTarget = this.findKeyboardTarget();
        this.panel?.querySelector<HTMLInputElement>(".mobile-controls__keyboard")?.focus({ preventScroll: true });
        break;
      case "wheel-up":
        this.dispatchWheel(-120);
        break;
      case "wheel-down":
        this.dispatchWheel(120);
        break;
    }
  }

  private handlePointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.joystickPointerId) return;
    const joystick = this.panel?.querySelector<HTMLElement>("[data-mobile-joystick]");
    if (!joystick) return;
    event.preventDefault();
    this.updateJoystick(event, joystick);
  }

  private handleLostPointerCapture(event: PointerEvent): void {
    if (event.pointerId !== this.joystickPointerId) return;
    this.resetJoystick();
  }

  private handlePointerUp(event: PointerEvent): void {
    // Virtual releases also bubble to window; only physical input releases controls.
    if ((event as MobileControlEvent).__nelgMobileControl) return;
    if (event.pointerId === this.joystickPointerId) {
      const joystick = this.panel?.querySelector<HTMLElement>("[data-mobile-joystick]");
      if (joystick?.hasPointerCapture(event.pointerId)) joystick.releasePointerCapture(event.pointerId);
      this.resetJoystick();
    }
    const direction = this.directionPointers.get(event.pointerId);
    if (direction) {
      this.directionPointers.delete(event.pointerId);
      const nextDirections = new Set(this.directionPointers.values());
      this.setDirections(nextDirections);
    }
    if (event.pointerId === this.primaryPointerId && this.primaryTarget) this.releasePrimary();
    if (this.spacePointers.delete(event.pointerId) && this.spacePointers.size === 0) {
      this.dispatchKey("keyup", " ", "Space");
    }
  }

  private toggleControlMode(button?: HTMLButtonElement): void {
    this.releaseAllMovement();
    this.controlMode = this.controlMode === "joystick" ? "dpad" : "joystick";
    this.panel?.setAttribute("data-control-mode", this.controlMode);
    const modeButton = button ?? this.panel?.querySelector<HTMLButtonElement>("[data-mobile-action='mode']");
    if (modeButton) modeButton.textContent = this.controlMode === "joystick" ? "PAD" : "STICK";
    this.saveControlMode();
  }

  private resetJoystick(): void {
    this.joystickPointerId = undefined;
    this.joystickX = 0;
    this.joystickY = 0;
    this.updateJoystickKnob();
    this.setDirections(new Set(this.directionPointers.values()));
  }

  private releaseAllMovement(): void {
    this.setDirections(new Set());
    this.directionPointers.clear();
    this.joystickPointerId = undefined;
    this.joystickX = 0;
    this.joystickY = 0;
    this.updateJoystickKnob();
  }

  private updateJoystick(event: PointerEvent, joystick: HTMLElement): void {
    const rect = joystick.getBoundingClientRect();
    const radius = Math.max(1, Math.min(rect.width, rect.height) / 2);
    const rawX = (event.clientX - rect.left - rect.width / 2) / radius;
    const rawY = (event.clientY - rect.top - rect.height / 2) / radius;
    const length = Math.hypot(rawX, rawY);
    const scale = length > 1 ? 1 / length : 1;
    this.joystickX = rawX * scale;
    this.joystickY = rawY * scale;
    if (Math.hypot(this.joystickX, this.joystickY) < JOYSTICK_DEAD_ZONE) {
      this.joystickX = 0;
      this.joystickY = 0;
    }
    this.updateJoystickKnob();

    const nextDirections = new Set<Direction>();
    if (this.joystickX <= -JOYSTICK_DEAD_ZONE) nextDirections.add("left");
    if (this.joystickX >= JOYSTICK_DEAD_ZONE) nextDirections.add("right");
    if (this.joystickY <= -JOYSTICK_DEAD_ZONE) nextDirections.add("up");
    if (this.joystickY >= JOYSTICK_DEAD_ZONE) nextDirections.add("down");
    this.setDirections(nextDirections);
  }

  private updateJoystickKnob(): void {
    const knob = this.panel?.querySelector<HTMLElement>(".mobile-controls__joystick-knob");
    if (!knob) return;
    knob.style.translate = `${this.joystickX * 28}px ${this.joystickY * 28}px`;
  }

  private setDirections(nextDirections: Set<Direction>): void {
    (Object.keys(DIRECTION_KEYS) as Direction[]).forEach((direction) => {
      const hasDirection = this.directions.has(direction);
      const needsDirection = nextDirections.has(direction);
      if (needsDirection && !hasDirection) {
        this.dispatchKey("keydown", DIRECTION_KEYS[direction]);
      } else if (!needsDirection && hasDirection) {
        this.dispatchKey("keyup", DIRECTION_KEYS[direction]);
      }
    });
    this.directions.clear();
    nextDirections.forEach((direction) => this.directions.add(direction));
  }

  private startMoving(): void {
    if (this.animationFrame !== undefined) return;
    let previousTime = performance.now();
    const move = (time: number) => {
      const elapsed = Math.min(32, time - previousTime);
      previousTime = time;
      const distance = CURSOR_STEP * (elapsed / 16.67);
      if (this.joystickX !== 0 || this.joystickY !== 0) {
        this.cursorX += this.joystickX * distance;
        this.cursorY += this.joystickY * distance;
      } else {
        if (this.directions.has("left")) this.cursorX -= distance;
        if (this.directions.has("right")) this.cursorX += distance;
        if (this.directions.has("up")) this.cursorY -= distance;
        if (this.directions.has("down")) this.cursorY += distance;
      }
      this.cursorX = Math.max(0, Math.min(799, this.cursorX));
      this.cursorY = Math.max(0, Math.min(599, this.cursorY));
      this.updateCursor();
      this.updateHoverTarget();
      this.dispatchPointer("pointermove", this.primaryTarget ?? this.hoverTarget, this.primaryTarget ? 1 : 0);
      if (this.primaryTarget) this.cursorMovedWhilePressed = true;
      if (this.directions.size > 0 || this.joystickX !== 0 || this.joystickY !== 0) this.animationFrame = window.requestAnimationFrame(move);
      else this.animationFrame = undefined;
    };
    this.animationFrame = window.requestAnimationFrame(move);
  }

  private pressPrimary(pointerId: number): void {
    const target = this.elementAtCursor();
    if (!target) return;
    if (this.acceptsKeyboardInput(target)) this.keyboardTarget = target;
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

  private releasePrimary(click = true): void {
    const target = this.primaryTarget;
    if (!target) return;
    const pointerId = this.primaryPointerId;
    const shouldClick = click && !this.cursorMovedWhilePressed;
    // Clear the hold before dispatching events that can synchronously change levels.
    this.primaryTarget = undefined;
    this.primaryPointerId = VIRTUAL_POINTER_ID;
    this.cursorMovedWhilePressed = false;
    this.dispatchPointer("pointerup", target, 0, 0, pointerId);
    if (shouldClick && target.isConnected) {
      target.dispatchEvent(markMobileEvent(new MouseEvent("click", {
        ...this.pointerCoordinates(), bubbles: true, cancelable: true, button: 0,
      })));
    }
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
    this.keyEventTarget().dispatchEvent(markMobileEvent(new KeyboardEvent(type, {
      key, code, bubbles: true, cancelable: true,
    })));
  }

  private keyEventTarget(): Element | Document {
    const active = document.activeElement;
    if (active && active !== document.body && !active.closest(".mobile-controls")) return active;
    if (this.keyboardTarget?.isConnected && !this.keyboardTarget.closest(".mobile-controls")) return this.keyboardTarget;
    return document;
  }

  private findKeyboardTarget(): Element | undefined {
    const active = document.activeElement;
    if (active && active !== document.body && !active.closest(".mobile-controls")) return active;
    const target = this.elementAtCursor();
    return target && this.acceptsKeyboardInput(target) ? target : undefined;
  }

  private acceptsKeyboardInput(target: Element): boolean {
    return target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || target.getAttribute("contenteditable") === "true";
  }

  private releaseAllKeys(): void {
    this.releaseAllMovement();
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
    const panel = this.panel;
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
    const cursor = this.panel?.querySelector<HTMLElement>(".mobile-controls__cursor");
    if (!cursor) return;
    const { clientX, clientY } = this.pointerCoordinates();
    cursor.style.translate = `${clientX}px ${clientY}px`;
  }
}
