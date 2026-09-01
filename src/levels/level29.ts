import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { SOUND_EFFECTS } from "../core/assets";

type Point = readonly [x: number, y: number];

const ANSWER = "I";
const BUTTON_PATHS: ReadonlyArray<{
  readonly origin: Point;
  readonly points: readonly Point[];
}> = [
  { origin: [45, 225], points: [[0, 96], [48, 0], [96, 96], [72, 50], [24, 50], [0, 96]] },
  { origin: [235, 225], points: [[0, 0], [0, 96], [54, 96], [88, 76], [54, 50], [0, 50], [54, 50], [88, 22], [54, 0], [0, 0]] },
  { origin: [425, 225], points: [[96, 14], [72, 0], [24, 0], [0, 24], [0, 72], [24, 96], [72, 96], [96, 82]] },
  { origin: [615, 225], points: [[0, 0], [0, 96], [54, 96], [96, 72], [96, 24], [54, 0], [0, 0]] },
  { origin: [45, 375], points: [[96, 0], [0, 0], [0, 48], [76, 48], [0, 48], [0, 96], [96, 96]] },
  { origin: [235, 375], points: [[96, 0], [0, 0], [0, 48], [76, 48], [0, 48], [0, 96]] },
  { origin: [425, 375], points: [[96, 14], [72, 0], [24, 0], [0, 24], [0, 72], [24, 96], [72, 96], [96, 72], [96, 54], [54, 54]] },
  { origin: [615, 375], points: [[0, 0], [0, 96], [0, 48], [96, 48], [96, 0], [96, 96]] },
];

export const level29: LevelDefinition = {
  number: 29,
  title: "Trail",
  mount({ screen, complete, listen, timeout, audio }) {
    const buttons = BUTTON_PATHS.map(({ origin, points }, index) => {
      const [originX, originY] = origin;
      const [pointX, pointY] = points[0] ?? [0, 0];
      return `<button class="level-29__runner" type="button" data-runner="${index}"
        style="left:${originX + pointX}px;top:${originY + pointY}px"
        aria-label="Moving orange button ${index + 1}"></button>`;
    }).join("");

    screen.className = "level-screen level-29";
    screen.innerHTML = `
      <header class="level-heading level-29__heading">
        <div class="level-heading__number">Level 29</div>
        <h1>Trail</h1>
      </header>

      <p class="level-29__message">Use your head and make all the buttons overlap.</p>
      <div class="level-29__runners" aria-label="Eight evasive orange buttons">${buttons}</div>

      <form class="level-29__form" autocomplete="off">
        <div class="level-29__controls">
          <input class="nelg-password-input" id="level-29-answer" name="nelg-level-29-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="1" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" aria-label="Password" spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>
    `;

    const runners = [...screen.querySelectorAll<HTMLButtonElement>(".level-29__runner")];
    const form = screen.querySelector<HTMLFormElement>(".level-29__form");
    const input = screen.querySelector<HTMLInputElement>("#level-29-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-29__form button");
    if (runners.length !== BUTTON_PATHS.length || !form || !input || !submitButton) return;

    const pathIndexes = BUTTON_PATHS.map(() => 0);
    runners.forEach((runner, runnerIndex) => {
      listen(runner, "pointerenter", () => {
        const route = BUTTON_PATHS[runnerIndex];
        if (!route) return;
        const nextIndex = ((pathIndexes[runnerIndex] ?? 0) + 1) % route.points.length;
        pathIndexes[runnerIndex] = nextIndex;
        const [originX, originY] = route.origin;
        const [pointX, pointY] = route.points[nextIndex] ?? [0, 0];
        runner.style.left = `${originX + pointX}px`;
        runner.style.top = `${originY + pointY}px`;
      });
      listen(runner, "click", () => audio.playEffect(SOUND_EFFECTS.smack));
    });

    const maskedInput = attachStarMaskedInput(input, listen);
    input.focus();

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue() === ANSWER) {
        submitButton.disabled = true;
        complete();
        return;
      }

      input.classList.remove("is-wrong");
      void input.offsetWidth;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
