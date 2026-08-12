import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const ANSWER = "decibel";

export const level34: LevelDefinition = {
  number: 34,
  title: "Voice",
  mount({ screen, complete, listen, timeout, audio }) {
    screen.className = "level-screen level-34";
    screen.innerHTML = `
      <header class="level-heading level-34__heading">
        <div class="level-heading__number">Level 34</div>
        <h1>Voice</h1>
      </header>

      <form class="level-34__form" autocomplete="off">
        <div class="level-34__controls">
          <input class="nelg-password-input" id="level-34-answer" name="nelg-level-34-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="24" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" aria-label="Voice answer" spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>

      <div class="level-34__audio-controls" aria-label="Voice recording controls">
        <button class="level-34__audio-button level-34__audio-button--play" type="button"
          aria-label="Play voice recording"><span aria-hidden="true"></span></button>
        <button class="level-34__audio-button level-34__audio-button--pause" type="button"
          aria-label="Pause voice recording"><span aria-hidden="true"></span></button>
        <button class="level-34__audio-button level-34__audio-button--stop" type="button"
          aria-label="Stop voice recording"><span aria-hidden="true"></span></button>
      </div>
      <p class="level-34__audio-status" role="status" aria-live="polite">STOPPED</p>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-34__form");
    const input = screen.querySelector<HTMLInputElement>("#level-34-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-34__form button");
    const playButton = screen.querySelector<HTMLButtonElement>(".level-34__audio-button--play");
    const pauseButton = screen.querySelector<HTMLButtonElement>(".level-34__audio-button--pause");
    const stopButton = screen.querySelector<HTMLButtonElement>(".level-34__audio-button--stop");
    const status = screen.querySelector<HTMLElement>(".level-34__audio-status");
    if (!form || !input || !submitButton || !playButton || !pauseButton || !stopButton || !status) return;

    const recording = new Audio(assetUrl("music/level34.mp3"));
    recording.preload = "metadata";
    recording.volume = audio.musicVolume / 100;

    const setStatus = (message: string) => {
      status.textContent = message;
    };

    listen(playButton, "click", () => {
      if (!audio.musicEnabled) {
        setStatus("MUSIC IS DISABLED IN OPTIONS");
        return;
      }
      recording.volume = audio.musicVolume / 100;
      void recording.play().then(() => setStatus("PLAYING")).catch(() => setStatus("PLAYBACK FAILED"));
    });

    listen(pauseButton, "click", () => {
      recording.pause();
      setStatus("PAUSED");
    });

    listen(stopButton, "click", () => {
      recording.pause();
      recording.currentTime = 0;
      setStatus("STOPPED");
    });

    recording.addEventListener("ended", () => setStatus("FINISHED"));
    recording.addEventListener("error", () => setStatus("AUDIO FILE COULD NOT BE LOADED"));

    const maskedInput = attachStarMaskedInput(input, listen);
    input.focus();

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue() === ANSWER) {
        submitButton.disabled = true;
        recording.pause();
        recording.currentTime = 0;
        complete();
        return;
      }

      maskedInput.clear();
      input.classList.remove("is-wrong");
      void input.offsetWidth;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });

    return () => {
      recording.pause();
      recording.removeAttribute("src");
      recording.load();
    };
  },
};
