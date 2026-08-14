import { assetUrl } from "./assets";

export interface HallOfFameEntry {
  id: number;
  nickname: string;
  message: string;
  achievedAt: string;
}

function normalizeEntry(value: unknown): HallOfFameEntry | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  if (!Number.isInteger(record.id) || (record.id as number) < 1 || typeof record.nickname !== "string" ||
      typeof record.message !== "string" || typeof record.achievedAt !== "string") return undefined;
  if (Number.isNaN(Date.parse(record.achievedAt))) return undefined;
  return {
    id: record.id as number,
    nickname: record.nickname.slice(0, 32),
    message: record.message.slice(0, 240),
    achievedAt: record.achievedAt,
  };
}

export class HallOfFameService {
  async list(): Promise<HallOfFameEntry[]> {
    const response = await fetch(assetUrl("data/hall-of-fame.json"), { cache: "no-cache" });
    if (!response.ok) throw new Error(`Hall of Fame file could not be loaded (${response.status}).`);
    const payload = await response.json() as unknown;
    const values = Array.isArray(payload) ? payload : (payload as { entries?: unknown[] }).entries;
    return (Array.isArray(values) ? values : [])
      .map(normalizeEntry)
      .filter((entry): entry is HallOfFameEntry => Boolean(entry))
      .sort((left, right) => Date.parse(left.achievedAt) - Date.parse(right.achievedAt));
  }
}
