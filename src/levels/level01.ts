import type { LevelDefinition } from "../core/types";
import { SOUND_EFFECTS } from "../core/assets";
import { localElementBounds, positionFloatingElement } from "../core/floatingPosition";

function menuMarkup(): string {
  return `
    <div class="level-09__context-menu level-01__context-menu" role="menu" aria-label="Flash player menu" hidden>
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

export const level01: LevelDefinition = {
  number: 1,
  title: "Tutorial I",
  mount({ screen, complete, wrongAnswer, listen, audio, session, goToLevel }) {
    const revivalMode = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-01${revivalMode ? " level-01--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 1</div>
        <h1>Tutorial I</h1>
      </header>

      <div class="level-01__instructions">
        <p>Welcome to Level 1 of <em>Never Ending Level Game ++</em>.</p>
        <p>
          This game was designed to closely resemble the original <em>Never Ending Level Game</em>
          and preserve as much of its bizarre atmosphere as possible.
        </p>
        <p>
          The first level teaches you the basic mouse controls. You will use the mouse often in this
          game—to click buttons, touch objects, and perform other actions.
        </p>
        <p>Your task is to click the red button below and proceed to Level 2.</p>
      </div>

      <button class="level-01__continue" type="button" aria-label="Continue to Level 2"></button>
      ${revivalMode ? '<button class="level-01__revival-secret" type="button" aria-label="Hidden revival button"></button>' : ""}
      ${menuMarkup()}
    `;

    const continueButton = screen.querySelector<HTMLButtonElement>(".level-01__continue");
    const secretButton = screen.querySelector<HTMLButtonElement>(".level-01__revival-secret");
    const menu = screen.querySelector<HTMLElement>(".level-01__context-menu");
    const volumeMenu = menu?.querySelector<HTMLElement>(".level-09__volume-menu");
    const musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    const musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']");
    const effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']");
    if (continueButton) {
      listen(continueButton, "click", () => {
        audio.playEffect(SOUND_EFFECTS.smack);
        if (revivalMode) wrongAnswer();
        else complete();
      });
    }
    if (secretButton) {
      listen(secretButton, "click", () => {
        audio.playEffect(SOUND_EFFECTS.smack);
        complete();
      });
    }
    if (menu && volumeMenu && musicItem && effectsItem && musicVolumeItem && effectsVolumeItem) {
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
          const selected = itemVolume === selectedVolume;
          item.textContent = `${selected ? "✓" : ""}  ${itemVolume}%`;
          item.setAttribute("aria-checked", String(selected));
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
            goToLevel(0);
            return;
        }
      });
      listen(document, "pointerdown", (event) => {
        if (!menu.hidden && !menu.contains(event.target as Node)) closeMenu();
      });
      listen(document, "keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });
    }
  },
};
