import type { LevelDefinition } from "../core/types";

export function createPlaceholderLevel(number: number): LevelDefinition {
  return {
    number,
    title: "To be continued",
    mount({ screen, complete, listen }) {
      screen.className = `level-screen placeholder-level placeholder-level--${number}`;
      screen.innerHTML = `
        <header class="level-heading">
          <div class="level-heading__number">Level ${number}</div>
          <h1>Coming Soon</h1>
        </header>
        <p class="placeholder-level__message">This puzzle is waiting to be designed.</p>
        <button class="flash-button placeholder-level__button" type="button">NEXT TEST LEVEL</button>
      `;

      const button = screen.querySelector<HTMLButtonElement>("button");
      if (button) listen(button, "click", complete);
    },
  };
}
