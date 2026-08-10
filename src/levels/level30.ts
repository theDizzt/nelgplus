import type { LevelDefinition } from "../core/types";

const CIPHERTEXT = "OWwAlVmZTAGEmNmZQWGBmDmAmVmDmDmZSWQB2V0ZPWQA3pwZTAGBmHwZPWGAmVmA3pwZ3HQZ";
const ANSWER = "password must be hidden >:D";

const CLUES = [
  { text: "Reverse", className: "level-30__clue--reverse-one" },
  { text: "ROT13", className: "level-30__clue--rot-one" },
  { text: "XOR", className: "level-30__clue--xor" },
  { text: "The keyword is THIRTY", className: "level-30__clue--keyword" },
  { text: "Hex", className: "level-30__clue--hex" },
  { text: "Base64", className: "level-30__clue--base" },
  { text: "ROT13", className: "level-30__clue--rot-two" },
  { text: "Reverse", className: "level-30__clue--reverse-two" },
] as const;

export const level30: LevelDefinition = {
  number: 30,
  title: "Decode",
  mount({ screen, complete, listen, timeout }) {
    const clues = CLUES.map(
      ({ text, className }) => `<span class="level-30__clue ${className}">${text}</span>`,
    ).join("");

    screen.className = "level-screen level-30";
    screen.innerHTML = `
      <header class="level-heading level-30__heading">
        <div class="level-heading__number">Level 30</div>
        <h1>Decode</h1>
      </header>

      <div class="level-30__clues" aria-label="Scattered decoding clues">${clues}</div>

      <form class="level-30__form" autocomplete="off">
        <div class="level-30__controls">
          <input class="nelg-password-input" id="level-30-answer" name="nelg-level-30-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="160" value="${CIPHERTEXT}" autocomplete="off"
            autocapitalize="off" aria-autocomplete="none" aria-label="Encoded password"
            spellcheck="false" />
          <button class="level-30__go" type="submit">GO</button>
          <button class="level-30__reset" type="button">Reset</button>
        </div>
      </form>

      <div class="level-30__darkness" aria-hidden="true"></div>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-30__form");
    const input = screen.querySelector<HTMLInputElement>("#level-30-answer");
    const goButton = screen.querySelector<HTMLButtonElement>(".level-30__go");
    const resetButton = screen.querySelector<HTMLButtonElement>(".level-30__reset");
    const darkness = screen.querySelector<HTMLElement>(".level-30__darkness");
    if (!form || !input || !goButton || !resetButton || !darkness) return;

    listen(screen, "pointermove", (event) => {
      const bounds = screen.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 800;
      const y = ((event.clientY - bounds.top) / bounds.height) * 600;
      darkness.style.setProperty("--level-30-light-x", `${x}px`);
      darkness.style.setProperty("--level-30-light-y", `${y}px`);
    });

    listen(resetButton, "click", () => {
      input.value = CIPHERTEXT;
      input.classList.remove("is-wrong");
      input.focus();
    });

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (input.value === ANSWER) {
        goButton.disabled = true;
        resetButton.disabled = true;
        complete();
        return;
      }

      input.classList.remove("is-wrong");
      void input.offsetWidth;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
