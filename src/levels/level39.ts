import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { SOUND_EFFECTS, assetUrl } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import type { LevelContext, LevelDefinition } from "../core/types";

const FAKE_LEVEL_WIDTH = 400;
const FAKE_LEVEL_HEIGHT = 300;
const FAKE_LEVEL_GAP = 450;
const FAKE_LEVEL_X_STEP = FAKE_LEVEL_WIDTH + FAKE_LEVEL_GAP;
const FAKE_LEVEL_Y_STEP = FAKE_LEVEL_HEIGHT + FAKE_LEVEL_GAP;
const FAKE_LEVEL_LAYOUT = [
  [91, 74, 65, 55, 76, 87, 94],
  [84, 81, 51, 47, 61, 80, 70],
  [78, 63, 97, 43, 99, 50, 67],
  [56, 45, 41, 40, 42, 48, 60],
  [66, 49, 98, 44, 96, 62, 77],
  [69, 83, 64, 46, 52, 79, 89],
  [95, 86, 75, 59, 68, 71, 92],
] as const;
const OMITTED_FAKE_LEVELS = new Set([53, 54, 57, 58, 72, 73, 82, 85, 88, 90, 93]);
const FAKE_LEVEL_SEQUENCE = Array.from({ length: 60 }, (_, index) => index + 40)
  .filter((levelNumber) => !OMITTED_FAKE_LEVELS.has(levelNumber));
const FAKE_SUBTITLES = [
  "ƎRRØR_Δ",
  "// NØT FØUND //",
  "G̷A̷T̷E̷_Ψ",
  "‡ß¥†ΞM 39",
  "N̸E̸X̸T̸¿",
  "0xDEAD::Æ",
  "[VØID_λ]",
  "▓▒░ ȜLITCH ░▒▓",
] as const;

interface FakeLevelPoint {
  readonly x: number;
  readonly y: number;
}

function fakeLevelPoint(levelNumber: number): FakeLevelPoint {
  for (let row = 0; row < FAKE_LEVEL_LAYOUT.length; row += 1) {
    const column = FAKE_LEVEL_LAYOUT[row]?.findIndex((value) => value === levelNumber) ?? -1;
    if (column >= 0) {
      return {
        x: (column - 3) * FAKE_LEVEL_X_STEP,
        y: (row - 3) * FAKE_LEVEL_Y_STEP,
      };
    }
  }
  return { x: 0, y: 0 };
}

function fakeSubtitle(levelNumber: number): string {
  return FAKE_SUBTITLES[(levelNumber - 40) % FAKE_SUBTITLES.length] ?? "ƎRRØR";
}

