import type { LevelDefinition } from "../core/types";

const START_VALUE = 4095;
const MINIMUM_VALUE = -4096;

function toBinary(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toString(2)}`;
}

export const levelMinus01: LevelDefinition = {
  number: -1,
  title: "Countdown",
  mount({ screen, listen, goToLevel }) {
    let value = START_VALUE;
    screen.className = "level-screen level-minus-01";
    screen.innerHTML = `
      <header class="level-heading level-minus-01__heading">
        <div class="level-heading__number">Level -1</div>
        <h1>Countdown</h1>
      </header>

      <button class="level-minus-01__counter" type="button" aria-label="Binary countdown value">${toBinary(value)}</button>
      <p class="level-minus-01__hint-letter" aria-hidden="true" hidden>a</p>
    `;

    const counter = screen.querySelector<HTMLButtonElement>(".level-minus-01__counter");
    const hintLetter = screen.querySelector<HTMLElement>(".level-minus-01__hint-letter");
    if (!counter || !hintLetter) return;

    const renderValue = () => {
      counter.textContent = toBinary(value);
      counter.setAttribute("aria-label", `Binary countdown value ${value}`);
    };

    listen(screen, "pointermove", () => {
      if (value <= MINIMUM_VALUE) return;
      value -= 1;
      renderValue();
    });
    listen(screen, "click", () => {
      if (value > 0) {
        goToLevel(0);
        return;
      }
      if (value < 0) {
        goToLevel(-2);
        return;
      }
      hintLetter.hidden = false;
    });
  },
};
