import { AudioManager } from "./AudioManager";
import { assetUrl, SOUND_EFFECTS } from "./assets";
import { InteractionGuard } from "./InteractionGuard";
import { LevelScope } from "./LevelScope";
import { attachStarMaskedInput } from "./StarMaskedInput";
import type { LevelContext } from "./types";
import { getLevel, registeredLevelNumbers } from "../levels/registry";

const DEVELOPMENT_PERIOD = "08/03/2026 – 08/19/2026";
const GAME_VERSION = "1.0.20";
const VERSION_DATE = "08/03/2026";
const DISCORD_URL = "https://discord.gg/txQK3RFfwy";
const ADMIN_OPTION_CODE = "melonsoda84";
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
  private readonly interactionGuard = new InteractionGuard();
  private readonly debugMode = new URLSearchParams(location.search).get("debug") === "1";
  private currentLevel = 1;
  private scope?: LevelScope;
  private transitioning = false;

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    this.interactionGuard.enable();
    void this.runPreloader();
  }

  private async runPreloader(): Promise<void> {
    this.root.innerHTML = `
      <main class="game-frame preloader" aria-label="Loading Never Ending Level Game Plus Plus">
        <div class="preloader__content">
          <p class="preloader__kicker">NEVER ENDING</p>
          <h1>Level Game <span>++</span></h1>
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
          <p class="main-menu__kicker">A browser puzzle game</p>
          <h1>Never Ending<br />Level Game <span>++</span></h1>
          <p class="main-menu__description">
            This game is a sequel to Clarence Ball’s <em>Never Ending Level Game</em>, which was released in 2005.
            It was created by blending elements from that game and its fan games (<em>Level Killer</em> and
            <em>TEDNE</em>) to let players experience the thrill of the original once again. You must complete
            150 levels while battling against the time and overcoming the game’s ruthless difficulty.
          </p>
          <dl class="main-menu__facts">
            <div>
              <dt>LEVELS INCLUDED</dt>
              <dd>${registeredLevelNumbers.length}</dd>
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
            <span>01</span> START GAME
          </button>
          <button class="menu-button" data-menu-action="warp" type="button">
            <span>02</span> WARP ZONE
          </button>
          <button class="menu-button" data-menu-action="credits" type="button">
            <span>03</span> CREDITS
          </button>
          <button class="menu-button" data-menu-action="hall" type="button">
            <span>04</span> HALL OF FAME
          </button>
          <button class="menu-button" data-menu-action="discord" type="button">
            <span>05</span> DISCORD
          </button>
          <button class="menu-button" data-menu-action="options" type="button">
            <span>06</span> OPTIONS
          </button>
        </nav>
      </main>
    `;

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

    this.root.querySelector<HTMLElement>(".level-jump")?.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button[data-level-number]");
      if (!button) return;
      const levelNumber = Number(button.dataset.levelNumber);
      if (JUMPABLE_LEVELS.some((number) => number === levelNumber)) this.renderWarpGate(levelNumber);
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
      ?.addEventListener("click", () => this.showLevel(levelNumber + 1), { once: true });
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
      `<div class="empty-panel">
         <p>NO ENTRIES YET</p>
         <span>The first champions will appear here.</span>
       </div>`,
    );
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
           <p>ADMIN LEVEL ACCESS</p>
           <form id="admin-level-form">
             <input id="admin-level-number" type="number" min="${MINIMUM_LEVEL}" max="${MAXIMUM_LEVEL}"
               step="1" placeholder="-8 to 150" aria-label="Admin level number" autocomplete="off" />
             <button type="submit">GO</button>
           </form>
           <span id="admin-level-feedback" role="status"></span>
         </section>
       </div>`,
    );

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
    const adminFeedback = this.root.querySelector<HTMLElement>("#admin-level-feedback");
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
      this.showLevel(levelNumber);
    });
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

  private showLevel(levelNumber: number): void {
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
      complete: () => this.completeCurrentLevel(),
      restart: () => this.showLevel(levelNumber),
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
    this.scope?.dispose();
    this.scope = undefined;
  }
}
