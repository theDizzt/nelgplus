import { NEWGROUNDS_MEDAL_MAP } from "./medalMap";

interface NewgroundsUser {
  name?: string;
}

interface NewgroundsApi {
  isInitialized: boolean;
  user: NewgroundsUser | null;
  init(appId: string, encryptionKey: string, options?: Record<string, unknown>): void;
  unlockMedal(medalId: number, callback?: (medal: unknown) => void): void;
  openLoginPage(): void;
  getConnectionStatus(callback?: (status: string) => void): void;
}

declare global {
  interface Window {
    NGIO?: NewgroundsApi;
  }
}

const enabled = import.meta.env.VITE_NEWGROUNDS_ENABLED?.trim().toLowerCase() === "true";
const appId = import.meta.env.VITE_NEWGROUNDS_APP_ID?.trim() ?? "";
const encryptionKey = import.meta.env.VITE_NEWGROUNDS_ENCRYPTION_KEY?.trim() ?? "";

class NewgroundsService {
  readonly enabled = enabled && Boolean(appId);
  private api?: NewgroundsApi;
  private readonly pendingMedalIds = new Set<number>();

  initialize(): void {
    if (!this.enabled || !window.NGIO || this.api) return;

    this.api = window.NGIO;
    this.api.init(appId, encryptionKey, {
      version: import.meta.env.VITE_NEWGROUNDS_VERSION?.trim() || undefined,
      preloadMedals: true,
      autoLogNewView: true,
    });
    this.api.getConnectionStatus(() => this.flushPendingMedals());
  }

  unlockForAchievement(achievementId: number): void {
    const medalId = NEWGROUNDS_MEDAL_MAP[achievementId];
    if (!medalId) return;
    if (!this.api?.user) {
      this.pendingMedalIds.add(medalId);
      return;
    }

    this.unlockMedal(medalId);
  }

  private flushPendingMedals(): void {
    if (!this.api?.user) return;
    for (const medalId of this.pendingMedalIds) this.unlockMedal(medalId);
    this.pendingMedalIds.clear();
  }

  private unlockMedal(medalId: number): void {
    try {
      this.api?.unlockMedal(medalId);
    } catch (error) {
      console.warn("Unable to unlock Newgrounds medal.", error);
    }
  }

  openLoginPage(): void {
    if (!this.enabled || !this.api) return;
    this.api.openLoginPage();
  }
}

export const newgroundsService = new NewgroundsService();
