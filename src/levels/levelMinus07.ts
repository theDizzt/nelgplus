import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { tryBackwardsPassword } from "./negativeBackwards";

const OBJECTS = [
  { name: "a", x: 350, y: 195, width: 190, height: 180, motion: "horizontal", duration: 145 },
  { name: "b", x: 20, y: 24, width: 140, height: 140, motion: "wobble", duration: 230 },
  { name: "c", x: -24, y: -8, width: 848, height: 636, motion: "rumble", duration: 310 },
  { name: "d", x: 644, y: 30, width: 130, height: 140, motion: "vertical", duration: 175 },
  { name: "e", x: 25, y: 200, width: 150, height: 145, motion: "diagonal", duration: 195 },
  { name: "f", x: 565, y: 200, width: 205, height: 165, motion: "twist", duration: 265 },
  { name: "g", x: 210, y: 205, width: 105, height: 130, motion: "orbit", duration: 340 },
  { name: "h", x: 270, y: 405, width: 110, height: 105, motion: "bounce", duration: 285 },
  { name: "i", x: 465, y: 402, width: 125, height: 108, motion: "skew", duration: 215 },
] as const;

export const levelMinus07: LevelDefinition = {
  number: -7,
  title: "AWESOME",
  mount({ screen, listen, goToLevel, wrongAnswer, unlockAchievement, session }) {
    screen.className = "level-screen level-minus-07";
    screen.innerHTML = `
      <div class="level-minus-07__background" aria-hidden="true" style="background-image:url('${assetUrl("images/levelm7bg.jpg")}')"></div>
      ${OBJECTS.map((object, index) => `
        <img class="level-minus-07__object level-minus-07__object--${object.name}" src="${assetUrl(`images/levelm7${object.name}.png`)}" alt="" aria-hidden="true" draggable="false"
          style="left:${object.x}px;top:${object.y}px;width:${object.width}px;height:${object.height}px;animation-name:level-minus-07-${object.motion};animation-duration:${object.duration}ms;animation-delay:-${index * 37}ms">
      `).join("")}
      <header class="level-heading level-minus-07__heading">
        <div class="level-heading__number"><span>Level -7</span></div>
        <h1><span>AWESOME</span></h1>
      </header>
      <form class="level-minus-07__form" autocomplete="off">
        <input class="nelg-password-input" type="text" aria-label="Password" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false" data-allow-select>
        <button type="submit">GO</button>
      </form>
      <div class="level-minus-07__overlay" aria-hidden="true"></div>
    `;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    const password = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      const answer = password.getValue();
      if (tryBackwardsPassword(answer, { session, goToLevel })) return;
      if (answer === "ivory") unlockAchievement(120);
      if (answer === "bold and brash") goToLevel(-8);
      else {
        wrongAnswer();
        password.clear();
        input.focus();
      }
    });
  },
};
