const AUDIO_SETTINGS_KEY = "nelg-plus-plus-audio";

function normalizeVolume(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.round(Math.min(100, Math.max(0, value)));
}

export class AudioManager {
  private currentMusic?: HTMLAudioElement;
  private musicAllowed = true;
  private effectsAllowed = true;
  private musicVolumePercent = 100;
  private effectsVolumePercent = 100;

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
      const legacyVolume = typeof settings.volume === "number" ? normalizeVolume(settings.volume) : 100;
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
    const audio = new Audio(source);
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
    const audio = new Audio(source);
    audio.volume = this.effectsVolumePercent / 100;
    void audio.play().catch(() => undefined);
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
