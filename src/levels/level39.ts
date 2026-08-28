import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { attachCustomCursor } from "../core/CustomCursor";
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

const FAKE_LEVEL_60_ASCII = String.raw`mmmmmm                                                                      mm               ##                         mmmmm
##""""#m                                                                    ##               ""                         ##"""##

## m#####m  mm#####m  mm#####m ##      ##  m####m    ##m####   m###m##             ####     mm#####m
######"     " mmm##  ##mmmm "  ##mmmm " "#  ##  #" ##"  "##   ##"      ##"  "##               ##     ##mmmm "            ##    ##
m##"""##   """"##m   """"##m  ##m##m##  ##    ##   ##       ##    ##               ##      """"##m
##mmm###   #mmmmm##  #mmmmm##  "##  ##"  "##mm##"   ##       "##mm###            mmm##mmm  #mmmmm##            ##mmm##
""         """" ""   """"""    """"""    ""  ""     """"     ""         """ ""            """""""   """"""             """""`;

const FAKE_LEVEL_70_MESSAGES = [
  "the gate is asleep", "wait for green", "null is not empty", "try another color",
  "memory address 0x46", "the password is cloud", "signal lost", "do not blink",
  "the password is void", "buffering clue", "there is no password", "look behind you",
  "syntax error", "the answer escaped", "green means nothing", "pause the noise",
  "the password is static", "read faster", "wrong timeline", "undefined behavior",
  "the password is lemon", "seek the silent frame", "permission denied", "try again later",
  "the password is zero", "frame skipped", "cursor detected", "message corrupted",
  "the password is yellow", "almost there", "false positive", "checksum failed",
  "the password is hidden", "stand by", "no useful data", "keep searching",
  "the password is pause", "packet dropped", "access granted?", "not this one",
  "the password is green", "random thought", "nothing to see", "stop the stream",
  "the password is flash", "loading secret", "invalid clue", "watch carefully",
  "the password is circle", "noise noise noise", "untrusted message", "freeze me",
  "the password is nelg", "too slow", "decoy detected", "one frame matters",
  "the password is button", "error 70", "meaning unavailable", "hold your breath",
  "the password is rewind", "still changing", "this is a decoy", "end of buffer",
] as const;

const FAKE_LEVEL_96_WORDS = [
  "anchor", "biscuit", "cactus", "dynamo", "ember", "feather", "galaxy", "harbor",
  "island", "jacket", "kettle", "lantern", "marble", "needle", "orchid", "pencil",
  "quartz", "ribbon", "saddle", "thunder", "utopia", "velvet", "walnut", "xylophone",
  "yogurt", "zipper", "acorn", "beacon", "castle", "desert", "engine", "fossil",
  "garden", "helmet", "igloo", "jigsaw", "kernel", "lizard", "magnet", "napkin",
  "ocean", "pepper", "rocket", "silver", "tunnel", "urchin", "violin", "window",
  "yellow", "zephyr", "apricot", "bucket", "camera", "dragon", "eclipse", "forest",
  "goblin", "hammer", "insect", "jungle", "koala", "lemon", "meteor", "nectar",
  "oxygen", "planet", "rabbit", "signal", "temple", "unicorn", "vortex", "whistle",
  "yonder", "zenith", "almond", "bridge", "comet", "dolphin", "falcon", "glacier",
  "horizon", "ivory", "jasmine", "kitten", "lobster", "mirror", "noodle", "octopus",
  "parrot", "radar", "sphinx", "tiger", "violet", "waffle", "yacht", "zebra",
] as const;

