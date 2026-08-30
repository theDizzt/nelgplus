import { assetUrl } from "../core/assets";
import { localElementBounds, positionFloatingElement } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const CORRUPTED_MAIN_FLAG = "level50-revival-main";

export const level50: LevelDefinition = {
  number: 50,
  title: "Revival",
  scenes: [{ id: "intro", label: "Intro" }],
  mount({ screen, audio, listen, goToMenu, session }) {
    screen.className = "level-screen level-50";
    screen.innerHTML = `
      <header class="level-heading level-50__heading" aria-label="Level 50, Revival">
        <div class="level-heading__number">Level 50</div>
        <h1>Revival</h1>
      </header>

      <img class="level-50__steve" src="${assetUrl("images/Steve.gif")}" alt="Steve emerging from the darkness" draggable="false" />

      <div class="level-09__context-menu level-50__context-menu" role="menu" aria-label="Flash player menu" hidden>
        <button type="button" role="menuitemcheckbox" data-menu-command="music"></button>
        <button type="button" role="menuitemcheckbox" data-menu-command="effects"></button>
        <button type="button" role="menuitem" data-menu-command="music-volume" aria-haspopup="menu"></button>
        <button type="button" role="menuitem" data-menu-command="effects-volume" aria-haspopup="menu"></button>
        <div class="level-09__volume-menu" role="menu" aria-label="Volume" hidden>
          ${Array.from({ length: 11 }, (_, index) => `
            <button type="button" role="menuitemradio" data-volume="${index * 10}"></button>
          `).join("")}
        </div>
        <div class="level-09__menu-separator" role="separator"></div>
        <button type="button" role="menuitem" data-menu-command="forward">Forward</button>
        <button type="button" role="menuitem" data-menu-command="back">Back</button>
        <button type="button" role="menuitem" data-menu-command="rewind">Rewind</button>
        <div class="level-09__menu-separator" role="separator"></div>
        <div class="level-09__player-label">Never Ending Level Game ++</div>
      </div>
    `;

    const menu = screen.querySelector<HTMLElement>(".level-50__context-menu");
    const volumeMenu = menu?.querySelector<HTMLElement>(".level-09__volume-menu");
    const musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    const musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']");
    const effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']");
    if (!menu || !volumeMenu || !musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem) return;

    void audio.playMusic("music/level50.mp3", false);
    let activeVolumeKind: "music" | "effects" = "music";

    const updateSettings = () => {
      musicItem.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
      effectsItem.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
      musicVolumeItem.textContent = `   Music Volume: ${audio.musicVolume}%  ▶`;
      effectsVolumeItem.textContent = `   SFX Volume: ${audio.effectsVolume}%  ▶`;
      musicItem.setAttribute("aria-checked", String(audio.musicEnabled));
      effectsItem.setAttribute("aria-checked", String(audio.effectsEnabled));
      volumeMenu.querySelectorAll<HTMLButtonElement>("[data-volume]").forEach((item) => {
        const selected = activeVolumeKind === "music" ? audio.musicVolume : audio.effectsVolume;
        const itemVolume = Number(item.dataset.volume);
        item.textContent = `${itemVolume === selected ? "✓" : ""}  ${itemVolume}%`;
        item.setAttribute("aria-checked", String(itemVolume === selected));
      });
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
      if (!item) return;
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
        case "rewind":
          session.setFlag(CORRUPTED_MAIN_FLAG);
          goToMenu();
          return;
        case "forward":
        case "back":
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
