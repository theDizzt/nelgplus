import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { clientPointToLocal } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const LEVEL_WIDTH = 800;
const LEVEL_HEIGHT = 600;

function getPolarCoordinates(x: number, y: number): { radius: number; theta: number } {
  const dx = x - LEVEL_WIDTH / 2;
  const dy = y - LEVEL_HEIGHT / 2;
  return {
    radius: Math.round(Math.hypot(dx, dy)),
    theta: Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360),
  };
}

export const level19: LevelDefinition = {
  number: 19,
  title: "Coordinate",
  mount({ screen, complete, wrongAnswer, unlockAchievement, listen, timeout, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-19${revival ? " level-19--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-19__heading">
        <div class="level-heading__number">Level 19</div>
        <h1>Coordinate</h1>
      </header>

      <button class="level-19__pixel-button level-19__pixel-button--first" type="button"
        aria-label="Coordinate 19, 19"></button>
      <button class="level-19__pixel-button level-19__pixel-button--second" type="button"
        aria-label="Coordinate 242, 242"></button>
      ${revival ? '<button class="level-19__pixel-button level-19__pixel-button--revival" type="button" aria-label="Polar coordinate 50, 50"></button>' : ""}

      <div class="level-19__coordinates${revival ? " revival-font-courier" : ""}" aria-live="off">
        <div class="${revival ? "revival-font-courier" : ""}">${revival ? "r" : "x"} : <span class="${revival ? "revival-font-courier" : ""}" data-coordinate="x">0</span></div>
        <div class="${revival ? "revival-font-courier" : ""}">${revival ? "θ" : "y"} : <span class="${revival ? "revival-font-courier" : ""}" data-coordinate="y">0</span></div>
      </div>

      <p class="level-19__corner-hint">focus on the special #</p>

      <p class="level-19__passing-clue" hidden>NELG Level 242</p>

      <form class="level-19__form" autocomplete="off" hidden>
        <input class="nelg-password-input" id="level-19-answer" name="nelg-level-nineteen-answer" data-allow-select
          data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
          maxlength="32" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
          aria-label="Password" spellcheck="false" />
        <button type="submit">GO</button>
      </form>
    `;

    const xOutput = screen.querySelector<HTMLElement>('[data-coordinate="x"]');
    const yOutput = screen.querySelector<HTMLElement>('[data-coordinate="y"]');
    const firstButton = screen.querySelector<HTMLButtonElement>(".level-19__pixel-button--first");
    const secondButton = screen.querySelector<HTMLButtonElement>(".level-19__pixel-button--second");
    const revivalButton = screen.querySelector<HTMLButtonElement>(".level-19__pixel-button--revival");
    const passingClue = screen.querySelector<HTMLElement>(".level-19__passing-clue");
    const form = screen.querySelector<HTMLFormElement>(".level-19__form");
    const input = screen.querySelector<HTMLInputElement>("#level-19-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-19__form button");
    if (!xOutput || !yOutput || !firstButton || !secondButton || !passingClue || !form || !input || !submitButton) {
      return;
    }

    listen(screen, "pointermove", (event) => {
      const bounds = screen.getBoundingClientRect();
      const x = Math.min(LEVEL_WIDTH - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * LEVEL_WIDTH)));
      const y = Math.min(LEVEL_HEIGHT - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * LEVEL_HEIGHT)));
      if (revival) {
        const polar = getPolarCoordinates(x, y);
        xOutput.textContent = String(polar.radius);
        yOutput.textContent = String(polar.theta);
      } else {
        xOutput.textContent = String(x);
        yOutput.textContent = String(y);
      }
    });

    let firstCoordinateClicked = false;
    let secondCoordinateClicked = false;

    const activateFirstCoordinate = () => {
      if (firstCoordinateClicked) return;
      firstCoordinateClicked = true;
      firstButton.hidden = true;
      passingClue.hidden = false;
      passingClue.classList.remove("is-passing");
      void passingClue.offsetWidth;
      passingClue.classList.add("is-passing");
    };

    const maskedInput = attachStarMaskedInput(input, listen);

    const activateSecondCoordinate = () => {
      if (secondCoordinateClicked) return;
      secondCoordinateClicked = true;
      if (!firstCoordinateClicked) unlockAchievement(16);
      secondButton.hidden = true;
      form.hidden = false;
      input.focus();
    };

    listen(screen, "click", (event) => {
      if (event.button !== 0) return;
      if (revival) {
        const point = clientPointToLocal(screen, event.clientX, event.clientY);
        const polar = getPolarCoordinates(Math.floor(point.x), Math.floor(point.y));
        if ((revivalButton && event.target === revivalButton) || (polar.radius === 50 && polar.theta === 50)) {
          if (revivalButton) revivalButton.hidden = true;
          form.hidden = false;
          input.focus();
        } else if (event.target === firstButton || event.target === secondButton) {
          wrongAnswer();
        }
        return;
      }
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      if (event.target === firstButton || (x === 19 && y === 19)) {
        activateFirstCoordinate();
        return;
      }
      if (event.target === secondButton || (x === 242 && y === 242)) activateSecondCoordinate();
    });

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    let checking = false;
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (checking) return;
      checking = true;
      submitButton.disabled = true;

      if (maskedInput.getValue() === (revival ? "hidden" : "NELG Level 242")) {
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
