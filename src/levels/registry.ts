import type { LevelDefinition } from "../core/types";
import { createPlaceholderLevel } from "./createPlaceholderLevel";
import { level01 } from "./level01";

const levels: LevelDefinition[] = [
  level01,
  ...Array.from({ length: 19 }, (_, index) => createPlaceholderLevel(index + 2)),
];

const levelMap = new Map(levels.map((level) => [level.number, level]));

export const registeredLevelNumbers = levels.map((level) => level.number).sort((a, b) => a - b);

export function getLevel(levelNumber: number): LevelDefinition | undefined {
  return levelMap.get(levelNumber);
}
