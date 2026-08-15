import { AudioManager } from "./AudioManager";
import { assetUrl, SOUND_EFFECTS } from "./assets";
import { InteractionGuard } from "./InteractionGuard";
import { HallOfFameService, type HallOfFameEntry } from "./HallOfFameService";
import { LevelScope } from "./LevelScope";
import { attachStarMaskedInput } from "./StarMaskedInput";
import type { LevelContext } from "./types";
import { getLevel, registeredLevelNumbers } from "../levels/registry";

const DEVELOPMENT_PERIOD = "08/03/2026 – 08/19/2026";
const GAME_VERSION = "1.0.39";
const VERSION_DATE = "08/14/2026";
const DISCORD_URL = "https://discord.gg/txQK3RFfwy";
const WINNER_REPORT_API_URL = import.meta.env.VITE_WINNER_REPORT_API_URL?.trim() || "/api/winner-report";
const ADMIN_OPTION_CODE = "melonsoda84";
const ADMIN_FONT_OPTIONS = [
  { id: "", label: "Default (level design)", family: "" },
  { id: "perpetua", label: "Perpetua", family: '"NELG Perpetua", Perpetua, serif' },
  { id: "courier", label: "Courier", family: '"NELG Courier", Courier, monospace' },
  { id: "arial", label: "Arial", family: '"NELG Arial", Arial, sans-serif' },
  { id: "arial-narrow", label: "Arial Narrow", family: '"NELG Arial Narrow", Arial, sans-serif' },
  { id: "tahoma", label: "Tahoma", family: '"NELG Tahoma", Tahoma, sans-serif' },
  { id: "comic-sans", label: "Comic Sans", family: '"NELG Comic Sans", "Comic Sans MS", cursive' },
  { id: "papyrus", label: "Papyrus", family: '"NELG Papyrus", Papyrus, fantasy' },
  { id: "vivaldi", label: "Vivaldi", family: '"NELG Vivaldi", Vivaldi, cursive' },
  { id: "rockwell", label: "Rockwell", family: '"NELG Rockwell", Rockwell, serif' },
  { id: "cherry-bomb-one", label: "Cherry Bomb One", family: '"NELG Cherry Bomb One", fantasy' },
  { id: "outfit", label: "Outfit", family: '"NELG Outfit", sans-serif' },
  { id: "gowun-batang", label: "Gowun Batang", family: '"NELG Gowun Batang", serif' },
  { id: "itc-kristen", label: "ITC Kristen", family: '"NELG ITC Kristen", cursive' },
  { id: "nexa", label: "Nexa", family: '"NELG Nexa", sans-serif' },
  { id: "wanted-sans", label: "Wanted Sans", family: '"NELG Wanted Sans", sans-serif' },
] as const;
const MINIMUM_LEVEL = -8;
const MAXIMUM_LEVEL = 150;
const PRELOAD_FONTS = [
  "/assets/fonts/perpetua/Perpetua.woff2",
  "/assets/fonts/perpetua/Perpetua-Bold.woff2",
  "/assets/fonts/perpetua/Perpetua-Italic.woff2",
  "/assets/fonts/perpetua/Perpetua-BoldItalic.woff2",
  "/assets/fonts/courier/CourierStd.woff2",
  "/assets/fonts/courier/CourierStd-Bold.woff2",
  "/assets/fonts/courier/CourierStd-Oblique.woff2",
  "/assets/fonts/courier/CourierStd-BoldOblique.woff2",
  "/assets/fonts/arial/ArialMT.woff2",
  "/assets/fonts/arial/Arial-BoldMT.woff2",
  "/assets/fonts/arial/Arial-ItalicMT.woff2",
  "/assets/fonts/arial/Arial-BoldItalicMT.woff2",
  "/assets/fonts/arial/ArialNarrow.woff2",
  "/assets/fonts/arial/ArialNarrow-Bold.woff2",
  "/assets/fonts/arial/ArialNarrow-Italic.woff2",
  "/assets/fonts/arial/ArialNarrow-BoldItalic.woff2",
  "/assets/fonts/tahoma/Tahoma.woff2",
  "/assets/fonts/tahoma/Tahoma-Bold.woff2",
  "/assets/fonts/comicsans/ComicSansMS.woff2",
  "/assets/fonts/comicsans/ComicSansMS-Bold.woff2",
  "/assets/fonts/papyrus/Papyrus V2.woff2",
  "/assets/fonts/vivaldi/Vivaldi.woff2",
  "/assets/fonts/vivaldi/Vivaldi_Bold.woff2",
  "/assets/fonts/rockwell/Rockwell-Regular.woff2",
  "/assets/fonts/rockwell/Rockwell-Bold.woff2",
  "/assets/fonts/cherrybombone/cherry-bomb-one-latin-regular.woff2",
  "/assets/fonts/outfit/outfit-v15-latin-regular.woff2",
  "/assets/fonts/outfit/outfit-v15-latin-700.woff2",
  "/assets/fonts/gowunbatang/gowun-batang-v12-latin-regular.woff2",
  "/assets/fonts/gowunbatang/gowun-batang-v12-latin-700.woff2",
  "/assets/fonts/kristenict/ITC Kristen.woff2",
  "/assets/fonts/nexa/Nexa-Regular.woff2",
  "/assets/fonts/nexa/Nexa-Bold.woff2",
  "/assets/fonts/wantedsans/WantedSansStd-Regular.woff2",
  "/assets/fonts/wantedsans/WantedSansStd-Bold.woff2",
] as const;
const PRELOAD_FONT_REQUESTS = [
  '400 32px "NELG Perpetua"', '700 32px "NELG Perpetua"', 'italic 400 32px "NELG Perpetua"',
  '400 24px "NELG Courier"', '700 24px "NELG Courier"', 'italic 400 24px "NELG Courier"',
  '400 24px "NELG Arial"', '700 24px "NELG Arial"', 'italic 400 24px "NELG Arial"',
  '400 24px "NELG Arial Narrow"', '700 24px "NELG Arial Narrow"',
  '400 24px "NELG Tahoma"', '700 24px "NELG Tahoma"',
  '400 24px "NELG Comic Sans"', '700 24px "NELG Comic Sans"',
  '400 24px "NELG Papyrus"', '700 24px "NELG Papyrus"',
  '400 32px "NELG Vivaldi"', '700 32px "NELG Vivaldi"',
  '400 32px "NELG Rockwell"', '700 32px "NELG Rockwell"',
  '400 32px "NELG Cherry Bomb One"',
  '400 32px "NELG Outfit"', '700 32px "NELG Outfit"',
  '400 32px "NELG Gowun Batang"', '700 32px "NELG Gowun Batang"',
  '400 32px "NELG ITC Kristen"',
  '400 32px "NELG Nexa"', '700 32px "NELG Nexa"',
  '400 32px "NELG Wanted Sans"', '700 32px "NELG Wanted Sans"',
] as const;
const PRELOAD_IMAGES = [
  "/assets/images/level16-cafe.png",
  "/assets/images/level18-paint.png",
  "/assets/images/level9a.png",
  "/assets/images/level20a.png",
  "/assets/images/level20b.png",
  "/assets/images/level21a.jpg",
  "/assets/images/level22a.png",
  "/assets/images/level25a.png",
  "/assets/images/level25b.png",
  "/assets/images/level25c.png",
  "/assets/images/132.jpg",
  "/assets/images/cheesus.gif",
  "/assets/images/clippy.gif",
  "/assets/images/Mr_gear.gif",
  "/assets/images/sirchair.png",
  "/assets/images/level31a.png",
  "/assets/images/level31b.png",
  "/assets/images/level31c.png",
  "/assets/images/level31d.png",
  "/assets/images/level31e.png",
  "/assets/images/level31f.png",
  "/assets/images/level31g.png",
  "/assets/images/level31h.png",
  "/assets/images/level31i.png",
  "/assets/images/level31j.png",
  "/assets/images/level31k.png",
  "/assets/images/level31l.png",
  "/assets/images/red_1.png",
  "/assets/images/red_2.png",
  "/assets/images/red_3.png",
  "/assets/images/red_4.png",
  "/assets/images/red_5.png",
  "/assets/images/red_6.png",
  "/assets/images/Steve.gif",
  "/assets/images/level32bg1.jpg",
  "/assets/images/level32bg2.jpg",
  "/assets/images/level32bg3.jpg",
  "/assets/images/level32bg4.jpg",
  "/assets/images/level32bg5.jpg",
  "/assets/images/level32bg6.jpg",
  "/assets/images/level32bg7.png",
  "/assets/images/warp.png",
  "/assets/images/spacebg.png?v=20260813",
  "/assets/images/level33a.png",
  "/assets/images/level33b.png",
  "/assets/images/level33c.png",
  "/assets/images/level33d.png",
  "/assets/images/level33e.png",
  "/assets/images/level33f.png",
  "/assets/images/level33g.png",
  "/assets/images/level33h.png",
  "/assets/images/level33i.png",
  "/assets/images/level33j.png",
  "/assets/images/level33k.png",
  "/assets/images/level35bg1.png",
  "/assets/images/level35phase4a.png",
  "/assets/images/level35phase4b.png",
  "/assets/images/level35phase4c.png",
  "/assets/images/level35phase4d.png",
  "/assets/images/level35phase4e.png",
  "/assets/images/level35phase4f.png",
  "/assets/images/level35phase10.png",
].map(assetUrl);
const PRELOAD_EFFECTS = [SOUND_EFFECTS.pop, SOUND_EFFECTS.smack] as const;
const MINIMUM_PRELOADER_TIME = 700;
const JUMPABLE_LEVELS = [
  8, 14, 19, 22, 25, 29, 32, 35, 39, 42, 46, 50, 55, 58, 61, 65, 69, 74, 78, 81, 84, 87, 91, 94, 97,
] as const;
const WARP_CHECKPOINTS: Readonly<Record<number, { message: string; password: string }>> = {
  8: {
    message:
      "Welcome to the first Warp Zone! This game has a level warp system so that you can take a short break along the way. Enter the Warp Zone from the main menu and type the password for the corresponding level to return to this screen. The password is written below. Now, continue your journey...",
    password: "teleport",
  },
  14: {
    message:
      "Getting this far probably wasn't too difficult. But starting with the next level, plenty of nasty puzzles will be waiting to torment you. Stay calm and keep moving forward...",
    password: "not hidden",
  },
  19: {
    message:
      "You have probably encountered quite a few tricky levels by now. But starting with the next level, the true NELG-style levels begin. They will take a great deal of time, and you will have to keep fighting yourself. Good luck...",
    password: "by Clarence",
  },
  22: {
    message:
      "Level 21 and Level 22 gave you a taste of this game's puzzle style. Even more vicious levels are coming, so be prepared. From now on, the levels will not give you direct hints. Make good use of methods you have learned before and the clues hidden on the screen! If it gets too difficult, visit the Help Section on the Discord server from the main menu...",
    password: "70.7billion",
  },
  25: {
    message:
      "Did you enjoy the painful maze level? Now I will show you difficulty that will make you want to give up for good. Before that... I prepared some simple puzzles to cool your brain. Since this is a special breather section, nothing should be difficult if you squeeze your brain hard enough. The journey of pain continues...",
    password: "NTG255",
  },
  29: {
    message:
      'The next section will raise you to a state of enlightenment. "The longer you endure, the deeper your inner self becomes, and the more wounds you withstand, the richer the fragrance of your soul grows..."',
    password: "perhaptation.json",
  },
  32: {
    message:
      "Congratulations! You have completed your first platformer level. Your next destination is the second Reunion level. Extremely difficult and cryptic levels are waiting for you, so prepare yourself to enjoy the anguish...",
    password: "cacophony",
  },
  35: {
    message:
      "Perfect... Wonderful... Beautiful!! But for those of you who are not satisfied even with puzzles this difficult, I have prepared levels in even stranger forms! From now on, I will truly show you the full extent of my wasted time...",
    password: "*philodox*",
  },
};

