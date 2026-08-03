import type { LevelDefinition } from "../core/types";

/** Development-only input test. This level is intentionally not registered. */
export const testLevel: LevelDefinition = {
  number: 0,
  title: "Framework Test",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen test-level";
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Test Level</div>
        <h1>Framework Test</h1>
      </header>

      <p class="test-level__message">The basic game framework is ready.</p>

      <div class="test-level__answer">
        <label for="test-level-input">Type <strong>begin</strong> to continue</label>
        <form id="test-level-form">
          <input id="test-level-input" data-allow-select type="text" autocomplete="off" spellcheck="false" />
          <button type="submit">GO</button>
        </form>
        <p id="test-level-feedback" role="status"></p>
      </div>
    `;

    const form = screen.querySelector<HTMLFormElement>("#test-level-form");
    const input = screen.querySelector<HTMLInputElement>("#test-level-input");
    const feedback = screen.querySelector<HTMLElement>("#test-level-feedback");

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
