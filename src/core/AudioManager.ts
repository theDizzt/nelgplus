const AUDIO_SETTINGS_KEY = "nelg-plus-plus-audio";

export class AudioManager {
  private currentMusic?: HTMLAudioElement;
  private musicAllowed = true;
  private effectsAllowed = true;

  constructor() {
    try {
      const stored = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (!stored) return;
      const settings = JSON.parse(stored) as { music?: unknown; effects?: unknown };
      if (typeof settings.music === "boolean") this.musicAllowed = settings.music;
      if (typeof settings.effects === "boolean") this.effectsAllowed = settings.effects;
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

  setMusicEnabled(enabled: boolean): void {
    this.musicAllowed = enabled;
    if (!enabled) this.stopMusic();
    this.saveSettings();
  }

  setEffectsEnabled(enabled: boolean): void {
    this.effectsAllowed = enabled;
    this.saveSettings();
  }

  async playMusic(source: string, loop = true): Promise<void> {
    this.stopMusic();
    if (!this.musicAllowed) return;
    const audio = new Audio(source);
    audio.loop = loop;
    audio.preload = "auto";
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
    void audio.play().catch(() => undefined);
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        AUDIO_SETTINGS_KEY,
        JSON.stringify({ music: this.musicAllowed, effects: this.effectsAllowed }),
      );
    } catch {
      // Settings are optional in restricted browser contexts.
    }
  }
}
