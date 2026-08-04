import type { LevelDefinition } from "../core/types";
import { attachStarMaskedInput } from "../core/StarMaskedInput";

export const level04: LevelDefinition = {
  number: 4,
  title: "Tutorial IV",
  mount({ screen, complete, listen, timeout }) {
    screen.className = "level-screen level-04";
    screen.innerHTML = `
      <header class="level-heading level-04__heading">
        <div class="level-heading__number">Level 4</div>
        <h1>TUTORIAL IV</h1>
      </header>

      <p class="level-04__message">
        This is the final tutorial! Search every corner of the game screen<br />
        and discover the secret password!
      </p>

      <form class="level-04__form" autocomplete="off">
        <label for="level-04-password">Enter password here</label>
        <input id="level-04-password" name="nelg-level-four-answer" data-allow-select
          data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text" inputmode="numeric"
          maxlength="12" autocomplete="off" autocapitalize="off" aria-autocomplete="none" spellcheck="false" />
        <button type="submit">GO</button>
      </form>

      <p class="level-04__hint">Multiply the level number by itself.</p>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-04__form");
    const input = screen.querySelector<HTMLInputElement>("#level-04-password");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-04__form button");
    if (!form || !input || !submitButton) return;

    let checking = false;
    const maskedInput = attachStarMaskedInput(input, listen);
    input.focus();

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (checking) return;
      checking = true;
      submitButton.disabled = true;

      const accepted = maskedInput.getValue().trim() === "16";
      if (accepted) {
        complete();
        return;
      }

      checking = false;
      submitButton.disabled = false;
      maskedInput.clear();
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
