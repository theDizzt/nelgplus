import type { LevelDefinition } from "../core/types";
import { attachStarMaskedInput } from "../core/StarMaskedInput";

export const level05: LevelDefinition = {
  number: 5,
  title: "Colour I",
  mount({ screen, complete, wrongAnswer, listen, timeout, session }) {
    const revivalMode = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-05${revivalMode ? " level-05--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-05__heading">
        <div class="level-heading__number">Level 5</div>
        <h1>Colour 1</h1>
      </header>

      <p class="level-05__message">I love this color...</p>

      <form class="level-05__form" autocomplete="off">
        <label for="level-05-answer">Type the background color</label>
        <div class="level-05__controls">
          <input class="nelg-password-input" id="level-05-answer" name="nelg-level-five-answer" data-allow-select
            data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
            maxlength="24" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
            spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-05__form");
    const input = screen.querySelector<HTMLInputElement>("#level-05-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-05__form button");
    if (!form || !input || !submitButton) return;

    let checking = false;
    const maskedInput = attachStarMaskedInput(input, listen);
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

      if (maskedInput.getValue() === (revivalMode ? "hidden" : "orange")) {
        complete();
        return;
      }
      if (wrongAnswer()) return;

      checking = false;
      submitButton.disabled = false;
      maskedInput.clear();
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
