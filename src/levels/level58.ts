import type { LevelDefinition } from "../core/types";
import { assetUrl } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { COSMIC_NOTES } from "./level58Notes";
import { blockTabNavigation } from "../core/blockTabNavigation";

export const level58: LevelDefinition = {
  number: 58,
  title: "Cosmic",
  scenes: [
    { id: "A", label: "Level 58 - Cosmic (Part A)" },
    { id: "B", label: "Level 58 - Cosmic (Part B)" },
  ],
  mount({ screen, initialScene, listen, complete }) {
    blockTabNavigation(listen);
    const part = initialScene === "B" ? "B" : "A";
    screen.className = "level-screen level-58";
    screen.dataset.scene = part;
    screen.setAttribute("aria-label", `Level 58: Cosmic, Part ${part}`);
    screen.style.setProperty("--level-58-space", `url("${assetUrl("images/spacebg.png")}")`);
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 58</div>
        <h1>Cosmic</h1>
      </header>
      <blockquote class="level-58__quote">“The cosmos is within us. We are made of star-stuff.
        We are a way for the cosmos to know itself.”<cite>– Carl Sagan</cite></blockquote>
      <div class="level-58__notes" aria-label="Discovered notes"></div>
      <form class="level-08__form level-58__form" autocomplete="off">
        <input class="nelg-password-input" id="level-58-answer" name="nelg-level-fifty-eight-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="40" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <button type="submit">GO</button>
      </form>
      <img class="level-58__split" src="${assetUrl(`images/level58split${part.toLowerCase()}.png`)}"
        alt="" aria-hidden="true" draggable="false" />
      <div class="level-58__split-blocker" aria-hidden="true"></div>`;

    const notesLayer = screen.querySelector<HTMLElement>(".level-58__notes")!;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = screen.querySelector<HTMLInputElement>("input")!;
    const split = screen.querySelector<HTMLImageElement>(".level-58__split")!;
    const blocker = screen.querySelector<HTMLElement>(".level-58__split-blocker")!;
    const masked = attachStarMaskedInput(input, listen);
    const notes = new Map<string, HTMLElement>();
    let topNote = 0;
    let solved = false;
    let disposed = false;
    let drag: { id: number; note: HTMLElement; startX: number; startY: number; x: number; y: number } | undefined;

    // Seal alpha pinholes and screen-edge gaps with one continuous hit region.
    // Keep the original image unchanged; only the invisible blocker is expanded.
    const prepareMask = () => {
      if (disposed || !split.naturalWidth) return;
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(split, 0, 0, 800, 600);
      const pixels = ctx.getImageData(0, 0, 800, 600).data;
      const edge = part === "A" ? -1 : 801;
      const outline = [`M${edge} -1`];
      for (let y = 0; y < 600; y += 1) {
        let boundary = part === "A" ? 0 : 800;
        for (let x = 0; x < 800; x += 1) {
          if (pixels[(y * 800 + x) * 4 + 3]! === 0) continue;
          boundary = part === "A" ? Math.max(boundary, x + 1) : Math.min(boundary, x);
        }
        boundary += part === "A" ? 2 : -2;
        outline.push(`H${boundary}V${y + 1}`);
      }
      outline.push(`V601H${edge}Z`);
      blocker.style.clipPath = `path("${outline.join("")}")`;
      screen.dataset.maskReady = "true";
    };
    listen(split, "load", prepareMask);
    if (split.complete) prepareMask();

    const moveNote = (note: HTMLElement, x: number, y: number) => {
      // Retain a grab strip at every edge, including after pointer cancellation.
      note.style.left = `${Math.max(48 - note.offsetWidth, Math.min(752, x))}px`;
      note.style.top = `${Math.max(32 - note.offsetHeight, Math.min(552, y))}px`;
    };
    const showNote = (key: string) => {
      const definition = COSMIC_NOTES[key];
      if (!definition) return;
      let note = notes.get(key);
      if (!note) {
        note = document.createElement("article");
        note.className = "level-58__note";
        note.dataset.note = key;
        note.tabIndex = 0;
        note.setAttribute("aria-label", "Old handwritten note. Drag to move, or use arrow keys.");
        note.setAttribute("data-allow-drag", "");
        note.innerHTML = `${definition.html}${definition.reveal ? '<p class="level-58__reveal" aria-live="polite" hidden></p>' : ""}`;
        notesLayer.append(note);
        notes.set(key, note);
      }
      note.style.zIndex = String(++topNote);
      moveNote(note, definition.x, definition.y);
    };
    listen(notesLayer, "pointerdown", event => {
      if (event.button !== 0 || drag) return;
      const note = (event.target as Element).closest<HTMLElement>(".level-58__note");
      if (!note) return;
      event.preventDefault();
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      note.style.zIndex = String(++topNote);
      drag = { id: event.pointerId, note, startX: point.x, startY: point.y, x: note.offsetLeft, y: note.offsetTop };
      note.setPointerCapture(event.pointerId);
      note.classList.add("is-dragging");
      note.focus({ preventScroll: true });
    });
    listen(notesLayer, "pointermove", event => {
      if (!drag || drag.id !== event.pointerId) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      moveNote(drag.note, drag.x + point.x - drag.startX, drag.y + point.y - drag.startY);
    });
    const stopDrag = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      const note = drag.note;
      drag = undefined;
      note.classList.remove("is-dragging");
      if (note.hasPointerCapture(event.pointerId)) note.releasePointerCapture(event.pointerId);
    };
    listen(notesLayer, "pointerup", stopDrag);
    listen(notesLayer, "pointercancel", stopDrag);
    listen(notesLayer, "lostpointercapture", stopDrag);
    listen(notesLayer, "keydown", event => {
      const note = (event.target as Element).closest<HTMLElement>(".level-58__note");
      const delta: Record<string, [number, number]> = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
      const step = delta[event.key];
      if (!note || !step) return;
      event.preventDefault();
      moveNote(note, note.offsetLeft + step[0], note.offsetTop + step[1]);
    });
    listen(document, "keydown", event => {
      if (event.key.toLowerCase() !== "e" || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      if ((event.target as Element | null)?.closest?.("input, textarea, [contenteditable='true']")) return;
      notes.forEach((note, key) => {
        const value = COSMIC_NOTES[key]?.reveal;
        const reveal = note.querySelector<HTMLElement>(".level-58__reveal");
        if (!value || !reveal) return;
        reveal.textContent = value;
        reveal.hidden = false;
      });
    });
    listen(screen, "pointerdown", event => {
      if (!(event.target as Element).closest("input, button, .nelg-password-input-mirror")) input.blur();
    });
    listen(input, "keydown", event => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", event => {
      event.preventDefault();
      if (solved) return;
      const answer = masked.getValue().trim().toLowerCase();
      if (answer === "cosmetic") {
        solved = true;
        complete();
        return;
      }
      if (Object.hasOwn(COSMIC_NOTES, answer)) {
        showNote(answer);
      }
      input.focus();
    });
    return () => { disposed = true; };
  },
};
