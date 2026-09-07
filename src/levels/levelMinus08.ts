import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { BACKWARDS_UNLOCKED } from "./negativeBackwards";

export const levelMinus08: LevelDefinition = {
  number: -8,
  title: "Backwards",
  mount({ screen, listen, timeout, session, goToLevel, wrongAnswer }) {
    screen.className = "level-screen level-minus-08";
    screen.style.backgroundImage = `url("${assetUrl("images/levelm8bg.png")}")`;
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level -8</div>
        <h1>Backward<button class="level-minus-08__s" type="button" disabled aria-expanded="false" aria-controls="level-minus-08-destination">s</button></h1>
      </header>
      <select id="level-minus-08-destination" class="level-minus-08__destination" aria-label="Destination level" hidden>
        <option value="" disabled selected>Level...</option>
        ${Array.from({ length: 8 }, (_, index) => `<option value="${-index}">Level ${-index}</option>`).join("")}
      </select>
      <form class="level-minus-08__form" autocomplete="off">
        <input class="nelg-password-input" type="text" aria-label="Password" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false" data-allow-select>
        <button type="submit">GO</button>
      </form>
    `;
    const secret = screen.querySelector<HTMLButtonElement>(".level-minus-08__s")!;
    const destination = screen.querySelector<HTMLSelectElement>("select")!;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    const password = attachStarMaskedInput(input, listen);
    timeout(() => { secret.disabled = false; }, 60_000);
    listen(secret, "click", () => {
      if (secret.disabled) return;
      session.setFlag(BACKWARDS_UNLOCKED);
      destination.hidden = !destination.hidden;
      secret.setAttribute("aria-expanded", String(!destination.hidden));
      if (!destination.hidden) destination.focus();
    });
    listen(destination, "change", () => {
      if (secret.disabled || destination.hidden || destination.value === "") return;
      const level = Number(destination.value);
      if (Number.isInteger(level) && level >= -7 && level <= 0) goToLevel(level);
    });
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (password.getValue() === "BACK") {
        goToLevel(-9, "fail");
        return;
      }
      wrongAnswer();
      password.clear();
      input.focus();
    });
  },
};
