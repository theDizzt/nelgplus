import { assetUrl } from "./assets";
import { clientPointToLocal } from "./floatingPosition";
import type { LevelContext } from "./types";

interface CustomCursorOptions {
  readonly source: string;
  readonly hotspot: "center" | "top-left";
  readonly rotating?: boolean;
}

export function attachCustomCursor(
  { screen, listen }: Pick<LevelContext, "screen" | "listen">,
  { source, hotspot, rotating = false }: CustomCursorOptions,
): () => void {
  screen.dataset.customCursorRoot = "";

  const cursor = document.createElement("span");
  cursor.className = `custom-cursor custom-cursor--${hotspot}${rotating ? " custom-cursor--rotating" : ""}`;
  cursor.hidden = true;
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = `<img src="${assetUrl(source)}" alt="" draggable="false" />`;

  const keepCursorMounted = () => {
    if (!screen.contains(cursor)) screen.append(cursor);
  };
  keepCursorMounted();

  const observer = new MutationObserver(keepCursorMounted);
  observer.observe(screen, { childList: true });

  const moveCursor = (event: PointerEvent) => {
    const point = clientPointToLocal(screen, event.clientX, event.clientY);
    cursor.style.left = `${point.x}px`;
    cursor.style.top = `${point.y}px`;
    cursor.hidden = false;
  };

  listen(screen, "pointerenter", moveCursor);
  listen(screen, "pointermove", moveCursor);
  listen(screen, "pointerleave", () => {
    cursor.hidden = true;
  });

  return () => {
    observer.disconnect();
    cursor.remove();
    delete screen.dataset.customCursorRoot;
  };
}
