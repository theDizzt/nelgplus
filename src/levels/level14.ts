import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

export const level14: LevelDefinition = {
  number: 14,
  title: "Form",
  mount({ screen, complete, listen, timeout }) {
    screen.className = "level-screen level-14";
    screen.innerHTML = `
      <div class="level-14__background" aria-hidden="true">
        <span class="level-14__shape level-14__shape--navy"></span>
        <span class="level-14__shape level-14__shape--red"></span>
        <span class="level-14__shape level-14__shape--brown"></span>
        <span class="level-14__shape level-14__shape--blue"></span>
      </div>

      <header class="level-heading level-14__heading">
        <div class="level-heading__number">Level 14</div>
        <h1>Form</h1>
      </header>

      <p class="level-14__message">Can you figure out what is hidden?</p>
      <canvas class="level-14__hidden-word" width="700" height="180" aria-hidden="true"></canvas>

      <form class="level-14__form" autocomplete="off">
        <input class="nelg-password-input" id="level-14-answer" name="nelg-level-fourteen-answer" data-allow-select
          data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
          maxlength="24" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
          aria-label="Password" spellcheck="false" />
        <button type="submit">GO</button>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-14__form");
    const input = screen.querySelector<HTMLInputElement>("#level-14-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-14__form button");
    const hiddenWord = screen.querySelector<HTMLCanvasElement>(".level-14__hidden-word");
    if (!form || !input || !submitButton || !hiddenWord) return;

    const hiddenContext = hiddenWord.getContext("2d", { willReadFrequently: true });
    if (!hiddenContext) return;

    const drawHiddenWord = () => {
      hiddenContext.clearRect(0, 0, hiddenWord.width, hiddenWord.height);
      hiddenContext.fillStyle = "#000";
      hiddenContext.font = '700 170px "NELG Arial", Arial, sans-serif';
      hiddenContext.textAlign = "center";
      hiddenContext.textBaseline = "middle";
      hiddenContext.fillText("hidden", hiddenWord.width / 2, hiddenWord.height / 2 + 4, 680);
    };

    drawHiddenWord();
    void document.fonts.load('700 170px "NELG Arial"').then(() => {
      if (hiddenWord.isConnected) drawHiddenWord();
    });

    listen(hiddenWord, "pointermove", (event) => {
      const bounds = hiddenWord.getBoundingClientRect();
      const x = Math.min(
        hiddenWord.width - 1,
        Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * hiddenWord.width)),
      );
      const y = Math.min(
        hiddenWord.height - 1,
        Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * hiddenWord.height)),
      );
      const alpha = hiddenContext.getImageData(x, y, 1, 1).data[3] ?? 0;
      hiddenWord.style.cursor = alpha > 0 ? "pointer" : "default";
    });

    listen(hiddenWord, "pointerleave", () => {
      hiddenWord.style.cursor = "default";
    });

    const maskedInput = attachStarMaskedInput(input, listen);
    let checking = false;
    input.focus();

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (checking) return;
      checking = true;
      submitButton.disabled = true;

      if (maskedInput.getValue() === "hidden") {
        complete();
        return;
      }

      checking = false;
      submitButton.disabled = false;
      maskedInput.clear();
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
