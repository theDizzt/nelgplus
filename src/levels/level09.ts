import type { LevelDefinition } from "../core/types";

export const level09: LevelDefinition = {
  number: 9,
  title: "Menu",
  mount({ screen, complete, goToLevel, goToMenu, audio, listen }) {
    screen.className = "level-screen level-09";
    screen.innerHTML = `
      <header class="level-heading level-09__heading">
        <div class="level-heading__number">Level 9</div>
        <h1>Menu</h1>
      </header>

      <p class="level-09__message">You can use the menu by right-clicking.</p>

      <div class="level-09__context-menu" role="menu" aria-label="Flash player menu" hidden>
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
        <button type="button" role="menuitem" data-menu-command="rewind">Rewind</button>
        <div class="level-09__menu-separator" role="separator"></div>
        <div class="level-09__player-label">Never Ending Level Game ++</div>
      </div>
    `;

    const menu = screen.querySelector<HTMLElement>(".level-09__context-menu");
    if (!menu) return;

    const musicItem = menu.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    const musicVolumeItem = menu.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']");
    const effectsVolumeItem = menu.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']");
    const volumeMenu = menu.querySelector<HTMLElement>(".level-09__volume-menu");
    if (!musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem || !volumeMenu) return;

    let activeVolumeKind: "music" | "effects" = "music";

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
        const isSelected = itemVolume === selectedVolume;
        item.textContent = `${isSelected ? "✓" : ""}  ${itemVolume}%`;
        item.setAttribute("aria-checked", String(isSelected));
      });
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
      const screenBounds = screen.getBoundingClientRect();
      const menuBounds = menu.getBoundingClientRect();
      const submenuBounds = volumeMenu.getBoundingClientRect();
      const menuLeft = menuBounds.left - screenBounds.left;
      const menuTop = menuBounds.top - screenBounds.top;
      const activeItem = kind === "music" ? musicVolumeItem : effectsVolumeItem;
      const preferredTop = activeItem.offsetTop;
      const maximumTop = screenBounds.height - menuTop - submenuBounds.height - 4;
      volumeMenu.style.top = `${Math.max(-menuTop + 4, Math.min(preferredTop, maximumTop))}px`;
      volumeMenu.classList.toggle(
        "opens-left",
        menuLeft + menuBounds.width + submenuBounds.width > screenBounds.width - 4,
      );
    };

    updateSettings();

    listen(screen, "contextmenu", (event) => {
      event.preventDefault();
      updateSettings();
      volumeMenu.hidden = true;
      menu.hidden = false;

      const screenBounds = screen.getBoundingClientRect();
      const menuBounds = menu.getBoundingClientRect();
      const requestedX = event.clientX - screenBounds.left;
      const requestedY = event.clientY - screenBounds.top;
      menu.style.left = `${Math.max(4, Math.min(requestedX, screenBounds.width - menuBounds.width - 4))}px`;
      menu.style.top = `${Math.max(4, Math.min(requestedY, screenBounds.height - menuBounds.height - 4))}px`;
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
        case "forward":
          complete();
          return;
        case "back":
          goToLevel(8);
          return;
        case "rewind":
          goToMenu();
          return;
      }
    });

    listen(document, "pointerdown", (event) => {
      if (!menu.hidden && !menu.contains(event.target as Node)) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  },
};
