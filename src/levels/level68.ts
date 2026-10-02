import { assetUrl } from "../core/assets";
import { blockTabNavigation } from "../core/blockTabNavigation";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { CONSTANT_CLUES, PASSWORD_LIMIT } from "./level68Constants";

export const level68: LevelDefinition = {
  number: 68,
  title: "Infinity",
  scenes: [{ id: "1", label: "Scene 1 - Infinity" }],
  mount({ screen, listen, complete, wrongAnswer, timeout }) {
    blockTabNavigation(listen);
    screen.className = "level-screen level-68";
    screen.dataset.scene = "1";
    screen.setAttribute("aria-label", "Level 68: Infinity");
    screen.innerHTML = `
      <div class="level-68__background">
        <img class="level-68__paint" src="${assetUrl("images/level68bg.jpg")}" alt="" draggable="false">
        ${[1, 2, 3, 4].map(n => `<img class="level-68__stars level-68__stars--${n}" src="${assetUrl("images/level68a.png")}" alt="" draggable="false">`).join("")}
        <span class="level-68__symbols">α φ γ e π</span>
        <span class="level-68__clue" role="status" aria-live="polite">??</span>
        <img class="level-68__figure" src="${assetUrl("images/level68b.png")}" alt="" draggable="false">
      </div>
      <div class="level-68__shade" aria-hidden="true"></div>
      <img class="level-68__foreground" src="${assetUrl("images/level68c.png")}" alt="" draggable="false">
      <header class="level-heading">
        <div class="level-heading__number" aria-label="Level 68">Level 6<span class="level-68__eight"><span>8</span></span></div>
        <h1>Infinity</h1>
      </header>
      <form class="level-08__form level-68__form" autocomplete="off">
        <input class="nelg-password-input" name="nelg-level-sixty-eight-answer" data-allow-select
          data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text" maxlength="${PASSWORD_LIMIT}"
          autocomplete="off" autocapitalize="off" aria-autocomplete="none" aria-label="Password" spellcheck="false">
        <button type="submit">GO</button>
      </form>`;

    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    const button = form.querySelector("button")!;
    const clue = screen.querySelector<HTMLElement>(".level-68__clue")!;
    const masked = attachStarMaskedInput(input, listen);
    let revealedFor: string | undefined;
    let leaving = false;

    // The mask intercepts beforeinput and paste, so native input events alone
    // cannot detect edits. Run after the mask's listeners to compare raw values.
    const resetClueOnEdit = () => {
      if (revealedFor !== undefined && masked.getValue() !== revealedFor) {
        clue.textContent = "??";
        revealedFor = undefined;
      }
      input.classList.remove("is-wrong");
    };
    listen(input, "beforeinput", resetClueOnEdit);
    listen(input, "paste", resetClueOnEdit);
    listen(input, "input", resetClueOnEdit);
    listen(input, "keydown", event => {
      if (event.key !== "Enter" || event.repeat || event.isComposing) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", event => {
      event.preventDefault();
      if (leaving) return;
      const answer = masked.getValue();
      if (answer === "unLimited!") {
        leaving = true;
        button.disabled = true;
        complete();
        return;
      }
      const match = CONSTANT_CLUES.find(constant => constant.password === answer);
      if (match) {
        revealedFor = answer;
        clue.textContent = match.fragment;
        input.classList.remove("is-wrong");
        return;
      }
      revealedFor = undefined;
      clue.textContent = "??";
      if (wrongAnswer()) return;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
    input.focus();
  },
};
