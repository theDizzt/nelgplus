import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { SOUND_EFFECTS } from "../core/assets";
import type { LevelDefinition } from "../core/types";
import { positionFloatingElement } from "../core/floatingPosition";

const UNLOCK_SEQUENCE = "hidden";

export const level24: LevelDefinition = {
  number: 24,
  title: "Script",
  scenes: [
    { id: "1", label: "Scene 1 - Puzzle" },
    { id: "2", label: "Scene 2 - Punishment" },
  ],
  mount({ screen, complete, wrongAnswer, unlockAchievement, restart, listen, audio, initialScene }) {
    let scene: "puzzle" | "wrong" = "puzzle";
    let keyBuffer = "";
    let menuUnlocked = false;
    let punishmentPresses = 0;
    const requiredPunishmentPresses = 35;

    const showWrong = () => {
      scene = "wrong";
      punishmentPresses = 0;
      screen.className = "level-screen level-24 level-24--wrong";
      screen.innerHTML = `
        <div class="level-24__wrong" role="alert">WRONG :(</div>
        <p class="level-24__punishment">AS PUNISHMENT, MASH THE SPACE BAR!</p>
        <div class="level-24__punishment-track" role="progressbar" aria-label="Space bar punishment progress"
          aria-valuemin="0" aria-valuemax="${requiredPunishmentPresses}" aria-valuenow="0">
          <i></i>
        </div>
      `;
    };

    screen.className = "level-screen level-24 level-24--puzzle";
    screen.innerHTML = `
      <pre class="level-24__source" aria-hidden="true"><code>const sequence = ["hid", "den"].join("");
let history = "";
let contextAllowed = false;

window.addEventListener("keydown", event =&gt; {
  if (event.target.closest("input")) return;
  history = (history + event.key).slice(-sequence.length);
  if (history === sequence) contextAllowed = true;
});

player.on("contextmenu", event =&gt; {
  event.preventDefault();
  if (!contextAllowed) return;
  flashMenu.open(event.x, event.y);
});

function choose(command) {
  if (command === flashMenu.items.at(-1)) nextLevel();
  else if (command === "settings") openSettings();
  else trapForever("WRONG :(");
}

passwordForm.onsubmit = () =&gt; trapForever("WRONG :(");</code></pre>

      <header class="level-heading level-24__heading">
        <div class="level-heading__number">Level 24</div>
        <h1>Script</h1>
      </header>

      <form class="level-24__form" autocomplete="off">
        <div class="level-24__controls">
          <input class="nelg-password-input" id="level-24-answer" data-allow-select
            data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
            maxlength="40" autocomplete="off" autocapitalize="off" aria-autocomplete="none"
            aria-label="Password" spellcheck="false" />
          <button type="submit">GO</button>
        </div>
      </form>

      <div class="level-24__context-menu" role="menu" aria-label="Flash player menu" hidden>
        <button type="button" role="menuitemcheckbox" data-menu-command="music"></button>
        <button type="button" role="menuitemcheckbox" data-menu-command="effects"></button>
        <div class="level-24__menu-separator" role="separator"></div>
        <button type="button" role="menuitem" data-menu-command="forward">Forward</button>
        <button type="button" role="menuitem" data-menu-command="back">Back</button>
        <button type="button" role="menuitem" data-menu-command="rewind">Rewind</button>
        <div class="level-24__menu-separator" role="separator"></div>
        <div class="level-24__player-label">Never Ending Level Game ++</div>
      </div>
      <div class="level-24__unlock-flash" aria-hidden="true">CONTEXT ENABLED</div>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-24__form");
    const input = screen.querySelector<HTMLInputElement>("#level-24-answer");
    const menu = screen.querySelector<HTMLElement>(".level-24__context-menu");
    const unlockFlash = screen.querySelector<HTMLElement>(".level-24__unlock-flash");
    const musicItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='music']");
    const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-menu-command='effects']");
    if (!form || !input || !menu || !unlockFlash || !musicItem || !effectsItem) return;

    const maskedInput = attachStarMaskedInput(input, listen);

    const updateSettings = () => {
      musicItem.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
      effectsItem.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
      musicItem.setAttribute("aria-checked", String(audio.musicEnabled));
      effectsItem.setAttribute("aria-checked", String(audio.effectsEnabled));
    };
    const closeMenu = () => { menu.hidden = true; };
    updateSettings();

    listen(document, "keydown", (event) => {
      if (scene === "wrong") {
        if (event.code !== "Space" || event.repeat) return;
        event.preventDefault();
        audio.playEffect(SOUND_EFFECTS.smack);
        punishmentPresses += 1;
        const track = screen.querySelector<HTMLElement>(".level-24__punishment-track");
        const fill = track?.querySelector<HTMLElement>("i");
        const progress = Math.min(1, punishmentPresses / requiredPunishmentPresses);
        if (fill) fill.style.width = `${progress * 100}%`;
        track?.setAttribute("aria-valuenow", String(punishmentPresses));
        if (punishmentPresses >= requiredPunishmentPresses) restart();
        return;
      }
      if (scene !== "puzzle") return;
      if ((event.target as Element).closest("input, button")) return;
      if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) return;
      keyBuffer = `${keyBuffer}${event.key}`.slice(-UNLOCK_SEQUENCE.length);
      if (keyBuffer !== UNLOCK_SEQUENCE || menuUnlocked) return;
      menuUnlocked = true;
      unlockFlash.classList.add("is-visible");
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (scene !== "puzzle") return;
      if (maskedInput.getValue() === "hidden") unlockAchievement(29);
      if (wrongAnswer()) return;
      showWrong();
    });

    const openMenu = (clientX: number, clientY: number) => {
      if (scene !== "puzzle" || !menuUnlocked) return;
      updateSettings();
      menu.hidden = false;
      positionFloatingElement(screen, menu, clientX, clientY);
    };

    listen(screen, "pointerdown", (event) => {
      if (event.button !== 2) return;
      event.preventDefault();
      openMenu(event.clientX, event.clientY);
    });

    listen(screen, "contextmenu", (event) => {
      event.preventDefault();
      openMenu(event.clientX, event.clientY);
    });

    listen(menu, "click", (event) => {
      const item = (event.target as Element).closest<HTMLButtonElement>("button[data-menu-command]");
      if (!item || scene !== "puzzle") return;
      switch (item.dataset.menuCommand) {
        case "music":
          audio.setMusicEnabled(!audio.musicEnabled);
          updateSettings();
          return;
        case "effects":
          audio.setEffectsEnabled(!audio.effectsEnabled);
          updateSettings();
          return;
        case "rewind":
          complete();
          return;
        case "forward":
        case "back":
          showWrong();
          return;
      }
    });

    listen(document, "pointerdown", (event) => {
      if (event.button !== 2 && scene === "puzzle" && !menu.hidden && !menu.contains(event.target as Node)) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape" && scene === "puzzle") closeMenu();
    });
    if (initialScene === "2") showWrong();
  },
};
