import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const MAZE_WIDTH = 1100;
const VIEWPORT_WIDTH = 220;
const MAX_OFFSET = VIEWPORT_WIDTH - MAZE_WIDTH;
const DRAG_SPEED = 6;
const RETURN_DURATION = 230;

const MAZES = [
  { color: "#19a83b", letter: "v", path: "M12 63 H76 V18 H142 V70 H210 V32 H278 V74 H346 V16 H414 V58 H482 V27 H550 V72 H618 V21 H686 V61 H754 V13 H822 V69 H890 V31 H958 V66 H1048" },
  { color: "#ef2828", letter: "s", path: "M12 24 H70 V67 H132 V15 H196 V56 H260 V75 H324 V27 H388 V62 H452 V18 H516 V70 H580 V34 H644 V76 H708 V22 H772 V58 H836 V14 H900 V68 H964 V29 H1048" },
  { color: "#8c35dd", letter: "r", path: "M12 70 H66 V25 H124 V58 H182 V14 H240 V66 H298 V31 H356 V74 H414 V20 H472 V61 H530 V12 H588 V69 H646 V28 H704 V73 H762 V18 H820 V57 H878 V24 H936 V70 H994 V33 H1048" },
  { color: "#f2d51b", letter: "l", path: "M12 42 H68 V17 H126 V72 H184 V35 H242 V68 H300 V22 H358 V59 H416 V13 H474 V74 H532 V29 H590 V65 H648 V16 H706 V55 H764 V76 H822 V26 H880 V62 H938 V19 H996 V70 H1048" },
  { color: "#2475e8", letter: "e", path: "M12 68 H74 V28 H136 V64 H198 V16 H260 V55 H322 V73 H384 V23 H446 V61 H508 V12 H570 V69 H632 V31 H694 V76 H756 V20 H818 V58 H880 V14 H942 V66 H1004 V27 H1048" },
  { color: "#f08a20", letter: "i", path: "M12 26 H72 V70 H132 V20 H192 V60 H252 V13 H312 V68 H372 V29 H432 V75 H492 V18 H552 V56 H612 V72 H672 V24 H732 V63 H792 V15 H852 V69 H912 V32 H972 V74 H1048" },
] as const;

function clamp(value: number): number {
  return Math.min(0, Math.max(MAX_OFFSET, value));
}

export const level08: LevelDefinition = {
  number: 8,
  title: "Colour II",
  mount({ screen, complete, wrongAnswer, listen, timeout, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    const mazeMarkup = MAZES.map(
      ({ color, letter, path }, index) => `
        <div class="level-08__maze" data-maze="${index + 1}" data-allow-drag
          style="--maze-color:${color}" aria-label="Draggable coloured maze ${index + 1}">
          <div class="level-08__maze-map">
            <svg width="${MAZE_WIDTH}" height="90" viewBox="0 0 ${MAZE_WIDTH} 90" aria-hidden="true">
              <path class="level-08__maze-border" d="${path}" />
              <path class="level-08__maze-route" d="${path}" />
            </svg>
            <span class="level-08__maze-letter" aria-hidden="true" hidden>${letter}</span>
          </div>
        </div>
      `,
    ).join("");

    screen.className = `level-screen level-08${revival ? " level-08--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-08__heading">
        <div class="level-heading__number level-08__number" aria-label="Level 8">
          ${revival ? "Level 8" : "<span>L</span><span>e</span><span>v</span><span>e</span><span>l</span><span>8</span>"}
        </div>
        <h1>Colour II</h1>
      </header>

      <div class="level-08__mazes">${mazeMarkup}</div>

      <form class="level-08__form" autocomplete="off">
        <input class="nelg-password-input" id="level-08-answer" name="nelg-level-eight-answer" data-allow-select
          data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
          maxlength="12" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
          aria-label="Password" spellcheck="false" />
        <button type="submit">GO</button>
      </form>
    `;

    const mazes = screen.querySelector<HTMLElement>(".level-08__mazes");
    const form = screen.querySelector<HTMLFormElement>(".level-08__form");
    const input = screen.querySelector<HTMLInputElement>("#level-08-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-08__form button");
    if (!mazes || !form || !input || !submitButton) return;

    const offsets = new Map<HTMLElement, number>();
    let activeMaze: HTMLElement | undefined;
    let activeMap: HTMLElement | undefined;
    let activePointer: number | undefined;
    let previousX = 0;

    const finishDrag = (event: PointerEvent) => {
      if (!activeMaze || event.pointerId !== activePointer) return;
      const releasedMaze = activeMaze;
      const releasedMap = activeMap;
      releasedMaze.classList.remove("is-dragging");
      releasedMaze.classList.add("is-returning");
      if (releasedMaze.hasPointerCapture(event.pointerId)) releasedMaze.releasePointerCapture(event.pointerId);
      offsets.set(releasedMaze, 0);
      if (releasedMap) releasedMap.style.transform = "translate3d(0, 0, 0)";
      activeMaze = undefined;
      activeMap = undefined;
      activePointer = undefined;
      timeout(() => {
        releasedMaze.classList.remove("is-returning", "is-complete");
        releasedMaze.querySelector<HTMLElement>(".level-08__maze-letter")?.setAttribute("hidden", "");
      }, RETURN_DURATION);
    };

    listen(mazes, "pointerdown", (event) => {
      const maze = (event.target as Element).closest<HTMLElement>(".level-08__maze");
      const map = maze?.querySelector<HTMLElement>(".level-08__maze-map");
      if (!maze || !map || !mazes.contains(maze)) return;

      activeMaze = maze;
      activeMap = map;
      activePointer = event.pointerId;
      previousX = event.clientX;
      maze.classList.remove("is-returning");
      maze.setPointerCapture(event.pointerId);
      maze.classList.add("is-dragging");
      event.preventDefault();
    });

    listen(mazes, "pointermove", (event) => {
      if (!activeMaze || !activeMap || event.pointerId !== activePointer) return;
      const nextOffset = clamp((offsets.get(activeMaze) ?? 0) + (event.clientX - previousX) * DRAG_SPEED);
      previousX = event.clientX;
      if (revival) {
        const repelledMaze = activeMaze;
        repelledMaze.classList.add("is-repelled");
        activeMap.style.transform = "translate3d(0, 0, 0)";
        timeout(() => repelledMaze.classList.remove("is-repelled"), 140);
        event.preventDefault();
        return;
      }
      offsets.set(activeMaze, nextOffset);
      activeMap.style.transform = `translate3d(${nextOffset}px, 0, 0)`;
      if (nextOffset <= MAX_OFFSET + 8) {
        activeMaze.classList.add("is-complete");
        activeMaze.querySelector<HTMLElement>(".level-08__maze-letter")?.removeAttribute("hidden");
      }
      event.preventDefault();
    });

    listen(mazes, "pointerup", finishDrag);
    listen(mazes, "pointercancel", finishDrag);
    listen(document, "pointerup", finishDrag);
    listen(document, "pointercancel", finishDrag);

    const maskedInput = attachStarMaskedInput(input, listen);
    let checking = false;
    input.focus();

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (checking) return;
      checking = true;
      submitButton.disabled = true;

      if (maskedInput.getValue() === (revival ? "gold" : "silver")) {
        complete();
        return;
      }
      if (wrongAnswer()) return;

      checking = false;
      submitButton.disabled = false;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
