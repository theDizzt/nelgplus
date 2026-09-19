import { assetUrl } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { attachLevel61Maze } from "./level61Maze";

export const level61: LevelDefinition = {
  number: 61,
  title: "Labyrinth",
  scenes: [
    { id: "1", label: "Scene 1 - Main" },
    { id: "2", label: "Scene 2 - Maze" },
    { id: "3", label: "Scene 3 - Failed" },
    { id: "4", label: "Scene 4 - Died" },
  ],
  mount({ screen, initialScene, listen, audio }) {
    screen.className = "level-screen level-61";
    screen.dataset.customCursorRoot = "";
    const colors = ["#f00", "url(#level61-gold)", "#0f0", "url(#level61-blue)", "#f0f", "#ff0", "url(#level61-silver)", "#f80", "#600"];
    screen.innerHTML = `
      <div class="level-61__pulse" aria-hidden="true"></div>
      <header class="level-heading"><div class="level-heading__number">Level 61</div><h1>Labyrinth</h1></header>
      <section class="level-61__scene" data-panel="1">
        <img class="level-61__art" src="${assetUrl("images/level59a.png")}" alt="" draggable="false">
        <p class="level-61__copy">そろそろ狂い始めています &gt;:D</p>
        <button class="level-61__action" type="button" data-start>Hajimari</button>
      </section>
      <section class="level-61__scene" data-panel="2" hidden>
        <div class="level-61__maze-world">
          <img src="${assetUrl("images/level61maze1.png")}" alt="" draggable="false">
          <button class="level-61__maze-goal" type="button" tabindex="-1" aria-label="Exit maze"></button>
        </div>
      </section>
      <section class="level-61__scene" data-panel="3" hidden>
        <p class="level-61__copy">あなたは死にました。</p>
        <button class="level-61__action" type="button" data-retry>もう一度</button>
      </section>
      <section class="level-61__scene" data-panel="4" hidden>
        <svg class="level-61__rings" viewBox="0 0 800 600" aria-label="Nine draggable rings">
          <defs>
            <linearGradient id="level61-gold"><stop stop-color="#ff0"/><stop offset="1" stop-color="#f60"/></linearGradient>
            <linearGradient id="level61-blue" x2="0" y2="1"><stop stop-color="#00f"/><stop offset="1" stop-color="#fff"/></linearGradient>
            <linearGradient id="level61-silver"><stop stop-color="#000"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#333"/></linearGradient>
          </defs>
          ${colors.map((color, i) => `<circle class="level-61__ring" data-ring="${i}" data-allow-drag cx="400" cy="337" r="${166 - i * 17}" fill="none" stroke="${color}" stroke-width="14" tabindex="0" role="img" aria-label="Draggable ring ${i + 1}; use arrow keys to move"/>`).join("")}
        </svg>
        ${["#fff", "#f00", "#0f0", "#00f"].map((color, i) => `
          <div
            class="level-61__password-layer"
            data-password-layer="${i + 1}"
            ${i < 3 ? `data-password-drag="${i + 1}"` : ""}
            style="z-index:${4 - i}"
          >
            <form
              class="level-08__form level-61__form"
              data-layer="${i + 1}"
              style="--input-color:${color}"
              autocomplete="off"
            >
              <input
                class="nelg-password-input"
                type="text"
                data-allow-select
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                aria-label="Password ${i + 1}"
              >
              <button type="submit">GO</button>
            </form>
          </div>
        `).join("")}
      </section>
      <span class="custom-cursor level-61__cursor" aria-hidden="true" hidden><i></i><i></i><i></i><b></b><b></b></span>
    `;
    const cursor = screen.querySelector<HTMLElement>(".level-61__cursor")!;
    const rings = [...screen.querySelectorAll<SVGCircleElement>(".level-61__ring")];
    let drag: { ring: SVGCircleElement; id: number; x: number; y: number; cx: number; cy: number } | undefined;
    const stopDrag = () => {
      const previous = drag;
      drag = undefined;
      if (previous && screen.hasPointerCapture(previous.id)) screen.releasePointerCapture(previous.id);
    };
    let musicStarted = false;
    let invincible = false;
    let cheatInput = "";
    const showScene = (scene: string) => {
      stopDrag();
      cheatInput = "";
      if (scene === "4") invincible = false;
      screen.dataset.scene = scene;
      screen.querySelectorAll<HTMLElement>("[data-panel]").forEach(panel => { panel.hidden = panel.dataset.panel !== scene; });
      maze.setActive(scene === "2");
      if (scene === "4") {
        audio.stopMusic();
        musicStarted = false;
      } else if (!musicStarted) {
        musicStarted = true;
        void audio.playMusic("music/level61.mp3", true);
      }
    };
    const maze = attachLevel61Maze(
      { screen, listen },
      () => { if (!invincible) showScene("3"); },
      () => showScene("4"),
      () => invincible,
    );
    listen(document, "keydown", event => {
      if (screen.dataset.scene !== "1" || event.repeat || event.isComposing) return;
      if ((event.target as Element | null)?.closest("input, textarea, [contenteditable]")) return;
      if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) {
        cheatInput = "";
        return;
      }
      const code = "melonsoda84";
      cheatInput = (cheatInput + event.key).slice(-code.length);
      if (cheatInput === code) {
        invincible = true;
        cheatInput = "";
      }
    });
    listen(screen.querySelector<HTMLElement>("[data-start]")!, "click", () => showScene("2"));
    listen(screen.querySelector<HTMLElement>("[data-retry]")!, "click", () => showScene("2"));
    screen.querySelectorAll<HTMLFormElement>("form").forEach(form => {
      attachStarMaskedInput(form.querySelector("input")!, listen);
      listen(form, "submit", event => event.preventDefault());
    });
    screen
  .querySelectorAll<HTMLElement>("[data-password-drag]")
  .forEach(layer => {

    let pointerId: number | null = null;

    let startX = 0;
    let startY = 0;

    let originX = 0;
    let originY = 0;

    listen(layer, "pointerdown", event => {
      if (
        event.button !== 0 ||
        screen.dataset.scene !== "4"
      ) {
        return;
      }

      const target = event.target as HTMLElement;

      if (target.closest("input, button")) {
        return;
      }

      const point = clientPointToLocal(
        screen,
        event.clientX,
        event.clientY
      );

      pointerId = event.pointerId;

      startX = point.x;
      startY = point.y;

      originX = Number(
        layer.dataset.dragX ?? "0"
      );

      originY = Number(
        layer.dataset.dragY ?? "0"
      );

      layer.setPointerCapture(event.pointerId);

      layer.classList.add("is-dragging");

      event.preventDefault();
    });


    listen(layer, "pointermove", event => {
      if (event.pointerId !== pointerId) {
        return;
      }

      const point = clientPointToLocal(
        screen,
        event.clientX,
        event.clientY
      );

      const x =
        originX +
        point.x -
        startX;

      const y =
        originY +
        point.y -
        startY;

      layer.dataset.dragX = String(x);
      layer.dataset.dragY = String(y);

      layer.style.setProperty(
        "--drag-x",
        `${x}px`
      );

      layer.style.setProperty(
        "--drag-y",
        `${y}px`
      );

      event.preventDefault();
    });


    const stopPasswordDrag = (
      event: PointerEvent
    ) => {
      if (event.pointerId !== pointerId) {
        return;
      }

      if (
        layer.hasPointerCapture(
          event.pointerId
        )
      ) {
        layer.releasePointerCapture(
          event.pointerId
        );
      }

      pointerId = null;

      layer.classList.remove(
        "is-dragging"
      );
    };


    listen(
      layer,
      "pointerup",
      stopPasswordDrag
    );

    listen(
      layer,
      "pointercancel",
      stopPasswordDrag
    );
  });
    const moveRing = (ring: SVGCircleElement, x: number, y: number) => {
      const radius = ring.r.baseVal.value + 7;
      ring.setAttribute("cx", String(Math.max(radius, Math.min(800 - radius, x))));
      ring.setAttribute("cy", String(Math.max(radius, Math.min(600 - radius, y))));
    };
    listen(screen, "pointerdown", event => {
      if (event.button !== 0 || drag || screen.dataset.scene !== "4") return;
      const ring = (event.target as Element).closest<SVGCircleElement>(".level-61__ring");
      if (!ring || !rings.includes(ring)) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      drag = { ring, id: event.pointerId, ...point, cx: ring.cx.baseVal.value, cy: ring.cy.baseVal.value };
      screen.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    listen(screen, "pointermove", event => {
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      cursor.hidden = event.pointerType === "touch";
      cursor.style.left = `${point.x}px`;
      cursor.style.top = `${point.y}px`;
      if (drag && event.pointerId === drag.id) moveRing(drag.ring, drag.cx + point.x - drag.x, drag.cy + point.y - drag.y);
    });
    const endPointer = (event: PointerEvent) => { if (drag?.id === event.pointerId) stopDrag(); };
    listen(screen, "pointerup", endPointer);
    listen(screen, "pointercancel", endPointer);
    listen(screen, "lostpointercapture", endPointer);
    listen(screen, "pointerleave", () => { cursor.hidden = true; });
    listen(window, "blur", () => { stopDrag(); cursor.hidden = true; });
    listen(screen, "keydown", event => {
      const ring = event.target as SVGCircleElement;
      if (!rings.includes(ring)) return;
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!delta) return;
      event.preventDefault();
      const step = event.shiftKey ? 20 : 5;
      moveRing(ring, ring.cx.baseVal.value + delta[0]! * step, ring.cy.baseVal.value + delta[1]! * step);
    });
    showScene(["1", "2", "3", "4"].includes(initialScene ?? "") ? initialScene! : "1");
    return () => { stopDrag(); maze.dispose(); audio.stopMusic(); delete screen.dataset.customCursorRoot; };
  },
};