function launchFakeLevelWorld(
  screen: HTMLElement,
  listen: LevelContext["listen"],
  audio: LevelContext["audio"],
  goToMenu: LevelContext["goToMenu"],
): void {
  if (screen.querySelector(".level-39__fake-stage")) return;
  screen.classList.add("is-fake-world");
  const stage = document.createElement("section");
  stage.className = "level-39__fake-stage";
  stage.dataset.allowDrag = "";
  stage.setAttribute("aria-label", "Draggable field of fake levels");
  stage.innerHTML = `
    <div class="level-39__fake-world" data-allow-drag>
      <div class="level-39__fake-origin" aria-hidden="true"><span>LEVEL 39</span></div>
    </div>`;
  screen.append(stage);

  const world = stage.querySelector<HTMLElement>(".level-39__fake-world");
  if (!world) return;

  let worldX = 200;
  let worldY = 150;
  const spawnedFakeLevels = new Set<number>();
  const fakeAnswers = new Map<string, ReturnType<typeof attachStarMaskedInput>>();
  const completedFake47Fields = new Set<string>();
  let fake44SequenceIndex = 0;
  let fake49HintRevealed = false;
  let fake51Waiting = false;
  let fake51Timer: number | undefined;
  let fake55Input = "";
  let routeRevealed = false;

  const renderWorldPosition = () => {
    world.style.transform = `translate(${worldX}px, ${worldY}px)`;
  };

  const controls = screen.querySelector<HTMLElement>(".level-39__controls");
  if (controls) {
    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "level-39__world-reset";
    resetButton.textContent = "RESET";
    resetButton.dataset.text = "RESET";
    resetButton.setAttribute("aria-label", "Reset fake-level position");
    controls.append(resetButton);
    listen(resetButton, "click", () => {
      worldX = 200;
      worldY = 150;
      renderWorldPosition();
    });
  }

  const makeFakeLevel = (levelNumber: number, point: FakeLevelPoint, finalLevel = false) => {
    const level = document.createElement("article");
    level.className = `level-39__fake-level level-39__fake-level--${levelNumber}${finalLevel ? " level-39__fake-level--666" : ""}`;
    level.dataset.fakeLevel = String(levelNumber);
    level.dataset.allowDrag = "";
    level.style.left = `${point.x}px`;
    level.style.top = `${point.y}px`;
    const titleAngle = ((levelNumber * 13) % 17) - 8;
    level.style.setProperty("--fake-title-angle", `${titleAngle}deg`);
    level.style.setProperty("--fake-subtitle-angle", `${titleAngle * -0.45}deg`);
    const puzzle = (() => {
      if (levelNumber === 40) {
        return `<button class="level-39__fake-40-button" type="button" data-fake-40-button
          aria-label="Large black button, 0 of 35 clicks"></button>`;
      }
      if (levelNumber === 41) {
        return `
          <div class="level-39__fake-41-clue" aria-hidden="true">
            <span class="level-39__fake-41-arrow">➜</span><b>?</b><i>⌜ ──── ⌝</i>
          </div>
          <form class="level-39__fake-password-form" data-fake-password-form="41" autocomplete="off">
            <input data-fake-password="41" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 41 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 42) {
        return `
          <p class="level-39__fake-42-code">5 ? g b / 6 y ? n / 3 ? d c</p>
          <form class="level-39__fake-password-form" data-fake-password-form="42" autocomplete="off">
            <input data-fake-password="42" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 42 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 43) {
        return `
          <p class="level-39__fake-43-why">WHY</p>
          <form class="level-39__fake-password-form" data-fake-password-form="43" autocomplete="off">
            <input data-fake-password="43" type="text" maxlength="1" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 43 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 44) {
        const colors = [
          ["red", "#ff0000"], ["hazel", "#8e7618"], ["orange", "#ff8c00"],
          ["emerald", "#50c878"], ["daisy", "#fff200"], ["blue", "#0000ff"],
          ["navy", "#000080"], ["violet", "#8f00ff"], ["ivory", "#fffff0"],
        ] as const;
        return `<div class="level-39__fake-44-diamonds">${colors.map(([name, color]) => `
          <button type="button" data-fake-44-color="${name}" data-fake-44-value="${color}"
            style="--diamond-color:${color}" aria-label="${name} diamond"></button>`).join("")}
        </div>`;
      }
      if (levelNumber === 45) {
        return `
          <img class="level-39__fake-45-image" src="${assetUrl("images/level39fake45.png")}" alt="A hidden mathematical symbol" draggable="false" />
          <form class="level-39__fake-password-form" data-fake-password-form="45" autocomplete="off">
            <input data-fake-password="45" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 45 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 46) {
        return `<div class="level-39__fake-46-orbit" aria-hidden="true">
          <img src="${assetUrl("images/level39fake46.png")}" alt="" draggable="false" />
        </div>`;
      }
      if (levelNumber === 47) {
        return `
          <p class="level-39__fake-47-clue">PW = COUNTING EVEN TODDLERS CAN DO<br /><b>(SPELL IT OUT!!!)</b></p>
          <div class="level-39__fake-47-forms">
            ${[1, 2, 3].map((slot) => `
              <form class="level-39__fake-password-form" data-fake-password-form="47-${slot}" autocomplete="off">
                <input data-fake-password="47-${slot}" type="text" maxlength="16" autocomplete="off"
                  spellcheck="false" aria-label="Fake Level 47 password ${slot}" />
                <button type="submit" data-text="GO">GO</button>
              </form>`).join("")}
          </div>`;
      }
      if (levelNumber === 48) {
        return `<p class="level-39__fake-48-letter" aria-label="S">S</p>`;
      }
      if (levelNumber === 49) {
        return `
          <p class="level-39__fake-49-clue" data-fake-49-clue>Password is hidden</p>
          <form class="level-39__fake-password-form" data-fake-password-form="49" autocomplete="off">
            <input data-fake-password="49" type="text" maxlength="32" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 49 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 50) {
        return `
          <p class="level-39__fake-50-morse">- .... . &nbsp;&nbsp; .--. .- ... ... .-- --- .-. -.. &nbsp;&nbsp; .. ... &nbsp;&nbsp; .- .--.</p>
          <form class="level-39__fake-password-form" data-fake-password-form="50" autocomplete="off">
            <input data-fake-password="50" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 50 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 51) {
        return `
          <p class="level-39__fake-51-instruction">THERE IS NO NEXT LEVEL.<br />DO NOTHING ON THIS SCREEN AND TAKE A SHORT BREAK.</p>
          <button class="level-39__fake-51-start" type="button" data-fake-51-start>Start</button>`;
      }
      if (levelNumber === 52) {
        return `
          <p class="level-39__fake-52-formula">8 + 5 + 73 + 49 = ?<br /><small>(THINK AS SMALL AS POSSIBLE!!!)</small></p>
          <form class="level-39__fake-password-form" data-fake-password-form="52" autocomplete="off">
            <input data-fake-password="52" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 52 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 55) {
        const inputCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return `
          <div class="level-39__fake-55-context-menu" role="menu" aria-label="Fake Flash player menu" hidden>
            <button type="button" role="menuitemcheckbox" data-fake-55-command="music"></button>
            <button type="button" role="menuitemcheckbox" data-fake-55-command="effects"></button>
            <button type="button" role="menuitem" data-fake-55-command="music-volume">Music Volume ▶</button>
            <button type="button" role="menuitem" data-fake-55-command="effects-volume">SFX Volume ▶</button>
            <button type="button" role="menuitem" data-fake-55-command="inputs">Inputs ▶</button>
            <div class="level-39__fake-55-separator" role="separator"></div>
            <button type="button" role="menuitem" data-fake-55-command="forward">Forward</button>
            <button type="button" role="menuitem" data-fake-55-command="back">Back</button>
            <button type="button" role="menuitem" data-fake-55-command="rewind">Rewind</button>
            <div class="level-39__fake-55-separator" role="separator"></div>
            <div class="level-39__fake-55-player-label">Never Ending Level Game ++</div>
            <div class="level-39__fake-55-submenu level-39__fake-55-volume-menu" role="menu" hidden>
              ${Array.from({ length: 11 }, (_, index) => `<button type="button" role="menuitemradio" data-fake-55-volume="${index * 10}"></button>`).join("")}
            </div>
            <div class="level-39__fake-55-submenu level-39__fake-55-inputs-menu" role="menu" aria-label="Inputs" hidden>
              ${Array.from(inputCharacters, (character) => `<button type="button" role="menuitem" data-fake-55-input="${character}">${character}</button>`).join("")}
            </div>
          </div>`;
      }
      if (levelNumber === 56) {
        return "";
      }
      if (levelNumber === 59) {
        return `
          <div class="level-39__fake-59-images" aria-hidden="true">
            ${Array.from({ length: 12 }, (_, index) => {
              const suffix = String.fromCharCode(97 + index);
              return `<img class="level-39__fake-59-image level-39__fake-59-image--${suffix}"
                src="${assetUrl(`images/level39fake59${suffix}.png`)}" alt="" draggable="false" />`;
            }).join("")}
          </div>
          <form class="level-39__fake-password-form" data-fake-password-form="59" autocomplete="off">
            <input data-fake-password="59" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 59 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      return `<button type="button" data-clear-fake-level="${levelNumber}" ${finalLevel ? "disabled" : ""}>
        ${finalLevel ? "..." : "NEXT"}
      </button>`;
    })();
    level.innerHTML = `
      <div class="level-39__fake-level-canvas" data-fake-level-canvas>
        <header>
          <h2>${levelNumber === 56
            ? '<span class="level-39__fake-level-word">L<span class="level-39__fake-56-e">e</span>vel</span> 56'
            : `<span class="level-39__fake-level-word">Level</span> ${levelNumber}`}</h2>
          <p>${finalLevel ? "F̴I̴N̴A̴L̴_̴F̴A̴L̴S̴E̴" : fakeSubtitle(levelNumber)}</p>
        </header>
        ${puzzle}
      </div>`;
    world.append(level);

    if (levelNumber === 55) level.dataset.allowContextMenu = "";

    level.querySelectorAll<HTMLInputElement>("[data-fake-password]").forEach((passwordInput) => {
      const passwordForm = passwordInput.closest<HTMLFormElement>("[data-fake-password-form]");
      const answerKey = passwordInput.dataset.fakePassword;
      if (!passwordForm || !answerKey) return;
      fakeAnswers.set(answerKey, attachStarMaskedInput(passwordInput, listen));
      listen(passwordInput, "keydown", (event) => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        passwordForm.requestSubmit();
      });
    });
    return level;
  };

  const spawnFakeLevel = (levelNumber: number) => {
    if (!FAKE_LEVEL_SEQUENCE.includes(levelNumber) || spawnedFakeLevels.has(levelNumber)) return;
    spawnedFakeLevels.add(levelNumber);
    makeFakeLevel(levelNumber, fakeLevelPoint(levelNumber));
  };

  const revealLevel666 = () => {
    const existing = world.querySelector<HTMLElement>('[data-fake-level="666"]');
    if (existing) return;
    const level55 = fakeLevelPoint(55);
    const level666 = makeFakeLevel(666, { x: level55.x, y: level55.y - 4000 }, true);
    level666.classList.add("is-materializing");
  };

  const revealRouteTo666 = () => {
    if (routeRevealed) return;
    routeRevealed = true;
    const level55 = fakeLevelPoint(55);
    const route = document.createElement("div");
    route.className = "level-39__route-to-666";
    route.dataset.allowDrag = "";
    route.setAttribute("aria-label", "Invisible draggable route to fake Level 666");
    route.style.left = `${level55.x + 141}px`;
    route.style.top = `${level55.y - 3710}px`;
    route.style.height = "3710px";
    world.append(route);
    revealLevel666();
  };

  const completeFakeLevel = (levelNumber: number, level: HTMLElement) => {
    if (level.classList.contains("is-cleared")) return;
    level.classList.add("is-cleared");
    level.querySelectorAll<HTMLInputElement>("input").forEach((input) => { input.disabled = true; });
    level.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      button.disabled = true;
      if (button.matches("[data-clear-fake-level], [data-fake-40-button]")) button.textContent = "CLEARED";
    });
    const currentIndex = FAKE_LEVEL_SEQUENCE.indexOf(levelNumber);
    const nextLevel = FAKE_LEVEL_SEQUENCE[currentIndex + 1];
    if (nextLevel === undefined) revealRouteTo666();
    else spawnFakeLevel(nextLevel);
  };

  const restartFake51Wait = () => {
    if (!fake51Waiting) return;
    if (fake51Timer !== undefined) window.clearTimeout(fake51Timer);
    fake51Timer = window.setTimeout(() => {
      const level = world.querySelector<HTMLElement>('[data-fake-level="51"]:not(.is-cleared)');
      if (!level?.isConnected || !fake51Waiting) return;
      fake51Waiting = false;
      completeFakeLevel(51, level);
    }, 30_000);
  };

  const origin = world.querySelector<HTMLElement>(".level-39__fake-origin");
  if (origin) {
    origin.style.left = "-18px";
    origin.style.top = "-18px";
  }
  spawnFakeLevel(40);
  renderWorldPosition();

  type PointerDrag =
    {
      readonly pointerId: number;
      readonly pointerX: number;
      readonly pointerY: number;
      readonly startX: number;
      readonly startY: number;
    };

  let drag: PointerDrag | undefined;
  const localPointer = (event: PointerEvent) => clientPointToLocal(screen, event.clientX, event.clientY);

  listen(stage, "pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : undefined;
    world.querySelectorAll<HTMLElement>(".level-39__fake-55-context-menu:not([hidden])").forEach((menu) => {
      if (!target || !menu.contains(target)) menu.hidden = true;
    });
    if (!target || target.closest("button, input, textarea, select, label, [contenteditable='true']")) return;
    if (!target.closest(".level-39__fake-level, .level-39__route-to-666")) return;
    const pointer = localPointer(event);
    drag = {
      pointerId: event.pointerId,
      pointerX: pointer.x,
      pointerY: pointer.y,
      startX: worldX,
      startY: worldY,
    };
    stage.classList.add("is-panning");
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  listen(stage, "pointermove", (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const pointer = localPointer(event);
    const deltaX = pointer.x - drag.pointerX;
    const deltaY = pointer.y - drag.pointerY;
    worldX = drag.startX + deltaX;
    worldY = drag.startY + deltaY;
    renderWorldPosition();
    event.preventDefault();
  });

  const finishDrag = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    stage.classList.remove("is-panning");
    drag = undefined;
  };
  listen(stage, "pointerup", finishDrag);
  listen(stage, "pointercancel", finishDrag);

  listen(stage, "click", (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    const smashButton = target?.closest<HTMLButtonElement>("button[data-fake-40-button]");
    if (smashButton && !smashButton.disabled) {
      audio.playEffect(SOUND_EFFECTS.smack);
      const clicks = Number(smashButton.dataset.clicks ?? "0") + 1;
      smashButton.dataset.clicks = String(clicks);
      smashButton.setAttribute("aria-label", `Large black button, ${clicks} of 35 clicks`);
      if (clicks >= 35) {
        const level = smashButton.closest<HTMLElement>(".level-39__fake-level");
        if (level) completeFakeLevel(40, level);
      }
      return;
    }

    const colorButton = target?.closest<HTMLButtonElement>("button[data-fake-44-color]");
    if (colorButton && !colorButton.disabled) {
      audio.playEffect(SOUND_EFFECTS.smack);
      const level = colorButton.closest<HTMLElement>(".level-39__fake-level");
      const colorName = colorButton.getAttribute("data-fake-44-color") ?? "";
      const colorValue = colorButton.getAttribute("data-fake-44-value") ?? "#f00";
      level?.style.setProperty("--fake-44-accent", colorValue);
      const requiredOrder = ["hazel", "ivory", "daisy", "daisy", "emerald", "navy"];
      if (colorName === requiredOrder[fake44SequenceIndex]) fake44SequenceIndex += 1;
      else fake44SequenceIndex = colorName === requiredOrder[0] ? 1 : 0;
      if (fake44SequenceIndex === requiredOrder.length && level) completeFakeLevel(44, level);
      return;
    }

    const startButton = target?.closest<HTMLButtonElement>("button[data-fake-51-start]");
    if (startButton && !startButton.disabled) {
      startButton.disabled = true;
      startButton.textContent = "WAIT";
      fake51Waiting = true;
      restartFake51Wait();
      return;
    }

    const fake55Menu = target?.closest<HTMLElement>(".level-39__fake-55-context-menu");
    const fake55Level = fake55Menu?.closest<HTMLElement>('[data-fake-level="55"]');
    if (fake55Menu && fake55Level && !fake55Level.classList.contains("is-cleared")) {
      const volumeMenu = fake55Menu.querySelector<HTMLElement>(".level-39__fake-55-volume-menu");
      const inputsMenu = fake55Menu.querySelector<HTMLElement>(".level-39__fake-55-inputs-menu");
      const inputButton = target?.closest<HTMLButtonElement>("button[data-fake-55-input]");
      if (inputButton && inputsMenu?.contains(inputButton)) {
        const character = inputButton.dataset.fake55Input ?? "";
        const targetAnswer = "HIDDEN";
        if (character === targetAnswer[fake55Input.length]) fake55Input += character;
        else fake55Input = character === targetAnswer[0] ? character : "";
        fake55Level.dataset.inputProgress = fake55Input;
        if (fake55Input === targetAnswer) {
          fake55Menu.hidden = true;
          completeFakeLevel(55, fake55Level);
        }
        return;
      }

      const volumeButton = target?.closest<HTMLButtonElement>("button[data-fake-55-volume]");
      if (volumeButton && volumeMenu?.contains(volumeButton)) {
        const volume = Number(volumeButton.dataset.fake55Volume);
        const volumeKind = volumeMenu.dataset.volumeKind;
        if (volumeKind === "music") audio.setMusicVolume(volume);
        else audio.setEffectsVolume(volume);
        volumeMenu.hidden = true;
        return;
      }

      const commandButton = target?.closest<HTMLButtonElement>("button[data-fake-55-command]");
      const command = commandButton?.dataset.fake55Command;
      if (!commandButton || !command) return;
      const updateFake55Settings = () => {
        const music = fake55Menu.querySelector<HTMLButtonElement>('[data-fake-55-command="music"]');
        const effects = fake55Menu.querySelector<HTMLButtonElement>('[data-fake-55-command="effects"]');
        if (music) music.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
        if (effects) effects.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
      };
      if (command === "music") {
        audio.setMusicEnabled(!audio.musicEnabled);
        updateFake55Settings();
      } else if (command === "effects") {
        audio.setEffectsEnabled(!audio.effectsEnabled);
        updateFake55Settings();
      } else if (command === "music-volume" || command === "effects-volume") {
        if (!volumeMenu) return;
        const kind = command === "music-volume" ? "music" : "effects";
        volumeMenu.dataset.volumeKind = kind;
        volumeMenu.querySelectorAll<HTMLButtonElement>("[data-fake-55-volume]").forEach((option) => {
          const value = Number(option.dataset.fake55Volume);
          const selected = kind === "music" ? audio.musicVolume : audio.effectsVolume;
          option.textContent = `${value === selected ? "✓" : ""}  ${value}%`;
        });
        if (inputsMenu) inputsMenu.hidden = true;
        volumeMenu.hidden = !volumeMenu.hidden;
      } else if (command === "inputs") {
        if (volumeMenu) volumeMenu.hidden = true;
        if (inputsMenu) inputsMenu.hidden = !inputsMenu.hidden;
      } else if (command === "rewind") {
        goToMenu();
      } else if (command === "forward" || command === "back") {
        const canvas = fake55Level.querySelector<HTMLElement>("[data-fake-level-canvas]");
        if (canvas) {
          canvas.classList.remove("is-blackout");
          void canvas.offsetWidth;
          canvas.classList.add("is-blackout");
          window.setTimeout(() => canvas.classList.remove("is-blackout"), 520);
        }
        fake55Menu.hidden = true;
      }
      return;
    }

    const button = target?.closest<HTMLButtonElement>("button[data-clear-fake-level]");
    if (!button || button.disabled) return;
    const levelNumber = Number(button.dataset.clearFakeLevel);
    if (!Number.isInteger(levelNumber) || levelNumber < 40 || levelNumber > 99) return;
    const level = button.closest<HTMLElement>(".level-39__fake-level");
    if (level) completeFakeLevel(levelNumber, level);
  });

  listen(stage, "submit", (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : undefined;
    if (!form?.matches("[data-fake-password-form]")) return;
    event.preventDefault();
    const answerKey = form.dataset.fakePasswordForm ?? "";
    const levelNumber = Number(answerKey.split("-")[0]);
    const expectedAnswers: Readonly<Record<string, string>> = {
      "41": "Level", "42": "the", "43": "y", "45": "sum",
      "49": "fake", "50": "ap",
      "52": "OBTaIn", "59": "pea",
      "47-1": "three", "47-2": "three", "47-3": "three",
    };
    const answer = fakeAnswers.get(answerKey)?.getValue();
    if (levelNumber === 49 && answer === "hidden" && !fake49HintRevealed) {
      fake49HintRevealed = true;
      const clue = form.closest<HTMLElement>(".level-39__fake-level")
        ?.querySelector<HTMLElement>("[data-fake-49-clue]");
      if (clue) clue.innerHTML = "Haha! You fell for it &gt;:D<br /><b>The password is fake</b>";
      fakeAnswers.get(answerKey)?.clear();
      form.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    if (answer === expectedAnswers[answerKey]) {
      const level = form.closest<HTMLElement>(".level-39__fake-level");
      if (levelNumber === 47) {
        completedFake47Fields.add(answerKey);
        form.classList.add("is-complete");
        form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button")
          .forEach((control) => { control.disabled = true; });
        if (completedFake47Fields.size === 3 && level) completeFakeLevel(47, level);
      } else if (level) {
        completeFakeLevel(levelNumber, level);
      }
      return;
    }
    form.classList.remove("is-wrong");
    void form.offsetWidth;
    form.classList.add("is-wrong");
  });

  listen(window, "keydown", (event) => {
    if (!event.repeat) {
      const key = event.key.toLowerCase();
      const level46 = world.querySelector<HTMLElement>('[data-fake-level="46"]:not(.is-cleared)');
      const level48 = world.querySelector<HTMLElement>('[data-fake-level="48"]:not(.is-cleared)');
      const level56 = world.querySelector<HTMLElement>('[data-fake-level="56"]:not(.is-cleared)');
      if (key === "b" && level46) completeFakeLevel(46, level46);
      if (key === "s" && level48) completeFakeLevel(48, level48);
      if (key === "e" && level56) completeFakeLevel(56, level56);
    }
    if (fake51Waiting) restartFake51Wait();
  });

  listen(window, "pointerdown", () => {
    if (fake51Waiting) restartFake51Wait();
  });
  listen(window, "pointermove", () => {
    if (fake51Waiting) restartFake51Wait();
  });
  listen(stage, "pointerover", (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    const button = target?.closest<HTMLButtonElement>("button[data-fake-51-start]");
    const previous = event.relatedTarget instanceof Node ? event.relatedTarget : undefined;
    if (button && !button.contains(previous ?? null)) audio.playEffect(SOUND_EFFECTS.pop);
  });

  listen(stage, "contextmenu", (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    const level = target?.closest<HTMLElement>('[data-fake-level="55"]:not(.is-cleared)');
    const canvas = level?.querySelector<HTMLElement>("[data-fake-level-canvas]");
    const menu = level?.querySelector<HTMLElement>(".level-39__fake-55-context-menu");
    if (!level || !canvas || !menu) return;
    event.preventDefault();
    const pointer = clientPointToLocal(canvas, event.clientX, event.clientY);
    menu.hidden = false;
    menu.querySelectorAll<HTMLElement>(".level-39__fake-55-submenu").forEach((submenu) => { submenu.hidden = true; });
    const music = menu.querySelector<HTMLButtonElement>('[data-fake-55-command="music"]');
    const effects = menu.querySelector<HTMLButtonElement>('[data-fake-55-command="effects"]');
    const musicVolume = menu.querySelector<HTMLButtonElement>('[data-fake-55-command="music-volume"]');
    const effectsVolume = menu.querySelector<HTMLButtonElement>('[data-fake-55-command="effects-volume"]');
    if (music) music.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
    if (effects) effects.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
    if (musicVolume) musicVolume.textContent = `   Music Volume: ${audio.musicVolume}%  ▶`;
    if (effectsVolume) effectsVolume.textContent = `   SFX Volume: ${audio.effectsVolume}%  ▶`;
    const left = Math.max(4, Math.min(pointer.x, 800 - menu.offsetWidth - 4));
    const top = Math.max(4, Math.min(pointer.y, 600 - menu.offsetHeight - 4));
    menu.classList.toggle("opens-left", left + menu.offsetWidth + 305 > 796);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  });
}

