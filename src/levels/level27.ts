import type { LevelDefinition } from "../core/types";

type Scene = "puzzle" | "too-many" | "negative" | "overflow";

const ERROR_MESSAGES: Record<Exclude<Scene, "puzzle">, string> = {
  "too-many": "PLEASE STOP PRESSING KEYS!!!!!!!",
  negative: "YOU'VE HIT ROCK BOTTOM!!!!!!!",
  overflow: "YOU GREEDY MONSTER!!!!!!!",
};

export const level27: LevelDefinition = {
  number: 27,
  title: "Arithmatic",
  mount({ screen, complete, listen }) {
    let scene: Scene = "puzzle";
    let value = 0;
    let operations = 0;

    const formatValue = () => String(value).padStart(3, "0");

    const renderPuzzle = () => {
      scene = "puzzle";
      value = 0;
      operations = 0;
      screen.className = "level-screen level-27 level-27--puzzle";
      screen.innerHTML = `
        <div class="level-27__clues" aria-hidden="true">
          <span class="level-27__clue level-27__clue--six">SIX</span>
          <span class="level-27__clue level-27__clue--addition">ADDITION</span>
          <span class="level-27__clue level-27__clue--subtraction">SUBTRACTION</span>
          <span class="level-27__clue level-27__clue--multiplication">MULTIPLICATION</span>
          <span class="level-27__clue level-27__clue--division">DIVISION</span>
        </div>

        <header class="level-heading level-27__heading">
          <div class="level-heading__number">Level 27</div>
          <h1>Arithmatic</h1>
        </header>

        <output class="level-27__display" aria-label="Current number" aria-live="polite">000</output>
      `;
    };

    const showError = (errorScene: Exclude<Scene, "puzzle">) => {
      scene = errorScene;
      screen.className = `level-screen level-27 level-27--error level-27--${errorScene}`;
      screen.innerHTML = `
        <header class="level-heading level-27__heading level-27__heading--error">
          <div class="level-heading__number">Level 27</div>
          <h1>Arithmatic</h1>
        </header>
        <div class="level-27__error-message" role="alert">${ERROR_MESSAGES[errorScene]}</div>
        <button class="level-27__back" type="button">BACK</button>
      `;
    };

    const updateDisplay = () => {
      const display = screen.querySelector<HTMLOutputElement>(".level-27__display");
      if (!display) return;
      display.textContent = formatValue();
      display.classList.remove("is-changing");
      void display.offsetWidth;
      display.classList.add("is-changing");
    };

    renderPuzzle();

    listen(document, "keydown", (event) => {
      if (scene !== "puzzle" || event.repeat) return;
      if (!['6', '+', '-', '*', '/'].includes(event.key)) return;
      event.preventDefault();

      operations += 1;
      if (operations >= 6) {
        showError("too-many");
        return;
      }

      switch (event.key) {
        case "6":
          value = Number(`${value}6`);
          break;
        case "+":
          value += 6;
          break;
        case "-":
          value -= 6;
          break;
        case "*":
          value *= 6;
          break;
        case "/":
          value = Math.floor(value / 6);
          break;
      }

      if (value < 0) {
        showError("negative");
        return;
      }
      if (value > 999) {
        showError("overflow");
        return;
      }
      if (value === 27) {
        complete();
        return;
      }
      updateDisplay();
    });

    listen(screen, "click", (event) => {
      const back = (event.target as Element).closest<HTMLButtonElement>(".level-27__back");
      if (!back || scene === "puzzle") return;
      renderPuzzle();
    });
  },
};
