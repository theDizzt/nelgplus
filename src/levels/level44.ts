import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { SOUND_EFFECTS, assetUrl } from "../core/assets";
import {
  clientPointToLocal,
  localElementBounds,
  positionFloatingElement,
  type LocalPoint,
} from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const ANSWER = "miracle";
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const MIRROR_COUNT = 44;

interface MirrorPlacement {
  readonly x: number;
  readonly y: number;
}

interface MazePixelMap {
  readonly width: number;
  readonly height: number;
  readonly path: Uint8Array;
  readonly yellow: Uint8Array;
}

function createMirrorPlacements(): MirrorPlacement[] {
  const placements: MirrorPlacement[] = [];
  const coverColumns = [-20, 190, 400, 610];
  const coverRows = [-20, 260, 520];
  coverRows.forEach((y) => {
    coverColumns.forEach((x) => placements.push({ x, y }));
  });

  let seed = 0x44a11ce;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  while (placements.length < MIRROR_COUNT) {
    placements.push({
      x: Math.round(-100 + random() * 880),
      y: Math.round(-130 + random() * 690),
    });
  }
  return placements;
}

function renderMirrors(): string {
  return createMirrorPlacements().map((placement, index) => `
    <article class="level-44__mirror" data-mirror style="left:${placement.x}px;top:${placement.y}px;--mirror-layer:${index + 1}">
      <span class="level-44__mirror-grip level-44__mirror-grip--top" data-mirror-grip aria-hidden="true"></span>
      <span class="level-44__mirror-grip level-44__mirror-grip--right" data-mirror-grip aria-hidden="true"></span>
      <span class="level-44__mirror-grip level-44__mirror-grip--bottom" data-mirror-grip aria-hidden="true"></span>
      <span class="level-44__mirror-grip level-44__mirror-grip--left" data-mirror-grip aria-hidden="true"></span>
      <button class="level-44__mirror-face" data-mirror-face type="button" aria-label="Break mirror ${index + 1}">
        <span class="level-44__mirror-error">ERROR:</span>
        <span class="level-44__mirror-hole" aria-hidden="true"></span>
        ${Array.from({ length: 9 }, (_, crackIndex) => `<i class="level-44__mirror-crack level-44__mirror-crack--${crackIndex + 1}" aria-hidden="true"></i>`).join("")}
      </button>
    </article>`).join("");
}

