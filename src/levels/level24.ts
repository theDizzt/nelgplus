import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { SOUND_EFFECTS } from "../core/assets";
import type { LevelDefinition } from "../core/types";
import { positionFloatingElement } from "../core/floatingPosition";

const UNLOCK_SEQUENCE = "hidden";
const REVIVAL_UNLOCK_SEQUENCE = "hiddenhidden";

export const level24: LevelDefinition = {
  number: 24,
  title: "Script",
  scenes: [
    { id: "1", label: "Scene 1 - Puzzle" },
    { id: "2", label: "Scene 2 - Punishment" },
  ],
  mount({ screen, complete, wrongAnswer, unlockAchievement, restart, listen, audio, initialScene, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    const unlockSequence = revival ? REVIVAL_UNLOCK_SEQUENCE : UNLOCK_SEQUENCE;
    let scene: "puzzle" | "wrong" = "puzzle";
    let keyBuffer = "";
    let menuUnlocked = false;
    let revivalKeyIndex = 0;
    let punishmentPresses = 0;
    let revivalMenuPairs = 0;
    let revivalExpectedCommand: "forward" | "back" | "rewind" = "forward";
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

    screen.className = `level-screen level-24 level-24--puzzle${revival ? " level-24--revival" : ""}`;
    screen.innerHTML = `
      <pre class="level-24__source${revival ? " revival-font-courier" : ""}" aria-hidden="true"><code class="${revival ? "revival-font-courier" : ""}">${revival ? `const A = [0x75, 0x74, 0x79, 0x79, 0x78, 0x73];
const X = 0x1d;
const K = Array.from({ length: 2 }, () =&gt;
  A.map(n =&gt; String.fromCharCode(n ^ X)).join("")
).join("");

const T = ["back", "rewind", "forward"];
const R = [2, 1, 2, 1, 2, 1, 0]
  .map(n =&gt; T[(n * 2 + 1) % T.length]);
let S = "", I = ~0;

addEventListener("keydown", e =&gt; {
  S = (S + e.key.toLowerCase()).slice(-K.length);
  if (![...K].some((c, i) =&gt; c !== S[i])) flashMenu.unlock();
});

function choose(c) {
  if (c !== R[++I]) return previousLevel();
  if (~I === -R.length) nextLevel();
}` : `const sequence = ["hid", "den"].join("");
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

passwordForm.onsubmit = () =&gt; trapForever("WRONG :(");`}</code></pre>

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

      <div class="level-24__context-menu${revival ? " revival-font-arial" : ""}" role="menu" aria-label="Flash player menu" hidden>
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
      if (revival) {
        const key = event.key.toLowerCase();
        if (key !== unlockSequence[revivalKeyIndex]) {
          wrongAnswer();
          return;
        }
        revivalKeyIndex += 1;
        if (revivalKeyIndex !== unlockSequence.length) return;
        menuUnlocked = true;
        unlockFlash.classList.add("is-visible");
        return;
      }
      keyBuffer = `${keyBuffer}${event.key.toLowerCase()}`.slice(-unlockSequence.length);
      if (keyBuffer !== unlockSequence || menuUnlocked) return;
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
      if (scene !== "puzzle") return;
      if (!menuUnlocked) {
        if (revival) wrongAnswer();
        return;
      }
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
      if (revival) {
        const command = item.dataset.menuCommand;
        if (command !== revivalExpectedCommand) {
          wrongAnswer();
          return;
        }

        closeMenu();
        if (command === "forward") {
          revivalExpectedCommand = "back";
          return;
        }
        if (command === "back") {
          revivalMenuPairs += 1;
          revivalExpectedCommand = revivalMenuPairs === 3 ? "rewind" : "forward";
          return;
        }
        complete();
        return;
      }
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
