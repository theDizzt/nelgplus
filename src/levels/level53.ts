import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const ANSWER = "gift";
const COLUMNS = 9;

const LETTERS: Readonly<Record<string, readonly string[]>> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["1000001", "1100011", "1010101", "1001001", "1000001", "1000001", "1000001"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["1000001", "1000001", "1000001", "1001001", "1010101", "1100011", "1000001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
};

function targetCells(pattern: readonly string[]): Set<number> {
  const targets = new Set<number>();
  const firstRow = pattern[0];
  if (!firstRow) return targets;
  const offset = Math.floor((COLUMNS - firstRow.length) / 2);
  pattern.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      if (cell === "1") targets.add(rowIndex * COLUMNS + offset + columnIndex);
    });
  });
  return targets;
}

export const level53: LevelDefinition = {
  number: 53,
  title: "Excavation",
  mount(context) {
    const { screen, complete, listen, timeout, wrongAnswer } = context;
    screen.className = "level-screen level-53";
    screen.innerHTML = `
      <header class="level-heading level-53__heading">
        <div class="level-heading__number">Level 53</div>
        <h1>Excavation</h1>
      </header>

      <div class="level-53__board" role="grid" aria-label="Excavation board" hidden></div>

      <button class="level-53__excavate" type="button" aria-label="Load a new excavation board">
        <span aria-hidden="true"></span>
      </button>

      <form class="level-53__form" autocomplete="off">
        <input class="nelg-password-input" id="level-53-answer" name="nelg-level-fifty-three-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="12" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <button type="submit">GO</button>
      </form>
    `;

    const board = screen.querySelector<HTMLElement>(".level-53__board");
    const excavate = screen.querySelector<HTMLButtonElement>(".level-53__excavate");
    const form = screen.querySelector<HTMLFormElement>(".level-53__form");
    const input = screen.querySelector<HTMLInputElement>("#level-53-answer");
    if (!board || !excavate || !form || !input) return;

    const maskedInput = attachStarMaskedInput(input, listen);
    const remainingLetters = new Set(Object.keys(LETTERS));
    let activeLetter: string | undefined;
    let lastLetter: string | undefined;
    let retryLetter: string | undefined;
    let boardActive = false;

    const updateCompletionState = () => {
      if (remainingLetters.size !== 0) return;
      excavate.disabled = true;
      excavate.setAttribute("aria-label", "All excavation boards completed");
      screen.classList.add("level-53--excavated");
    };

    const closeBoard = (state: "failed" | "cleared") => {
      boardActive = false;
      retryLetter = state === "failed" ? activeLetter : undefined;
      board.classList.add(state === "failed" ? "is-failed" : "is-cleared");
      timeout(() => {
        board.hidden = true;
        board.className = "level-53__board";
        board.replaceChildren();
      }, state === "failed" ? 260 : 180);
    };

    const clearTile = (tile: HTMLButtonElement, targets: Set<number>) => {
      if (!boardActive || tile.classList.contains("is-removed")) return;
      const index = Number(tile.dataset.index);
      if (!targets.has(index)) {
        wrongAnswer();
        closeBoard("failed");
        return;
      }

      tile.classList.add("is-removed");
      tile.disabled = true;
      targets.delete(index);
      if (targets.size !== 0 || !activeLetter) return;

      remainingLetters.delete(activeLetter);
      lastLetter = activeLetter;
      closeBoard("cleared");
      updateCompletionState();
    };

    const loadBoard = () => {
      if (boardActive || remainingLetters.size === 0) return;
      const choices = retryLetter
        ? [retryLetter].filter((letter) => remainingLetters.has(letter))
        : [...remainingLetters].filter((letter) => remainingLetters.size === 1 || letter !== lastLetter);
      const selectedLetter = choices[Math.floor(Math.random() * choices.length)];
      if (!selectedLetter) return;
      const pattern = LETTERS[selectedLetter];
      if (!pattern) return;
      activeLetter = selectedLetter;
      const targets = targetCells(pattern);
      board.replaceChildren();
      board.className = "level-53__board";
      board.hidden = false;

      for (let index = 0; index < COLUMNS * 7; index += 1) {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "level-53__tile";
        tile.dataset.index = String(index);
        tile.setAttribute("role", "gridcell");
        tile.setAttribute("aria-label", `Excavation square ${index + 1}`);
        listen(tile, "pointerenter", () => clearTile(tile, targets));
        board.append(tile);
      }
      boardActive = true;
    };

    listen(excavate, "click", loadBoard);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue().trim().toLowerCase() === ANSWER) {
        complete();
        return;
      }
      input.focus();
    });
  },
};
