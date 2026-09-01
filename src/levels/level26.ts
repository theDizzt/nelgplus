import type { LevelDefinition } from "../core/types";

const ANSWER = "******";

export const level26: LevelDefinition = {
  number: 26,
  title: "Awkwardness",
  mount({ screen, complete, unlockAchievement, listen, timeout }) {
    screen.className = "level-screen level-26";
    screen.innerHTML = `
      <header class="level-heading level-26__heading">
        <div class="level-heading__number">Level 26</div>
        <h1>Awkwardness</h1>
      </header>

      <p class="level-26__message">The password is hidden.</p>

      <form class="level-26__form" autocomplete="off">
        <div class="level-26__controls">
          <input class="nelg-password-input" id="level-26-answer" name="nelg-level-26-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="20" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" aria-label="Password" spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-26__form");
    const input = screen.querySelector<HTMLInputElement>("#level-26-answer");
    const button = screen.querySelector<HTMLButtonElement>(".level-26__form button");
    if (!form || !input || !button) return;

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
      button.disabled = true;

      const answer = input.value;
      if (answer === "hidden." || answer === "*******") unlockAchievement(32);
      if (answer === ANSWER) {
        complete();
        return;
      }

      checking = false;
      button.disabled = false;
      input.classList.remove("is-wrong");
      void input.offsetWidth;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
