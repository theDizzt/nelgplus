import type { LevelDefinition } from "../core/types";

export const levelMinus03: LevelDefinition = {
  number: -3,
  title: "Out of Range",
  mount({ screen, listen, goToLevel, wrongAnswer }) {
    screen.className = "level-screen level-minus-03";
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level -3</div>
        <h1>Out of Range</h1>
      </header>
      <p class="level-minus-03__copy">Password input box ====&gt;</p>
      <form class="level-minus-03__form" autocomplete="off">
        <input class="nelg-password-input" type="text" value="g" aria-label="Password" maxlength="64"
          autocomplete="off" autocapitalize="off" spellcheck="false" data-allow-select>
        <button type="submit">GO</button>
      </form>
    `;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    // Keep native text selection and copying so the initial letter is discoverable.
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (input.value === "hidden") goToLevel(-4);
      else wrongAnswer();
    });
  },
};
