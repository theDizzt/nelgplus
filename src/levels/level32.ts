import { createRedGuy, type RedGuyRect } from "../core/RedGuy";
import type { LevelDefinition } from "../core/types";

const PLATFORMS: readonly RedGuyRect[] = [
  { x: 0, y: 528, width: 800, height: 72 },
  { x: 112, y: 445, width: 168, height: 20 },
  { x: 326, y: 365, width: 158, height: 20 },
  { x: 532, y: 285, width: 150, height: 20 },
  { x: 650, y: 445, width: 150, height: 20 },
];

export const level32: LevelDefinition = {
  number: 32,
  title: "Red Guy Test",
  mount(context) {
    const { screen, listen, interval } = context;
    screen.className = "level-screen level-32";
    screen.innerHTML = `
      <header class="level-32__heading">
        <div>Level 32</div>
        <h1>RED GUY TEST</h1>
      </header>

      <aside class="level-32__help" aria-label="Controls">
        <strong>CONTROL TEST</strong>
        <span><kbd>&larr;</kbd><kbd>&rarr;</kbd> Move / Slide</span>
        <span><kbd>&uarr;</kbd> Jump</span>
        <span><kbd>&darr;</kbd> Crouch</span>
      </aside>

      <output class="level-32__status" aria-live="polite">
        <span>STATE <b data-status="state">IDLE</b></span>
        <span>VELOCITY <b data-status="velocity">0, 0</b></span>
        <span>GROUND <b data-status="ground">NO</b></span>
      </output>

      <button class="level-32__reset" type="button">RESET</button>
      <div class="level-32__start-label">START</div>
      ${PLATFORMS.map((platform, index) => `
        <div class="level-32__platform level-32__platform--${index}"
          style="left:${platform.x}px;top:${platform.y}px;width:${platform.width}px;height:${platform.height}px"></div>
      `).join("")}
    `;

    const stateOutput = screen.querySelector<HTMLElement>('[data-status="state"]');
    const velocityOutput = screen.querySelector<HTMLElement>('[data-status="velocity"]');
    const groundOutput = screen.querySelector<HTMLElement>('[data-status="ground"]');
    const resetButton = screen.querySelector<HTMLButtonElement>(".level-32__reset");

    const redGuy = createRedGuy(context, {
      parent: screen,
      x: 48,
      y: 456,
      platforms: PLATFORMS,
      bounds: { x: 0, y: 0, width: 800, height: 600 },
    });

    if (resetButton) {
      listen(resetButton, "click", () => redGuy.teleport(48, 456));
    }

    interval(() => {
      const snapshot = redGuy.getSnapshot();
      if (stateOutput) stateOutput.textContent = snapshot.state.toUpperCase();
      if (velocityOutput) {
        velocityOutput.textContent = `${Math.round(snapshot.velocityX)}, ${Math.round(snapshot.velocityY)}`;
      }
      if (groundOutput) groundOutput.textContent = snapshot.grounded ? "YES" : "NO";
    }, 50);

    return () => redGuy.destroy();
  },
};
