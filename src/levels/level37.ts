import { localElementBounds, positionFloatingElement } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const PORTAL_REPAIRED_FLAG = "level-37-portal-repaired";
const REPAIR_PASSWORD = "neddIh";
const REPAIR_DELAY_MS = 60_000;

const STORY = `Oh, crap... The portal to Level 38 is completely destroyed. I don't know which jerk did this, but it looks like it xeeds to be fixed... Let’s stay calm, gather cluxs, and see if we can find something to fix the door. First, we need to finx the right parts to repair the completely shattered door frame anx finish the repairs. Then we’ll have to check if it’s working properly... It’s a huge pain, but please be patient and help me get the door fixed. x’ll do my best to keep troubleshooting, so just give me a little xelp... It’s definitely an easy task.`;

function heading(): string {
  return `<header class="level-heading level-37__heading">
    <div class="level-heading__number">Level 37</div>
    <h1>Repair</h1>
  </header>`;
}

function workshopDecoration(): string {
  return `<div class="level-37__workshop" aria-hidden="true">
    <span class="level-37__wire level-37__wire--a"></span>
    <span class="level-37__wire level-37__wire--b"></span>
    <span class="level-37__wire level-37__wire--c"></span>
    <span class="level-37__wire level-37__wire--d"></span>
    <span class="level-37__scrap level-37__scrap--a"></span>
    <span class="level-37__scrap level-37__scrap--b"></span>
    <span class="level-37__scrap level-37__scrap--c"></span>
    <span class="level-37__scrap level-37__scrap--d"></span>
    <span class="level-37__bolt level-37__bolt--a"></span>
    <span class="level-37__bolt level-37__bolt--b"></span>
    <span class="level-37__bolt level-37__bolt--c"></span>
  </div>`;
}

function brokenPortal(): string {
  return `<div class="level-37__portal level-37__portal--broken" aria-label="Destroyed portal to Level 38">
    <div class="level-37__portal-core"></div>
    <span class="level-37__frame level-37__frame--top"></span>
    <span class="level-37__frame level-37__frame--left"></span>
    <span class="level-37__frame level-37__frame--right"></span>
    <span class="level-37__frame level-37__frame--bottom"></span>
    <span class="level-37__crack level-37__crack--a"></span>
    <span class="level-37__crack level-37__crack--b"></span>
    <div class="level-37__smoke" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </div>
    <span class="level-37__portal-label">PORTAL TO LEVEL 38: BROKEN</span>
  </div>`;
}

function repairedPortal(): string {
  return `<button class="level-37__portal level-37__portal--repaired" type="button" aria-label="Enter the repaired portal to Level 38">
    <span class="level-37__repaired-core"></span>
    <span class="level-37__portal-label">PORTAL TO LEVEL 38: ONLINE</span>
  </button>`;
}

