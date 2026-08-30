export interface LevelDefinition {
  readonly number: number;
  readonly title: string;
  readonly scenes?: readonly AdminSceneDefinition[];
  readonly mount: (context: LevelContext) => void | (() => void);
}

export interface AdminSceneDefinition {
  readonly id: string;
  readonly label: string;
}

export interface LevelContext {
  readonly screen: HTMLElement;
  readonly levelNumber: number;
  readonly initialScene?: string;
  readonly audio: {
    readonly musicEnabled: boolean;
    readonly effectsEnabled: boolean;
    readonly musicVolume: number;
    readonly effectsVolume: number;
    setMusicEnabled: (enabled: boolean) => void;
    setEffectsEnabled: (enabled: boolean) => void;
    setMusicVolume: (volume: number) => void;
    setEffectsVolume: (volume: number) => void;
    playMusic: (source: string, loop?: boolean) => Promise<void>;
    playMusicSequence: (sources: readonly string[]) => Promise<void>;
    stopMusic: () => void;
    playEffect: (source: string) => void;
  };
  readonly session: {
    hasFlag: (flag: string) => boolean;
    setFlag: (flag: string) => void;
  };
  complete: () => void;
  wrongAnswer: () => boolean;
  unlockAchievement: (achievementId: number) => void;
  restart: () => void;
  goToLevel: (levelNumber: number) => void;
  goToMenu: () => void;
  listen: <K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Document | Window,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ) => void;
  timeout: (callback: () => void, delay: number) => number;
  interval: (callback: () => void, delay: number) => number;
}
