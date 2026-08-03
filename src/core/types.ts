export interface LevelDefinition {
  readonly number: number;
  readonly title: string;
  readonly mount: (context: LevelContext) => void | (() => void);
}

export interface LevelContext {
  readonly screen: HTMLElement;
  readonly levelNumber: number;
  readonly audio: {
    playMusic: (source: string, loop?: boolean) => Promise<void>;
    stopMusic: () => void;
    playEffect: (source: string) => void;
  };
  complete: () => void;
  restart: () => void;
  listen: <K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Document | Window,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ) => void;
  timeout: (callback: () => void, delay: number) => number;
  interval: (callback: () => void, delay: number) => number;
}
