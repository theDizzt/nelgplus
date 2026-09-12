import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelContext } from "../core/types";

export function mountLevel57NoWay({ screen, listen, goToLevel, audio }: LevelContext): void {
  screen.className = "level-screen level-57-no-way";
  screen.dataset.scene = "B";
  screen.setAttribute("aria-label", "Level 57: NO WAY");
  screen.innerHTML = `
    <header class="level-heading">
      <div class="level-heading__number">Level 5<span class="level-57-no-way__seven">7<img
        src="${assetUrl("images/level56a.png")}" alt="Red X over the 7" draggable="false" /></span></div>
      <h1>NO WAY</h1>
    </header>
    <form class="level-08__form level-57__form" autocomplete="off">
      <input class="nelg-password-input" id="level-57-answer" name="nelg-level-fifty-seven-b-answer"
        data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
        type="text" maxlength="24" autocomplete="off" autocapitalize="off"
        aria-autocomplete="none" spellcheck="false" aria-label="Password" />
      <button type="submit">GO</button>
    </form>`;
  const form = screen.querySelector<HTMLFormElement>("form")!;
  const input = screen.querySelector<HTMLInputElement>("input")!;
  const masked = attachStarMaskedInput(input, listen);
  let leaving = false;
  listen(form.querySelector<HTMLButtonElement>("button")!, "pointerenter", () => audio.playEffect(SOUND_EFFECTS.pop));
  listen(input, "keydown", event => {
    if (event.key !== "Enter" || event.repeat) return;
    event.preventDefault();
    form.requestSubmit();
  });
  listen(form, "submit", event => {
    event.preventDefault();
    if (leaving) return;
    const answer = masked.getValue().trim().toLowerCase();
    if (answer === "endive") {
      leaving = true;
      goToLevel(58, "B");
    } else if (answer === "!" || answer === "?") {
      goToLevel(56, answer === "!" ? "2" : "3");
    } else if (answer === "confringo") {
      goToLevel(57, "A");
    } else input.focus();
  });
  input.focus();
}
