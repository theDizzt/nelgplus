import { assetUrl } from "../core/assets";
import { attachCustomCursor } from "../core/CustomCursor";
import { clientPointToLocal, localElementBounds } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const COLORS = [
  [3, 170, 245], [210, 5, 95], [160, 225, 8], [13, 210, 150],
  [240, 120, 21], [145, 34, 210], [55, 125, 230], [220, 190, 89],
] as const;

export const levelMinus09: LevelDefinition = {
  number: -9,
  title: "Least",
  scenes: [{ id: "fail", label: "Screen 1 - Fail" }, { id: "success", label: "Screen 2 - Success" }, { id: "ending", label: "Minus Ending" }],
  mount(context) {
    const { screen, initialScene, listen, goToLevel, wrongAnswer, unlockAchievement } = context;
    if (initialScene === "ending") {
      unlockAchievement(121);
      screen.className = "level-screen minus-ending";
      screen.style.backgroundImage = `url("${assetUrl("images/hiddenpicture.png")}")`;
      screen.innerHTML = `
        <section class="minus-ending__message" aria-label="Minus ending">
          <p>Congratulations! You've reached the lowest level in this game.</p>
          <p>It's nothing much, but here's a picture of my favorite Pok&eacute;mon as a gift. Enjoy the cute Rayquaza and the night view, then continue your journey through the positive integer levels.</p>
          <p class="minus-ending__credit">By Dizzt</p>
        </section>
      `;
      return;
    }
    const success = initialScene === "success";
    screen.className = `level-screen level-minus-09 level-minus-09--${success ? "success" : "fail"}`;
    screen.style.backgroundImage = `url("${assetUrl("images/levelm9bg.png")}")`;
    screen.innerHTML = `
      <header class="level-heading"><div class="level-heading__number">Level -9</div><h1>Least</h1></header>
      ${success ? `<div class="level-minus-09__colors">${COLORS.map((color, index) => `<div class="level-minus-09__color" role="img" aria-label="Color sample ${index + 1}" style="background-color:rgb(${color.join(",")})"></div>`).join("")}</div>
        <img class="level-minus-09__hint" src="${assetUrl("images/levelm9a.png")}" alt="" aria-hidden="true" draggable="false">` : ""}
      <form id="level-minus-09-form" class="level-minus-09__form" autocomplete="off">
        <input class="nelg-password-input" type="text" aria-label="Password" maxlength="24" autocomplete="off" autocapitalize="off" spellcheck="false" data-allow-select ${success ? "" : "disabled"}>
      </form>
      <button class="level-minus-09__go" type="submit" form="level-minus-09-form" ${success ? "" : "disabled"}>GO</button>
    `;
    const cleanupCursor = attachCustomCursor(context, { source: "cursor/levelm9.png", hotspot: "top-left" });
    if (!success) return cleanupCursor;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    const button = screen.querySelector<HTMLButtonElement>(".level-minus-09__go")!;
    const password = attachStarMaskedInput(input, listen);
    let drag: { id: number; x: number; y: number; left: number; top: number } | undefined;
    let moved = false;
    listen(button, "pointerdown", (event) => {
      if (event.button !== 0 || drag) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      const bounds = localElementBounds(screen, button);
      drag = { id: event.pointerId, x: point.x, y: point.y, left: bounds.x, top: bounds.y };
      moved = false;
      button.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    listen(button, "pointermove", (event) => {
      if (drag?.id !== event.pointerId) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      const dx = point.x - drag.x;
      const dy = point.y - drag.y;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      button.style.left = `${Math.max(0, Math.min(screen.clientWidth - button.offsetWidth, drag.left + dx))}px`;
      button.style.top = `${Math.max(0, Math.min(screen.clientHeight - button.offsetHeight, drag.top + dy))}px`;
    });
    const stopDrag = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) return;
      drag = undefined;
      if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    };
    listen(button, "pointerup", stopDrag);
    listen(button, "pointercancel", stopDrag);
    listen(button, "lostpointercapture", stopDrag);
    listen(button, "click", (event) => {
      if (!moved || event.detail === 0) return;
      event.preventDefault();
      moved = false;
    });
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (password.getValue() === "144") goToLevel(-9, "ending");
      else {
        wrongAnswer();
        password.clear();
        input.focus();
      }
    });
    return cleanupCursor;
  },
};
