import type { LevelDefinition } from "../core/types";
import { createPlaceholderLevel } from "./createPlaceholderLevel";
import { level01 } from "./level01";
import { level02 } from "./level02";
import { level03 } from "./level03";
import { level04 } from "./level04";
import { level05 } from "./level05";

const levels: LevelDefinition[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  ...Array.from({ length: 15 }, (_, index) => createPlaceholderLevel(index + 6)),
];

const levelMap = new Map(levels.map((level) => [level.number, level]));

export const registeredLevelNumbers = levels.map((level) => level.number).sort((a, b) => a - b);

export function getLevel(levelNumber: number): LevelDefinition | undefined {
  return levelMap.get(levelNumber);
}
