import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { SOUND_EFFECTS, assetUrl } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const ANSWER = "butterfly";

const CLUE_SCENES: Readonly<Record<string, number>> = {
  hidden: 1,
  navy: 2,
  "level 49": 3,
  left: 4,
  "green rectangle": 5,
  "red triangle": 6,
  stairs: 7,
  clockwise: 8,
};

function renderPasswordForm(): string {
  const buttons = Array.from({ length: 9 }, (_, index) => {
    const color = ["green", "magenta", "aqua"][index % 3];
    return `<button class="level-49__go level-49__go--${color}"
      style="bottom:${index * 40}px;left:${466 + index * 34}px"
      type="submit">GO</button>`;
  }).join("");
  return `
    <form class="level-49__form" autocomplete="off">
      <input class="nelg-password-input" id="level-49-answer" name="nelg-level-forty-nine-answer"
        data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
        type="text" maxlength="24" autocomplete="off" autocapitalize="off"
        aria-autocomplete="none" spellcheck="false" aria-label="Password" />
      ${buttons}
    </form>`;
}

export const level49: LevelDefinition = {
  number: 49,
  title: "Acoustic",
  scenes: Array.from({ length: 9 }, (_, index) => ({ id: String(index + 1), label: `Scene ${index + 1}` })),
  mount({ screen, complete, listen, timeout, audio, initialScene }) {
    let sceneIndex = Math.max(0, Math.min(8, Number(initialScene ?? "1") - 1));
    let maskedInput: ReturnType<typeof attachStarMaskedInput> | undefined;
    let cursorDecoration: HTMLElement | undefined;

    const renderScene = () => {
      screen.className = "level-screen level-49";
      screen.dataset.scene = String(sceneIndex + 1);
      maskedInput = undefined;
      screen.innerHTML = `
        <header class="level-heading level-49__heading" aria-label="Level 49, Acoustic">
          <div class="level-heading__number">Level 49</div>
          <h1>Acoustic</h1>
        </header>

        ${sceneIndex === 0 ? `
          <button class="level-49__moving-rectangle" type="button" aria-label="Moving green rectangle"></button>
          <button class="level-49__red-triangle" type="button" aria-label="Red triangle"></button>
          ${renderPasswordForm()}
        ` : `
          <p class="level-49__measure-number">${sceneIndex} / 8</p>
          <img class="level-49__sheet-music" src="${assetUrl(`images/level49a${sceneIndex}.png`)}"
            alt="Sheet music measure ${sceneIndex} of 8" draggable="false" />
          <button class="level-49__return" type="button" aria-label="Return to Scene 1"></button>
        `}
      `;

      cursorDecoration = document.createElement("span");
      cursorDecoration.className = "level-49__cursor-decoration";
      cursorDecoration.hidden = true;
      cursorDecoration.setAttribute("aria-hidden", "true");
      cursorDecoration.innerHTML = `<img src="${assetUrl("cursor/level49.png")}" alt="" draggable="false" />`;
      screen.append(cursorDecoration);

      if (sceneIndex === 0) {
        const input = screen.querySelector<HTMLInputElement>("#level-49-answer");
        if (input) maskedInput = attachStarMaskedInput(input, listen);
      }
    };

    const goToScene = (nextSceneIndex: number) => {
      sceneIndex = Math.max(0, Math.min(8, nextSceneIndex));
      renderScene();
    };

    renderScene();

    listen(screen, "pointermove", (event) => {
      if (!cursorDecoration) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      cursorDecoration.style.left = `${point.x}px`;
      cursorDecoration.style.top = `${point.y}px`;
      cursorDecoration.hidden = false;
    });
    listen(screen, "pointerleave", () => {
      if (cursorDecoration) cursorDecoration.hidden = true;
    });

    listen(screen, "click", (event) => {
      const target = event.target as Element;
      if (target.closest(".level-49__moving-rectangle, .level-49__red-triangle")) {
        audio.playEffect(SOUND_EFFECTS.smack);
        return;
      }
      if (target.closest(".level-49__return")) {
        audio.playEffect(SOUND_EFFECTS.smack);
        goToScene(0);
      }
    });

    listen(screen, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat || sceneIndex !== 0) return;
      const input = event.target instanceof HTMLInputElement ? event.target : undefined;
      const form = input?.closest<HTMLFormElement>(".level-49__form");
      if (!form) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(screen, "submit", (event) => {
      const form = event.target instanceof HTMLFormElement ? event.target : undefined;
      if (!form?.matches(".level-49__form") || !maskedInput) return;
      event.preventDefault();
      const answer = maskedInput.getValue().trim().toLowerCase();
      if (answer === ANSWER) {
        form.querySelectorAll<HTMLButtonElement>("button").forEach((button) => { button.disabled = true; });
        complete();
        return;
      }

      const nextScene = CLUE_SCENES[answer];
      if (nextScene !== undefined) {
        goToScene(nextScene);
        return;
      }

      const input = form.querySelector<HTMLInputElement>("#level-49-answer");
      maskedInput.clear();
      input?.classList.add("is-wrong");
      input?.focus();
      if (input) timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
