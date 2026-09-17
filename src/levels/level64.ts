import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

export const level64: LevelDefinition = {
  number: 64,
  title: "Direction",
  scenes: [{ id: "main", label: "Main" }],
  mount({ screen, listen, complete, timeout }) {
    const clues = [
      ["half", "*39", "/14", "*9", "+5", "*5", "/7"],
      ["√x", "mod 69", "++", "↑↑2", "3x+2", "^2", "-91"],
      ["*(-1)", "<<4", "+5", "/4", ">>4", "/15", "^3"],
      ["1/x", "", "log", "*25", "^(1/3)", "+84", "triple"],
    ];
    const clueMarkup = clues.flatMap((row, y) => row.map((text, x) => {
      const escaped = text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      const tile = (x + y) % 2 === 0 ? "dark" : "light";
      const small = text === "mod 69" || text === "^(1/3)" ? " level-64__clue--small" : "";
      return `<span class="level-64__clue level-64__clue--${tile}${small}" style="grid-column:${x + 1};grid-row:${y + 1}">${escaped}</span>`;
    })).join("");
    screen.className = "level-screen level-64";
    screen.innerHTML = `
      <header class="level-heading level-64__heading">
        <div class="level-heading__number">Level <span class="level-64__six">6</span>4</div>
        <h1>Search</h1>
      </header>
      <div class="level-64__content">
        <div class="level-64__clues">${clueMarkup}</div>
        <div class="level-64__target">Move 6<br>Here</div>
        <form class="level-08__form level-64__form" autocomplete="off">
          <input class="nelg-password-input" type="text" data-allow-select autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Password">
          <button type="submit">GO</button>
        </form>
      </div>
    `;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector<HTMLInputElement>("input")!;
    const password = attachStarMaskedInput(input, listen);
    const six = screen.querySelector<HTMLElement>(".level-64__six")!;
    const target = screen.querySelector<HTMLElement>(".level-64__target")!;
    const steps = [
      ["down", 0, 1],
      ["right", 1, 0],
      ["down", 0, 1],
      ["south", 0, 1],
      ["up", 0, -1],
      ["diagnal", -1, 1],
      ["left", -1, 0],
      ["northwest", -1, -1],
      ["north", 0, -1],
      ["southwest", -1, 1],
      ["down", 0, 1],
      ["south", 0, 1],
    ] as const;
    let stepIndex = 0;
    let column = 0;
    let row = 0;
    let moving = false;
    let completed = false;
    const submit = (event: Event) => {
      event.preventDefault();
      if (moving || completed) return;
      const answer = password.getValue().trim().toLowerCase();
      password.clear();
      input.focus();
      if (stepIndex === steps.length) {
        if (answer === "816") {
          completed = true;
          complete();
        }
        return;
      }
      const step = steps[stepIndex];
      if (!step) return;
      const [expected, dx, dy] = step;
      if (answer !== expected) return;
      column += dx;
      row += dy;
      stepIndex += 1;
      moving = true;
      six.style.transform = `translate(${column * 100}px, ${row * 100}px)`;
      six.classList.toggle("level-64__six--dark-tile", (column + row) % 2 !== 0);
      if (stepIndex === steps.length) target.hidden = true;
      timeout(() => {
        moving = false;
      }, 220);
    };
    listen(form, "submit", submit);
    listen(input, "keydown", event => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
  },
};
