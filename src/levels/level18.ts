import type { LevelDefinition } from "../core/types";
import { assetUrl } from "../core/assets";

export const level18: LevelDefinition = {
  number: 18,
  title: "Paint",
  mount({ screen, complete, wrongAnswer, listen, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-18${revival ? " level-18--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-18__heading">
        <div class="level-heading__number">Level 1<span class="level-18__eight${revival ? " revival-font-perpetua" : ""}">8${revival ? '<button class="level-18__revival-button" type="button" aria-label="Hidden button inside 8"></button>' : ""}</span></div>
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
    if (hiddenButton) listen(hiddenButton, "click", revival ? wrongAnswer : complete);
    const revivalButton = screen.querySelector<HTMLButtonElement>(".level-18__revival-button");
    if (revivalButton) listen(revivalButton, "click", complete);
  },
};
