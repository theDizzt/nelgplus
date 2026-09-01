import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

interface AlphaMask {
  readonly alpha: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

interface PieceState {
  readonly element: HTMLImageElement;
  mask?: AlphaMask;
  x: number;
  y: number;
  z: number;
}

const ANSWER = "decing";

const INITIAL_PIECES = [
  ...Array<string>(7).fill("level43a1.png"),
  ...Array<string>(2).fill("level43a2.png"),
  "level43a3.png",
  "level43a4.png",
  "level43a5.png",
  "level43b1.png",
  "level43b2.png",
  "level43b3.png",
  "level43b4.png",
  "level43b5.png",
  "level43b6.png",
  ...Array<string>(2).fill("level43c1.png"),
  "level43c2.png",
  "level43c3.png",
  "level43c4.png",
  ...Array<string>(2).fill("level43d1.png"),
  "level43d2.png",
  "level43d3.png",
  "level43d4.png",
  ...Array<string>(2).fill("level43e1.png"),
  "level43e2.png",
  "level43e3.png",
  "level43e4.png",
  "level43e5.png",
  "level43e6.png",
  "level43e7.png",
  "level43f.png",
] as const;

const PASSWORD_PIECES: Readonly<Record<string, string>> = {
  coffee: "level43pw1.png",
  carrot: "level43pw2.png",
  east: "level43pw3.png",
  melon: "level43pw4.png",
  water: "level43pw5.png",
  hidden: "level43pw6.png",
};

const PASSWORD_POSITIONS = [
  { x: 622, y: 314 },
  { x: 78, y: 426 },
  { x: 438, y: 374 },
  { x: 248, y: 286 },
  { x: 548, y: 452 },
  { x: 158, y: 348 },
] as const;

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

function isOpaqueAtPointer(state: PieceState, clientX: number, clientY: number): boolean {
  if (!state.mask) return false;
  const bounds = state.element.getBoundingClientRect();
  if (clientX < bounds.left || clientX >= bounds.right || clientY < bounds.top || clientY >= bounds.bottom) return false;
  const x = Math.floor(((clientX - bounds.left) / bounds.width) * state.mask.width);
  const y = Math.floor(((clientY - bounds.top) / bounds.height) * state.mask.height);
  return (state.mask.alpha[y * state.mask.width + x] ?? 0) > 32;
}

function initialPosition(index: number): { readonly x: number; readonly y: number } {
  return {
    x: 8 + (index * 211 + index % 5 * 29) % 665,
    y: 180 + (index * 109 + Math.floor(index / 4) * 31) % 285,
  };
}

export const level43: LevelDefinition = {
  number: 43,
  title: "Scatter",
  mount({ screen, complete, listen, timeout }) {
    screen.className = "level-screen level-43";
    screen.innerHTML = `
      <header class="level-heading level-43__heading" aria-label="Level 43, Scatter">
        <div class="level-heading__number">Level 43</div>
        <h1>Scatter</h1>
      </header>

      <p class="level-43__message">
        I shattered the foreign words so you could never find them!!!!!<br />
        Ha ha ha!!! Do you really think you can pull this off?
      </p>

      <div class="level-43__piece-stage" data-allow-drag aria-label="Scattered draggable word pieces"></div>

      <form class="level-43__form" autocomplete="off">
        <input class="nelg-password-input" id="level-43-answer" name="nelg-level-forty-three-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="16" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <button type="submit">GO</button>
      </form>
    `;

    const stage = screen.querySelector<HTMLElement>(".level-43__piece-stage");
    const form = screen.querySelector<HTMLFormElement>(".level-43__form");
    const input = screen.querySelector<HTMLInputElement>("#level-43-answer");
    const submitButton = form?.querySelector<HTMLButtonElement>("button");
    if (!stage || !form || !input || !submitButton) return;

    const pieces: PieceState[] = [];
    const unlockedWords = new Set<string>();
    let nextZ = 1;
    let activeDrag:
      | {
          readonly state: PieceState;
          readonly pointerId: number;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly pieceX: number;
          readonly pieceY: number;
        }
      | undefined;

    const addPiece = (source: string, x: number, y: number) => {
      const image = document.createElement("img");
      image.className = "level-43__piece";
      image.src = assetUrl(`images/${source}`);
      image.alt = "";
      image.draggable = false;
      image.style.left = `${x}px`;
      image.style.top = `${y}px`;
      image.style.zIndex = String(nextZ);
      stage.append(image);

      const state: PieceState = { element: image, x, y, z: nextZ };
      nextZ += 1;
      pieces.push(state);
      const loadMask = () => {
        state.mask = captureAlphaMask(image);
        image.dataset.maskReady = state.mask ? "true" : "false";
      };
      if (image.complete) loadMask();
      else listen(image, "load", loadMask, { once: true });
    };

    INITIAL_PIECES.forEach((source, index) => {
      const position = initialPosition(index);
      addPiece(source, position.x, position.y);
    });

    listen(stage, "pointerdown", (event) => {
      const state = [...pieces]
        .sort((left, right) => right.z - left.z)
        .find((piece) => isOpaqueAtPointer(piece, event.clientX, event.clientY));
      if (!state) return;
      const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
      state.z = nextZ;
      nextZ += 1;
      state.element.style.zIndex = String(state.z);
      state.element.classList.add("is-dragging");
      activeDrag = {
        state,
        pointerId: event.pointerId,
        pointerX: pointer.x,
        pointerY: pointer.y,
        pieceX: state.x,
        pieceY: state.y,
      };
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    listen(stage, "pointermove", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
      activeDrag.state.x = Math.max(0, Math.min(736, activeDrag.pieceX + pointer.x - activeDrag.pointerX));
      activeDrag.state.y = Math.max(0, Math.min(536, activeDrag.pieceY + pointer.y - activeDrag.pointerY));
      activeDrag.state.element.style.left = `${activeDrag.state.x}px`;
      activeDrag.state.element.style.top = `${activeDrag.state.y}px`;
      event.preventDefault();
    });

    const finishDrag = (event: PointerEvent) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      activeDrag.state.element.classList.remove("is-dragging");
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

    listen(form, "submit", (event) => {
      event.preventDefault();
      const answer = maskedInput.getValue();
      if (answer === ANSWER) {
        submitButton.disabled = true;
        complete();
        return;
      }

      const pieceSource = PASSWORD_PIECES[answer];
      if (pieceSource) {
        if (!unlockedWords.has(answer)) {
          const position = PASSWORD_POSITIONS[Object.keys(PASSWORD_PIECES).indexOf(answer)] ?? { x: 340, y: 360 };
          unlockedWords.add(answer);
          addPiece(pieceSource, position.x, position.y);
        }
        maskedInput.clear();
        input.focus();
        return;
      }

      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