export class Game {
  private readonly audioManager = new AudioManager();
  private readonly hallOfFame = new HallOfFameService();
  private readonly interactionGuard = new InteractionGuard();
  private readonly debugMode = new URLSearchParams(location.search).get("debug") === "1";
  private currentLevel = 1;
  private scope?: LevelScope;
  private mainMenuCleanup?: () => void;
  private transitioning = false;
  private adminTitleFont = "";
  private adminSubtitleFont = "";

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    this.interactionGuard.enable();
    void this.runPreloader();
  }

  private async runPreloader(): Promise<void> {
    this.root.innerHTML = `
      <main class="game-frame preloader" aria-label="Loading Never Ending Level Game Plus Plus">
        <div class="preloader__content">
          <p class="preloader__kicker">WELCOME TO THE</p>
          <h1>Never Ending Level Game <span>++</span></h1>
          <p class="preloader__status">LOADING GAME ASSETS</p>
          <div class="preloader__track" role="progressbar" aria-label="Loading progress"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="preloader__bar"></div>
          </div>
          <output class="preloader__percentage" aria-live="polite">0%</output>
        </div>
      </main>
    `;

    const progress = this.root.querySelector<HTMLElement>(".preloader__track");
    const bar = this.root.querySelector<HTMLElement>(".preloader__bar");
    const percentage = this.root.querySelector<HTMLOutputElement>(".preloader__percentage");
    let loadedAssets = 0;

    const updateProgress = () => {
      const totalAssets = PRELOAD_FONTS.length + PRELOAD_IMAGES.length + PRELOAD_EFFECTS.length;
      const value = Math.round((loadedAssets / totalAssets) * 100);
      if (progress) progress.setAttribute("aria-valuenow", String(value));
      if (bar) bar.style.width = `${value}%`;
      if (percentage) percentage.value = `${value}%`;
    };

    const markLoaded = () => {
      loadedAssets += 1;
      updateProgress();
    };

    const preloadFontFiles = Promise.all(
      PRELOAD_FONTS.map(async (source) => {
        try {
          const response = await fetch(assetUrl(source), { cache: "force-cache" });
          if (response.ok) await response.arrayBuffer();
        } catch {
          // A missing optional font should not prevent the game from starting.
        } finally {
          markLoaded();
        }
      }),
    );

    const preloadImages = Promise.all(
      PRELOAD_IMAGES.map(async (source) => {
        try {
          const image = new Image();
          image.decoding = "async";
          image.src = source;
          await image.decode();
        } catch {
          // A missing optional image should not prevent the game from starting.
        } finally {
          markLoaded();
        }
      }),
    );

    const preloadEffects = this.audioManager.preloadEffects(PRELOAD_EFFECTS).finally(() => {
      loadedAssets += PRELOAD_EFFECTS.length;
      updateProgress();
    });
    const minimumDisplayTime = new Promise<void>((resolve) => window.setTimeout(resolve, MINIMUM_PRELOADER_TIME));

    await Promise.all([preloadFontFiles, preloadImages, preloadEffects]);
    await Promise.all(PRELOAD_FONT_REQUESTS.map((font) => document.fonts.load(font)));
    await Promise.all([document.fonts.ready, minimumDisplayTime]);
    this.renderMainMenu();
  }

  private renderMainMenu(): void {
    this.disposeCurrentLevel();
    this.audioManager.stopMusic();
    this.root.innerHTML = `
      <main class="game-frame main-menu" aria-label="Never Ending Level Game Plus Plus main menu">
        <div class="main-menu__glow" aria-hidden="true"></div>
        <section class="main-menu__identity">
          <p class="main-menu__kicker">WELCOME TO THE</p>
          <h1>Never Ending Level Game <span>++</span></h1>
          <div class="main-menu__parade" aria-hidden="true"></div>
          <p class="main-menu__description">
            This game is a sequel to Clarence Ball’s <em>Never Ending Level Game</em>, which was released in 2005.
            It was created by blending elements from that game and its fan games (<em>Level Killer</em> and
            <em>TEDNE</em>) to let players experience the thrill of the original once again. You must complete
            150 levels while battling against the time and overcoming the game’s ruthless difficulty.
          </p>
          <p class="main-menu__continuation">
            This game is a continuation of the test of knowledge, patience and perhaps more stuff and I am
            reflecting myself for making the difficulty of the things ruthless, of the puzzles, or not puzzles...
          </p>
          <dl class="main-menu__facts">
            <div>
              <dt>LEVELS INCLUDED</dt>
              <dd>${registeredLevelNumbers.length} / ${MAXIMUM_LEVEL}</dd>
            </div>
            <div>
              <dt>DEVELOPMENT</dt>
              <dd>${DEVELOPMENT_PERIOD}</dd>
            </div>
            <div>
              <dt>VERSION</dt>
              <dd>${GAME_VERSION} · ${VERSION_DATE}</dd>
            </div>
          </dl>
        </section>

        <nav class="main-menu__buttons" aria-label="Main menu">
          <button class="menu-button menu-button--primary" data-menu-action="start" type="button">
            START GAME
          </button>
          <button class="menu-button" data-menu-action="warp" type="button">
            WARP ZONE
          </button>
          <button class="menu-button" data-menu-action="credits" type="button">
            CREDITS
          </button>
          <button class="menu-button" data-menu-action="hall" type="button">
            HALL OF FAME
          </button>
          <button class="menu-button menu-button--discord" data-menu-action="discord" type="button">
            DISCORD
          </button>
          <button class="menu-button" data-menu-action="options" type="button">
            OPTIONS
          </button>
        </nav>
      </main>
    `;

    this.startMainMenuParade();

    this.root.querySelector<HTMLElement>(".main-menu__buttons")?.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button[data-menu-action]");
      if (!button) return;

      switch (button.dataset.menuAction) {
        case "start":
          this.showLevel(1);
          break;
        case "warp":
          this.renderWarpZone();
          break;
        case "credits":
          this.renderCredits();
          break;
        case "hall":
          this.renderHallOfFame();
          break;
        case "discord":
          this.openDiscord();
          break;
        case "options":
          this.renderOptions();
          break;
      }
    });
  }

  private startMainMenuParade(): void {
    const parade = this.root.querySelector<HTMLElement>(".main-menu__parade");
    if (!parade) return;

    const sprites = [
      { source: "images/Steve.gif", label: "Steve", reverseFacing: true },
      { source: "images/Mr_gear.gif", label: "Mr. Gear", rolls: true },
      { source: "images/sirchair.png", label: "Sir Chair" },
      { source: "images/red_2.png", alternateSource: "images/red_3.png", label: "Red Guy" },
      { source: "images/cheesus.gif", label: "Cheesus", reverseFacing: true },
      { source: "images/clippy.gif", label: "Clippy" },
      { source: "images/level18-paint.png", label: "Paint" },
      { source: "images/level25a.png", label: "Puzzle piece" },
    ] as const;
    const timeoutIds = new Set<number>();
    const intervalIds = new Set<number>();
    const animations = new Set<Animation>();
    let disposed = false;

    const removeSprite = (item: HTMLElement, animation?: Animation, frameTimer?: number): void => {
      if (animation) animations.delete(animation);
      if (frameTimer !== undefined) {
        window.clearInterval(frameTimer);
        intervalIds.delete(frameTimer);
      }
      item.remove();
    };

    const spawnSprite = (): void => {
      if (disposed) return;
      const sprite = sprites[Math.floor(Math.random() * sprites.length)] ?? sprites[0];
      const item = document.createElement("span");
      const image = document.createElement("img");
      const movingRight = Math.random() >= 0.5;
      const facingRight = "reverseFacing" in sprite ? !movingRight : movingRight;
      const spriteHeight = 38 + Math.round(Math.random() * 14);

      item.className = "main-menu__parade-item";
      item.style.bottom = `${Math.round(Math.random() * 6)}px`;
      image.src = assetUrl(sprite.source);
      image.alt = sprite.label;
      image.draggable = false;
      image.style.height = `${spriteHeight}px`;
      image.style.setProperty("--main-menu-sprite-facing", facingRight ? "1" : "-1");
      if ("rolls" in sprite) {
        item.classList.add("main-menu__parade-item--gear");
        image.style.setProperty("--main-menu-gear-rotation", movingRight ? "1turn" : "-1turn");
      }
      item.append(image);
      parade.append(item);

      let frameTimer: number | undefined;
      if ("alternateSource" in sprite) {
        let alternateFrame = false;
        frameTimer = window.setInterval(() => {
          alternateFrame = !alternateFrame;
          image.src = assetUrl(alternateFrame ? sprite.alternateSource : sprite.source);
        }, 180);
        intervalIds.add(frameTimer);
      }

      const padding = 72;
      const start = movingRight ? -padding : parade.clientWidth + padding;
      const end = movingRight ? parade.clientWidth + padding : -padding;
      const duration = 4800 + Math.round(Math.random() * 4000);
      const animation = item.animate(
        [{ transform: `translateX(${start}px)` }, { transform: `translateX(${end}px)` }],
        { duration, easing: "linear" },
      );
      animations.add(animation);
      void animation.finished
        .then(() => removeSprite(item, animation, frameTimer))
        .catch(() => removeSprite(item, animation, frameTimer));
    };

    const scheduleNextSprite = (): void => {
      if (disposed) return;
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId);
        spawnSprite();
        scheduleNextSprite();
      }, 1800 + Math.round(Math.random() * 1600));
      timeoutIds.add(timeoutId);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const image = document.createElement("img");
      const sprite = sprites[Math.floor(Math.random() * sprites.length)] ?? sprites[0];
      image.className = "main-menu__parade-static";
      image.src = assetUrl(sprite.source);
      image.alt = sprite.label;
      parade.append(image);
    } else {
      spawnSprite();
      scheduleNextSprite();
    }

    this.mainMenuCleanup = () => {
      disposed = true;
      timeoutIds.forEach((id) => window.clearTimeout(id));
      intervalIds.forEach((id) => window.clearInterval(id));
      animations.forEach((animation) => animation.cancel());
      timeoutIds.clear();
      intervalIds.clear();
      animations.clear();
      parade.replaceChildren();
    };
  }

  private renderWarpZone(): void {
    const levelButtons = JUMPABLE_LEVELS
      .map(
        (number) => `
          <button class="level-jump__button${number === this.currentLevel ? " is-current" : ""}"
            type="button" data-level-number="${number}">
            ${number}
          </button>`,
      )
      .join("");

    this.renderMenuPage(
      "Warp Zone",
      `<p class="menu-page__intro">Choose a level to warp to.</p>
       <div class="level-jump">${levelButtons}</div>`,
    );

    let warpSelectionPending = false;
    this.root.querySelector<HTMLElement>(".level-jump")?.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button[data-level-number]");
      if (!button || warpSelectionPending) return;
      const levelNumber = Number(button.dataset.levelNumber);
      if (!JUMPABLE_LEVELS.some((number) => number === levelNumber)) return;

      warpSelectionPending = true;
      button.classList.add("is-activating");
      const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
      window.setTimeout(() => {
        if (button.isConnected) this.renderWarpGate(levelNumber);
      }, delay);
    });
  }

  private renderWarpGate(levelNumber: number): void {
    const warpIndex = JUMPABLE_LEVELS.findIndex((number) => number === levelNumber);
    if (warpIndex < 0) {
      this.renderWarpZone();
      return;
    }

    const warpNumber = String(warpIndex + 1).padStart(2, "0");
    const checkpoint = WARP_CHECKPOINTS[levelNumber];
    this.disposeCurrentLevel();
    this.audioManager.stopMusic();
    this.root.innerHTML = `
      <main class="game-frame warp-gate" aria-label="Level ${levelNumber}, Warp Zone ${warpNumber}">
        <header class="warp-gate__heading">
          <h1>Level ${levelNumber}</h1>
          <p>Warp Zone ${warpNumber}</p>
        </header>

        <form class="warp-gate__form" aria-label="Warp password">
          <input class="nelg-password-input" data-allow-select data-form-type="other"
            data-lpignore="true" data-1p-ignore="true" type="text" maxlength="32"
            aria-label="Warp password" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" spellcheck="false" ${checkpoint ? "" : "disabled"} />
          <button type="${checkpoint ? "submit" : "button"}" ${checkpoint ? "" : "disabled"}>GO</button>
        </form>
        <p class="warp-gate__feedback" role="status" aria-live="polite"></p>

        <button class="warp-gate__back" type="button">Back</button>
      </main>
    `;

    if (checkpoint) {
      const form = this.root.querySelector<HTMLFormElement>(".warp-gate__form");
      const input = this.root.querySelector<HTMLInputElement>(".warp-gate__form input");
      const feedback = this.root.querySelector<HTMLElement>(".warp-gate__feedback");
      const gateListen: LevelContext["listen"] = (target, type, listener, options = {}) => {
        target.addEventListener(type, listener as EventListener, options);
      };
      const maskedInput = input ? attachStarMaskedInput(input, gateListen) : undefined;
      input?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        form?.requestSubmit();
      });
      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!input) return;
        if (maskedInput?.getValue() === checkpoint.password) {
          this.renderWarpCheckpoint(levelNumber);
          return;
        }

        maskedInput?.clear();
        input.classList.remove("is-wrong");
        void input.offsetWidth;
        input.classList.add("is-wrong");
        if (feedback) feedback.textContent = "INCORRECT PASSWORD";
        input.focus();
      });
    }

    this.root
      .querySelector<HTMLButtonElement>(".warp-gate__back")
      ?.addEventListener("click", () => this.renderWarpZone(), { once: true });
  }

  private renderWarpCheckpoint(levelNumber: number): void {
    const checkpoint = WARP_CHECKPOINTS[levelNumber];
    const warpIndex = JUMPABLE_LEVELS.findIndex((number) => number === levelNumber);
    if (!checkpoint || warpIndex < 0) {
      this.renderWarpZone();
      return;
    }

    const warpNumber = String(warpIndex + 1).padStart(2, "0");
    this.disposeCurrentLevel();
    this.audioManager.stopMusic();
    this.transitioning = false;
    this.root.innerHTML = `
      <main class="game-frame warp-gate warp-checkpoint"
        aria-label="Level ${levelNumber}, Warp Zone ${warpNumber} checkpoint">
        <header class="warp-gate__heading">
          <h1>Level ${levelNumber}</h1>
          <p>Warp Zone ${warpNumber}</p>
        </header>

        <p class="warp-checkpoint__message">${checkpoint.message}</p>
        <button class="warp-checkpoint__next" type="button">Next</button>
        <strong class="warp-checkpoint__password">${checkpoint.password}</strong>
      </main>
    `;

    this.root
      .querySelector<HTMLButtonElement>(".warp-checkpoint__next")
      ?.addEventListener("click", () => {
        if (levelNumber === 35) this.renderLevel35Winner();
        else this.showLevel(levelNumber + 1);
      }, { once: true });
  }

  private renderCredits(): void {
    this.renderMenuPage(
      "Credits",
      `<div class="credits-list">
         <section class="credits-section">
           <h2>CREATORS</h2>
           <article class="credits-person"><h3>Dizzt <span>(dizzt3942)</span></h3><p>Former winner of NELG Level 300 and creator of Level Killer.</p><p>One of the minds responsible for the puzzles in this painful game.</p></article>
           <article class="credits-person"><h3>Perhaptation <span>(highstrike300)</span></h3><p>Former winner of NELG Level 300 and creator of TEDNE.</p><p>One of the minds responsible for the puzzles in this painful game.</p></article>
         </section>
         <section class="credits-section">
           <h2>SPECIAL THANKS</h2>
           <article class="credits-person"><h3>C-Tall Ball</h3><p>The original creator of NELG, who kindly allowed derivative works. Most of this game's designs and ideas pay homage to NELG, making him a truly extraordinary person!</p></article>
           <article class="credits-person"><h3>Dapur <span>(bumchiDP)</span></h3><p>Former winner of NELG Level 300 and creator of Level Killer.</p><p>Although he could not participate in NELG++, some levels still feature his puzzles!</p></article>
           <article class="credits-person"><h3>NTG</h3><p>Former winner of NELG Level 300.</p><p>Although he could not participate in NELG++, he tested Level Killer and TEDNE and contributed ideas long ago. Some of his unrealized ideas have finally appeared in NELG++.</p></article>
           <article class="credits-person"><h3>ArgentumB <span>(dmsql3935)</span></h3><p>Former winner of NELG Level 300 and creator of Level Killer.</p><p>Although she could not participate in NELG++, some levels still feature her vicious puzzles!</p></article>
           <article class="credits-person"><h3>Kukui <span>(kukui91)</span></h3><p>Former winner of NELG Level 300 and creator of Level Killer.</p><p>Although she could not participate in NELG++, some levels still feature her vicious puzzles!</p></article>
         </section>
         <section class="credits-section">
           <h2>BETA TESTERS</h2>
           <ul class="credits-names">
             <li>ArgentumB <span>(dmsql3935)</span></li>
             <li>Kukui <span>(kukui91)</span></li>
             <li>decing <span>(jw29674)</span></li>
             <li>Bin <span>(monteeplayer)</span></li>
             <li>Confringo</li>
             <li>Sierra</li>
             <li>Lunaris</li>
             <li>mutsuki</li>
           </ul>
         </section>
         <section class="credits-section">
           <h2>MUSIC USED</h2>
           <article class="credits-track"><span>LEVEL 32</span><strong>Final Doom — M08: Into the Beast's Belly</strong></article>
         </section>
       </div>`,
    );
  }

  private renderHallOfFame(): void {
    this.renderMenuPage(
      "Hall of Fame",
      `<p class="menu-page__intro">Ranked by the time each winner reached the finish.</p>
       <div class="hall-list" id="hall-list" aria-live="polite"><p>LOADING...</p></div>`,
    );
    const list = this.root.querySelector<HTMLElement>("#hall-list");
    void this.hallOfFame.list().then((entries) => {
      if (!list?.isConnected) return;
      this.populateHallOfFame(list, entries);
    }).catch((error: unknown) => {
      if (list?.isConnected) list.textContent = error instanceof Error ? error.message : "Unable to load the Hall of Fame.";
    });
  }

  private populateHallOfFame(container: HTMLElement, entries: HallOfFameEntry[]): void {
    container.replaceChildren();
    if (entries.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "NO ENTRIES YET";
      container.append(empty);
      return;
    }
    entries.forEach((entry, index) => {
      const article = document.createElement("article");
      article.className = "hall-entry";
      const rank = document.createElement("strong");
      rank.className = "hall-entry__rank";
      rank.textContent = `#${index + 1}`;
      const body = document.createElement("div");
      const name = document.createElement("h2");
      name.textContent = entry.nickname;
      const time = document.createElement("time");
      time.dateTime = entry.achievedAt;
      time.textContent = this.formatUtcTimestamp(new Date(entry.achievedAt));
      const message = document.createElement("p");
      message.textContent = entry.message || "—";
      body.append(name, time, message);
      article.append(rank, body);
      container.append(article);
    });
  }

  private renderLevel35Winner(): void {
    this.disposeCurrentLevel();
    this.audioManager.stopMusic();
    const arrivedAt = new Date();
    this.root.innerHTML = `
      <main class="game-frame winner-screen" aria-label="Level 35 Winner">
        <p class="winner-screen__kicker">LEVEL 35 WINNER</p>
        <h1>Congratulations!</h1>
        <div class="winner-screen__message">
          <p>Congratulations!!! You have won all <strong class="winner-screen__level-count">35</strong> levels in this game. Complete the short form below to submit your name to the Hall of Fame. Please note that it may take some time for your entry to appear in an update.</p>
          <p>Enter your nickname and a message you would like to leave, and they may be permanently preserved in the Hall of Fame!</p>
          <p>To discourage bug abuse, a secret password has been hidden somewhere you can discover naturally while playing the game. Please enter it in the Hidden Password field.</p>
          <p>More levels will be added in the future, so take a well-earned break and meet us again after the next update. Thank you from the bottom of our hearts for playing this game!!!</p>
        </div>
        <form class="winner-report" autocomplete="off">
          <label>Nickname
            <input name="nickname" maxlength="32" required data-allow-select autocomplete="off" />
          </label>
          <label>Arrival time (UTC)
            <input value="${this.formatUtcTimestamp(arrivedAt)}" readonly tabindex="-1" />
          </label>
          <label>Game version
            <input value="${GAME_VERSION}" readonly tabindex="-1" />
          </label>
          <label class="winner-report__secret">Hidden password
            <input name="hiddenPassword" type="password" maxlength="64" required data-allow-select
              data-form-type="other" data-lpignore="true" data-1p-ignore="true"
              autocomplete="off" autocapitalize="off" spellcheck="false" />
          </label>
          <label class="winner-report__message">Message
            <textarea name="message" maxlength="240" rows="3" data-allow-select></textarea>
          </label>
          <button type="submit">SEND WINNER REPORT</button>
          <p class="winner-report__status" role="status" aria-live="polite"></p>
        </form>
        <button class="winner-screen__hall" type="button">VIEW HALL OF FAME</button>
        <button class="winner-screen__menu" type="button">MAIN MENU</button>
      </main>`;
    const reportForm = this.root.querySelector<HTMLFormElement>(".winner-report");
    const reportStatus = this.root.querySelector<HTMLElement>(".winner-report__status");
    reportForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const submit = reportForm.querySelector<HTMLButtonElement>('button[type="submit"]');
      const data = new FormData(reportForm);
      if (submit) submit.disabled = true;
      if (reportStatus) reportStatus.textContent = "SENDING...";
      void fetch(WINNER_REPORT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nickname: String(data.get("nickname") ?? ""),
          gameVersion: GAME_VERSION,
          hiddenPassword: String(data.get("hiddenPassword") ?? ""),
          message: String(data.get("message") ?? ""),
        }),
      }).then(async (response) => {
        const payload = await response.json().catch(() => ({})) as { message?: string };
        if (!response.ok) {
          const missingLocalApi = response.status === 404 && /^https?:\/\/(?:127\.0\.0\.1|localhost):5173\b/.test(location.origin);
          throw new Error(payload.message || (missingLocalApi
            ? "WINNER REPORT API IS NOT RUNNING. USE VERCEL DEV OR SET VITE_WINNER_REPORT_API_URL."
            : `Report failed (${response.status}).`));
        }
        if (reportStatus?.isConnected) reportStatus.textContent = "REPORT SENT. THE ADMINISTRATOR WILL REVIEW IT.";
        reportForm.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((field) => { field.disabled = true; });
      }).catch((error: unknown) => {
        if (submit?.isConnected) submit.disabled = false;
        if (reportStatus?.isConnected) reportStatus.textContent = error instanceof Error ? error.message : "REPORT FAILED.";
      });
    });
    this.root.querySelector<HTMLButtonElement>(".winner-screen__hall")?.addEventListener("click", () => this.renderHallOfFame(), { once: true });
    this.root.querySelector<HTMLButtonElement>(".winner-screen__menu")?.addEventListener("click", () => this.renderMainMenu(), { once: true });
  }

  private formatUtcTimestamp(value: Date): string {
    const pad = (number: number) => String(number).padStart(2, "0");
    return `${pad(value.getUTCMonth() + 1)}/${pad(value.getUTCDate())}/${value.getUTCFullYear()} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`;
  }

  private openDiscord(): void {
    if (DISCORD_URL) {
      window.open(DISCORD_URL, "_blank", "noopener,noreferrer");
      return;
    }

    this.renderMenuPage(
      "Discord",
      `<div class="empty-panel">
         <p>INVITE LINK NOT CONFIGURED</p>
         <span>Add the server address to <code>DISCORD_URL</code> when it is ready.</span>
       </div>`,
    );
  }

  private renderOptions(): void {
    const fontOptions = (selected: string) => ADMIN_FONT_OPTIONS.map((font) =>
      `<option value="${font.id}"${font.id === selected ? " selected" : ""}>${font.label}</option>`,
    ).join("");
    this.renderMenuPage(
      "Options",
      `<div class="options-panel">
         <div class="options-panel__audio-row">
           <label class="options-panel__toggle">
             <span>MUSIC</span>
             <input id="music-option" type="checkbox" ${this.audioManager.musicEnabled ? "checked" : ""} />
           </label>
           <span class="options-panel__volume-controls">
             <input id="music-volume-range" type="range" min="0" max="100" step="1"
               value="${this.audioManager.musicVolume}" aria-label="Music volume" />
             <input id="music-volume-number" type="number" min="0" max="100" step="1"
               value="${this.audioManager.musicVolume}" aria-label="Music volume percentage" autocomplete="off" />
             <span aria-hidden="true">%</span>
           </span>
         </div>
         <div class="options-panel__audio-row">
           <label class="options-panel__toggle">
             <span>SFX</span>
             <input id="effects-option" type="checkbox" ${this.audioManager.effectsEnabled ? "checked" : ""} />
           </label>
           <span class="options-panel__volume-controls">
             <input id="effects-volume-range" type="range" min="0" max="100" step="1"
               value="${this.audioManager.effectsVolume}" aria-label="SFX volume" />
             <input id="effects-volume-number" type="number" min="0" max="100" step="1"
               value="${this.audioManager.effectsVolume}" aria-label="SFX volume percentage" autocomplete="off" />
             <span aria-hidden="true">%</span>
           </span>
         </div>
         <section class="admin-panel" id="admin-panel" hidden>
           <p>ADMIN CONSOLE</p>
           <form id="admin-level-form">
             <label><span>LEVEL</span>
               <input id="admin-level-number" type="number" min="${MINIMUM_LEVEL}" max="${MAXIMUM_LEVEL}"
                 step="1" placeholder="-8 to 150" aria-label="Admin level number" autocomplete="off" />
             </label>
             <label><span>SCENE</span>
               <select id="admin-scene" aria-label="Admin scene" disabled>
                 <option value="">Default</option>
               </select>
             </label>
             <button type="submit">GO</button>
           </form>
           <span id="admin-level-feedback" role="status"></span>
           <div class="admin-panel__fonts">
             <p>HEADING FONT OVERRIDE</p>
             <label><span>LEVEL TITLE</span>
               <select id="admin-title-font" aria-label="Admin level title font">${fontOptions(this.adminTitleFont)}</select>
             </label>
             <label><span>SUBTITLE</span>
               <select id="admin-subtitle-font" aria-label="Admin subtitle font">${fontOptions(this.adminSubtitleFont)}</select>
             </label>
           </div>
         </section>
       </div>`,
    );
    this.root.querySelector<HTMLElement>(".menu-page")?.classList.add("menu-page--options");

    this.root.querySelector<HTMLInputElement>("#music-option")?.addEventListener("change", (event) => {
      this.audioManager.setMusicEnabled((event.currentTarget as HTMLInputElement).checked);
    });
    this.root.querySelector<HTMLInputElement>("#effects-option")?.addEventListener("change", (event) => {
      this.audioManager.setEffectsEnabled((event.currentTarget as HTMLInputElement).checked);
    });

    const bindVolumeControls = (
      rangeSelector: string,
      numberSelector: string,
      setter: (volume: number) => void,
    ) => {
      const range = this.root.querySelector<HTMLInputElement>(rangeSelector);
      const number = this.root.querySelector<HTMLInputElement>(numberSelector);
      const applyVolume = (value: number) => {
        if (!Number.isFinite(value)) return;
        const normalizedVolume = Math.round(Math.min(100, Math.max(0, value)));
        setter(normalizedVolume);
        if (range) range.value = String(normalizedVolume);
        if (number) number.value = String(normalizedVolume);
      };
      range?.addEventListener("input", () => applyVolume(range.valueAsNumber));
      number?.addEventListener("input", () => applyVolume(number.valueAsNumber));
      number?.addEventListener("change", () => applyVolume(number.valueAsNumber));
    };
    bindVolumeControls("#music-volume-range", "#music-volume-number", (volume) =>
      this.audioManager.setMusicVolume(volume),
    );
    bindVolumeControls("#effects-volume-range", "#effects-volume-number", (volume) =>
      this.audioManager.setEffectsVolume(volume),
    );

    const adminPanel = this.root.querySelector<HTMLElement>("#admin-panel");
    const adminForm = this.root.querySelector<HTMLFormElement>("#admin-level-form");
    const adminInput = this.root.querySelector<HTMLInputElement>("#admin-level-number");
    const adminScene = this.root.querySelector<HTMLSelectElement>("#admin-scene");
    const adminFeedback = this.root.querySelector<HTMLElement>("#admin-level-feedback");
    const adminTitleFont = this.root.querySelector<HTMLSelectElement>("#admin-title-font");
    const adminSubtitleFont = this.root.querySelector<HTMLSelectElement>("#admin-subtitle-font");
    const optionsController = new AbortController();
    let adminCodeBuffer = "";

    window.addEventListener(
      "keydown",
      (event) => {
        if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
        adminCodeBuffer = `${adminCodeBuffer}${event.key.toLowerCase()}`.slice(-ADMIN_OPTION_CODE.length);
        if (adminCodeBuffer !== ADMIN_OPTION_CODE || !adminPanel || !adminInput) return;

        event.preventDefault();
        adminPanel.hidden = false;
        adminCodeBuffer = "";
        adminInput.focus();
      },
      { signal: optionsController.signal },
    );

    this.root.querySelector<HTMLButtonElement>("#menu-back")?.addEventListener(
      "click",
      () => optionsController.abort(),
      { once: true },
    );

    adminInput?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      adminForm?.requestSubmit();
    });

    const updateAdminScenes = () => {
      if (!adminInput || !adminScene) return;
      const scenes = Number.isInteger(adminInput.valueAsNumber)
        ? getLevel(adminInput.valueAsNumber)?.scenes ?? []
        : [];
      adminScene.replaceChildren();
      if (scenes.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No scene selection";
        adminScene.append(option);
      } else {
        scenes.forEach((scene) => {
          const option = document.createElement("option");
          option.value = scene.id;
          option.textContent = scene.label;
          adminScene.append(option);
        });
      }
      adminScene.disabled = scenes.length === 0;
    };
    adminInput?.addEventListener("input", updateAdminScenes);
    adminInput?.addEventListener("change", updateAdminScenes);

    const changeFont = () => {
      this.adminTitleFont = adminTitleFont?.value ?? "";
      this.adminSubtitleFont = adminSubtitleFont?.value ?? "";
      this.applyAdminFontOverrides();
    };
    adminTitleFont?.addEventListener("change", changeFont);
    adminSubtitleFont?.addEventListener("change", changeFont);

    adminForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!adminInput || !adminFeedback) return;

      const levelNumber = adminInput.valueAsNumber;
      if (!Number.isInteger(levelNumber) || levelNumber < MINIMUM_LEVEL || levelNumber > MAXIMUM_LEVEL) {
        adminFeedback.textContent = `ENTER A WHOLE NUMBER FROM ${MINIMUM_LEVEL} TO ${MAXIMUM_LEVEL}.`;
        adminInput.select();
        return;
      }

      optionsController.abort();
      this.showLevel(levelNumber, adminScene?.value || undefined);
    });
  }

  private applyAdminFontOverrides(): void {
    const title = ADMIN_FONT_OPTIONS.find((font) => font.id === this.adminTitleFont)?.family ?? "";
    const subtitle = ADMIN_FONT_OPTIONS.find((font) => font.id === this.adminSubtitleFont)?.family ?? "";
    if (title) this.root.style.setProperty("--admin-level-title-font", title);
    else this.root.style.removeProperty("--admin-level-title-font");
    if (subtitle) this.root.style.setProperty("--admin-level-subtitle-font", subtitle);
    else this.root.style.removeProperty("--admin-level-subtitle-font");
    this.root.classList.toggle("admin-title-font-override", Boolean(title));
    this.root.classList.toggle("admin-subtitle-font-override", Boolean(subtitle));
  }

  private renderMenuPage(title: string, content: string): void {
    this.disposeCurrentLevel();
    this.root.innerHTML = `
      <main class="game-frame menu-page">
        <div class="menu-page__topline">NEVER ENDING LEVEL GAME ++</div>
        <h1>${title}</h1>
        <section class="menu-page__content">${content}</section>
        <button class="menu-page__back" id="menu-back" type="button">← BACK</button>
      </main>
    `;
    this.root
      .querySelector<HTMLButtonElement>("#menu-back")
      ?.addEventListener("click", () => this.renderMainMenu(), { once: true });
  }

  private showLevel(levelNumber: number, initialScene?: string): void {
    const level = getLevel(levelNumber);
    if (!level) {
      this.renderComingSoon(levelNumber);
      return;
    }

    this.disposeCurrentLevel();
    this.audioManager.stopMusic();
    this.transitioning = false;
    this.currentLevel = levelNumber;

    this.root.innerHTML = `
      <main class="game-frame level-frame" data-level="${level.number}">
        <section id="level-screen" class="level-screen" aria-label="Level ${level.number}: ${level.title}"></section>
        ${this.debugMode ? this.renderDebugControls() : ""}
      </main>
    `;

    const screen = this.root.querySelector<HTMLElement>("#level-screen");
    if (!screen) throw new Error("The level screen could not be created.");

    this.scope = new LevelScope({
      screen,
      levelNumber,
      initialScene,
      complete: () => this.completeCurrentLevel(),
      restart: () => this.showLevel(levelNumber, initialScene),
      goToLevel: (targetLevel) => this.showLevel(targetLevel),
      goToMenu: () => this.renderMainMenu(),
      audio: this.audioManager,
    });
    this.scope.setCustomCleanup(level.mount(this.scope.context));
    this.bindDebugControls();
  }

  private completeCurrentLevel(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    if (WARP_CHECKPOINTS[this.currentLevel]) {
      this.renderWarpCheckpoint(this.currentLevel);
      return;
    }
    this.showLevel(this.currentLevel + 1);
  }

  private renderComingSoon(levelNumber: number): void {
    this.disposeCurrentLevel();
    this.root.innerHTML = `
      <main class="game-frame coming-soon">
        <h1>Level ${levelNumber}</h1>
        <p>This level has not been built yet.</p>
        <button class="flash-button" id="return-menu" type="button">MAIN MENU</button>
      </main>
    `;
    this.root
      .querySelector<HTMLButtonElement>("#return-menu")
      ?.addEventListener("click", () => this.renderMainMenu(), { once: true });
  }

  private renderDebugControls(): string {
    return `
      <nav class="debug-controls" data-allow-select>
        <button type="button" data-debug-action="previous">Prev</button>
        <span>Level ${this.currentLevel}</span>
        <button type="button" data-debug-action="next">Next</button>
        <button type="button" data-debug-action="restart">Restart</button>
        <button type="button" data-debug-action="menu">Menu</button>
      </nav>
    `;
  }

  private bindDebugControls(): void {
    if (!this.debugMode) return;
    const controls = this.root.querySelector<HTMLElement>(".debug-controls");
    if (!controls || !this.scope) return;

    this.scope.context.listen(controls, "click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button[data-debug-action]");
      if (!button) return;

      const currentIndex = registeredLevelNumbers.indexOf(this.currentLevel);
      if (button.dataset.debugAction === "previous" && currentIndex > 0) {
        const previous = registeredLevelNumbers[currentIndex - 1];
        if (previous !== undefined) this.showLevel(previous);
      }
      if (button.dataset.debugAction === "next") {
        const next = registeredLevelNumbers[currentIndex + 1];
        if (next !== undefined) this.showLevel(next);
      }
      if (button.dataset.debugAction === "restart") this.showLevel(this.currentLevel);
      if (button.dataset.debugAction === "menu") this.renderMainMenu();
    });
  }

  private disposeCurrentLevel(): void {
    this.mainMenuCleanup?.();
    this.mainMenuCleanup = undefined;
    this.scope?.dispose();
    this.scope = undefined;
  }
}