function corruptCoordinate(value: number): string {
  const rounded = Math.round(value);
  const mode = Math.floor(Math.random() * 9);
  if (mode === 0) return "NaN";
  if (mode === 1) return `0x${Math.abs(rounded + Math.floor(Math.random() * 64)).toString(16).toUpperCase()}`;
  if (mode === 2) return String(-rounded - Math.floor(Math.random() * 300));
  if (mode === 3) return `${rounded}${Math.floor(Math.random() * 10)}`;
  if (mode === 4) return Math.random() > 0.5 ? "∞" : "-∞";
  if (mode === 5) return String((rounded ^ Math.floor(Math.random() * 511)) & 1023);
  return String(rounded + Math.floor(Math.random() * 181) - 90);
}

export const level39: LevelDefinition = {
  number: 39,
  title: "Glitch",
  mount({ screen, listen, timeout, audio, goToMenu }) {
    screen.className = "level-screen level-39";
    screen.innerHTML = `
      <div class="level-39__gradient level-39__gradient--yellow" aria-hidden="true"></div>
      <div class="level-39__gradient level-39__gradient--lime" aria-hidden="true"></div>
      <div class="level-39__scanlines" aria-hidden="true"></div>

      <header class="level-heading level-39__heading" aria-label="Level 39, Glitch">
        <div class="level-heading__number level-39__title">Level 39</div>
        <h1 class="level-39__subtitle">Glitch</h1>
      </header>

      <aside class="level-39__telemetry" aria-label="Corrupted cursor coordinates">
        <p><span>x :</span> <output class="level-39__x">0</output></p>
        <p><span>y :</span> <output class="level-39__y">0</output></p>
        <svg class="level-39__sigil" viewBox="0 0 180 245" aria-hidden="true">
          <path d="M83 12 62 70 78 109 49 157 88 146 102 213M83 12 108 82 91 119 135 169 101 166M25 190 47 143M26 190 67 185M144 205 123 166M144 205 111 196" />
          <path class="level-39__sigil-eye" d="M54 92 Q88 61 126 94 Q91 126 54 92 Z M78 92 A13 13 0 1 0 104 92 A13 13 0 1 0 78 92" />
          <text x="12" y="235">9  A4  Ǝ  ?</text>
        </svg>
      </aside>

      <section class="level-39__rupture" aria-hidden="true">
        <pre><code><span>export</span> const level = memory[<b>0x27</b>];
if (cursor.x !== cursor.y) {
  frame.splice(<i>UNKNOWN</i>, 39);
  throw new RangeError("G̷A̵T̷E̶");
}
screen.render(fragment[NaN]);
while (signal) signal ^= 0x39;
// DO NOT TRUST THE TITLE
return void 0x000000;</code></pre>
      </section>

      <svg class="level-39__cracks" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true">
        <g>
          <path d="M608 291 561 248 574 205 529 164M608 291 548 307 511 283 467 318 425 294" />
          <path d="M608 291 650 239 697 229 729 181M608 291 665 315 690 365 749 382" />
          <path d="M608 291 588 349 608 397 566 449 582 506" />
          <path d="M561 248 517 232 490 194M548 307 519 352 475 365M665 315 719 290 764 307" />
        </g>
      </svg>

      <div class="level-39__dead-shard level-39__dead-shard--one" aria-hidden="true"></div>
      <div class="level-39__dead-shard level-39__dead-shard--two" aria-hidden="true"></div>
      <div class="level-39__dead-shard level-39__dead-shard--three" aria-hidden="true"></div>
      <div class="level-39__glitch-bar level-39__glitch-bar--one" aria-hidden="true"></div>
      <div class="level-39__glitch-bar level-39__glitch-bar--two" aria-hidden="true"></div>
      <div class="level-39__glitch-bar level-39__glitch-bar--three" aria-hidden="true"></div>

      <form class="level-39__form" autocomplete="off">
        <label for="level-39-answer">Type the background color</label>
        <div class="level-39__controls">
          <div class="level-39__broken-input">
            <input class="nelg-password-input" id="level-39-answer" name="nelg-level-thirty-nine-answer"
              data-allow-select type="text" maxlength="64" autocomplete="off" autocapitalize="off"
              aria-autocomplete="none" data-form-type="other" data-lpignore="true" data-1p-ignore="true"
              spellcheck="false" aria-label="Damaged password input" />
            <i aria-hidden="true"></i>
          </div>
          <button type="submit" data-text="GO" aria-label="Damaged GO button">GO</button>
        </div>
      </form>
    `;

    const xOutput = screen.querySelector<HTMLOutputElement>(".level-39__x");
    const yOutput = screen.querySelector<HTMLOutputElement>(".level-39__y");
    const sigil = screen.querySelector<SVGElement>(".level-39__sigil");
    const form = screen.querySelector<HTMLFormElement>(".level-39__form");
    const input = screen.querySelector<HTMLInputElement>("#level-39-answer");
    const submit = screen.querySelector<HTMLButtonElement>(".level-39__form button");
    if (!xOutput || !yOutput || !sigil || !form || !input || !submit) return;

    const maskedInput = attachStarMaskedInput(input, listen);

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(screen, "pointermove", () => {
      xOutput.value = corruptCoordinate(Math.random() * 800);
      yOutput.value = corruptCoordinate(Math.random() * 600);
      sigil.style.setProperty("--sigil-shift-x", `${Math.floor(Math.random() * 17) - 8}px`);
      sigil.style.setProperty("--sigil-skew", `${Math.floor(Math.random() * 13) - 6}deg`);
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue() === "hidden") {
        launchFakeLevelWorld(screen, listen, audio, goToMenu);
        return;
      }
      form.classList.remove("is-malfunctioning");
      void form.offsetWidth;
      form.classList.add("is-malfunctioning");
      submit.textContent = Math.random() > 0.5 ? "G?" : "0xGO";
      submit.dataset.text = submit.textContent;
      timeout(() => {
        form.classList.remove("is-malfunctioning");
        submit.textContent = "GO";
        submit.dataset.text = "GO";
        input.focus();
      }, 520);
    });
  },
};
