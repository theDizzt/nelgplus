import type { LevelDefinition } from "../core/types";
import { SOUND_EFFECTS } from "../core/assets";

const BUTTON_SIZE = 78;
const SCREEN_WIDTH = 800;

const MIRRORED_BUTTONS = [
  { red: 176, left: SCREEN_WIDTH - 77 - BUTTON_SIZE, top: 338 },
  { red: 24, left: SCREEN_WIDTH - 282 - BUTTON_SIZE, top: 285 },
  { red: 211, left: SCREEN_WIDTH - 511 - BUTTON_SIZE, top: 357 },
  { red: 79, left: SCREEN_WIDTH - 666 - BUTTON_SIZE, top: 292 },
  { red: 244, left: SCREEN_WIDTH - 178 - BUTTON_SIZE, top: 479 },
  { red: 108, left: SCREEN_WIDTH - 378 - BUTTON_SIZE, top: 426 },
  { red: 52, left: SCREEN_WIDTH - 580 - BUTTON_SIZE, top: 492 },
  { red: 141, left: SCREEN_WIDTH - 706 - BUTTON_SIZE, top: 437 },
] as const;

const CORRECT_ORDER = [...MIRRORED_BUTTONS].map(({ red }) => red).sort((a, b) => a - b);

export const level28: LevelDefinition = {
  number: 28,
  title: "Familiarity",
  mount({ screen, complete, listen, audio }) {
    const buttons = MIRRORED_BUTTONS.map(
      ({ red, left, top }) => `
        <button class="level-28__button" type="button" data-red="${red}"
          style="left:${left}px;top:${top}px" aria-label="Familiar button"></button>
      `,
    ).join("");

    screen.className = "level-screen level-28";
    screen.innerHTML = `
      <header class="level-heading level-28__heading">
        <div class="level-heading__number">Level 28</div>
        <h1>Familiarity</h1>
      </header>

      <div class="level-28__buttons">${buttons}</div>
    `;

    const buttonContainer = screen.querySelector<HTMLElement>(".level-28__buttons");
    const levelButtons = [...screen.querySelectorAll<HTMLButtonElement>(".level-28__button")];
    if (!buttonContainer || levelButtons.length !== CORRECT_ORDER.length) return;

    let expectedIndex = 0;

    levelButtons.forEach((button) => {
      listen(button, "pointerenter", () => audio.playEffect(SOUND_EFFECTS.pop));
    });

    listen(buttonContainer, "click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(".level-28__button");
      if (!button || !buttonContainer.contains(button)) return;

      if (Number(button.dataset.red) !== CORRECT_ORDER[expectedIndex]) {
        expectedIndex = 0;
        return;
      }

      expectedIndex += 1;
      if (expectedIndex === CORRECT_ORDER.length) complete();
    });
  },
};
