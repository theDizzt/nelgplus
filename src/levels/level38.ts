import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

interface AlphaMask {
  readonly alpha: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

interface RouteState {
  readonly element: HTMLImageElement;
  mask?: AlphaMask;
  x: number;
  y: number;
}

function captureAlphaMask(image: HTMLImageElement): AlphaMask | undefined {
  if (!image.naturalWidth || !image.naturalHeight) return undefined;
  const maximumSide = 1000;
  const scale = Math.min(1, maximumSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const alpha = new Uint8ClampedArray(width * height);
  for (let index = 0; index < alpha.length; index += 1) alpha[index] = pixels[index * 4 + 3] ?? 0;
  return { alpha, width, height };
}

function isOpaqueAtPointer(state: RouteState, clientX: number, clientY: number): boolean {
  if (!state.mask) return false;
  const bounds = state.element.getBoundingClientRect();
  if (clientX < bounds.left || clientX >= bounds.right || clientY < bounds.top || clientY >= bounds.bottom) return false;
  const x = Math.floor(((clientX - bounds.left) / bounds.width) * state.mask.width);
  const y = Math.floor(((clientY - bounds.top) / bounds.height) * state.mask.height);
  return (state.mask.alpha[y * state.mask.width + x] ?? 0) > 32;
}

export const level38: LevelDefinition = {
  number: 38,
  title: "Massive",
  mount({ screen, complete, listen, timeout }) {
    screen.className = "level-screen level-38";
    screen.innerHTML = `
      <header class="level-heading level-38__heading">
        <div class="level-heading__number">Level 38</div>
        <h1>Massive</h1>
      </header>

      <div class="level-38__route-stage" data-allow-drag aria-label="Massive draggable route">
        <img class="level-38__route" src="${assetUrl("images/level38a.png")}" alt="A massive winding route" draggable="false" />
      </div>

      <form class="level-38__form" autocomplete="off">
        <div class="level-38__controls">
          <input class="nelg-password-input" id="level-38-answer" name="nelg-level-thirty-eight-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
            maxlength="16" autocomplete="off" autocapitalize="off" aria-autocomplete="none" spellcheck="false"
            aria-label="Password" />
          <button type="submit">GO</button>
        </div>
      </form>`;

    const stage = screen.querySelector<HTMLElement>(".level-38__route-stage");
    const image = screen.querySelector<HTMLImageElement>(".level-38__route");
    const form = screen.querySelector<HTMLFormElement>(".level-38__form");
    const input = screen.querySelector<HTMLInputElement>("#level-38-answer");
    const submit = screen.querySelector<HTMLButtonElement>(".level-38__form button");
    if (!stage || !image || !form || !input || !submit) return;

    const route: RouteState = { element: image, x: -3650, y: -3420 };
    let activeDrag:
      | {
          readonly pointerId: number;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly routeX: number;
          readonly routeY: number;
        }
      | undefined;

    const localPointer = (event: PointerEvent) => {
      const bounds = screen.getBoundingClientRect();
      return {
        x: ((event.clientX - bounds.left) / bounds.width) * screen.clientWidth,
        y: ((event.clientY - bounds.top) / bounds.height) * screen.clientHeight,
      };
    };

    const loadMask = () => {
      route.mask = captureAlphaMask(image);
      image.dataset.maskReady = route.mask ? "true" : "false";
    };
    if (image.complete) loadMask();
    else listen(image, "load", loadMask, { once: true });

    listen(stage, "pointerdown", (event) => {
      if (!isOpaqueAtPointer(route, event.clientX, event.clientY)) return;
      const pointer = localPointer(event);
      activeDrag = {
        pointerId: event.pointerId,
        pointerX: pointer.x,
        pointerY: pointer.y,
        routeX: route.x,
        routeY: route.y,
      };
      stage.setPointerCapture(event.pointerId);
      image.classList.add("is-dragging");
      event.preventDefault();
    });

    listen(stage, "pointermove", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      const pointer = localPointer(event);
      const minimumX = Math.min(0, screen.clientWidth - image.offsetWidth);
      const minimumY = Math.min(0, screen.clientHeight - image.offsetHeight);
      route.x = Math.max(minimumX, Math.min(0, activeDrag.routeX + pointer.x - activeDrag.pointerX));
      route.y = Math.max(minimumY, Math.min(0, activeDrag.routeY + pointer.y - activeDrag.pointerY));
      image.style.left = `${route.x}px`;
      image.style.top = `${route.y}px`;
      event.preventDefault();
    });

    const finishDrag = (event: PointerEvent) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      image.classList.remove("is-dragging");
      activeDrag = undefined;
    };
    listen(stage, "pointerup", finishDrag);
    listen(stage, "pointercancel", finishDrag);

    const maskedInput = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(input, "animationend", () => input.classList.remove("is-wrong"));
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue() === "G") {
        submit.disabled = true;
        complete();
        return;
      }
      input.classList.remove("is-wrong");
      void input.offsetWidth;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
