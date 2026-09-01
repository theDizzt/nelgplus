import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { SOUND_EFFECTS, assetUrl } from "../core/assets";
import { clientPointToLocal, localElementBounds, positionFloatingElement } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const ANSWER = "totally hidden";
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export const level37: LevelDefinition = {
  number: 37,
  title: "Zoom",
  scenes: [
    { id: "scene-1", label: "Scene 1 - Blockhead" },
    { id: "scene-2", label: "Scene 2 - Hidden cursor" },
  ],
  mount({ screen, initialScene, complete, wrongAnswer, listen, timeout, audio, goToMenu }) {
    screen.className = "level-screen level-37";
    screen.innerHTML = `
      <div class="level-37__world" data-level-37-world>
        <section class="level-37__scene level-37__scene--one" data-level-37-scene="scene-1">
          <header class="level-heading level-37__heading" aria-label="Level 37, Zoom">
            <div class="level-heading__number">Level 37</div>
            <h1>Zoom</h1>
          </header>

          <p class="level-37__message">This level is so easy even a blockhead could beat it</p>
          <span class="level-37__hidden-message">argentumb must cheat</span>

          <div class="level-37__shapes" aria-label="Tiny hidden shapes">
            <button class="level-37__shape level-37__shape--square" type="button" aria-label="Tiny square"></button>
            <button class="level-37__shape level-37__shape--circle" type="button" aria-label="Tiny circle"></button>
            <button class="level-37__shape level-37__shape--triangle" type="button" aria-label="Tiny triangle"></button>
            <button class="level-37__shape level-37__shape--diamond" type="button" aria-label="Tiny diamond"></button>
            <button class="level-37__shape level-37__shape--star" type="button" aria-label="Tiny star"></button>
            <button class="level-37__shape level-37__shape--hexagon" type="button" aria-label="Tiny hexagon"></button>
          </div>

          <form class="level-37__form" autocomplete="off">
            <input class="nelg-password-input" id="level-37-answer" name="nelg-level-thirty-seven-answer"
              data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
              type="text" maxlength="32" autocomplete="off" autocapitalize="off"
              aria-autocomplete="none" aria-label="Password" spellcheck="false" />
            <button type="submit">GO</button>
          </form>
        </section>

        <section class="level-37__scene level-37__scene--two" data-level-37-scene="scene-2" hidden>
          <header class="level-heading level-37__heading" aria-label="Level 37, Zoom">
            <div class="level-heading__number">Level 37</div>
            <h1>Zoom</h1>
          </header>
          <p class="level-37__fair-message">Keep it fair, keep it right.</p>
        </section>
      </div>

      <div class="level-09__context-menu level-37__context-menu" role="menu" aria-label="Flash player menu" hidden>
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

    const world = screen.querySelector<HTMLElement>("[data-level-37-world]");
    const scenes = Array.from(screen.querySelectorAll<HTMLElement>("[data-level-37-scene]"));
    const form = screen.querySelector<HTMLFormElement>(".level-37__form");
    const input = screen.querySelector<HTMLInputElement>("#level-37-answer");
    const submitButton = form?.querySelector<HTMLButtonElement>("button");
    const menu = screen.querySelector<HTMLElement>(".level-37__context-menu");
    const volumeMenu = menu?.querySelector<HTMLElement>(".level-09__volume-menu");
    const musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    const musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']");
    const effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']");
    if (!world || !form || !input || !submitButton || !menu || !volumeMenu
      || !musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem) return;

    screen.dataset.customCursorRoot = "";
    const customCursor = document.createElement("span");
    customCursor.className = "custom-cursor level-37__custom-cursor";
    customCursor.hidden = true;
    customCursor.setAttribute("aria-hidden", "true");
    customCursor.innerHTML = `
      <img src="${assetUrl("cursor/level37.png")}" alt="" draggable="false" />
      <span>The password is\ntotally hidden</span>`;
    screen.append(customCursor);

    let activeScene: "scene-1" | "scene-2" = initialScene === "scene-2" ? "scene-2" : "scene-1";
    let activeVolumeKind: "music" | "effects" = "music";
    let zoom = MIN_ZOOM;
    let panX = 0;
    let panY = 0;
    let checking = false;
    let drag:
      | {
          readonly pointerId: number;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly panX: number;
          readonly panY: number;
        }
      | undefined;

    const clampPan = () => {
      panX = Math.max(800 - 800 * zoom, Math.min(0, panX));
      panY = Math.max(600 - 600 * zoom, Math.min(0, panY));
    };

    const renderWorldTransform = () => {
      clampPan();
      world.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
      customCursor.style.setProperty("--level-37-cursor-zoom", String(activeScene === "scene-2" ? zoom : 1));
      screen.classList.toggle("is-zoomed", zoom > MIN_ZOOM);
    };

    const setZoom = (nextZoom: number) => {
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
      if (clampedZoom === zoom) return;
      const worldCenterX = (400 - panX) / zoom;
      const worldCenterY = (300 - panY) / zoom;
      zoom = clampedZoom;
      panX = 400 - worldCenterX * zoom;
      panY = 300 - worldCenterY * zoom;
      renderWorldTransform();
    };

    const showScene = (sceneId: "scene-1" | "scene-2") => {
      activeScene = sceneId;
      scenes.forEach((scene) => {
        scene.hidden = scene.getAttribute("data-level-37-scene") !== sceneId;
      });
      screen.classList.toggle("level-37--scene-two", sceneId === "scene-2");
      zoom = MIN_ZOOM;
      panX = 0;
      panY = 0;
      renderWorldTransform();
      menu.hidden = true;
      volumeMenu.hidden = true;
      if (sceneId === "scene-1") input.focus();
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
        item.textContent = `${itemVolume === selectedVolume ? "✓" : ""}  ${itemVolume}%`;
        item.setAttribute("aria-checked", String(itemVolume === selectedVolume));
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

    const moveCustomCursor = (event: PointerEvent) => {
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      customCursor.style.left = `${point.x}px`;
      customCursor.style.top = `${point.y}px`;
      customCursor.hidden = false;
    };
    listen(screen, "pointerenter", moveCustomCursor);
    listen(screen, "pointermove", moveCustomCursor);
    listen(screen, "pointerleave", () => {
      customCursor.hidden = true;
    });

    const openMenu = (event: MouseEvent | PointerEvent) => {
      event.preventDefault();
      updateSettings();
      volumeMenu.hidden = true;
      menu.hidden = false;
      positionFloatingElement(screen, menu, event.clientX, event.clientY);
    };
    listen(screen, "pointerdown", (event) => {
      if (event.button === 2) openMenu(event);
    });
    listen(screen, "contextmenu", openMenu);

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
        case "music": audio.setMusicEnabled(!audio.musicEnabled); updateSettings(); return;
        case "effects": audio.setEffectsEnabled(!audio.effectsEnabled); updateSettings(); return;
        case "music-volume": positionVolumeMenu("music"); return;
        case "effects-volume": positionVolumeMenu("effects"); return;
        case "zoom-in": setZoom(zoom + ZOOM_STEP); closeMenu(); return;
        case "zoom-out": setZoom(zoom - ZOOM_STEP); closeMenu(); return;
        case "show-all": zoom = MIN_ZOOM; panX = 0; panY = 0; renderWorldTransform(); closeMenu(); return;
        case "forward":
        case "back": showScene(activeScene === "scene-1" ? "scene-2" : "scene-1"); return;
        case "rewind": goToMenu(); return;
      }
    });

    listen(screen, "pointerdown", (event) => {
      if (event.button !== 0 || zoom <= MIN_ZOOM) return;
      const target = event.target as Element;
      if (target.closest("button, input, form, .level-37__context-menu")) return;
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
      if (!drag || drag.pointerId !== event.pointerId) return;
      const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
      panX = drag.panX + pointer.x - drag.pointerX;
      panY = drag.panY + pointer.y - drag.pointerY;
      renderWorldTransform();
      event.preventDefault();
    });

    const finishPan = (event: PointerEvent) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (screen.hasPointerCapture(event.pointerId)) screen.releasePointerCapture(event.pointerId);
      drag = undefined;
      screen.classList.remove("is-panning");
    };
    listen(screen, "pointerup", finishPan);
    listen(screen, "pointercancel", finishPan);

    const maskedInput = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (checking || activeScene !== "scene-1") return;
      checking = true;
      submitButton.disabled = true;
      if (maskedInput.getValue().trim().toLowerCase() === ANSWER) {
        complete();
        return;
      }
      if (wrongAnswer()) return;
      checking = false;
      submitButton.disabled = false;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });

    listen(screen, "click", (event) => {
      if ((event.target as Element).closest(".level-37__shape")) audio.playEffect(SOUND_EFFECTS.pop);
    });
    listen(document, "pointerdown", (event) => {
      if (!menu.hidden && !menu.contains(event.target as Node)) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    showScene(activeScene);
    updateSettings();

    return () => {
      customCursor.remove();
      delete screen.dataset.customCursorRoot;
    };
  },
};
