import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { attachCustomCursor } from "../core/CustomCursor";
import type { LevelDefinition } from "../core/types";

const ANSWER = "love";

export const level41: LevelDefinition = {
  number: 41,
  title: "Distinguish",
  mount(context) {
    const { screen, listen, complete, goToLevel } = context;
    const removeCustomCursor = attachCustomCursor(context, {
      source: "cursor/level41.png",
      hotspot: "top-left",
    });
    screen.className = "level-screen level-41";
    screen.innerHTML = `
      <p class="level-41__hidden-clue">Can you spot the very subtle difference?</p>

      <header class="level-heading level-41__heading" aria-label="Level 41, Distinguish">
        <div class="level-heading__number level-41__title">Level 41</div>
        <h1 class="level-41__subtitle">Distinguish</h1>
      </header>

      <p class="level-41__message">
        You did <span>L</span>evel 40<br />
        wr<span>o</span>ng...<br />
        Start the game o<span>ve</span>r.
      </p>

      <form class="level-41__form" autocomplete="off">
        <button class="level-41__fake-input" type="submit" aria-label="Submit password"></button>
        <input class="nelg-password-input level-41__answer" id="level-41-answer"
          name="nelg-level-forty-one-answer" data-allow-select data-form-type="other"
          data-lpignore="true" data-1p-ignore="true" type="text" maxlength="4"
          autocomplete="off" autocapitalize="off" aria-autocomplete="none" spellcheck="false"
          aria-label="Password input in the GO position" />
      </form>

      <button class="level-41__return" type="button" aria-label="Return to Level 40"></button>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-41__form");
    const input = screen.querySelector<HTMLInputElement>("#level-41-answer");
    const returnButton = screen.querySelector<HTMLButtonElement>(".level-41__return");
    if (!form || !input || !returnButton) return removeCustomCursor;

    const maskedInput = attachStarMaskedInput(input, listen);

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue().toLowerCase() === ANSWER) {
        complete();
        return;
      }
      input.focus();
    });

    listen(returnButton, "click", () => goToLevel(40));
    return removeCustomCursor;
  },
};
