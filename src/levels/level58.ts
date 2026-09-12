import type { LevelDefinition } from "../core/types";

// Keep the branch destination explicit until the Level 58 puzzles are supplied.
export const level58: LevelDefinition = {
  number: 58,
  title: "Coming Soon",
  scenes: [
    { id: "A", label: "Level 58A" },
    { id: "B", label: "Level 58B" },
  ],
  mount({ screen, initialScene }) {
    const part = initialScene === "B" ? "B" : "A";
    screen.className = "level-screen placeholder-level";
    screen.dataset.scene = part;
    screen.setAttribute("aria-label", `Level 58${part}: Coming Soon`);
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 58${part}</div>
        <h1>Coming Soon</h1>
      </header>
      <p class="placeholder-level__message">This level has not been built yet.</p>`;
  },
};
