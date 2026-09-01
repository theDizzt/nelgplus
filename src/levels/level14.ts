import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

export const level14: LevelDefinition = {
  number: 14,
  title: "Form",
  mount({ screen, complete, wrongAnswer, listen, timeout, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-14${revival ? " level-14--revival" : ""}`;
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

      <p class="level-14__message">${revival
        ? 'Ca<span data-night-letter>n</span> you f<span data-night-letter>i</span>gure out what is hidden? Fi<span data-night-letter>g</span>ure out w<span data-night-letter>h</span>a<span data-night-letter>t</span> changed.'
        : "Can you figure out what is hidden?"}</p>
      <canvas class="level-14__hidden-word" width="700" height="180" aria-hidden="true"></canvas>
      <canvas class="level-14__trace" width="700" height="180" aria-hidden="true"></canvas>

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
    const traceCanvas = screen.querySelector<HTMLCanvasElement>(".level-14__trace");
    if (!form || !input || !submitButton || !hiddenWord || !traceCanvas) return;

    const hiddenContext = hiddenWord.getContext("2d", { willReadFrequently: true });
    const traceContext = traceCanvas.getContext("2d");
    if (!hiddenContext || !traceContext) return;
    let traceClearTimeout: number | undefined;

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

    if (revival) hiddenWord.hidden = true;

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
      if (alpha > 0) {
        traceContext.save();
        traceContext.beginPath();
        traceContext.arc(x, y, 22, 0, Math.PI * 2);
        traceContext.clip();
        traceContext.globalAlpha = 0.38;
        traceContext.drawImage(hiddenWord, 0, 0);
        traceContext.restore();
        if (traceClearTimeout !== undefined) window.clearTimeout(traceClearTimeout);
        traceClearTimeout = window.setTimeout(() => {
          traceContext.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
          traceClearTimeout = undefined;
        }, 800);
      }
    });

    listen(hiddenWord, "pointerleave", () => {
      hiddenWord.style.cursor = "default";
    });

    const traceFadeInterval = window.setInterval(() => {
      traceContext.save();
      traceContext.globalCompositeOperation = "destination-out";
      traceContext.fillStyle = "rgb(0 0 0 / 8%)";
      traceContext.fillRect(0, 0, traceCanvas.width, traceCanvas.height);
      traceContext.restore();
    }, 70);

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

      if (maskedInput.getValue() === (revival ? "night" : "hidden")) {
        complete();
        return;
      }
      if (wrongAnswer()) return;

      checking = false;
      submitButton.disabled = false;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });

    let backgroundInterval: number | undefined;
    if (revival) {
      const colors = ["#243540", "#5a1717", "#193d2a", "#4b3518", "#2f1749", "#101010"];
      backgroundInterval = window.setInterval(() => {
        screen.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] ?? "#101010";
      }, 850);
    }

    return () => {
      window.clearInterval(traceFadeInterval);
      if (backgroundInterval !== undefined) window.clearInterval(backgroundInterval);
      if (traceClearTimeout !== undefined) window.clearTimeout(traceClearTimeout);
    };
  },
};