export const level44: LevelDefinition = {
  number: 44,
  title: "Mirror",
  mount({ screen, complete, listen, timeout, audio, goToMenu }) {
    screen.className = "level-screen level-44";
    screen.innerHTML = `
      <div class="level-44__world" data-level-44-world>
        <div class="level-44__teal-panel" aria-hidden="true"></div>
        <i class="level-44__line level-44__line--one" aria-hidden="true"></i>
        <i class="level-44__line level-44__line--two" aria-hidden="true"></i>
        <i class="level-44__line level-44__line--three" aria-hidden="true"></i>

        <header class="level-heading level-44__heading" aria-label="Level 44, Mirror">
          <div class="level-heading__number">Level 44</div>
          <h1>Mirror</h1>
        </header>

        <p class="level-44__password-hint" data-level-44-password-hint hidden>miracle</p>

        <div class="level-44__cursor-controls" aria-label="Cursor controls">
          <button class="level-44__cursor-button level-44__cursor-button--one" data-cursor-command="dot" type="button" aria-label="Cursor mode 1">
            <img src="${assetUrl("images/level44a1.png")}" alt="" draggable="false" />
          </button>
          <button class="level-44__cursor-button level-44__cursor-button--four" data-cursor-command="hide-map" type="button" aria-label="Cursor mode 4">
            <img src="${assetUrl("images/level44a4.png")}" alt="" draggable="false" />
          </button>
          <button class="level-44__cursor-button level-44__cursor-button--seven" data-cursor-command="restore" type="button" aria-label="Cursor mode 7">
            <img src="${assetUrl("images/level44a7.png")}" alt="" draggable="false" />
          </button>
        </div>

        <img class="level-44__cursor-map" data-level-44-cursor-map
          src="${assetUrl("cursor/level44a.png")}" alt="" draggable="false" hidden />

        <button class="level-44__rainbow-button" type="button" aria-label="Rainbow image button">
          <img src="${assetUrl("images/level44a.png")}" alt="" draggable="false" />
        </button>

        <form class="level-44__form" autocomplete="off">
          <input class="nelg-password-input" id="level-44-answer" name="nelg-level-forty-four-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="12" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" aria-label="Password" spellcheck="false" />
          <button type="submit">GO</button>
        </form>

        <section class="level-44__mirrors" aria-label="44 draggable mirrors">
          ${renderMirrors()}
        </section>
      </div>

      <div class="level-09__context-menu level-44__context-menu" role="menu" aria-label="Flash player menu" hidden>
        <button type="button" role="menuitemcheckbox" data-menu-command="music"></button>
        <button type="button" role="menuitemcheckbox" data-menu-command="effects"></button>
        <button type="button" role="menuitem" data-menu-command="music-volume" aria-haspopup="menu"></button>
        <button type="button" role="menuitem" data-menu-command="effects-volume" aria-haspopup="menu"></button>
        <div class="level-09__volume-menu" role="menu" aria-label="Volume" hidden>
          ${Array.from(
            { length: 11 },
            (_, index) => `<button type="button" role="menuitemradio" data-volume="${index * 10}"></button>`,
          ).join("")}
        </div>
        <div class="level-09__menu-separator" role="separator"></div>
        <button type="button" role="menuitem" data-menu-command="zoom-in">Zoom In</button>
        <button type="button" role="menuitem" data-menu-command="zoom-out">Zoom Out</button>
        <button type="button" role="menuitem" data-menu-command="show-all">Show All</button>
        <div class="level-09__menu-separator" role="separator"></div>
        <button type="button" role="menuitem" data-menu-command="forward">Forward</button>
        <button type="button" role="menuitem" data-menu-command="back">Back</button>
        <button type="button" role="menuitem" data-menu-command="rewind">Rewind</button>
        <div class="level-09__menu-separator" role="separator"></div>
        <div class="level-09__player-label">Never Ending Level Game ++</div>
      </div>
    `;

    const world = screen.querySelector<HTMLElement>("[data-level-44-world]");
    const form = screen.querySelector<HTMLFormElement>(".level-44__form");
    const input = screen.querySelector<HTMLInputElement>("#level-44-answer");
    const rainbowButton = screen.querySelector<HTMLButtonElement>(".level-44__rainbow-button");
    const cursorMap = screen.querySelector<HTMLImageElement>("[data-level-44-cursor-map]");
    const passwordHint = screen.querySelector<HTMLElement>("[data-level-44-password-hint]");
    const menu = screen.querySelector<HTMLElement>(".level-44__context-menu");
    const volumeMenu = menu?.querySelector<HTMLElement>(".level-09__volume-menu");
    const musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    const musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']");
    const effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']");
    if (!world || !form || !input || !rainbowButton || !cursorMap || !passwordHint
      || !menu || !volumeMenu
      || !musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem) return;

    screen.dataset.customCursorRoot = "";
    const customCursor = document.createElement("span");
    customCursor.className = "custom-cursor custom-cursor--top-left level-44__custom-cursor";
    customCursor.hidden = true;
    customCursor.setAttribute("aria-hidden", "true");
    customCursor.innerHTML = `
      <img src="${assetUrl("cursor/level44a.png")}" alt="" draggable="false" />
      <i hidden></i>`;
    screen.append(customCursor);
    const customCursorImage = customCursor.querySelector<HTMLImageElement>("img")!;
    const customCursorDot = customCursor.querySelector<HTMLElement>("i")!;

    let zoom = MIN_ZOOM;
    let panX = 0;
    let panY = 0;
    let activeVolumeKind: "music" | "effects" = "music";
    let cursorMode: "image" | "dot" = "image";
    let mazePixels: MazePixelMap | undefined;
    let mazeActive = false;
    let mazeSolved = false;
    let previousMazePoint: LocalPoint | undefined;
    let mirrorDrag:
      | {
          readonly element: HTMLElement;
          readonly pointerId: number;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly elementX: number;
          readonly elementY: number;
        }
      | undefined;
    let drag:
      | {
          readonly pointerId: number;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly panX: number;
          readonly panY: number;
        }
      | undefined;

    const setCursorMode = (mode: "image" | "dot") => {
      cursorMode = mode;
      customCursor.classList.toggle("custom-cursor--top-left", mode === "image");
      customCursor.classList.toggle("custom-cursor--center", mode === "dot");
      customCursorImage.hidden = mode !== "image";
      customCursorDot.hidden = mode !== "dot";
      previousMazePoint = undefined;
      if (mode !== "dot") {
        mazeActive = false;
      }
    };

    const revealMazeSolution = () => {
      if (mazeSolved) return;
      mazeSolved = true;
      mazeActive = false;
      cursorMap.src = assetUrl("cursor/level44b.png");
      cursorMap.classList.add("is-solved");
      passwordHint.hidden = false;
    };

    const loadMazePixels = () => {
      const solution = new Image();
      solution.addEventListener("load", () => {
        const canvas = document.createElement("canvas");
        canvas.width = solution.naturalWidth;
        canvas.height = solution.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(solution, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const yellow = new Uint8Array(canvas.width * canvas.height);
        for (let index = 0; index < yellow.length; index += 1) {
          const offset = index * 4;
          if (pixels[offset]! > 220 && pixels[offset + 1]! > 180
            && pixels[offset + 2]! < 80 && pixels[offset + 3]! > 0) yellow[index] = 1;
        }
        const path = yellow.slice();
        const radius = 6;
        for (let y = 0; y < canvas.height; y += 1) {
          for (let x = 0; x < canvas.width; x += 1) {
            if (!yellow[y * canvas.width + x]) continue;
            for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
              const targetY = y + offsetY;
              if (targetY < 0 || targetY >= canvas.height) continue;
              for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
                const targetX = x + offsetX;
                if (targetX < 0 || targetX >= canvas.width) continue;
                path[targetY * canvas.width + targetX] = 1;
              }
            }
          }
        }
        mazePixels = { width: canvas.width, height: canvas.height, path, yellow };
      });
      solution.src = assetUrl("cursor/level44b.png");
    };

    const sampleMaze = (point: LocalPoint) => {
      if (!mazePixels || cursorMap.hidden || cursorMap.offsetWidth === 0 || cursorMap.offsetHeight === 0) return undefined;
      const normalizedX = (point.x - cursorMap.offsetLeft) / cursorMap.offsetWidth;
      const normalizedY = (point.y - cursorMap.offsetTop) / cursorMap.offsetHeight;
      if (normalizedX < 0 || normalizedX >= 1 || normalizedY < 0 || normalizedY >= 1) return undefined;
      const x = Math.min(mazePixels.width - 1, Math.floor(normalizedX * mazePixels.width));
      const y = Math.min(mazePixels.height - 1, Math.floor(normalizedY * mazePixels.height));
      const index = y * mazePixels.width + x;
      return {
        safe: mazePixels.path[index] === 1,
        start: mazePixels.path[index] === 1 && x >= 420 && y >= 410 && y <= 480,
        finish: mazePixels.path[index] === 1 && x <= 100 && y >= 610,
      };
    };

    const resetMazeAttempt = () => {
      mazeActive = false;
      cursorMap.classList.remove("is-resetting");
      void cursorMap.offsetWidth;
      cursorMap.classList.add("is-resetting");
    };

    const updateMaze = (screenPoint: LocalPoint) => {
      if (cursorMode !== "dot" || mazeSolved || cursorMap.hidden || !mazePixels) return;
      const point = {
        x: (screenPoint.x - panX) / zoom,
        y: (screenPoint.y - panY) / zoom,
      };
      const sample = sampleMaze(point);
      if (!mazeActive) {
        if (sample?.start) mazeActive = true;
        previousMazePoint = point;
        return;
      }

      const previous = previousMazePoint ?? point;
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      const steps = Math.max(1, Math.ceil(distance * 5));
      for (let step = 1; step <= steps; step += 1) {
        const ratio = step / steps;
        const current = sampleMaze({
          x: previous.x + (point.x - previous.x) * ratio,
          y: previous.y + (point.y - previous.y) * ratio,
        });
        if (!current?.safe) {
          resetMazeAttempt();
          previousMazePoint = point;
          return;
        }
        if (current.finish) {
          revealMazeSolution();
          previousMazePoint = point;
          return;
        }
      }
      previousMazePoint = point;
    };

    const clampPan = () => {
      panX = Math.max(800 - 800 * zoom, Math.min(0, panX));
      panY = Math.max(600 - 600 * zoom, Math.min(0, panY));
    };

    const renderWorldTransform = () => {
      clampPan();
      world.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
      screen.classList.toggle("is-zoomed", zoom > MIN_ZOOM);
      world.setAttribute("aria-label", `Zoomed canvas at ${Math.round(zoom * 100)} percent`);
    };

    const setZoom = (nextZoom: number) => {
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
      if (clampedZoom === zoom) return;
      const centerX = 400;
      const centerY = 300;
      const worldCenterX = (centerX - panX) / zoom;
      const worldCenterY = (centerY - panY) / zoom;
      zoom = clampedZoom;
      panX = centerX - worldCenterX * zoom;
      panY = centerY - worldCenterY * zoom;
      renderWorldTransform();
    };

    const updateSettings = () => {
      musicItem.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
      effectsItem.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
      musicVolumeItem.textContent = `   Music Volume: ${audio.musicVolume}%  ▶`;
      effectsVolumeItem.textContent = `   SFX Volume: ${audio.effectsVolume}%  ▶`;
      musicItem.setAttribute("aria-checked", String(audio.musicEnabled));
      effectsItem.setAttribute("aria-checked", String(audio.effectsEnabled));
      volumeMenu.querySelectorAll<HTMLButtonElement>("[data-volume]").forEach((item) => {
        const itemVolume = Number(item.dataset.volume);
        const selectedVolume = activeVolumeKind === "music" ? audio.musicVolume : audio.effectsVolume;
        const selected = itemVolume === selectedVolume;
        item.textContent = `${selected ? "✓" : ""}  ${itemVolume}%`;
        item.setAttribute("aria-checked", String(selected));
      });
      menu.querySelector<HTMLButtonElement>("[data-menu-command='zoom-in']")!.disabled = zoom >= MAX_ZOOM;
      menu.querySelector<HTMLButtonElement>("[data-menu-command='zoom-out']")!.disabled = zoom <= MIN_ZOOM;
    };

    const closeMenu = () => {
      menu.hidden = true;
      volumeMenu.hidden = true;
    };

    const positionVolumeMenu = (kind: "music" | "effects") => {
      activeVolumeKind = kind;
      volumeMenu.setAttribute("aria-label", kind === "music" ? "Music volume" : "SFX volume");
      updateSettings();
      volumeMenu.hidden = false;
      const menuBounds = localElementBounds(screen, menu);
      const submenuBounds = localElementBounds(screen, volumeMenu);
      const activeItem = kind === "music" ? musicVolumeItem : effectsVolumeItem;
      const maximumTop = screen.clientHeight - menuBounds.top - submenuBounds.height - 4;
      volumeMenu.style.top = `${Math.max(-menuBounds.top + 4, Math.min(activeItem.offsetTop, maximumTop))}px`;
      volumeMenu.classList.toggle(
        "opens-left",
        menuBounds.left + menuBounds.width + submenuBounds.width > screen.clientWidth - 4,
      );
    };

    renderWorldTransform();
    updateSettings();
    loadMazePixels();

    const moveCustomCursor = (event: PointerEvent) => {
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      customCursor.style.left = `${point.x}px`;
      customCursor.style.top = `${point.y}px`;
      customCursor.hidden = false;
      updateMaze(point);
    };
    listen(screen, "pointerenter", moveCustomCursor);
    listen(screen, "pointermove", moveCustomCursor);
    listen(screen, "pointerleave", () => {
      customCursor.hidden = true;
      previousMazePoint = undefined;
    });

    listen(screen, "contextmenu", (event) => {
      event.preventDefault();
      updateSettings();
      volumeMenu.hidden = true;
      menu.hidden = false;
      positionFloatingElement(screen, menu, event.clientX, event.clientY);
    });

    listen(menu, "click", (event) => {
      const volumeOption = (event.target as Element).closest<HTMLButtonElement>("button[data-volume]");
      if (volumeOption && volumeMenu.contains(volumeOption)) {
        const volume = Number(volumeOption.dataset.volume);
        if (activeVolumeKind === "music") audio.setMusicVolume(volume);
        else audio.setEffectsVolume(volume);
        updateSettings();
        volumeMenu.hidden = true;
        return;
      }

      const item = (event.target as Element).closest<HTMLButtonElement>("button[data-menu-command]");
      if (!item || !menu.contains(item) || item.disabled) return;
      switch (item.dataset.menuCommand) {
        case "music":
          audio.setMusicEnabled(!audio.musicEnabled);
          updateSettings();
          return;
        case "effects":
          audio.setEffectsEnabled(!audio.effectsEnabled);
          updateSettings();
          return;
        case "music-volume":
          if (volumeMenu.hidden || activeVolumeKind !== "music") positionVolumeMenu("music");
          else volumeMenu.hidden = true;
          return;
        case "effects-volume":
          if (volumeMenu.hidden || activeVolumeKind !== "effects") positionVolumeMenu("effects");
          else volumeMenu.hidden = true;
          return;
        case "zoom-in":
          setZoom(zoom + ZOOM_STEP);
          closeMenu();
          return;
        case "zoom-out":
          setZoom(zoom - ZOOM_STEP);
          closeMenu();
          return;
        case "show-all":
          zoom = MIN_ZOOM;
          panX = 0;
          panY = 0;
          renderWorldTransform();
          closeMenu();
          return;
        case "forward":
        case "back":
          closeMenu();
          return;
        case "rewind":
          goToMenu();
          return;
      }
    });

    listen(screen, "pointerdown", (event) => {
      if (event.button !== 0) return;
      const target = event.target as Element;
      const mirror = target.closest<HTMLElement>("[data-mirror]");
      const grip = target.closest<HTMLElement>("[data-mirror-grip]");
      if (mirror && grip && !mirror.classList.contains("is-broken")) {
        const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
        mirrorDrag = {
          element: mirror,
          pointerId: event.pointerId,
          pointerX: pointer.x,
          pointerY: pointer.y,
          elementX: mirror.offsetLeft,
          elementY: mirror.offsetTop,
        };
        mirror.setPointerCapture(event.pointerId);
        mirror.classList.add("is-dragging");
        event.preventDefault();
        return;
      }
      if (zoom <= MIN_ZOOM) return;
      if (target.closest("button, input, form, .level-44__context-menu")) return;
      const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
      drag = {
        pointerId: event.pointerId,
        pointerX: pointer.x,
        pointerY: pointer.y,
        panX,
        panY,
      };
      screen.setPointerCapture(event.pointerId);
      screen.classList.add("is-panning");
      event.preventDefault();
    });

    listen(screen, "pointermove", (event) => {
      if (mirrorDrag && mirrorDrag.pointerId === event.pointerId) {
        const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
        const x = mirrorDrag.elementX + (pointer.x - mirrorDrag.pointerX) / zoom;
        const y = mirrorDrag.elementY + (pointer.y - mirrorDrag.pointerY) / zoom;
        mirrorDrag.element.style.left = `${Math.max(-mirrorDrag.element.offsetWidth, Math.min(800, x))}px`;
        mirrorDrag.element.style.top = `${Math.max(-mirrorDrag.element.offsetHeight, Math.min(600, y))}px`;
        event.preventDefault();
        return;
      }
      if (!drag || drag.pointerId !== event.pointerId) return;
      const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
      panX = drag.panX + pointer.x - drag.pointerX;
      panY = drag.panY + pointer.y - drag.pointerY;
      renderWorldTransform();
      event.preventDefault();
    });

    const finishPan = (event: PointerEvent) => {
      if (mirrorDrag?.pointerId === event.pointerId) {
        const mirror = mirrorDrag.element;
        if (mirror.hasPointerCapture(event.pointerId)) {
          mirror.releasePointerCapture(event.pointerId);
        }
        mirror.classList.remove("is-dragging");
        mirrorDrag = undefined;
      }
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (screen.hasPointerCapture(event.pointerId)) screen.releasePointerCapture(event.pointerId);
      drag = undefined;
      screen.classList.remove("is-panning");
    };
    listen(screen, "pointerup", finishPan);
    listen(screen, "pointercancel", finishPan);

    listen(screen, "click", (event) => {
      const target = event.target as Element;
      const face = target.closest<HTMLButtonElement>("[data-mirror-face]");
      const mirror = face?.closest<HTMLElement>("[data-mirror]");
      if (face && mirror && !mirror.classList.contains("is-broken")) {
        audio.playEffect(SOUND_EFFECTS.break);
        mirror.classList.add("is-broken");
        face.disabled = true;
        face.setAttribute("aria-label", "Broken mirror");
        return;
      }

      const cursorCommand = target.closest<HTMLButtonElement>("[data-cursor-command]")?.dataset.cursorCommand;
      if (cursorCommand === "dot") {
        setCursorMode("dot");
        cursorMap.hidden = false;
        if (!mazeSolved) cursorMap.src = assetUrl("cursor/level44a.png");
        mazeActive = false;
        return;
      }
      if (cursorCommand === "hide-map") {
        cursorMap.hidden = true;
        mazeActive = false;
        previousMazePoint = undefined;
        return;
      }
      if (cursorCommand === "restore") {
        setCursorMode("image");
        return;
      }

      if (target.closest(".level-44__rainbow-button")) {
        if (maskedInput.getValue().toLowerCase() === ANSWER) {
          rainbowButton.disabled = true;
          complete();
          return;
        }
        maskedInput.clear();
        input.classList.add("is-wrong");
        input.focus();
        timeout(() => input.classList.remove("is-wrong"), 360);
      }
    });

    const maskedInput = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
    });

    listen(document, "pointerdown", (event) => {
      if (!menu.hidden && !menu.contains(event.target as Node)) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    return () => {
      customCursor.remove();
      delete screen.dataset.customCursorRoot;
    };
  },
};
