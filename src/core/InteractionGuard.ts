const ALLOW_SELECT = "[data-allow-select]";
const ALLOW_DRAG = "[data-allow-drag]";

function isInside(target: EventTarget | null, selector: string): boolean {
  return target instanceof Element && target.closest(selector) !== null;
}

function blockContextMenu(event: MouseEvent): void {
  event.preventDefault();
  event.returnValue = false;
}

function blockSecondaryPointer(event: MouseEvent | PointerEvent): void {
  if (event.button !== 2) return;
  event.preventDefault();
  event.returnValue = false;
}

export class InteractionGuard {
  private readonly controller = new AbortController();

  enable(): void {
    const options = { signal: this.controller.signal };

    document.addEventListener(
      "selectstart",
      (event) => {
        if (!isInside(event.target, ALLOW_SELECT)) event.preventDefault();
      },
      options,
    );

    document.addEventListener(
      "dragstart",
      (event) => {
        if (!isInside(event.target, ALLOW_DRAG)) event.preventDefault();
      },
      options,
    );

    const contextMenuOptions = { ...options, capture: true, passive: false };

    window.addEventListener("pointerdown", blockSecondaryPointer, contextMenuOptions);
    window.addEventListener("mousedown", blockSecondaryPointer, contextMenuOptions);
    window.addEventListener("mouseup", blockSecondaryPointer, contextMenuOptions);
    window.addEventListener("contextmenu", blockContextMenu, contextMenuOptions);
    document.addEventListener("pointerdown", blockSecondaryPointer, contextMenuOptions);
    document.addEventListener("mousedown", blockSecondaryPointer, contextMenuOptions);
    document.addEventListener("mouseup", blockSecondaryPointer, contextMenuOptions);
    document.addEventListener("contextmenu", blockContextMenu, contextMenuOptions);

    document.addEventListener(
      "drop",
      (event) => {
        if (!isInside(event.target, ALLOW_DRAG)) event.preventDefault();
      },
      options,
    );

    document.addEventListener(
      "dragover",
      (event) => {
        if (!isInside(event.target, ALLOW_DRAG)) event.preventDefault();
      },
      options,
    );

    window.addEventListener(
      "keydown",
      (event) => {
        const target = event.target;
        const isEditable =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable);

        if (!isEditable && ["ArrowUp", "ArrowDown", " "].includes(event.key)) {
          event.preventDefault();
        }
      },
      options,
    );
  }

  disable(): void {
    this.controller.abort();
  }
}
