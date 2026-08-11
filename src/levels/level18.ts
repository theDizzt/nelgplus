import type { LevelDefinition } from "../core/types";
import { assetUrl } from "../core/assets";

export const level18: LevelDefinition = {
  number: 18,
  title: "Paint",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen level-18";
    screen.innerHTML = `
      <header class="level-heading level-18__heading">
        <div class="level-heading__number">Level 18</div>
        <h1>Paint</h1>
      </header>

      <button class="level-18__hidden-button" type="button" aria-label="Hidden button"></button>

      <div class="level-18__instructions">
        <p><strong>*Invert the color of this screen</strong></p>
        <p>Take a <span>screenshot of the game's screen.</span></p>
        <p>Open the screenshot in <span>MS Paint or a similar program.</span></p>
        <p>Use the <span>&quot;Fill Tool&quot;</span> to change the background to a different color to</p>
        <p>reveal a hidden button.</p>
      </div>

      <img class="level-18__paint-icon" src="${assetUrl("images/level18-paint.png")}" alt="" aria-hidden="true" />
    `;

    const hiddenButton = screen.querySelector<HTMLButtonElement>(".level-18__hidden-button");
    if (hiddenButton) listen(hiddenButton, "click", complete);
  },
};
