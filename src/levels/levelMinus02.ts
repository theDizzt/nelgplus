import { assetUrl } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { tryBackwardsPassword } from "./negativeBackwards";

export const levelMinus02: LevelDefinition = {
  number: -2,
  title: "Gigantic",
  mount({ screen, listen, goToLevel, wrongAnswer, session }) {
    screen.className = "level-screen level-minus-02";
    screen.style.backgroundImage = `url("${assetUrl("images/levelm2bg.png")}")`;
    screen.innerHTML = `
      <img class="level-minus-02__object" src="${assetUrl("images/levelm2a.png")}" draggable="false" alt="" aria-hidden="true">
      <header class="level-heading level-minus-02__heading">
        <div class="level-heading__number">Level -2</div>
        <h1>Gigantic</h1>
      </header>
      <form class="level-minus-02__form" autocomplete="off">
        <input class="nelg-password-input" type="text" aria-label="Password" maxlength="24" autocomplete="off" spellcheck="false" autocapitalize="off" data-allow-select>
        <button type="submit">GO</button>
      </form>
    `;

    const object = screen.querySelector<HTMLImageElement>(".level-minus-02__object")!;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    const password = attachStarMaskedInput(input, listen);
    let pixels: ImageData | undefined;
    let x = 0;
    let y = -100;
    let drag: { id: number; x: number; y: number } | undefined;

    const renderPosition = () => {
      object.style.transform = `translate(${x}px, ${y}px)`;
    };
    const readPixels = () => {
      if (!object.naturalWidth) return;
      const canvas = document.createElement("canvas");
      canvas.width = object.naturalWidth;
      canvas.height = object.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(object, 0, 0);
      pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    };
    listen(object, "load", readPixels);
    if (object.complete) readPixels();
    renderPosition();

    const isOpaque = (localX: number, localY: number) => {
      if (!pixels) return false;
      const px = Math.floor((localX - x) * pixels.width / object.offsetWidth);
      const py = Math.floor((localY - y) * pixels.height / object.offsetHeight);
      return px >= 0 && py >= 0 && px < pixels.width && py < pixels.height
        && pixels.data[(py * pixels.width + px) * 4 + 3]! > 0;
    };
    listen(object, "pointerdown", (event) => {
      if (event.button !== 0 || drag) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      if (!isOpaque(point.x, point.y)) return;
      drag = { id: event.pointerId, x: point.x - x, y: point.y - y };
      object.setPointerCapture(event.pointerId);
      object.style.cursor = "grabbing";
      event.preventDefault();
    });
    listen(object, "pointermove", (event) => {
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      if (!drag) {
        object.style.cursor = isOpaque(point.x, point.y) ? "grab" : "default";
        return;
      }
      if (drag.id !== event.pointerId) return;
      // Keep the oversized image covering the viewport so it cannot get lost.
      x = Math.max(screen.clientWidth - object.offsetWidth, Math.min(0, point.x - drag.x));
      y = Math.max(screen.clientHeight - object.offsetHeight, Math.min(0, point.y - drag.y));
      renderPosition();
    });
    const stopDrag = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) return;
      drag = undefined;
      object.style.cursor = "default";
      if (object.hasPointerCapture(event.pointerId)) object.releasePointerCapture(event.pointerId);
    };
    listen(object, "pointerup", stopDrag);
    listen(object, "pointercancel", stopDrag);
    listen(object, "lostpointercapture", stopDrag);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (tryBackwardsPassword(password.getValue(), { session, goToLevel })) return;
      if (password.getValue() === "QUEEN!") {
        goToLevel(-3);
      } else {
        wrongAnswer();
        password.clear();
        input.focus();
      }
    });
  },
};
