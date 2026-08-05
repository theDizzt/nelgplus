import type { LevelDefinition } from "../core/types";

const BUTTON_POSITIONS = [
  [66, 273],
  [254, 263],
  [459, 278],
  [680, 258],
  [137, 343],
  [336, 359],
  [545, 338],
  [716, 367],
  [53, 431],
  [242, 419],
  [431, 443],
  [632, 425],
  [142, 518],
  [331, 505],
  [519, 526],
  [706, 506],
] as const;

export const level10: LevelDefinition = {
  number: 10,
  title: "Disappearance",
  mount({ screen, complete, listen, audio }) {
    const buttons = BUTTON_POSITIONS.map(
      ([left, top], index) => `
        <button class="level-10__target" type="button" style="left:${left}px;top:${top}px"
          aria-label="Target ${index + 1}"></button>
      `,
    ).join("");

    screen.className = "level-screen level-10";
    screen.innerHTML = `
      <header class="level-heading level-10__heading">
        <div class="level-heading__number">Level 10</div>
        <h1>Disappearance</h1>
      </header>

      <p class="level-10__message">
        I hid the mouse cursor somewhere you cannot see it.<br />
        Do not get too frustrated. Take your time and work through it step by step.
      </p>

      <div class="level-10__targets">${buttons}</div>
    `;

    const targetContainer = screen.querySelector<HTMLElement>(".level-10__targets");
    if (!targetContainer) return;

    let remaining = BUTTON_POSITIONS.length;
    listen(targetContainer, "click", (event) => {
      const target = (event.target as Element).closest<HTMLButtonElement>(".level-10__target");
      if (!target || !targetContainer.contains(target)) return;

      audio.playEffect("/assets/sounds/nelgsmack.WAV");
      target.remove();
      remaining -= 1;
      if (remaining === 0) complete();
    });
  },
};
