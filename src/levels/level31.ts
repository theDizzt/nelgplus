import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import { attachCustomCursor } from "../core/CustomCursor";
import type { LevelDefinition } from "../core/types";

const IMAGE_SEQUENCE = [
  "level31a.png",
  "level31b.png",
  "level31c.png",
  "level31d.png",
  "level31e.png",
  "level31f.png",
  "level31f.png",
  "level31g.png",
  "level31h.png",
  "level31i.png",
  "level31j.png",
  "level31k.png",
  "level31f.png",
  "level31g.png",
  "level31c.png",
  "level31k.png",
  "level31l.png",
] as const;

const ANSWERS = new Set(["WEIẞ", "WEISS"]);

export const level31: LevelDefinition = {
  number: 31,
  title: "BLANC",
  mount(context) {
    const { screen, complete, unlockAchievement, listen, timeout } = context;
    const removeCustomCursor = attachCustomCursor(context, {
      source: "cursor/level31.png",
      hotspot: "top-left",
    });
    screen.className = "level-screen level-31";
    screen.innerHTML = `
      <header class="level-heading level-31__heading">
        <div class="level-heading__number">Level 31</div>
        <h1>BLANC</h1>
      </header>

      <img class="level-31__image" alt="" aria-hidden="true" hidden />

      <form class="level-31__form" autocomplete="off" hidden>
        <div class="level-31__controls">
          <input class="nelg-password-input" id="level-31-answer" name="nelg-level-31-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="12" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" aria-label="Password" spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>
    `;

    const image = screen.querySelector<HTMLImageElement>(".level-31__image");
    const form = screen.querySelector<HTMLFormElement>(".level-31__form");
    const input = screen.querySelector<HTMLInputElement>("#level-31-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-31__form button");
    if (!image || !form || !input || !submitButton) return removeCustomCursor;

    let stage = 0;
    listen(screen, "click", (event) => {
      if ((event.target as Element).closest(".level-31__form")) return;
      stage = (stage + 1) % (IMAGE_SEQUENCE.length + 2);
      image.hidden = true;
      form.hidden = true;

      if (stage > 0 && stage <= IMAGE_SEQUENCE.length) {
        image.src = assetUrl(`images/${IMAGE_SEQUENCE[stage - 1]}`);
        image.hidden = false;
      } else if (stage === IMAGE_SEQUENCE.length + 1) {
        form.hidden = false;
        input.focus();
      }
    });

    const maskedInput = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      const answer = maskedInput.getValue();
      if (answer === "WEIB") unlockAchievement(36);
      if (ANSWERS.has(answer)) {
        submitButton.disabled = true;
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
    return removeCustomCursor;
  },
};
