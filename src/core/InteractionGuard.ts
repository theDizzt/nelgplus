const ALLOW_SELECT = "[data-allow-select]";
const ALLOW_DRAG = "[data-allow-drag]";
const ALLOW_CONTEXT_MENU = "[data-allow-context-menu]";

function isInside(target: EventTarget | null, selector: string): boolean {
  return target instanceof Element && target.closest(selector) !== null;
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

    document.addEventListener(
      "contextmenu",
      (event) => {
        if (!isInside(event.target, ALLOW_CONTEXT_MENU)) event.preventDefault();
      },
      options,
    );

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
