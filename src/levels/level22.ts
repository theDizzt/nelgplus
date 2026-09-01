import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import type { LevelDefinition } from "../core/types";

export const level22: LevelDefinition = {
  number: 22,
  title: "Virtual Image",
  mount({ screen, complete, wrongAnswer, unlockAchievement, listen, timeout, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-22${revival ? " level-22--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-22__heading">
        <div class="level-heading__number">Level 22</div>
        <h1>Virtual Image</h1>
      </header>

      <span class="level-22__face" aria-hidden="true">&gt;:D</span>
      <p class="level-22__hint">THE MIRROR KNOWS THE ANSWER.</p>
      <img class="level-22__image" src="${assetUrl(revival ? "images/level50u22a.png" : "images/level22a.png")}" alt="Mirrored symbol puzzle" />

      <form class="level-22__form" autocomplete="off">
        <div class="level-22__controls">
          <input class="nelg-password-input" id="level-22-answer" data-allow-select
            data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
            maxlength="24" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
            aria-label="Password" spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-22__form");
    const input = screen.querySelector<HTMLInputElement>("#level-22-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-22__form button");
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
      if (answer === "EBOI") unlockAchievement(26);
      if (revival ? answer.trim().toUpperCase() === "JOKER" : answer === "1083") {
        complete();
        return;
      }
      if (wrongAnswer()) return;

      checking = false;
      submitButton.disabled = false;
      input.classList.remove("is-wrong");
      void input.offsetWidth;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
