import { SOUND_EFFECTS } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

// Each control owns one complete row. Preserve all leading and trailing spaces.
const ASCII_ROWS = [
  "                        :##           #                        ",
  "  .###:                 #.                                     ",
  " .#: .#                 #                                      ",
  " #:      ###   #:##:  #####   #:##: ###    #:##:   ## #   ###  ",
  " #      #   #  #  :#    #     ##  #   #    #  :#  #   #  #   # ",
  " #      #   #  #   #    #     #       #    #   #  #   #  #   # ",
  " #      #   #  #   #    #     #       #    #   #  #   #  #   # ",
  " #:     #   #  #   #    #     #       #    #   #  #   #  #   # ",
  " .#: .  #   #  #   #    #     #       #    #   #  #   #  #   # ",
  "  :###:  ###   #   #    #     #     #####  #   #   ##:#   ###  ",
  "                                                      #        ",
  "                                                     :#        ",
  "                                                   :##.        ",
] as const;

const COLORS = [
  "#461f46", "#ed171f", "#00003d",
  "#00003d", "#20b04b", "#414871",
  "#004000", "#4046cf", "#737ba3",
  "#886600", "#a249a5", "#ff2b7c",
] as const;

export const level56: LevelDefinition = {
  number: 56,
  title: "Doubt",
  scenes: [
    { id: "1", label: "Scene 1 — Doubt" },
    { id: "2", label: "Scene 2 — Color positions" },
    { id: "3", label: "Scene 3 — RGB" },
  ],
  mount({ screen, audio, listen, interval, goToLevel, initialScene }) {
    if (initialScene === "4") {
      goToLevel(57, "B");
      return;
    }
    screen.className = "level-screen level-56";
    screen.innerHTML = `
      <div class="level-56__scene" data-scene="1">
      <header class="level-heading">
        <div class="level-heading__number">Level 56</div>
        <h1>Doubt</h1>
      </header>
      <p class="level-56__prompt">How well do you know RGB codes?</p>
      <p class="level-56__hidden-message">The world is full of con artists.
        If you trust only what you see, you will lose everything.</p>
      <div class="level-56__colors" role="group" aria-label="Color buttons">
        ${COLORS.map((color, index) => `<button type="button" class="level-56__color"
          style="background-color: ${color}" aria-label="Color button ${index + 1}"></button>`).join("")}
      </div>
      <div class="level-56__symbol" aria-hidden="true">?</div>
      </div>
      <div class="level-56__scene" data-scene="2" hidden>
        <div class="level-56__hint-grid" aria-label="Numbers at corresponding color positions">
          ${[0, 0, 0, 3, 1, 1, 4, 6, 2, 5, 8, 9].map(number => `<div>${number}</div>`).join("")}
        </div>
        <p class="level-56__position-hint">One color corresponds to one number, right at the corresponding position.</p>
        <button class="level-56__back" type="button">BACK</button>
      </div>
      <div class="level-56__scene" data-scene="3" hidden>
        <div class="level-56__hint-grid" aria-label="RGB columns with downward arrows and two empty rows">
          ${["R", "G", "B", "⌄", "⌄", "⌄", "", "", "", "", "", ""].map(value => `<div>${value}</div>`).join("")}
        </div>
        <p class="level-56__rgb-hint">The solution is<br />value &gt;128</p>
        <button class="level-56__back" type="button">BACK</button>
      </div>
      <form class="level-56__form" autocomplete="off">
        <input class="nelg-password-input" id="level-56-answer" name="nelg-level-fifty-six-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="24" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <label for="level-56-answer">If you find the solution,<br />submit it here:</label>
        <button type="submit">GO</button>
      </form>
    `;

    const input = screen.querySelector<HTMLInputElement>("#level-56-answer")!;
    const form = screen.querySelector<HTMLFormElement>(".level-56__form")!;
    const go = form.querySelector<HTMLButtonElement>("button")!;
    const symbol = screen.querySelector<HTMLElement>(".level-56__symbol")!;
    const maskedInput = attachStarMaskedInput(input, listen);
    const playPop = () => audio.playEffect(SOUND_EFFECTS.pop);
    let solved = false;
    let scene = "1";

    const showScene = (nextScene: string) => {
      scene = nextScene;
      screen.dataset.scene = scene;
      screen.querySelectorAll<HTMLElement>(".level-56__scene").forEach(panel => {
        panel.hidden = panel.dataset.scene !== scene;
      });
      form.hidden = scene === "2" || scene === "3";
      maskedInput.clear();
      if (form.hidden) screen.querySelector<HTMLButtonElement>(`.level-56__scene[data-scene="${scene}"] .level-56__back`)?.focus();
      else input.focus();
    };
    screen.querySelectorAll<HTMLButtonElement>(".level-56__back").forEach(button => {
      listen(button, "click", () => showScene("1"));
      listen(button, "pointerenter", playPop);
    });

    screen.querySelectorAll<HTMLButtonElement>(".level-56__color").forEach((button, index) => {
      listen(button, "pointerenter", playPop);
      listen(button, "click", () => console.log(ASCII_ROWS[index]));
    });
    listen(go, "pointerenter", playPop);
    listen(go, "click", () => {
      if (scene === "1") console.log(ASCII_ROWS[12]);
    });
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (solved) return;
      const answer = maskedInput.getValue().trim().toLowerCase();
      if (answer === "!" || answer === "?") {
        showScene(answer === "!" ? "2" : "3");
        return;
      }
      if (answer === "512") {
        goToLevel(57, "B");
        return;
      }
      if (answer === "confringo") {
        solved = true;
        goToLevel(57, "A");
        return;
      }
      input.focus();
    });
    interval(() => {
      if (scene !== "1") return;
      symbol.textContent = symbol.textContent === "?" ? "!" : "?";
    }, 900);
    showScene(["2", "3"].includes(initialScene ?? "") ? initialScene! : "1");
  },
};
