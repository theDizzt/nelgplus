import type { LevelDefinition } from "../core/types";
import { SOUND_EFFECTS } from "../core/assets";

export const level06: LevelDefinition = {
  number: 6,
  title: "Catch",
  mount({ screen, complete, wrongAnswer, listen, audio, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    const numbers = revival ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3];
    screen.className = `level-screen level-06${revival ? " level-06--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-06__heading">
        <div class="level-heading__number">Level 6</div>
        <h1>Catch</h1>
      </header>

      <div class="level-06__buttons">
        ${numbers.map((number) => `<button class="level-06__button level-06__button--${number}" type="button" data-number="${number}">${number}</button>`).join("")}
      </div>
    `;

    const buttonContainer = screen.querySelector<HTMLElement>(".level-06__buttons");
    if (!buttonContainer) return;

    let expectedNumber = 1;
    const remainingKeys = new Set(numbers);
    listen(buttonContainer, "click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(".level-06__button");
      if (!button || !buttonContainer.contains(button)) return;
      audio.playEffect(SOUND_EFFECTS.smack);

      if (revival) {
        wrongAnswer();
        return;
      }

      const clickedNumber = Number(button.dataset.number);
      if (clickedNumber !== expectedNumber) {
        expectedNumber = 1;
        buttonContainer.querySelectorAll<HTMLButtonElement>(".level-06__button").forEach((item) => {
          item.hidden = false;
        });
        return;
      }

      button.hidden = true;
      expectedNumber += 1;
      if (expectedNumber === 4) complete();
    });

    if (revival) {
      listen(document, "keydown", (event) => {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || !/^\d$/.test(event.key)) return;
        const number = Number(event.key);
        if (!remainingKeys.has(number)) {
          wrongAnswer();
          return;
        }
        event.preventDefault();
        remainingKeys.delete(number);
        buttonContainer.querySelector<HTMLButtonElement>(`[data-number="${number}"]`)?.setAttribute("hidden", "");
        if (remainingKeys.size === 0) complete();
      });
    }
  },
};
