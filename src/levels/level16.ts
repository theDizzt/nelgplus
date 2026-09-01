import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

export const level16: LevelDefinition = {
  number: 16,
  title: "Hexadecimal",
  mount({ screen, complete, wrongAnswer, unlockAchievement, listen, timeout, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-16${revival ? " level-16--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-16__heading">
        <div class="level-heading__number">Level 16</div>
        <h1>Hexadecimal</h1>
      </header>

      <p class="level-16__message">
        16 is one of my favorite numbers...<br />
        Can you convert this to decimal?
      </p>

      <form class="level-16__form" autocomplete="off">
        <input class="nelg-password-input" id="level-16-answer" name="nelg-level-sixteen-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" inputmode="numeric" maxlength="12" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" aria-label="Password" spellcheck="false" />
        <button type="submit">GO</button>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-16__form");
    const input = screen.querySelector<HTMLInputElement>("#level-16-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-16__form button");
    if (!form || !input || !submitButton) return;

    const maskedInput = attachStarMaskedInput(input, listen);
    let checking = false;
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

      const answer = maskedInput.getValue();
      if (answer === "22" || answer === "4.58203125") unlockAchievement(14);
      if (answer === (revival ? "80" : "51966")) {
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
