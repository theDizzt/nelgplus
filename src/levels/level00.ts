import { localElementBounds, positionFloatingElement } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

function menuMarkup(): string {
  return `
    <div class="level-09__context-menu level-00__context-menu" role="menu" aria-label="Flash player menu" hidden>
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
      <button type="button" role="menuitem" data-menu-command="forward">Forward</button>
      <button type="button" role="menuitem" data-menu-command="back">Back</button>
      <button type="button" role="menuitem">Rewind</button>
      <div class="level-09__menu-separator" role="separator"></div>
      <div class="level-09__player-label">Never Ending Level Game ++</div>
    </div>
  `;
}

export const level00: LevelDefinition = {
  number: 0,
  title: "Origin",
  mount({ screen, listen, goToLevel, audio }) {
    let activeVolumeKind: "music" | "effects" = "music";
    let activeButton: HTMLButtonElement | undefined;
    let menu: HTMLElement | undefined;
    let volumeMenu: HTMLElement | undefined;
    let musicItem: HTMLButtonElement | undefined;
    let effectsItem: HTMLButtonElement | undefined;
    let musicVolumeItem: HTMLButtonElement | undefined;
    let effectsVolumeItem: HTMLButtonElement | undefined;

    const updateSettings = () => {
      if (!musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem || !volumeMenu) return;
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
    };

    const closeMenu = () => {
      if (!menu || !volumeMenu) return;
      menu.hidden = true;
      volumeMenu.hidden = true;
    };
    const positionVolumeMenu = (kind: "music" | "effects") => {
      if (!menu || !volumeMenu || !musicVolumeItem || !effectsVolumeItem) return;
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
    const openMenu = (event: MouseEvent | PointerEvent) => {
      if (!menu || !volumeMenu) return;
      event.preventDefault();
      updateSettings();
      volumeMenu.hidden = true;
      menu.hidden = false;
      positionFloatingElement(screen, menu, event.clientX, event.clientY);
    };

    const bindScreen = (negativeZero = false) => {
      screen.className = `level-screen level-00${negativeZero ? " level-00--negative-zero" : ""}`;
      screen.innerHTML = negativeZero
        ? `
          <header class="level-heading level-00__heading level-00__heading--negative">
            <div class="level-heading__number">Level -0</div>
            <h1>???</h1>
          </header>
          <button class="level-00__go-back" type="button">GO BACK</button>
          <button class="level-00__red-button" type="button" aria-label="Return to Level 0"></button>
          <p class="level-00__button-copy">Ok, this is button for you :)</p>
        `
        : `
          <header class="level-heading level-00__heading">
            <div class="level-heading__number">Level 0</div>
            <h1>Origin</h1>
          </header>
          <button class="level-00__origin-button" type="button" aria-label="Return to Level 1"></button>
          ${menuMarkup()}
        `;

      activeButton = screen.querySelector<HTMLButtonElement>(
        negativeZero ? ".level-00__go-back, .level-00__red-button" : ".level-00__origin-button",
      ) ?? undefined;
      menu = screen.querySelector<HTMLElement>(".level-00__context-menu") ?? undefined;
      volumeMenu = menu?.querySelector<HTMLElement>(".level-09__volume-menu") ?? undefined;
      musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']") ?? undefined;
      effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']") ?? undefined;
      musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']") ?? undefined;
      effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']") ?? undefined;

      if (negativeZero) {
        screen.querySelectorAll<HTMLButtonElement>(".level-00__go-back, .level-00__red-button")
          .forEach((button) => listen(button, "click", () => bindScreen(false)));
        return;
      }

      const button = activeButton;
      if (!button || !menu || !volumeMenu || !musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem) return;

      listen(button, "click", () => goToLevel(1));
      listen(button, "pointerdown", (event) => {
        if (event.button === 2) openMenu(event);
      });
      listen(button, "contextmenu", openMenu);
    };

    bindScreen();

    listen(screen, "pointerdown", (event) => {
      if (event.button === 2) openMenu(event);
    });
    listen(screen, "contextmenu", openMenu);
    listen(screen, "click", (event) => {
      if (!menu || !volumeMenu) return;
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
      if (!item || !menu.contains(item)) return;
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
        case "back":
          goToLevel(-1);
          return;
        case "forward":
          closeMenu();
          bindScreen(true);
          return;
      }
    });
    listen(document, "pointerdown", (event) => {
      if (menu && !menu.hidden && !menu.contains(event.target as Node) && event.target !== activeButton) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  },
};