export const level37: LevelDefinition = {
  number: 37,
  title: "Repair",
  mount(context) {
    const { screen, complete, goToMenu, listen, session, timeout } = context;
    screen.className = "level-screen level-37";

    if (session.hasFlag(PORTAL_REPAIRED_FLAG)) {
      screen.classList.add("level-37--repaired");
      screen.innerHTML = `${workshopDecoration()}${heading()}
        <p class="level-37__repair-complete">PORTAL REPAIR COMPLETE</p>
        ${repairedPortal()}`;
      const portal = screen.querySelector<HTMLButtonElement>(".level-37__portal--repaired");
      if (portal) listen(portal, "click", complete, { once: true });
      return;
    }

    screen.classList.add("level-37--broken");
    screen.innerHTML = `${workshopDecoration()}${heading()}
      <p class="level-37__story">${STORY}</p>
      ${brokenPortal()}
      <form class="level-37__form" autocomplete="off">
        <div class="level-37__controls">
          <input class="nelg-password-input" id="level-37-answer" name="nelg-level-thirty-seven-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
            maxlength="24" autocomplete="off" autocapitalize="off" aria-autocomplete="none" spellcheck="false"
            aria-label="Portal repair password" />
          <button type="submit">GO</button>
        </div>
      </form>
      <p class="level-37__status" role="status" aria-live="polite"></p>
      <div class="level-37__context-menu" role="menu" aria-label="Flash navigation menu" hidden>
        <button type="button" role="menuitemcheckbox" data-menu-command="music"></button>
        <button type="button" role="menuitemcheckbox" data-menu-command="effects"></button>
        <button type="button" role="menuitem" data-menu-command="music-volume" aria-haspopup="menu"></button>
        <button type="button" role="menuitem" data-menu-command="effects-volume" aria-haspopup="menu"></button>
        <div class="level-37__volume-menu" role="menu" aria-label="Volume" hidden>
          ${Array.from({ length: 11 }, (_, index) => `<button type="button" role="menuitemradio" data-volume="${index * 10}"></button>`).join("")}
        </div>
        <div class="level-37__menu-separator" role="separator"></div>
        <button type="button" role="menuitem">Forward</button>
        <button type="button" role="menuitem">Back</button>
        <button class="level-37__rewind" type="button" role="menuitem">Rewind</button>
        <div class="level-37__menu-separator" role="separator"></div>
        <div class="level-37__player-label">Never Ending Level Game ++</div>
      </div>`;

    const form = screen.querySelector<HTMLFormElement>(".level-37__form");
    const input = screen.querySelector<HTMLInputElement>("#level-37-answer");
    const status = screen.querySelector<HTMLElement>(".level-37__status");
    const menu = screen.querySelector<HTMLElement>(".level-37__context-menu");
    const rewind = screen.querySelector<HTMLButtonElement>(".level-37__rewind");
    const musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    const musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music-volume']");
    const effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects-volume']");
    const volumeMenu = menu?.querySelector<HTMLElement>(".level-37__volume-menu");
    if (!form || !input || !status || !menu || !rewind || !musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem || !volumeMenu) return;

    const maskedInput = attachStarMaskedInput(input, listen);
    let restartReady = false;
    let activeVolumeKind: "music" | "effects" = "music";

    const updateSettings = () => {
      musicItem.textContent = `${context.audio.musicEnabled ? "✓" : ""}  Music`;
      effectsItem.textContent = `${context.audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
      musicVolumeItem.textContent = `   Music Volume: ${context.audio.musicVolume}%  ▶`;
      effectsVolumeItem.textContent = `   SFX Volume: ${context.audio.effectsVolume}%  ▶`;
      musicItem.setAttribute("aria-checked", String(context.audio.musicEnabled));
      effectsItem.setAttribute("aria-checked", String(context.audio.effectsEnabled));
      volumeMenu.querySelectorAll<HTMLButtonElement>("[data-volume]").forEach((option) => {
        const value = Number(option.dataset.volume);
        const selected = value === (activeVolumeKind === "music" ? context.audio.musicVolume : context.audio.effectsVolume);
        option.textContent = `${selected ? "✓" : ""}  ${value}%`;
        option.setAttribute("aria-checked", String(selected));
      });
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

    const hideMenu = () => {
      menu.hidden = true;
      volumeMenu.hidden = true;
    };
    const showMenu = (event: MouseEvent) => {
      if (!restartReady) return;
      updateSettings();
      volumeMenu.hidden = true;
      menu.hidden = false;
      positionFloatingElement(screen, menu, event.clientX, event.clientY, 8);
      rewind.focus();
    };

    listen(screen, "contextmenu", (event) => {
      event.preventDefault();
      hideMenu();
      showMenu(event);
    });
    listen(screen, "pointerdown", (event) => {
      if (event.button === 2) {
        event.preventDefault();
        hideMenu();
        showMenu(event);
        return;
      }
      if (menu.hidden || menu.contains(event.target as Node)) return;
      hideMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape") hideMenu();
    });
    listen(rewind, "click", () => {
      if (!restartReady) return;
      session.setFlag(PORTAL_REPAIRED_FLAG);
      goToMenu();
    });
    listen(menu, "click", (event) => {
      const volumeOption = (event.target as Element).closest<HTMLButtonElement>("button[data-volume]");
      if (volumeOption && volumeMenu.contains(volumeOption)) {
        const volume = Number(volumeOption.dataset.volume);
        if (activeVolumeKind === "music") context.audio.setMusicVolume(volume);
        else context.audio.setEffectsVolume(volume);
        updateSettings();
        volumeMenu.hidden = true;
        return;
      }
      const item = (event.target as Element).closest<HTMLButtonElement>("button[data-menu-command]");
      if (!item || !menu.contains(item)) return;
      if (item.dataset.menuCommand === "music") context.audio.setMusicEnabled(!context.audio.musicEnabled);
      if (item.dataset.menuCommand === "effects") context.audio.setEffectsEnabled(!context.audio.effectsEnabled);
      if (item.dataset.menuCommand === "music-volume") {
        if (volumeMenu.hidden || activeVolumeKind !== "music") positionVolumeMenu("music");
        else volumeMenu.hidden = true;
        return;
      }
      if (item.dataset.menuCommand === "effects-volume") {
        if (volumeMenu.hidden || activeVolumeKind !== "effects") positionVolumeMenu("effects");
        else volumeMenu.hidden = true;
        return;
      }
      updateSettings();
    });
    listen(input, "animationend", () => input.classList.remove("is-wrong"));
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue() !== REPAIR_PASSWORD) {
        maskedInput.clear();
        input.classList.remove("is-wrong");
        void input.offsetWidth;
        input.classList.add("is-wrong");
        input.focus();
        return;
      }

      form.hidden = true;
      status.textContent = "TROUBLESHOOTING THE PORTAL... PLEASE WAIT.";
      timeout(() => {
        restartReady = true;
        status.textContent = "RESTART THE GAME";
        status.classList.add("is-ready");
        screen.classList.add("level-37--restart-ready");
      }, REPAIR_DELAY_MS);
    });

    input.focus();
  },
};
