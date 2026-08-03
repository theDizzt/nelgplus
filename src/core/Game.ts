import { AudioManager } from "./AudioManager";
import { InteractionGuard } from "./InteractionGuard";
import { LevelScope } from "./LevelScope";
import { SaveManager } from "./SaveManager";
import { getLevel, registeredLevelNumbers } from "../levels/registry";

const DEVELOPMENT_PERIOD = "AUGUST 2026 – PRESENT";
const DISCORD_URL = "";

export class Game {
  private readonly saveManager = new SaveManager();
  private readonly audioManager = new AudioManager();
  private readonly interactionGuard = new InteractionGuard();
  private readonly debugMode = new URLSearchParams(location.search).get("debug") === "1";
  private currentLevel = 1;
  private highestLevel = 1;
  private scope?: LevelScope;
  private transitioning = false;

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    const save = this.saveManager.load();
    this.currentLevel = getLevel(save.currentLevel) ? save.currentLevel : 1;
    this.highestLevel = Math.max(1, save.highestLevel);
    this.interactionGuard.enable();
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
          <dl class="main-menu__facts">
            <div>
              <dt>LEVELS INCLUDED</dt>
              <dd>${registeredLevelNumbers.length}</dd>
            </div>
            <div>
              <dt>DEVELOPMENT</dt>
              <dd>${DEVELOPMENT_PERIOD}</dd>
            </div>
          </dl>
        </section>

        <nav class="main-menu__buttons" aria-label="Main menu">
          <button class="menu-button menu-button--primary" data-menu-action="start" type="button">
            <span>01</span> START GAME
          </button>
          <button class="menu-button" data-menu-action="jump" type="button">
            <span>02</span> LEVEL JUMP
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

        <p class="main-menu__save">CURRENT SAVE · LEVEL ${this.currentLevel}</p>
      </main>
    `;

    this.root.querySelector<HTMLElement>(".main-menu__buttons")?.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button[data-menu-action]");
      if (!button) return;

      switch (button.dataset.menuAction) {
        case "start":
          this.showLevel(this.currentLevel);
          break;
        case "jump":
          this.renderLevelJump();
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

  private renderLevelJump(): void {
    const levelButtons = registeredLevelNumbers
      .map(
        (number) => `
          <button class="level-jump__button${number === this.currentLevel ? " is-current" : ""}"
            type="button" data-level-number="${number}">
            ${number}
          </button>`,
      )
      .join("");

    this.renderMenuPage(
      "Level Jump",
      `<p class="menu-page__intro">Choose any level included in this build.</p>
       <div class="level-jump">${levelButtons}</div>`,
    );

    this.root.querySelector<HTMLElement>(".level-jump")?.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button[data-level-number]");
      if (!button) return;
      const levelNumber = Number(button.dataset.levelNumber);
      if (getLevel(levelNumber)) this.showLevel(levelNumber);
    });
  }

  private renderCredits(): void {
    this.renderMenuPage(
      "Credits",
      `<div class="credits-list">
         <div><span>GAME DESIGN</span><strong>TO BE ANNOUNCED</strong></div>
         <div><span>DEVELOPMENT</span><strong>TO BE ANNOUNCED</strong></div>
         <div><span>FONTS</span><strong>PERPETUA · COURIER · ARIAL</strong></div>
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
         <label>
           <span>MUSIC</span>
           <input id="music-option" type="checkbox" ${this.audioManager.musicEnabled ? "checked" : ""} />
         </label>
         <label>
           <span>SOUND EFFECTS</span>
           <input id="effects-option" type="checkbox" ${this.audioManager.effectsEnabled ? "checked" : ""} />
         </label>
         <button class="danger-button" id="reset-save" type="button">RESET PROGRESS</button>
         <p id="options-feedback" role="status"></p>
       </div>`,
    );

    this.root.querySelector<HTMLInputElement>("#music-option")?.addEventListener("change", (event) => {
      this.audioManager.setMusicEnabled((event.currentTarget as HTMLInputElement).checked);
    });
    this.root.querySelector<HTMLInputElement>("#effects-option")?.addEventListener("change", (event) => {
      this.audioManager.setEffectsEnabled((event.currentTarget as HTMLInputElement).checked);
    });

    let resetArmed = false;
    this.root.querySelector<HTMLButtonElement>("#reset-save")?.addEventListener("click", (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      if (!resetArmed) {
        resetArmed = true;
        button.textContent = "CLICK AGAIN TO CONFIRM";
        return;
      }

      this.saveManager.reset();
      this.currentLevel = 1;
      this.highestLevel = 1;
      button.textContent = "PROGRESS RESET";
      button.disabled = true;
      const feedback = this.root.querySelector<HTMLElement>("#options-feedback");
      if (feedback) feedback.textContent = "Your next game will begin at Level 1.";
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
    this.highestLevel = Math.max(this.highestLevel, levelNumber);
    this.saveManager.save(this.currentLevel, this.highestLevel);

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
      audio: this.audioManager,
    });
    this.scope.setCustomCleanup(level.mount(this.scope.context));
    this.bindDebugControls();
  }

  private completeCurrentLevel(): void {
    if (this.transitioning) return;
    this.transitioning = true;
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
