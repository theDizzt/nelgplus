import type { LevelContext } from "./types";
import type { AudioManager } from "./AudioManager";

interface ScopeOptions {
  screen: HTMLElement;
  levelNumber: number;
  complete: () => void;
  restart: () => void;
  audio: AudioManager;
}

export class LevelScope {
  readonly context: LevelContext;

  private readonly controller = new AbortController();
  private readonly timeoutIds = new Set<number>();
  private readonly intervalIds = new Set<number>();
  private customCleanup?: () => void;
  private disposed = false;

  constructor(options: ScopeOptions) {
    this.context = {
      screen: options.screen,
      levelNumber: options.levelNumber,
      audio: {
        playMusic: (source, loop) => options.audio.playMusic(source, loop),
        stopMusic: () => options.audio.stopMusic(),
        playEffect: (source) => options.audio.playEffect(source),
      },
      complete: options.complete,
      restart: options.restart,
      listen: (target, type, listener, eventOptions = {}) => {
        target.addEventListener(type, listener as EventListener, {
          ...eventOptions,
          signal: this.controller.signal,
        });
      },
      timeout: (callback, delay) => {
        const id = window.setTimeout(() => {
          this.timeoutIds.delete(id);
          if (!this.disposed) callback();
        }, delay);
        this.timeoutIds.add(id);
        return id;
      },
      interval: (callback, delay) => {
        const id = window.setInterval(() => {
          if (!this.disposed) callback();
        }, delay);
        this.intervalIds.add(id);
        return id;
      },
    };
  }

  setCustomCleanup(cleanup: void | (() => void)): void {
    this.customCleanup = cleanup || undefined;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.controller.abort();
    this.timeoutIds.forEach((id) => window.clearTimeout(id));
    this.intervalIds.forEach((id) => window.clearInterval(id));
    this.timeoutIds.clear();
    this.intervalIds.clear();
    this.customCleanup?.();
  }
}
