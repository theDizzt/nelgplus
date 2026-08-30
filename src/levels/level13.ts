import type { LevelDefinition } from "../core/types";
import { assetUrl } from "../core/assets";

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

const REVIVAL_BUTTONS = [
  { value: 62135, image: "level50u13a62135.png", left: 66, top: 300 },
  { value: -80, image: "level50u13a-80.png", left: 230, top: 320 },
  { value: 684, image: "level50u13a684.png", left: 410, top: 290 },
  { value: 42, image: "level50u13a42.png", left: 650, top: 315 },
  { value: 100000, image: "level50u13a100000.png", left: 110, top: 420 },
  { value: 1.618, image: "level50u13a1.618.png", left: 290, top: 400 },
  { value: 4559, image: "level50u13a4559.png", left: 480, top: 430 },
  { value: 0, image: "level50u13a0.png", left: 675, top: 410 },
  { value: 656, image: "level50u13a656.png", left: 55, top: 505 },
  { value: 39, image: "level50u13a39.png", left: 235, top: 495 },
  { value: 1000, image: "level50u13a1000.png", left: 450, top: 500 },
  { value: 491, image: "level50u13a491.png", left: 650, top: 500 },
] as const;

const REVIVAL_ORDER = [...REVIVAL_BUTTONS].map(({ value }) => value).sort((a, b) => a - b);

export const level13: LevelDefinition = {
  number: 13,
  title: "Value",
  mount({ screen, complete, wrongAnswer, listen, timeout, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    const order = revival ? REVIVAL_ORDER : RED_ORDER;
    const buttons = revival
      ? REVIVAL_BUTTONS.map(
          ({ value, image, left, top }) => `
            <button class="level-13__button" type="button" data-value="${value}"
              style="--button-color:#ff0000;left:${left}px;top:${top}px" aria-label="Hidden value button">
              <img src="${assetUrl(`images/${image}`)}" alt="" aria-hidden="true" draggable="false" />
            </button>
          `,
        ).join("")
      : COLOR_BUTTONS.map(
          ({ red, color, left, top }) => `
            <button class="level-13__button" type="button" data-value="${red}"
              style="--button-color:${color};left:${left}px;top:${top}px"
              aria-label="Color button"></button>
          `,
        ).join("");

    screen.className = `level-screen level-13${revival ? " level-13--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-13__heading">
        <div class="level-heading__number">Level 13</div>
        <h1>Value</h1>
      </header>

      <p class="level-13__message">
        Can you measure the amount of red mixed into each color?<br />
        Click the buttons in order from the smallest value to the largest.
      </p>

      <p class="level-13__progress${revival ? " revival-font-courier" : ""}" role="status">Progress: 0 / ${order.length}</p>

      <div class="level-13__buttons">${buttons}</div>
    `;

    const buttonContainer = screen.querySelector<HTMLElement>(".level-13__buttons");
    const progress = screen.querySelector<HTMLElement>(".level-13__progress");
    if (!buttonContainer || !progress) return;

    let expectedIndex = 0;
    listen(buttonContainer, "click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(".level-13__button");
      if (!button || !buttonContainer.contains(button)) return;

      const value = Number(button.dataset.value);
      if (value !== order[expectedIndex]) {
        if (revival) {
          wrongAnswer();
          return;
        }
        expectedIndex = 0;
        progress.textContent = `Progress: 0 / ${order.length}`;
        button.classList.remove("is-wrong");
        void button.offsetWidth;
        button.classList.add("is-wrong");
        timeout(() => button.classList.remove("is-wrong"), 520);
        return;
      }

      if (revival) button.disabled = true;
      expectedIndex += 1;
      progress.textContent = `Progress: ${expectedIndex} / ${order.length}`;
      if (expectedIndex === order.length) complete();
    });
  },
};