const FAKE_LEVEL_94_ERROR =
  "E̷̽̊͗r̸͒̈́̕r̷̈́̑͝o̶͛͐̚r̷͒͑̈*̵C̵͊̾͝õ̸̂͠d̴̛̐͐ë̷́̄̉*̵6̴̓̄͠6̶̛̀̚6̵̈́̒̑:̵͆̒ System*Fall. NULL*POINT at 0x00000";

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
  complete: LevelContext["complete"],
  adminTargetLevel?: number,
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
  void audio.playMusicSequence(["music/level39a.mp3", "music/level39b.mp3"]);

  let worldX = 200;
  let worldY = 150;
  const spawnedFakeLevels = new Set<number>();
  const fakeAnswers = new Map<string, ReturnType<typeof attachStarMaskedInput>>();
  const completedFake47Fields = new Set<string>();
  let fake44Sequence: string[] = [];
  let fake44Locked = false;
  let fake49HintRevealed = false;
  let fake51Waiting = false;
  let fake51Timer: number | undefined;
  let fake55Input = "";
  let fake62Phase: "awaiting-mute" | "awaiting-unmute" = "awaiting-mute";
  let fake68Timer: number | undefined;
  let fake68PointerId: number | undefined;
  let fake70Interval: number | undefined;
  let fake75OffsetX = 0;
  let fake77SpawnedButtons = 0;
  let fake81Clicks = 0;
  let fake83KeyBuffer = "";
  let fake84Step = 0;
  let fake84Timer: number | undefined;
  let fake92KeyBuffer = "";
  let fake94DroppedLetters = 0;
  let fake96LastWordAt = 0;
  let fake98KeyBuffer = "";
  let routeRevealed = false;

  const stopFake70Cycle = () => {
    if (fake70Interval !== undefined) window.clearInterval(fake70Interval);
    fake70Interval = undefined;
  };

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

  const openFake55Menu = (level: HTMLElement, event: MouseEvent) => {
    const canvas = level.querySelector<HTMLElement>("[data-fake-level-canvas]");
    const menu = level.querySelector<HTMLElement>(".level-39__fake-55-context-menu");
    if (!canvas || !menu) return;

    event.preventDefault();
    event.stopPropagation();
    const pointer = clientPointToLocal(canvas, event.clientX, event.clientY);
    menu.hidden = false;
    menu.querySelectorAll<HTMLElement>(".level-39__fake-55-submenu").forEach((submenu) => {
      submenu.hidden = true;
    });
    menu.querySelectorAll<HTMLButtonElement>("button[data-fake-55-command], button[data-fake-55-volume]")
      .forEach((button) => { button.disabled = false; });
    if (!level.classList.contains("is-cleared")) {
      menu.querySelectorAll<HTMLButtonElement>("button[data-fake-55-input]")
        .forEach((button) => { button.disabled = false; });
    }
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
  };

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
    if (levelNumber === 91) {
      level.style.setProperty("--fake-91-space", `url("${assetUrl("images/spacebg.png?v=20260813")}")`);
    }
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
        return `
        <div class="level-39__fake-44-entry" data-fake-44-entry aria-live="polite" aria-label="0 of 6 colors entered"></div>
        <p class="level-39__fake-44-result" data-fake-44-result aria-live="assertive"></p>
        <div class="level-39__fake-44-diamonds">${colors.map(([name, color]) => `
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
      if (levelNumber === 60) {
        return `
          <textarea class="level-39__fake-60-ascii" data-fake-60-ascii data-allow-select
            readonly wrap="off" spellcheck="false" aria-label="Tiny selectable dynamic text"></textarea>
          <form class="level-39__fake-password-form" data-fake-password-form="60" autocomplete="off">
            <input data-fake-password="60" type="text" maxlength="8" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 60 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 61) {
        return `
          <p class="level-39__fake-61-clue">You cannot &quot;divide&quot; this, because it is hiding!</p>
          <form class="level-39__fake-password-form" data-fake-password-form="61" autocomplete="off">
            <input data-fake-password="61" type="text" maxlength="24" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 61 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 62) {
        return `
          <img class="level-39__fake-62-image" data-fake-62-image
            src="${assetUrl("images/level39fake62a.png")}" alt="A nearly hidden audio instruction" draggable="false" />
          <button class="level-39__fake-62-button" type="button" data-fake-62-button hidden>CLICK</button>`;
      }
      if (levelNumber === 63) {
        return `<img class="level-39__fake-63-image" src="${assetUrl("images/level39fake63.png")}" alt="A cup of tea" draggable="false" />`;
      }
      if (levelNumber === 64) {
        return `
          <p class="level-39__fake-64-clue">STOP PLAYING THIS GAME</p>
          <form class="level-39__fake-password-form" data-fake-password-form="64" autocomplete="off">
            <input data-fake-password="64" type="text" maxlength="40" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 64 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 65) {
        return `
          <img class="level-39__fake-65-image" src="${assetUrl("images/level39fake65.png")}" alt="The abbreviated game title with one differently colored letter" draggable="false" />
          <form class="level-39__fake-password-form" data-fake-password-form="65" autocomplete="off">
            <input data-fake-password="65" type="text" maxlength="20" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 65 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 66) {
        return `
          <p class="level-39__fake-66-face">;(</p>
        `;
      }
      if (levelNumber === 67) {
        return `<img class="level-39__fake-67-image" src="${assetUrl("images/level39fake67.png")}" alt="A message written with symbol characters" draggable="false" />`;
      }
      if (levelNumber === 68) {
        return `
          <p class="level-39__fake-68-clue">PW =</p>
          <form class="level-39__fake-password-form" data-fake-password-form="68" autocomplete="off">
            <input data-fake-password="68" type="text" maxlength="24" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 68 password" />
            <button type="submit" data-fake-68-hold data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 69) {
        return `
          <p class="level-39__fake-69-coordinates">33°55'19&quot; N 118°20'03&quot; W, November 8, 2022<br />
            24°45'30&quot; N 81°31'53&quot; W, December 31, 2011<br />
            42°47'11&quot; N 77°42'58&quot; W, December 31, 2020<br />
            53°13′27″N, 4°11′22″W, April 4, 2021<br />
            37°02'59&quot; N 110°07'22&quot; W, May 5, 2016<br />
            52°28′43″N, 1°51′15″W, August 10, 2007</p>
          <form class="level-39__fake-password-form" data-fake-password-form="69" autocomplete="off">
            <input data-fake-password="69" type="text" maxlength="20" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 69 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 70) {
        return `
          <p class="level-39__fake-70-message" data-fake-70-message>MOVE OVER THE GREEN BUTTON</p>
          <button class="level-39__fake-70-control level-39__fake-70-control--cycle" type="button"
            data-fake-70-cycle aria-label="Start rapidly changing text"></button>
          <button class="level-39__fake-70-control level-39__fake-70-control--pause" type="button"
            data-fake-70-pause aria-label="Pause changing text">Ⅱ</button>
          <form class="level-39__fake-password-form" data-fake-password-form="70" autocomplete="off">
            <input data-fake-password="70" type="text" maxlength="20" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 70 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 71) {
        return `
          <p class="level-39__fake-71-clue">EASIER THAN IT LOOKS</p>
          <form class="level-39__fake-password-form" data-fake-password-form="71" autocomplete="off">
            <input data-fake-password="71" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 71 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 74) {
        return `
          <p class="level-39__fake-74-clue">THE PASSWORD DOES NOT EXIST ON THIS SCREEN.</p>
          <form class="level-39__fake-password-form" data-fake-password-form="74" autocomplete="off">
            <input data-fake-password="74" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 74 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 75) {
        return `
          <div class="level-39__fake-75-track" data-fake-75-track aria-label="Extremely long draggable gray path">
            <button class="level-39__fake-75-end" type="button" data-fake-75-end aria-label="Diamond at the end of the path"></button>
          </div>`;
      }
      if (levelNumber === 76) {
        return `
          <img class="level-39__fake-76-image" src="${assetUrl("images/level39fake76.png")}" alt="An extremely horizontally stretched text clue" draggable="false" />
          <form class="level-39__fake-password-form" data-fake-password-form="76" autocomplete="off">
            <input data-fake-password="76" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 76 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 77) {
        return `
          <p class="level-39__fake-77-message">THE GAME IS COMPLETELY BROKEN...<br />PRESS REWIND AND START AGAIN FROM THE BEGINNING!</p>
          <div class="level-39__fake-77-buttons" data-fake-77-buttons aria-live="polite"></div>
          <form class="level-39__fake-password-form level-39__fake-77-form" data-fake-password-form="77" autocomplete="off">
            <input data-fake-password="77" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 77 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 78) {
        return `
          <p class="level-39__fake-78-message">A SCREEN WHERE THE STARS SHINE...</p>
          <div class="level-39__fake-78-stars" aria-hidden="true">
            ${Array.from({ length: 54 }, (_, index) => `<span style="--star-x:${(index * 47 + 13) % 96}%;--star-y:${(index * 71 + 19) % 82}%;--star-delay:${(index % 11) * -0.13}s;--star-size:${24 + (index % 6) * 8}px">*</span>`).join("")}
          </div>
          <form class="level-39__fake-password-form" data-fake-password-form="78" autocomplete="off">
            <input data-fake-password="78" type="text" maxlength="4" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 78 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 79) {
        return `
          <p class="level-39__fake-79-message">When you mix different elements together, you create a new mix of ideas. In the modern studio, audio engineers mix tracks with great care. They adjust the mix until the final mix sounds just right. You can mix vocals, guitars, and drums into a single mix. A good mix requires patience, just like a chef who likes to mix spices to create a rich mix of flavors. When ingredients mix, they form a delicious mix. If you mix red and blue, you get a mix of purple. Life is also a mix of choices. We mix work and play to find a healthy mix. Every daily mix of events brings a new mix of feelings. Do not mix up your priorities. Keep your mix balanced and clear.</p>
          <form class="level-39__fake-password-form" data-fake-password-form="79" autocomplete="off">
            <input data-fake-password="79" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 79 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 80) {
        return `
          <p class="level-39__fake-80-message">Finish the equation.</p>
          <form class="level-39__fake-password-form" data-fake-password-form="80" autocomplete="off">
            <input data-fake-password="80" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 80 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 81) {
        return `
          <button class="level-39__fake-81-surface" type="button" data-fake-81-surface
            aria-label="Extremely worn surface, 0 of 132 hits"></button>
          <p class="level-39__fake-81-message">???</p>`;
      }
      if (levelNumber === 83) {
        return `
          <img class="level-39__fake-83-image" src="${assetUrl("images/level39fake83.png")}" alt="A visual clue about a number" draggable="false" />
          <form class="level-39__fake-password-form" data-fake-password-form="83" autocomplete="off" hidden>
            <input data-fake-password="83" type="text" maxlength="24" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 83 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 84) {
        return `
          <p class="level-39__fake-84-message">USE THE POWER OF THE HEXAGON...</p>
          <form class="level-39__fake-password-form" data-fake-password-form="84" autocomplete="off">
            <input data-fake-password="84" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 84 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 86) {
        const debris = Array.from({ length: 16 }, (_, index) => `
          <button class="level-39__fake-86-object level-39__fake-86-object--${(index % 8) + 1}" type="button"
            data-fake-86-object style="--object-x:${42 + (index % 4) * 184}px;--object-y:${178 + Math.floor(index / 4) * 76}px;--object-r:${(index * 37) % 180 - 90}deg"
            aria-label="Strange breakable object ${index + 1}"></button>`).join("");
        return `
          <div class="level-39__fake-86-objects">${debris}</div>
          <form class="level-39__fake-password-form" data-fake-password-form="86" autocomplete="off">
            <input data-fake-password="86" type="text" maxlength="24" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 86 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 87) {
        return `
          <p class="level-39__fake-87-clue">WELL KNOWN = A5Q7A2A2Q2Z5<br />PW = Q8A3</p>
          <form class="level-39__fake-password-form" data-fake-password-form="87" autocomplete="off">
            <input data-fake-password="87" type="text" maxlength="12" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 87 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 89) {
        return `<p class="level-39__fake-89-clue">uǝppᴉɥ sᴉ pɹoʍssɐd ǝɥʇ</p>`;
      }
      if (levelNumber === 91) {
        return `
          <form class="level-39__fake-password-form" data-fake-password-form="91" autocomplete="off">
            <input data-fake-password="91" type="text" maxlength="1" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 91 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 92) {
        return `<p class="level-39__fake-92-message">QUIT THIS GAME</p>`;
      }
      if (levelNumber === 94) {
        return `
          <p class="level-39__fake-94-error">${FAKE_LEVEL_94_ERROR}</p>
          <div class="level-39__fake-94-letters" data-fake-94-letters aria-live="polite"></div>
          <form class="level-39__fake-password-form" data-fake-password-form="94" autocomplete="off">
            <input data-fake-password="94" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 94 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 95) {
        return `
          <p class="level-39__fake-95-message">JUST GIVE UP</p>
          <form class="level-39__fake-password-form" data-fake-password-form="95" autocomplete="off">
            <input data-fake-password="95" type="text" maxlength="20" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 95 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 96) {
        return `
          <p class="level-39__fake-96-message">ABSOLUTELY IMPOSSIBLE!!!</p>
          <div class="level-39__fake-96-words" data-fake-96-words aria-hidden="true"></div>
          <form class="level-39__fake-password-form" data-fake-password-form="96" autocomplete="off">
            <input data-fake-password="96" type="text" maxlength="16" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 96 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 97) {
        return `<div class="level-39__fake-97-errors" aria-label="Corrupted error codes">
          ${Array.from({ length: 18 }, (_, index) => `<code>ERR_${(0x9700 + index * 39).toString(16).toUpperCase()} :: ${index % 3 === 0 ? "NULL_SIGNAL" : index % 3 === 1 ? "FRAME_ABORT" : "MEMORY_GLITCH"}</code>`).join("")}
        </div>`;
      }
      if (levelNumber === 98) {
        return `<p class="level-39__fake-98-message">FATAL ERROR</p>`;
      }
      if (levelNumber === 99) {
        return `
          <p class="level-39__fake-99-message">GAME CRASHED</p>
          <img class="level-39__fake-99-image" src="${assetUrl("images/level39fake99.png")}" alt="A dead-face emoticon clue" draggable="false" />
          <form class="level-39__fake-password-form" data-fake-password-form="99" autocomplete="off">
            <input data-fake-password="99" type="text" maxlength="12" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 99 password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      if (levelNumber === 666) {
        return `
          <img class="level-39__fake-666-image" src="${assetUrl("images/level39fake666.png")}" alt="A keypad-position cipher" draggable="false" />
          <form class="level-39__fake-password-form level-39__fake-666-form" data-fake-password-form="666" autocomplete="off">
            <input data-fake-password="666" type="text" inputmode="numeric" maxlength="3" autocomplete="off"
              spellcheck="false" aria-label="Fake Level 666 final password" />
            <button type="submit" data-text="GO">GO</button>
          </form>`;
      }
      return `<button type="button" data-clear-fake-level="${levelNumber}" ${finalLevel ? "disabled" : ""}>
        ${finalLevel ? "..." : "NEXT"}
      </button>`;
    })();
    level.innerHTML = `
      <div class="level-39__fake-level-canvas" data-fake-level-canvas${levelNumber === 55 ? " data-allow-context-menu" : ""}>
        <header>
          <h2>${levelNumber === 56
            ? '<span class="level-39__fake-level-word">L<span class="level-39__fake-56-e">e</span>vel</span> 56'
            : `<span class="level-39__fake-level-word">Level</span> ${levelNumber}`}</h2>
          <p>${finalLevel ? "F̴I̴N̴A̴L̴_̴F̴A̴L̴S̴E̴" : fakeSubtitle(levelNumber)}</p>
        </header>
        ${puzzle}
      </div>`;
    world.append(level);

    if (levelNumber === 74) {
      const level71Canvas = world.querySelector<HTMLElement>('[data-fake-level="71"] [data-fake-level-canvas]');
      if (level71Canvas && !level71Canvas.querySelector("[data-fake-71-hidden-clue]")) {
        const hiddenClue = document.createElement("img");
        hiddenClue.className = "level-39__fake-71-hidden-clue";
        hiddenClue.dataset.fake71HiddenClue = "";
        hiddenClue.src = assetUrl("images/level39fake71.png");
        hiddenClue.alt = "A newly appeared, nearly hidden clue";
        hiddenClue.draggable = false;
        level71Canvas.append(hiddenClue);
      }
    }

    const fake60Ascii = level.querySelector<HTMLTextAreaElement>("[data-fake-60-ascii]");
    if (fake60Ascii) fake60Ascii.value = FAKE_LEVEL_60_ASCII;

    if (levelNumber === 84) {
      const route = [
        { level: 84, label: "55", step: 0 },
        { level: 55, label: "70", step: 1 },
        { level: 70, label: "77", step: 2 },
        { level: 77, label: "46", step: 3 },
        { level: 46, label: "66", step: 4 },
        { level: 66, label: "84", step: 5 },
      ] as const;
      route.forEach(({ level: targetLevel, label, step }) => {
        const targetCanvas = world.querySelector<HTMLElement>(`[data-fake-level="${targetLevel}"] [data-fake-level-canvas]`);
        if (!targetCanvas || targetCanvas.querySelector(`[data-fake-84-route="${step}"]`)) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "level-39__fake-84-route";
        button.setAttribute("data-fake-84-route", String(step));
        button.textContent = label;
        button.hidden = step !== 0;
        button.setAttribute("aria-label", `Hexagon route ${label}`);
        targetCanvas.append(button);
      });
    }

    if (levelNumber === 89) {
      const level68Form = world.querySelector<HTMLFormElement>('[data-fake-level="68"] [data-fake-password-form="68"]');
      fakeAnswers.get("68")?.clear();
      level68Form?.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button").forEach((control) => {
        control.disabled = false;
      });
    }

    if (levelNumber === 55) {
      level.dataset.allowContextMenu = "";
      const menu = level.querySelector<HTMLElement>(".level-39__fake-55-context-menu");
      if (menu) menu.dataset.allowContextMenu = "";
      listen(level, "contextmenu", (event) => openFake55Menu(level, event));
      if (menu) {
        menu.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
          listen(button, "pointerdown", (event) => {
            if (event.button !== 0 || button.disabled) return;
            if (!handleFake55MenuClick(button)) return;
            event.preventDefault();
            event.stopPropagation();
          });
        });
        listen(menu, "click", (event) => {
          // Pointer input is handled on each button before the draggable stage can
          // capture it. Keep click handling only for keyboard-generated activation.
          if (event.detail !== 0) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          const target = event.target instanceof Element ? event.target : undefined;
          if (!target || !handleFake55MenuClick(target)) return;
          event.preventDefault();
          event.stopPropagation();
        });
      }
    }

    if (levelNumber === 70) {
      const cycle = level.querySelector<HTMLButtonElement>("[data-fake-70-cycle]");
      const pause = level.querySelector<HTMLButtonElement>("[data-fake-70-pause]");
      const message = level.querySelector<HTMLElement>("[data-fake-70-message]");
      let previousIndex = -1;
      if (cycle && pause && message) {
        listen(cycle, "pointerenter", () => {
          stopFake70Cycle();
          fake70Interval = window.setInterval(() => {
            let index = Math.floor(Math.random() * FAKE_LEVEL_70_MESSAGES.length);
            if (index === previousIndex) index = (index + 1) % FAKE_LEVEL_70_MESSAGES.length;
            previousIndex = index;
            message.textContent = FAKE_LEVEL_70_MESSAGES[index] ?? "void";
          }, 55);
        });
        listen(pause, "pointerenter", stopFake70Cycle);
      }
    }

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
    if (levelNumber === 62) syncFake62();
  };

  const revealLevel666 = () => {
    const existing = world.querySelector<HTMLElement>('[data-fake-level="666"]');
    if (existing) return;
    const level55 = fakeLevelPoint(55);
    const level666 = makeFakeLevel(666, { x: level55.x, y: level55.y - 4000 }, true);
    level666.classList.add("is-materializing");
    const level69Canvas = world.querySelector<HTMLElement>('[data-fake-level="69"] [data-fake-level-canvas]');
    if (level69Canvas && !level69Canvas.querySelector("[data-fake-666-extra]")) {
      const clue = document.createElement("p");
      clue.className = "level-39__fake-69-extra";
      clue.dataset.fake666Extra = "";
      clue.textContent = "apply the pw and plus four hundred";
      level69Canvas.append(clue);
    }
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

  const markFakeLevelCleared = (levelNumber: number, level: HTMLElement) => {
    level.classList.add("is-cleared");
    const preserveLevel68Input = levelNumber === 68
      && Boolean(world.querySelector('[data-fake-level="89"]:not(.is-cleared)'));
    level.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      if (preserveLevel68Input && input.closest('[data-fake-password-form="68"]')) return;
      input.disabled = true;
    });
    level.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      if (button.hasAttribute("data-fake-84-route")) return;
      if (preserveLevel68Input && button.closest('[data-fake-password-form="68"]')) return;
      button.disabled = levelNumber === 55 ? button.hasAttribute("data-fake-55-input") : true;
      if (button.matches("[data-clear-fake-level], [data-fake-40-button]")) button.textContent = "CLEARED";
    });
  };

  const completeFakeLevel = (levelNumber: number, level: HTMLElement) => {
    if (level.classList.contains("is-cleared")) return;
    if (levelNumber === 70) stopFake70Cycle();
    if (levelNumber === 84) {
      if (fake84Timer !== undefined) window.clearTimeout(fake84Timer);
      fake84Timer = undefined;
      world.querySelectorAll<HTMLButtonElement>("[data-fake-84-route]").forEach((button) => {
        button.hidden = true;
        button.disabled = true;
      });
    }
    markFakeLevelCleared(levelNumber, level);
    const currentIndex = FAKE_LEVEL_SEQUENCE.indexOf(levelNumber);
    const nextLevel = FAKE_LEVEL_SEQUENCE[currentIndex + 1];
    if (nextLevel === undefined) revealRouteTo666();
    else spawnFakeLevel(nextLevel);
  };

  const syncFake62 = () => {
    const level = world.querySelector<HTMLElement>('[data-fake-level="62"]:not(.is-cleared)');
    if (!level) return;
    const button = level.querySelector<HTMLButtonElement>("[data-fake-62-button]");
    const image = level.querySelector<HTMLImageElement>("[data-fake-62-image]");
    const musicMuted = !audio.musicEnabled || audio.musicVolume === 0;
    const effectsMuted = !audio.effectsEnabled || audio.effectsVolume === 0;
    const musicAudible = audio.musicEnabled && audio.musicVolume > 0;
    const effectsAudible = audio.effectsEnabled && audio.effectsVolume > 0;

    if (fake62Phase === "awaiting-mute") {
      if (button) button.hidden = !(musicMuted && effectsMuted);
      return;
    }
    if (button) button.hidden = true;
    if (image) image.src = assetUrl("images/level39fake62b.png");
    if (musicAudible && effectsAudible) completeFakeLevel(62, level);
  };

  const handleFake55MenuClick = (target: Element): boolean => {
    const fake55Menu = target.closest<HTMLElement>(".level-39__fake-55-context-menu");
    const fake55Level = fake55Menu?.closest<HTMLElement>('[data-fake-level="55"]');
    if (!fake55Menu || !fake55Level) return false;

    const volumeMenu = fake55Menu.querySelector<HTMLElement>(".level-39__fake-55-volume-menu");
    const inputsMenu = fake55Menu.querySelector<HTMLElement>(".level-39__fake-55-inputs-menu");
    const inputButton = target.closest<HTMLButtonElement>("button[data-fake-55-input]");
    if (inputButton && inputsMenu?.contains(inputButton)) {
      const character = inputButton.getAttribute("data-fake-55-input") ?? "";
      const targetAnswer = "HIDDEN";
      if (character === targetAnswer[fake55Input.length]) fake55Input += character;
      else fake55Input = character === targetAnswer[0] ? character : "";
      fake55Level.dataset.inputProgress = fake55Input;
      if (fake55Input === targetAnswer) {
        fake55Menu.hidden = true;
        completeFakeLevel(55, fake55Level);
      }
      return true;
    }

    const volumeButton = target.closest<HTMLButtonElement>("button[data-fake-55-volume]");
    if (volumeButton && volumeMenu?.contains(volumeButton)) {
      const volume = Number(volumeButton.getAttribute("data-fake-55-volume"));
      const volumeKind = volumeMenu.dataset.volumeKind;
      if (volumeKind === "music") audio.setMusicVolume(volume);
      else if (volumeKind === "effects") audio.setEffectsVolume(volume);
      else return true;
      volumeMenu.hidden = true;
      syncFake62();
      return true;
    }

    const commandButton = target.closest<HTMLButtonElement>("button[data-fake-55-command]");
    const command = commandButton?.getAttribute("data-fake-55-command");
    if (!commandButton || !command) return false;
    const updateFake55Settings = () => {
      const music = fake55Menu.querySelector<HTMLButtonElement>('[data-fake-55-command="music"]');
      const effects = fake55Menu.querySelector<HTMLButtonElement>('[data-fake-55-command="effects"]');
      if (music) music.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
      if (effects) effects.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
    };
    if (command === "music") {
      audio.setMusicEnabled(!audio.musicEnabled);
      updateFake55Settings();
      syncFake62();
    } else if (command === "effects") {
      audio.setEffectsEnabled(!audio.effectsEnabled);
      updateFake55Settings();
      syncFake62();
    } else if (command === "music-volume" || command === "effects-volume") {
      if (!volumeMenu) return true;
      const kind = command === "music-volume" ? "music" : "effects";
      volumeMenu.dataset.volumeKind = kind;
      volumeMenu.querySelectorAll<HTMLButtonElement>("[data-fake-55-volume]").forEach((option) => {
        const value = Number(option.getAttribute("data-fake-55-volume"));
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
    return true;
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

  const cancelFake68Hold = () => {
    if (fake68Timer !== undefined) window.clearTimeout(fake68Timer);
    fake68Timer = undefined;
    const button = world.querySelector<HTMLButtonElement>("button[data-fake-68-hold][data-holding]");
    if (button && !button.disabled) {
      delete button.dataset.holding;
      button.textContent = "GO";
      button.dataset.text = "GO";
    }
    fake68PointerId = undefined;
  };

  const resetFake84Route = () => {
    if (fake84Timer !== undefined) window.clearTimeout(fake84Timer);
    fake84Timer = undefined;
    fake84Step = 0;
    world.querySelectorAll<HTMLButtonElement>("[data-fake-84-route]").forEach((button) => {
      const step = Number(button.getAttribute("data-fake-84-route"));
      button.hidden = step !== 0;
      button.disabled = false;
      if (step === 0) {
        button.textContent = "55";
        button.setAttribute("aria-label", "Hexagon route 55");
      }
    });
  };

  const armFake84Timer = () => {
    if (fake84Timer !== undefined) window.clearTimeout(fake84Timer);
    fake84Timer = window.setTimeout(resetFake84Route, 6_000);
  };

  const origin = world.querySelector<HTMLElement>(".level-39__fake-origin");
  if (origin) {
    origin.style.left = "-18px";
    origin.style.top = "-18px";
  }
  const adminTargetIndex = adminTargetLevel === 666
    ? FAKE_LEVEL_SEQUENCE.length - 1
    : FAKE_LEVEL_SEQUENCE.indexOf(adminTargetLevel ?? 40);
  const finalAdminIndex = adminTargetIndex >= 0 ? adminTargetIndex : 0;
  for (let index = 0; index <= finalAdminIndex; index += 1) {
    const levelNumber = FAKE_LEVEL_SEQUENCE[index];
    if (levelNumber !== undefined) spawnFakeLevel(levelNumber);
  }
  for (let index = 0; index < finalAdminIndex; index += 1) {
    const levelNumber = FAKE_LEVEL_SEQUENCE[index];
    const level = levelNumber === undefined
      ? undefined
      : world.querySelector<HTMLElement>(`[data-fake-level="${levelNumber}"]`);
    if (levelNumber !== undefined && level) markFakeLevelCleared(levelNumber, level);
  }
  if (adminTargetLevel === 666) {
    const finalRegularLevel = FAKE_LEVEL_SEQUENCE[FAKE_LEVEL_SEQUENCE.length - 1];
    const finalRegularCard = finalRegularLevel === undefined
      ? undefined
      : world.querySelector<HTMLElement>(`[data-fake-level="${finalRegularLevel}"]`);
    if (finalRegularLevel !== undefined && finalRegularCard) markFakeLevelCleared(finalRegularLevel, finalRegularCard);
    revealRouteTo666();
  }
  const targetPoint = adminTargetLevel === 666
    ? { x: fakeLevelPoint(55).x, y: fakeLevelPoint(55).y - 4000 }
    : fakeLevelPoint(FAKE_LEVEL_SEQUENCE[finalAdminIndex] ?? 40);
  worldX = 200 - targetPoint.x;
  worldY = 150 - targetPoint.y;
  renderWorldPosition();

  type PointerDrag =
    {
      readonly pointerId: number;
      readonly pointerX: number;
      readonly pointerY: number;
      readonly startX: number;
      readonly startY: number;
      readonly shakesFake94: boolean;
      readonly draggedFake97?: HTMLElement;
    };

  type Fake75Drag = {
    readonly pointerId: number;
    readonly pointerX: number;
    readonly startOffsetX: number;
  };

  let drag: PointerDrag | undefined;
  let fake75Drag: Fake75Drag | undefined;
  let fake94LastPointerX = 0;
  let fake94LastDirection = 0;
  let fake94ShakeScore = 0;
  const localPointer = (event: PointerEvent) => clientPointToLocal(screen, event.clientX, event.clientY);
  const isFake66BorderHit = (event: PointerEvent | MouseEvent, level: HTMLElement) => {
    const rect = level.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const styles = getComputedStyle(level);
    const scaleX = rect.width / level.offsetWidth;
    const scaleY = rect.height / level.offsetHeight;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const left = Number.parseFloat(styles.borderLeftWidth) * scaleX;
    const right = Number.parseFloat(styles.borderRightWidth) * scaleX;
    const top = Number.parseFloat(styles.borderTopWidth) * scaleY;
    const bottom = Number.parseFloat(styles.borderBottomWidth) * scaleY;
    return x <= left || x >= rect.width - right || y <= top || y >= rect.height - bottom;
  };

  listen(stage, "pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : undefined;
    world.querySelectorAll<HTMLElement>(".level-39__fake-55-context-menu:not([hidden])").forEach((menu) => {
      if (!target || !menu.contains(target)) menu.hidden = true;
    });
    const fake66 = target?.closest<HTMLElement>('[data-fake-level="66"]');
    if (fake66 && isFake66BorderHit(event, fake66)) return;
    if (!target || target.closest("button, input, textarea, select, label, [contenteditable='true'], [data-fake-75-track]")) return;
    if (!target.closest(".level-39__fake-level, .level-39__route-to-666")) return;
    const pointer = localPointer(event);
    drag = {
      pointerId: event.pointerId,
      pointerX: pointer.x,
      pointerY: pointer.y,
      startX: worldX,
      startY: worldY,
      shakesFake94: Boolean(target.closest('[data-fake-level="94"]:not(.is-cleared)')),
      draggedFake97: target.closest<HTMLElement>('[data-fake-level="97"]:not(.is-cleared)') ?? undefined,
    };
    if (drag.shakesFake94) {
      fake94LastPointerX = pointer.x;
      fake94LastDirection = 0;
      fake94ShakeScore = 0;
    }
    stage.classList.add("is-panning");
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  listen(stage, "pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : undefined;
    const track = target?.closest<HTMLElement>("[data-fake-75-track]");
    if (!track || target?.closest("button")) return;
    const pointer = localPointer(event);
    fake75Drag = {
      pointerId: event.pointerId,
      pointerX: pointer.x,
      startOffsetX: fake75OffsetX,
    };
    track.classList.add("is-dragging");
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  listen(stage, "pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : undefined;
    const button = target?.closest<HTMLButtonElement>("button[data-fake-68-hold]");
    if (!button || button.disabled) return;
    const form = button.closest<HTMLFormElement>('[data-fake-password-form="68"]');
    const answer = fakeAnswers.get("68")?.getValue() ?? "";
    if (!form || answer !== "") {
      form?.classList.remove("is-wrong");
      if (form) void form.offsetWidth;
      form?.classList.add("is-wrong");
      return;
    }
    cancelFake68Hold();
    fake68PointerId = event.pointerId;
    button.dataset.holding = "true";
    button.textContent = "HOLD";
    button.dataset.text = "HOLD";
    stage.setPointerCapture(event.pointerId);
    fake68Timer = window.setTimeout(() => {
      fake68Timer = undefined;
      if (button.dataset.holding !== "true" || (fakeAnswers.get("68")?.getValue() ?? "") !== "") return;
      delete button.dataset.holding;
      const level = button.closest<HTMLElement>('[data-fake-level="68"]');
      if (level) completeFakeLevel(68, level);
    }, 10_000);
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
    if (drag.draggedFake97 && Math.abs(deltaX) + Math.abs(deltaY) >= 3) {
      completeFakeLevel(97, drag.draggedFake97);
    }
    if (drag.shakesFake94 && fake94DroppedLetters < 4) {
      const movementX = pointer.x - fake94LastPointerX;
      const direction = Math.abs(movementX) >= 8 ? Math.sign(movementX) : 0;
      if (direction !== 0) {
        if (fake94LastDirection !== 0 && direction !== fake94LastDirection) {
          fake94ShakeScore += 1;
          if (fake94ShakeScore >= 2) {
            fake94ShakeScore = 0;
            const level94 = world.querySelector<HTMLElement>('[data-fake-level="94"]:not(.is-cleared)');
            const layer = level94?.querySelector<HTMLElement>("[data-fake-94-letters]");
            const character = "pass"[fake94DroppedLetters];
            if (layer && character) {
              const letter = document.createElement("span");
              letter.textContent = character;
              letter.style.setProperty("--letter-x", `${105 + fake94DroppedLetters * 175}px`);
              letter.style.setProperty("--letter-delay", `${fake94DroppedLetters * 35}ms`);
              layer.append(letter);
              fake94DroppedLetters += 1;
            }
          }
        }
        fake94LastDirection = direction;
        fake94LastPointerX = pointer.x;
      }
    }
    event.preventDefault();
  });

  listen(stage, "pointermove", (event) => {
    if (!fake75Drag || fake75Drag.pointerId !== event.pointerId) return;
    const pointer = localPointer(event);
    // The fake-level canvas is rendered at 50%, so pointer travel must be doubled
    // to keep the path attached to the cursor in its 800×600 design space.
    fake75OffsetX = Math.max(-5_310, Math.min(0,
      fake75Drag.startOffsetX + (pointer.x - fake75Drag.pointerX) * 2));
    const track = world.querySelector<HTMLElement>("[data-fake-75-track]");
    if (track) track.style.transform = `translateX(${fake75OffsetX}px)`;
    event.preventDefault();
  });

  listen(stage, "pointermove", (event) => {
    const now = performance.now();
    if (now - fake96LastWordAt < 45) return;
    const target = event.target instanceof Element ? event.target : undefined;
    const level96 = target?.closest<HTMLElement>('[data-fake-level="96"]:not(.is-cleared)');
    const canvas = level96?.querySelector<HTMLElement>("[data-fake-level-canvas]");
    const layer = level96?.querySelector<HTMLElement>("[data-fake-96-words]");
    if (!canvas || !layer) return;
    fake96LastWordAt = now;
    const pointer = clientPointToLocal(canvas, event.clientX, event.clientY);
    const word = document.createElement("span");
    word.textContent = FAKE_LEVEL_96_WORDS[Math.floor(Math.random() * FAKE_LEVEL_96_WORDS.length)] ?? "word";
    word.style.left = `${Math.max(12, Math.min(720, pointer.x - 40))}px`;
    word.style.top = `${Math.max(125, Math.min(520, pointer.y - 14))}px`;
    word.style.setProperty("--word-angle", `${Math.floor(Math.random() * 35) - 17}deg`);
    layer.append(word);
    while (layer.childElementCount > 96) layer.firstElementChild?.remove();
  });

  const finishDrag = (event: PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    stage.classList.remove("is-panning");
    drag = undefined;
  };
  listen(stage, "pointerup", finishDrag);
  listen(stage, "pointercancel", finishDrag);
  const finishFake75Drag = (event: PointerEvent) => {
    if (!fake75Drag || fake75Drag.pointerId !== event.pointerId) return;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    world.querySelector<HTMLElement>("[data-fake-75-track]")?.classList.remove("is-dragging");
    fake75Drag = undefined;
  };
  listen(stage, "pointerup", finishFake75Drag);
  listen(stage, "pointercancel", finishFake75Drag);
  const finishFake68Hold = (event: PointerEvent) => {
    if (fake68PointerId !== event.pointerId) return;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    cancelFake68Hold();
  };
  listen(stage, "pointerup", finishFake68Hold);
  listen(stage, "pointercancel", finishFake68Hold);

  listen(stage, "click", (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    const fake97 = target?.closest<HTMLElement>('[data-fake-level="97"]:not(.is-cleared)');
    if (fake97) {
      completeFakeLevel(97, fake97);
      return;
    }
    const fake66 = target?.closest<HTMLElement>('[data-fake-level="66"]');
    if (fake66 && isFake66BorderHit(event, fake66)) {
      completeFakeLevel(66, fake66);
      return;
    }

    const fake75End = target?.closest<HTMLButtonElement>("button[data-fake-75-end]");
    if (fake75End && !fake75End.disabled) {
      const level = fake75End.closest<HTMLElement>('[data-fake-level="75"]');
      if (level) completeFakeLevel(75, level);
      return;
    }

    const fake77Go = target?.closest<HTMLButtonElement>("button[data-fake-77-go]");
    if (fake77Go && !fake77Go.disabled) {
      fake77Go.closest<HTMLElement>('[data-fake-level="77"]')
        ?.querySelector<HTMLFormElement>('[data-fake-password-form="77"]')?.requestSubmit();
      return;
    }

    const fake81Surface = target?.closest<HTMLButtonElement>("button[data-fake-81-surface]");
    if (fake81Surface && !fake81Surface.disabled) {
      fake81Clicks += 1;
      fake81Surface.setAttribute("aria-label", `Extremely worn surface, ${fake81Clicks} of 132 hits`);
      if (event instanceof MouseEvent) {
        const point = clientPointToLocal(fake81Surface, event.clientX, event.clientY);
        const crack = document.createElement("span");
        crack.className = "level-39__fake-81-crack";
        crack.setAttribute("aria-hidden", "true");
        crack.style.left = `${point.x}px`;
        crack.style.top = `${point.y}px`;
        crack.style.setProperty("--crack-angle", `${(fake81Clicks * 47) % 360}deg`);
        crack.style.setProperty("--crack-scale", `${0.72 + Math.min(fake81Clicks, 90) / 150}`);
        fake81Surface.append(crack);
      }
      if (fake81Clicks >= 132) {
        fake81Surface.disabled = true;
        const level = fake81Surface.closest<HTMLElement>('[data-fake-level="81"]');
        level?.classList.add("is-shattering");
        audio.playEffect(SOUND_EFFECTS.break);
        window.setTimeout(() => {
          if (level?.isConnected) completeFakeLevel(81, level);
        }, 760);
      } else audio.playEffect(SOUND_EFFECTS.smack);
      return;
    }

    const fake84Route = target?.closest<HTMLButtonElement>("button[data-fake-84-route]");
    if (fake84Route && !fake84Route.hidden && !fake84Route.disabled) {
      const clickedStep = Number(fake84Route.getAttribute("data-fake-84-route"));
      if ((fake84Step < 6 && clickedStep !== fake84Step) || (fake84Step === 6 && clickedStep !== 0)) {
        resetFake84Route();
        return;
      }
      if (fake84Step === 6) {
        const level84 = world.querySelector<HTMLElement>('[data-fake-level="84"]:not(.is-cleared)');
        if (fakeAnswers.get("84")?.getValue() === "time" && level84) completeFakeLevel(84, level84);
        else resetFake84Route();
        return;
      }
      fake84Route.hidden = true;
      fake84Step += 1;
      const nextStep = fake84Step === 6 ? 0 : fake84Step;
      const nextButton = world.querySelector<HTMLButtonElement>(`[data-fake-84-route="${nextStep}"]`);
      if (nextButton) {
        nextButton.hidden = false;
        if (fake84Step === 6) {
          nextButton.textContent = "time";
          nextButton.setAttribute("aria-label", "Hexagon route time");
        }
      }
      armFake84Timer();
      return;
    }

    const fake86Object = target?.closest<HTMLButtonElement>("button[data-fake-86-object]");
    if (fake86Object && !fake86Object.disabled) {
      fake86Object.disabled = true;
      fake86Object.classList.add("is-breaking");
      audio.playEffect(SOUND_EFFECTS.break);
      window.setTimeout(() => fake86Object.remove(), 460);
      return;
    }

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
    if (colorButton && !colorButton.disabled && !fake44Locked) {
      audio.playEffect(SOUND_EFFECTS.smack);
      const level = colorButton.closest<HTMLElement>(".level-39__fake-level");
      const colorName = colorButton.getAttribute("data-fake-44-color") ?? "";
      const colorValue = colorButton.getAttribute("data-fake-44-value") ?? "#f00";
      level?.style.setProperty("--fake-44-accent", colorValue);
      const requiredOrder = ["hazel", "ivory", "daisy", "daisy", "emerald", "navy"];
      fake44Sequence.push(colorName);
      const entry = level?.querySelector<HTMLElement>("[data-fake-44-entry]");
      const result = level?.querySelector<HTMLElement>("[data-fake-44-result]");
      if (entry) {
        entry.textContent = "*".repeat(fake44Sequence.length);
        entry.setAttribute("aria-label", `${fake44Sequence.length} of 6 colors entered`);
      }
      if (fake44Sequence.length === requiredOrder.length && level) {
        fake44Locked = true;
        const isCorrect = fake44Sequence.every((color, index) => color === requiredOrder[index]);
        level.classList.toggle("is-correct", isCorrect);
        level.classList.toggle("is-wrong", !isCorrect);
        if (result) result.textContent = isCorrect ? "CORRECT" : "WRONG";
        level.querySelectorAll<HTMLButtonElement>("[data-fake-44-color]").forEach((button) => {
          button.disabled = true;
        });
        if (isCorrect) {
          window.setTimeout(() => {
            if (level.isConnected) completeFakeLevel(44, level);
          }, 700);
        } else {
          window.setTimeout(() => {
            if (!level.isConnected) return;
            fake44Sequence = [];
            fake44Locked = false;
            level.classList.remove("is-wrong");
            if (entry) {
              entry.textContent = "";
              entry.setAttribute("aria-label", "0 of 6 colors entered");
            }
            if (result) result.textContent = "";
            level.querySelectorAll<HTMLButtonElement>("[data-fake-44-color]").forEach((button) => {
              button.disabled = false;
            });
          }, 900);
        }
      }
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

    if (target && handleFake55MenuClick(target)) return;

    const fake62Button = target?.closest<HTMLButtonElement>("button[data-fake-62-button]");
    if (fake62Button && !fake62Button.hidden && !fake62Button.disabled) {
      const level = fake62Button.closest<HTMLElement>('[data-fake-level="62"]');
      const image = level?.querySelector<HTMLImageElement>("[data-fake-62-image]");
      fake62Phase = "awaiting-unmute";
      fake62Button.hidden = true;
      if (image) image.src = assetUrl("images/level39fake62b.png");
      syncFake62();
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
      "52": "OBTaIn", "59": "pea", "60": "D", "61": "dividing",
      "64": "STOP PLAYING THIS GAME", "65": "Never",
      "69": "triple", "70": "void", "71": "red", "74": "IS",
      "76": "hat", "78": "*", "79": "mix", "80": "77693",
      "83": "number",
      "87": "of", "91": " ",
      "94": "pass", "96": "word", "99": "XoX",
      "47-1": "three", "47-2": "three", "47-3": "three",
    };
    const answer = fakeAnswers.get(answerKey)?.getValue();
    if (levelNumber === 666) {
      if (answer === "607") {
        form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button")
          .forEach((control) => { control.disabled = true; });
        complete();
        return;
      }
      form.classList.remove("is-wrong");
      void form.offsetWidth;
      form.classList.add("is-wrong");
      return;
    }
    if (levelNumber === 68) {
      const level89 = world.querySelector<HTMLElement>('[data-fake-level="89"]:not(.is-cleared)');
      if (level89 && answer === "hidden") {
        form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button").forEach((control) => {
          control.disabled = true;
        });
        completeFakeLevel(89, level89);
        return;
      }
      if (answer !== "") {
        form.classList.remove("is-wrong");
        void form.offsetWidth;
        form.classList.add("is-wrong");
      }
      return;
    }
    if (levelNumber === 49 && answer === "hidden" && !fake49HintRevealed) {
      fake49HintRevealed = true;
      const clue = form.closest<HTMLElement>(".level-39__fake-level")
        ?.querySelector<HTMLElement>("[data-fake-49-clue]");
      if (clue) clue.innerHTML = "Haha! You fell for it &gt;:D<br /><b>The password is fake</b>";
      fakeAnswers.get(answerKey)?.clear();
      form.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    if (levelNumber === 77) {
      const level = form.closest<HTMLElement>('[data-fake-level="77"]');
      if (answer === "hidden" && fake77SpawnedButtons < 76 && level) {
        const layer = level.querySelector<HTMLElement>("[data-fake-77-buttons]");
        if (layer) {
          const index = fake77SpawnedButtons;
          const button = document.createElement("button");
          button.type = "button";
          button.className = "level-39__fake-77-go";
          button.dataset.fake77Go = "";
          button.textContent = "GO";
          button.setAttribute("aria-label", `Generated GO button ${index + 1} of 76`);
          button.style.left = `${12 + (index % 10) * 78}px`;
          button.style.top = `${12 + Math.floor(index / 10) * 54}px`;
          layer.append(button);
          fake77SpawnedButtons += 1;
        }
        return;
      }
      if (answer === "77" && fake77SpawnedButtons === 76 && level) {
        completeFakeLevel(77, level);
        return;
      }
      form.classList.remove("is-wrong");
      void form.offsetWidth;
      form.classList.add("is-wrong");
      return;
    }
    if (levelNumber === 84) {
      form.classList.remove("is-wrong");
      void form.offsetWidth;
      form.classList.add("is-wrong");
      return;
    }
    if (levelNumber === 86 && (answer === "86" || answer === "eighty six")) {
      const level = form.closest<HTMLElement>('[data-fake-level="86"]');
      if (level) completeFakeLevel(86, level);
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
      const level63 = world.querySelector<HTMLElement>('[data-fake-level="63"]:not(.is-cleared)');
      const level67 = world.querySelector<HTMLElement>('[data-fake-level="67"]:not(.is-cleared)');
      const level83 = world.querySelector<HTMLElement>('[data-fake-level="83"]:not(.is-cleared)');
      const level92 = world.querySelector<HTMLElement>('[data-fake-level="92"]:not(.is-cleared)');
      const level95 = world.querySelector<HTMLElement>('[data-fake-level="95"]:not(.is-cleared)');
      const level98 = world.querySelector<HTMLElement>('[data-fake-level="98"]:not(.is-cleared)');
      const typingInForm = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (key === "b" && level46) completeFakeLevel(46, level46);
      if (key === "s" && level48) completeFakeLevel(48, level48);
      if (key === "e" && level56) completeFakeLevel(56, level56);
      if (key === "t" && level63) completeFakeLevel(63, level63);
      if (event.key === "ArrowRight" && level67) completeFakeLevel(67, level67);
      if (event.key === "ArrowUp" && level95) {
        event.preventDefault();
        completeFakeLevel(95, level95);
      }
      if (level92 && !typingInForm && event.key.length === 1) {
        fake92KeyBuffer = `${fake92KeyBuffer}${event.key.toLowerCase()}`.slice(-14);
        if (fake92KeyBuffer === "quit this game") {
          completeFakeLevel(92, level92);
          fake92KeyBuffer = "";
        }
      }
      if (level98 && !typingInForm && event.key.length === 1) {
        fake98KeyBuffer = `${fake98KeyBuffer}${event.key.toLowerCase()}`.slice(-11);
        if (fake98KeyBuffer === "fatal error") {
          completeFakeLevel(98, level98);
          fake98KeyBuffer = "";
        }
      }
      if (level83 && !typingInForm) {
        fake83KeyBuffer = `${fake83KeyBuffer}${key}`.slice(-6);
        if (fake83KeyBuffer === "hidden") {
          const form = level83.querySelector<HTMLFormElement>('[data-fake-password-form="83"]');
          if (form) {
            form.hidden = false;
            form.querySelector<HTMLInputElement>("input")?.focus();
          }
          fake83KeyBuffer = "";
        }
      }
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
  scenes: [
    { id: "main", label: "Main Screen" },
    ...FAKE_LEVEL_SEQUENCE.map((levelNumber) => ({
      id: `fake-${levelNumber}`,
      label: `Fake Level ${levelNumber}`,
    })),
    { id: "fake-666", label: "Fake Level 666" },
  ],
  mount(context) {
    const { screen, listen, timeout, audio, goToMenu, complete, initialScene } = context;
    const removeCustomCursor = attachCustomCursor(context, {
      source: "cursor/level39.png",
      hotspot: "center",
      rotating: true,
    });
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
// THE MOST COMMONLY USED PASSWORD
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
    if (!xOutput || !yOutput || !sigil || !form || !input || !submit) return removeCustomCursor;

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
        launchFakeLevelWorld(screen, listen, audio, goToMenu, complete);
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

    const requestedFakeLevel = /^fake-(\d+)$/.exec(initialScene ?? "");
    if (requestedFakeLevel) {
      const targetLevel = Number(requestedFakeLevel[1]);
      if (targetLevel === 666 || FAKE_LEVEL_SEQUENCE.includes(targetLevel)) {
        launchFakeLevelWorld(screen, listen, audio, goToMenu, complete, targetLevel);
      }
    }
    return () => {
      audio.stopMusic();
      removeCustomCursor();
    };
  },
};
