import type { LevelDefinition } from "../core/types";

export const level01: LevelDefinition = {
  number: 1,
  title: "Framework Test",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen level-01";
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 1</div>
        <h1>Framework Test</h1>
      </header>

      <p class="level-01__message">The basic game framework is ready.</p>

      <div class="level-01__answer">
        <label for="level-01-input">Type <strong>begin</strong> to continue</label>
        <form id="level-01-form">
          <input id="level-01-input" data-allow-select type="text" autocomplete="off" spellcheck="false" />
          <button type="submit">GO</button>
        </form>
        <p id="level-01-feedback" role="status"></p>
      </div>
    `;

    const form = screen.querySelector<HTMLFormElement>("#level-01-form");
    const input = screen.querySelector<HTMLInputElement>("#level-01-input");
    const feedback = screen.querySelector<HTMLElement>("#level-01-feedback");

    if (input) input.focus();
    if (!form || !input || !feedback) return;

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (input.value.trim().toLowerCase() === "begin") {
        complete();
        return;
      }

      feedback.textContent = "That is not the word.";
      input.select();
    });
  },
};
