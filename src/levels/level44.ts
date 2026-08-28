import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import { clientPointToLocal, localElementBounds, positionFloatingElement } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const ANSWER = "miracle";
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

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
    const submitButton = form?.querySelector<HTMLButtonElement>("button");
    const menu = screen.querySelector<HTMLElement>(".level-44__context-menu");
    const volumeMenu = menu?.querySelector<HTMLElement>(".level-09__volume-menu");
    const musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    const musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']");
    const effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']");
    if (!world || !form || !input || !submitButton || !menu || !volumeMenu
      || !musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem) return;

    let zoom = MIN_ZOOM;
    let panX = 0;
    let panY = 0;
    let activeVolumeKind: "music" | "effects" = "music";
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
      if (event.button !== 0 || zoom <= MIN_ZOOM) return;
      const target = event.target as Element;
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
      if (maskedInput.getValue() === ANSWER) {
        submitButton.disabled = true;
        complete();
        return;
      }
      maskedInput.clear();
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });

    listen(document, "pointerdown", (event) => {
      if (!menu.hidden && !menu.contains(event.target as Node)) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  },
};
