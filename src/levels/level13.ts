import type { LevelDefinition } from "../core/types";

const COLOR_BUTTONS = [
  { red: 176, color: "rgb(176 54 140)", left: 77, top: 338 },
  { red: 24, color: "rgb(24 198 231)", left: 282, top: 285 },
  { red: 211, color: "rgb(211 190 33)", left: 511, top: 357 },
  { red: 79, color: "rgb(79 205 104)", left: 666, top: 292 },
  { red: 244, color: "rgb(244 91 38)", left: 178, top: 479 },
  { red: 108, color: "rgb(108 61 188)", left: 378, top: 426 },
  { red: 52, color: "rgb(52 80 222)", left: 580, top: 492 },
  { red: 141, color: "rgb(141 215 42)", left: 706, top: 437 },
] as const;

const RED_ORDER = [...COLOR_BUTTONS].map(({ red }) => red).sort((a, b) => a - b);

export const level13: LevelDefinition = {
  number: 13,
  title: "Value",
  mount({ screen, complete, listen, timeout }) {
    const buttons = COLOR_BUTTONS.map(
      ({ red, color, left, top }) => `
        <button class="level-13__button" type="button" data-red="${red}"
          style="--button-color:${color};left:${left}px;top:${top}px"
          aria-label="Color button"></button>
      `,
    ).join("");

    screen.className = "level-screen level-13";
    screen.innerHTML = `
      <header class="level-heading level-13__heading">
        <div class="level-heading__number">Level 13</div>
        <h1>Value</h1>
      </header>

      <p class="level-13__message">
        Can you measure the amount of red mixed into each color?<br />
        Click the buttons in order from the smallest value to the largest.
      </p>

      <p class="level-13__progress" role="status">Progress: 0 / ${RED_ORDER.length}</p>

      <div class="level-13__buttons">${buttons}</div>
    `;

    const buttonContainer = screen.querySelector<HTMLElement>(".level-13__buttons");
    const progress = screen.querySelector<HTMLElement>(".level-13__progress");
    if (!buttonContainer || !progress) return;

    let expectedIndex = 0;
    listen(buttonContainer, "click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(".level-13__button");
      if (!button || !buttonContainer.contains(button)) return;

      const redValue = Number(button.dataset.red);
      if (redValue !== RED_ORDER[expectedIndex]) {
        expectedIndex = 0;
        progress.textContent = `Progress: 0 / ${RED_ORDER.length}`;
        button.classList.remove("is-wrong");
        void button.offsetWidth;
        button.classList.add("is-wrong");
        timeout(() => button.classList.remove("is-wrong"), 520);
        return;
      }

      expectedIndex += 1;
      progress.textContent = `Progress: ${expectedIndex} / ${RED_ORDER.length}`;
      if (expectedIndex === RED_ORDER.length) complete();
    });
  },
};
