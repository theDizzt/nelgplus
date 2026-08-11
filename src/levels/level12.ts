import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const ACCEPTED_NAMES = new Set([
  "dark purple",
  "deep purple",
  "dark violet",
  "deep violet",
  "rich purple",
  "dusky purple",
  "sombre purple",
  "dark purplish",
  "deep purplish",
  "purple-black",
  "blackish purple",
  "indigo",
  "eggplant",
  "aubergine",
  "plum",
  "prune",
  "mulberry",
  "grape",
  "raisin",
  "blackberry",
  "blackcurrant",
  "wine purple",
  "burgundy purple",
  "maroon purple",
  "midnight purple",
  "royal purple",
  "imperial purple",
  "regal purple",
  "majestic purple",
  "tyrian purple",
  "byzantine purple",
  "byzantium",
  "purpureus",
  "pansy purple",
  "iris purple",
  "amethyst",
  "deep amethyst",
  "dark amethyst",
  "violet purple",
  "blue violet",
  "dark blue violet",
  "deep blue violet",
  "purple violet",
  "deep orchid",
  "dark orchid",
  "dark magenta",
  "deep magenta",
  "wine",
  "claret",
  "merlot",
  "port",
  "sangria",
  "damson",
  "boysenberry",
  "elderberry",
  "acai",
  "fig",
  "black plum",
]);

export const level12: LevelDefinition = {
  number: 12,
  title: "Name",
  mount({ screen, complete, listen, timeout }) {
    screen.className = "level-screen level-12";
    screen.innerHTML = `
      <header class="level-heading level-12__heading">
        <div class="level-heading__number">Level 12</div>
        <h1>Name</h1>
      </header>

      <p class="level-12__message">DP of BumchiDP means Dark Purple.</p>
      <p class="level-12__hint">What other names could it have?</p>

      <form class="level-12__form" autocomplete="off">
        <input class="nelg-password-input" id="level-12-answer" name="nelg-level-twelve-answer" data-allow-select
          data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
          maxlength="24" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
          aria-label="Password" spellcheck="false" />
        <button type="submit">GO</button>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-12__form");
    const input = screen.querySelector<HTMLInputElement>("#level-12-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-12__form button");
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

      if (ACCEPTED_NAMES.has(maskedInput.getValue())) {
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
