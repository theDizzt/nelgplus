import type { LevelDefinition } from "../core/types";
import { SOUND_EFFECTS } from "../core/assets";

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 230;
const VIEWPORT_WIDTH = 800;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export const level03: LevelDefinition = {
  number: 3,
  title: "Tutorial III",
  mount({ screen, complete, wrongAnswer, listen, audio, session }) {
    const revivalMode = session.hasFlag("level50-enhanced-run");
    const mapWidth = revivalMode ? 3000 : MAP_WIDTH;
    screen.className = `level-screen level-03${revivalMode ? " level-03--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-03__heading">
        <div class="level-heading__number">Level 3</div>
        <h1>TUTORIAL III - DRAG</h1>
      </header>

      <div class="level-03__viewport" data-allow-drag aria-label="Drag the rainbow route to find its end">
        <div class="level-03__map" style="width: ${mapWidth}px">
          <svg class="level-03__route" width="${mapWidth}" height="${MAP_HEIGHT}"
            viewBox="0 0 ${mapWidth} ${MAP_HEIGHT}" aria-hidden="true">
            <defs>
              <linearGradient id="level-03-rainbow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ff1010" />
                <stop offset="17%" stop-color="#ff8a00" />
                <stop offset="34%" stop-color="#fff600" />
                <stop offset="51%" stop-color="#31e81c" />
                <stop offset="68%" stop-color="#00ddf2" />
                <stop offset="84%" stop-color="#3157ff" />
                <stop offset="100%" stop-color="#b01cff" />
              </linearGradient>
            </defs>
            <path class="level-03__route-border"
              d="M 322 105 H 980 V 165 H 1320 V 65 H 1660 V 165 H 2000 V 65 H 2220 V 105 H 2350" />
            <path class="level-03__route-colour"
              d="M 322 105 H 980 V 165 H 1320 V 65 H 1660 V 165 H 2000 V 65 H 2220 V 105 H 2350" />
          </svg>
          <button class="level-03__end-button" type="button" aria-label="Continue to Level 4"></button>
          ${revivalMode ? '<button class="level-03__revival-button" type="button" aria-label="Grotesque button, 0 of 66 clicks" hidden></button>' : ""}
        </div>
      </div>

      <p class="level-03__instructions">
        Third, we will see how to manipulate using drag.<br />
        Drag the route all the way and you will see a<br />
        button. Click it to go to the next screen!
      </p>
    `;

    const viewport = screen.querySelector<HTMLElement>(".level-03__viewport");
    const map = screen.querySelector<HTMLElement>(".level-03__map");
    const endButton = screen.querySelector<HTMLButtonElement>(".level-03__end-button");
    const revivalButton = screen.querySelector<HTMLButtonElement>(".level-03__revival-button");
    if (!viewport || !map || !endButton) return;

    let offsetX = 0;
    let previousX = 0;
    let activePointer: number | undefined;

    const renderPosition = () => {
      map.style.transform = `translate3d(${offsetX}px, 0, 0)`;
      if (revivalButton && offsetX <= VIEWPORT_WIDTH - mapWidth + 2) revivalButton.hidden = false;
    };

    listen(viewport, "pointerdown", (event) => {
      if ((event.target as Element).closest(".level-03__end-button, .level-03__revival-button")) return;
      activePointer = event.pointerId;
      previousX = event.clientX;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add("is-dragging");
      event.preventDefault();
    });

    listen(viewport, "pointermove", (event) => {
      if (activePointer !== event.pointerId) return;
      const deltaX = event.clientX - previousX;
      previousX = event.clientX;
      offsetX = clamp(offsetX + deltaX, VIEWPORT_WIDTH - mapWidth, 0);
      renderPosition();
      event.preventDefault();
    });

    const finishDragging = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return;
      activePointer = undefined;
      viewport.classList.remove("is-dragging");
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    };

    listen(viewport, "pointerup", finishDragging);
    listen(viewport, "pointercancel", finishDragging);
    listen(endButton, "click", () => {
      audio.playEffect(SOUND_EFFECTS.smack);
      if (revivalMode) wrongAnswer();
      else complete();
    });
    let revivalClicks = 0;
    if (revivalButton) {
      listen(revivalButton, "click", () => {
        audio.playEffect(SOUND_EFFECTS.smack);
        revivalClicks += 1;
        revivalButton.setAttribute("aria-label", `Grotesque button, ${revivalClicks} of 66 clicks`);
        revivalButton.style.setProperty("--level-03-revival-progress", String(revivalClicks / 66));
        if (revivalClicks >= 66) complete();
      });
    }
  },
};
