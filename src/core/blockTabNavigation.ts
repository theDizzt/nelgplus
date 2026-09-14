import type { LevelContext } from "./types";

/** Keep pointer-first levels from being entered or activated through Tab traversal. */
export function blockTabNavigation(listen: LevelContext["listen"]): void {
  listen(document, "keydown", event => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    (event.target as HTMLElement | null)?.blur();
  }, { capture: true });
}
