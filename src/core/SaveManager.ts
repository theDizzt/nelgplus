interface SaveData {
  version: 1;
  currentLevel: number;
  highestLevel: number;
}

const SAVE_KEY = "nelg-plus-plus-save";
const DEFAULT_SAVE: SaveData = {
  version: 1,
  currentLevel: 1,
  highestLevel: 1,
};

export class SaveManager {
  load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };

      const parsed = JSON.parse(raw) as Partial<SaveData>;
      if (
        parsed.version !== 1 ||
        !Number.isInteger(parsed.currentLevel) ||
        !Number.isInteger(parsed.highestLevel)
      ) {
        return { ...DEFAULT_SAVE };
      }

      return parsed as SaveData;
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  save(currentLevel: number, highestLevel: number): void {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: 1, currentLevel, highestLevel } satisfies SaveData),
      );
    } catch {
      // Saving can fail in restricted browser contexts; gameplay should continue.
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Resetting can fail in restricted browser contexts.
    }
  }
}
