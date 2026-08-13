import { assetUrl } from "./assets";

const AUDIO_SETTINGS_KEY = "nelg-plus-plus-audio";
const DEFAULT_VOLUME = 50;

function resolveAudioSource(source: string): string {
  if (/^(?:https?:|blob:|data:)/i.test(source)) return source;
  return assetUrl(source);
}

function normalizeVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.round(Math.min(100, Math.max(0, value)));
}

export class AudioManager {
  private currentMusic?: HTMLAudioElement;
  private readonly effectPools = new Map<string, HTMLAudioElement[]>();
  private readonly effectPoolCursor = new Map<string, number>();
  private musicAllowed = true;
  private effectsAllowed = true;
  private musicVolumePercent = DEFAULT_VOLUME;
  private effectsVolumePercent = DEFAULT_VOLUME;

  constructor() {
    try {
      const stored = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (!stored) return;
      const settings = JSON.parse(stored) as {
        music?: unknown;
        effects?: unknown;
        volume?: unknown;
        musicVolume?: unknown;
        effectsVolume?: unknown;
      };
      if (typeof settings.music === "boolean") this.musicAllowed = settings.music;
      if (typeof settings.effects === "boolean") this.effectsAllowed = settings.effects;
      const legacyVolume = typeof settings.volume === "number" ? normalizeVolume(settings.volume) : DEFAULT_VOLUME;
      this.musicVolumePercent =
        typeof settings.musicVolume === "number" ? normalizeVolume(settings.musicVolume) : legacyVolume;
      this.effectsVolumePercent =
        typeof settings.effectsVolume === "number" ? normalizeVolume(settings.effectsVolume) : legacyVolume;
    } catch {
      // Invalid or unavailable storage should not block the game.
    }
  }

  get musicEnabled(): boolean {
    return this.musicAllowed;
  }

  get effectsEnabled(): boolean {
    return this.effectsAllowed;
  }

  get musicVolume(): number {
    return this.musicVolumePercent;
  }

  get effectsVolume(): number {
    return this.effectsVolumePercent;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicAllowed = enabled;
    if (!enabled) this.stopMusic();
    this.saveSettings();
  }

  setEffectsEnabled(enabled: boolean): void {
    this.effectsAllowed = enabled;
    this.saveSettings();
  }

  setMusicVolume(volume: number): void {
    this.musicVolumePercent = normalizeVolume(volume);
    if (this.currentMusic) this.currentMusic.volume = this.musicVolumePercent / 100;
    this.saveSettings();
  }

  setEffectsVolume(volume: number): void {
    this.effectsVolumePercent = normalizeVolume(volume);
    this.saveSettings();
  }

  async playMusic(source: string, loop = true): Promise<void> {
    this.stopMusic();
    if (!this.musicAllowed) return;
    const audio = new Audio(resolveAudioSource(source));
    audio.loop = loop;
    audio.preload = "auto";
    audio.volume = this.musicVolumePercent / 100;
    this.currentMusic = audio;

    try {
      await audio.play();
    } catch {
      // Browsers may block audio until the player interacts with the game.
    }
  }

  stopMusic(): void {
    if (!this.currentMusic) return;
    this.currentMusic.pause();
    this.currentMusic.currentTime = 0;
    this.currentMusic = undefined;
  }

  playEffect(source: string): void {
    if (!this.effectsAllowed) return;
    const resolvedSource = resolveAudioSource(source);
    const pool = this.effectPools.get(resolvedSource);
    let audio: HTMLAudioElement;
    if (pool?.length) {
      const cursor = this.effectPoolCursor.get(resolvedSource) ?? 0;
      audio = pool[cursor % pool.length]!;
      this.effectPoolCursor.set(resolvedSource, cursor + 1);
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio = new Audio(resolvedSource);
      audio.preload = "auto";
    }
    audio.volume = this.effectsVolumePercent / 100;
    void audio.play().catch(() => undefined);
  }

  async preloadEffects(sources: readonly string[], poolSize = 4): Promise<void> {
    await Promise.all(sources.map(async (source) => {
      const resolvedSource = resolveAudioSource(source);
      if (this.effectPools.has(resolvedSource)) return;

      const audio = new Audio(resolvedSource);
      audio.preload = "auto";
      const ready = new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          resolve();
        };
        const timeoutId = window.setTimeout(finish, 8_000);
        if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
          finish();
          return;
        }
        audio.addEventListener("canplaythrough", finish, { once: true });
        audio.addEventListener("error", finish, { once: true });
      });
      audio.load();
      await ready;

      const pool = Array.from({ length: poolSize }, (_, index) => {
        const item = index === 0 ? audio : audio.cloneNode(true) as HTMLAudioElement;
        item.preload = "auto";
        item.volume = this.effectsVolumePercent / 100;
        return item;
      });
      this.effectPools.set(resolvedSource, pool);
      this.effectPoolCursor.set(resolvedSource, 0);
    }));
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        AUDIO_SETTINGS_KEY,
        JSON.stringify({
          music: this.musicAllowed,
          effects: this.effectsAllowed,
          musicVolume: this.musicVolumePercent,
          effectsVolume: this.effectsVolumePercent,
        }),
      );
    } catch {
      // Settings are optional in restricted browser contexts.
    }
  }
}
