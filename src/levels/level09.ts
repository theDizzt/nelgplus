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
    if (!musicItem || !effectsItem) return;

    const updateSettings = () => {
      musicItem.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
      effectsItem.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
      musicItem.setAttribute("aria-checked", String(audio.musicEnabled));
      effectsItem.setAttribute("aria-checked", String(audio.effectsEnabled));
    };

    const closeMenu = () => {
      menu.hidden = true;
    };

    updateSettings();

    listen(screen, "contextmenu", (event) => {
      event.preventDefault();
      updateSettings();
      menu.hidden = false;

      const screenBounds = screen.getBoundingClientRect();
      const menuBounds = menu.getBoundingClientRect();
      const requestedX = event.clientX - screenBounds.left;
      const requestedY = event.clientY - screenBounds.top;
      menu.style.left = `${Math.max(4, Math.min(requestedX, screenBounds.width - menuBounds.width - 4))}px`;
      menu.style.top = `${Math.max(4, Math.min(requestedY, screenBounds.height - menuBounds.height - 4))}px`;
    });

    listen(menu, "click", (event) => {
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
