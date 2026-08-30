import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const REVEAL_KEYS: Readonly<Record<string, { index: number; letter: string }>> = {
  h: { index: 0, letter: "h" },
  i: { index: 1, letter: "i" },
  d: { index: 2, letter: "d" },
  e: { index: 3, letter: "e" },
};

export const level15: LevelDefinition = {
  number: 15,
  title: "Input",
  mount({ screen, complete, wrongAnswer, unlockAchievement, listen, timeout }) {
    screen.className = "level-screen level-15";
    screen.innerHTML = `
      <header class="level-heading level-15__heading">
        <div class="level-heading__number">Level 15</div>
        <h1>Input</h1>
      </header>

      <div class="level-15__boxes" aria-label="Five hidden letter boxes">
        ${Array.from(
          { length: 5 },
          (_, index) => `<div class="level-15__box${index === 1 ? " level-15__box--different" : ""}">?</div>`,
        ).join("")}
      </div>

      <p class="level-15__message">
        If you try to press the letters on the keyboard, hidden letters will appear!<br />
        Take a deep breath and smash your keyboard to find the hidden letters.
      </p>

      <form class="level-15__form" autocomplete="off">
        <input class="nelg-password-input" id="level-15-answer" name="nelg-level-fifteen-answer" data-allow-select
          data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
          maxlength="12" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
          aria-label="Password" spellcheck="false" />
        <button type="submit">GO</button>
      </form>
    `;

    const boxes = [...screen.querySelectorAll<HTMLElement>(".level-15__box")];
    const form = screen.querySelector<HTMLFormElement>(".level-15__form");
    const input = screen.querySelector<HTMLInputElement>("#level-15-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-15__form button");
    if (boxes.length !== 5 || !form || !input || !submitButton) return;

    listen(document, "keydown", (event) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      const reveal = REVEAL_KEYS[event.key.toLowerCase()];
      if (!reveal) return;

      const box = boxes[reveal.index];
      if (!box || box.classList.contains("is-revealed")) return;
      box.textContent = reveal.letter;
      box.classList.add("is-revealed");
    });

    const maskedInput = attachStarMaskedInput(input, listen);
    let checking = false;

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
      if (new Set(["hide", "hidden", "?????"]).has(answer)) unlockAchievement(13);
      if (answer === "hide?") {
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
