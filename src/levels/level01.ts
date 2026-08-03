import type { LevelDefinition } from "../core/types";

export const level01: LevelDefinition = {
  number: 1,
  title: "Tutorial I",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen level-01";
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 1</div>
        <h1>Tutorial I</h1>
      </header>

      <div class="level-01__instructions">
        <p>Welcome to Level 1 of <em>Never Ending Level Game ++</em>.</p>
        <p>
          This game was designed to closely resemble the original <em>Never Ending Level Game</em>
          and preserve as much of its bizarre atmosphere as possible.
        </p>
        <p>
          The first level teaches you the basic mouse controls. You will use the mouse often in this
          game—to click buttons, touch objects, and perform other actions.
        </p>
        <p>Your task is to click the red button below and proceed to Level 2.</p>
      </div>

      <button class="level-01__continue" type="button" aria-label="Continue to Level 2"></button>
    `;

    const continueButton = screen.querySelector<HTMLButtonElement>(".level-01__continue");
    if (continueButton) listen(continueButton, "click", complete);
  },
};
