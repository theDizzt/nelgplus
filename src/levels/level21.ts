import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelContext, LevelDefinition } from "../core/types";

export const level21: LevelDefinition = {
  number: 21,
  title: "Homophone",
  scenes: [
    { id: "1", label: "Scene 1 - Puzzle" },
    { id: "2", label: "Scene 2 - Failure" },
  ],
  mount({ screen, complete, initialScene }) {
    let sceneController = new AbortController();
    const sceneTimers = new Set<number>();

    const clearScene = () => {
      sceneController.abort();
      sceneController = new AbortController();
      sceneTimers.forEach((timer) => window.clearTimeout(timer));
      sceneTimers.clear();
    };

    const on: LevelContext["listen"] = (target, type, listener, options = {}) => {
      target.addEventListener(type, listener as EventListener, {
        ...options,
        signal: sceneController.signal,
      });
    };

    const sceneTimeout = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        sceneTimers.delete(timer);
        callback();
      }, delay);
      sceneTimers.add(timer);
    };

    const renderSceneTwo = () => {
      clearScene();
      screen.className = "level-screen level-21 level-21--failure";
      screen.innerHTML = `
        <header class="level-heading level-21__heading level-21__heading--failure">
          <div class="level-heading__number">Level 21</div>
          <h1>Homophone</h1>
        </header>
        <p class="level-21__no">NO</p>
        <button class="level-21__back" type="button">BACK</button>
      `;

      const backButton = screen.querySelector<HTMLButtonElement>(".level-21__back");
      if (backButton) on(backButton, "click", renderSceneOne, { once: true });
    };

    const renderSceneOne = () => {
      clearScene();
      screen.className = "level-screen level-21 level-21--puzzle";
      screen.innerHTML = `
        <header class="level-heading level-21__heading">
          <div class="level-heading__number">Level 21</div>
          <h1>Homophone</h1>
        </header>

        <p class="level-21__message">Stop playing this game and go for a walk.</p>

        <form class="level-21__form" autocomplete="off">
          <div class="level-21__controls">
            <input class="nelg-password-input" id="level-21-answer" data-allow-select
              data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
              maxlength="1" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
              aria-label="Password" spellcheck="false" />
            <button type="submit">GO</button>
          </div>
        </form>
      `;

      const form = screen.querySelector<HTMLFormElement>(".level-21__form");
      const input = screen.querySelector<HTMLInputElement>("#level-21-answer");
      const submitButton = screen.querySelector<HTMLButtonElement>(".level-21__form button");
      if (!form || !input || !submitButton) return;

      const maskedInput = attachStarMaskedInput(input, on);
      let keyboardTrapArmed = false;
      sceneTimeout(() => {
        keyboardTrapArmed = true;
      }, 0);
      on(window, "keydown", (event) => {
        if (!keyboardTrapArmed || event.repeat) return;
        if (event.key === "3" || event.key === "Enter") {
          event.preventDefault();
          renderSceneTwo();
        }
      });
      on(form, "submit", (event) => {
        event.preventDefault();
        if (maskedInput.getValue() === "3") {
          complete();
          return;
        }

        maskedInput.clear();
        input.classList.remove("is-wrong");
        void input.offsetWidth;
        input.classList.add("is-wrong");
        input.focus();
        sceneTimeout(() => input.classList.remove("is-wrong"), 360);
      });
      input.focus();
    };

    if (initialScene === "2") renderSceneTwo();
    else renderSceneOne();
    return clearScene;
  },
};
