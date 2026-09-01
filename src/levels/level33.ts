import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

interface AlphaMask {
  readonly alpha: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

interface FormulaState {
  readonly element: HTMLImageElement;
  mask?: AlphaMask;
  x: number;
  y: number;
}

const FORMULA_IMAGES = [
  "level33a.png",
  "level33b.png",
  "level33c.png",
  "level33d.png",
  "level33e.png",
  "level33f.png",
  "level33g.png",
  "level33h.png",
  "level33i.png",
  "level33j.png",
  "level33k.png",
] as const;

const STEP_ANSWERS = ["84", "39", "123", "666", "13082", "29767936", "298080", "60466176", "apery's constant", "5"] as const;
const FINAL_PASSWORD = "212097273";
const INITIAL_POSITIONS = [
  { x: -88, y: 112 },
  { x: -35, y: 78 },
  { x: -105, y: 134 },
  { x: -18, y: 96 },
  { x: -72, y: 58 },
  { x: -126, y: 118 },
  { x: -44, y: 146 },
  { x: -94, y: 86 },
  { x: -24, y: 126 },
  { x: -116, y: 66 },
  { x: -64, y: 104 },
] as const;

function normalizeLooseAperyAnswer(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function captureAlphaMask(image: HTMLImageElement): AlphaMask | undefined {
  if (!image.naturalWidth || !image.naturalHeight) return undefined;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const alpha = new Uint8ClampedArray(canvas.width * canvas.height);
  for (let index = 0; index < alpha.length; index += 1) alpha[index] = pixels[index * 4 + 3] ?? 0;
  return { alpha, width: canvas.width, height: canvas.height };
}

function isOpaqueAtPointer(state: FormulaState, clientX: number, clientY: number): boolean {
  if (!state.mask) return false;
  const bounds = state.element.getBoundingClientRect();
  if (clientX < bounds.left || clientX >= bounds.right || clientY < bounds.top || clientY >= bounds.bottom) return false;
  const imageX = Math.floor(((clientX - bounds.left) / bounds.width) * state.mask.width);
  const imageY = Math.floor(((clientY - bounds.top) / bounds.height) * state.mask.height);
  return (state.mask.alpha[imageY * state.mask.width + imageX] ?? 0) > 32;
}

export const level33: LevelDefinition = {
  number: 33,
  title: "Formula",
  mount({ screen, complete, listen, timeout }) {
    screen.className = "level-screen level-33";
    screen.innerHTML = `
      <header class="level-heading level-33__heading">
        <div class="level-heading__number">Level 33</div>
        <h1>Formula</h1>
      </header>

      <div class="level-33__formula-stage" data-allow-drag aria-label="Draggable formula images"></div>
      <p class="level-33__final-hint" hidden>Next time, enter only this password to proceed to Level 34.</p>

      <form class="level-33__form" autocomplete="off">
        <div class="level-33__controls">
          <input class="nelg-password-input" id="level-33-answer" name="nelg-level-33-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="24" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" aria-label="Formula answer" spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>
    `;

    const stage = screen.querySelector<HTMLElement>(".level-33__formula-stage");
    const hint = screen.querySelector<HTMLElement>(".level-33__final-hint");
    const form = screen.querySelector<HTMLFormElement>(".level-33__form");
    const input = screen.querySelector<HTMLInputElement>("#level-33-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-33__form button");
    if (!stage || !hint || !form || !input || !submitButton) return;

    const formulas: FormulaState[] = [];
    let expectedStep = 0;
    let topLayer = 4;
    let activeDrag:
      | {
          readonly pointerId: number;
          readonly state: FormulaState;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly imageX: number;
          readonly imageY: number;
        }
      | undefined;

    const pointerInGame = (event: PointerEvent) => {
      const bounds = screen.getBoundingClientRect();
      return {
        x: ((event.clientX - bounds.left) / bounds.width) * screen.clientWidth,
        y: ((event.clientY - bounds.top) / bounds.height) * screen.clientHeight,
      };
    };

    const addFormula = (index: number) => {
      const position = INITIAL_POSITIONS[index];
      const source = FORMULA_IMAGES[index];
      if (!position || !source) return;

      const image = document.createElement("img");
      image.className = "level-33__formula";
      image.src = assetUrl(`images/${source}`);
      image.alt = `Formula ${index + 1}`;
      image.draggable = false;
      image.style.left = `${position.x}px`;
      image.style.top = `${position.y}px`;
      image.style.zIndex = String(++topLayer);
      const state: FormulaState = { element: image, x: position.x, y: position.y };
      formulas.push(state);
      stage.append(image);

      const loadMask = () => {
        state.mask = captureAlphaMask(image);
        image.dataset.maskReady = state.mask ? "true" : "false";
      };
      if (image.complete) loadMask();
      else image.addEventListener("load", loadMask, { once: true });
    };

    listen(stage, "pointerdown", (event) => {
      const state = [...formulas].reverse().find((formula) => isOpaqueAtPointer(formula, event.clientX, event.clientY));
      if (!state) return;
      const pointer = pointerInGame(event);
      activeDrag = {
        pointerId: event.pointerId,
        state,
        pointerX: pointer.x,
        pointerY: pointer.y,
        imageX: state.x,
        imageY: state.y,
      };
      state.element.style.zIndex = String(++topLayer);
      state.element.classList.add("is-dragging");
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    listen(stage, "pointermove", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      const pointer = pointerInGame(event);
      const imageWidth = activeDrag.state.element.offsetWidth;
      const imageHeight = activeDrag.state.element.offsetHeight;
      activeDrag.state.x = Math.max(60 - imageWidth, Math.min(740, activeDrag.imageX + pointer.x - activeDrag.pointerX));
      activeDrag.state.y = Math.max(70 - imageHeight, Math.min(530, activeDrag.imageY + pointer.y - activeDrag.pointerY));
      activeDrag.state.element.style.left = `${activeDrag.state.x}px`;
      activeDrag.state.element.style.top = `${activeDrag.state.y}px`;
      event.preventDefault();
    });

    const finishDrag = (event: PointerEvent) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      activeDrag.state.element.classList.remove("is-dragging");
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      activeDrag = undefined;
    };
    listen(stage, "pointerup", finishDrag);
    listen(stage, "pointercancel", finishDrag);

    const maskedInput = attachStarMaskedInput(input, listen);
    addFormula(0);
    input.focus();

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      const answer = maskedInput.getValue();
      if (answer === FINAL_PASSWORD) {
        submitButton.disabled = true;
        complete();
        return;
      }

      const expectedAnswer = STEP_ANSWERS[expectedStep];
      const matchesExpected =
        expectedStep === 8
          ? normalizeLooseAperyAnswer(answer) === "aperysconstant"
          : answer === expectedAnswer;
      if (expectedStep < STEP_ANSWERS.length && matchesExpected) {
        expectedStep += 1;
        addFormula(expectedStep);
        if (expectedStep === STEP_ANSWERS.length) hint.hidden = false;
        maskedInput.clear();
        input.focus();
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
