import type { LevelDefinition } from "../core/types";
import { createPlaceholderLevel } from "./createPlaceholderLevel";
import { level01 } from "./level01";
import { level02 } from "./level02";
import { level03 } from "./level03";
import { level04 } from "./level04";
import { level05 } from "./level05";
import { level06 } from "./level06";
import { level07 } from "./level07";
import { level08 } from "./level08";
import { level09 } from "./level09";
import { level10 } from "./level10";
import { level11 } from "./level11";
import { level12 } from "./level12";
import { level13 } from "./level13";
import { level14 } from "./level14";
import { level15 } from "./level15";
import { level16 } from "./level16";
import { level17 } from "./level17";
import { level18 } from "./level18";
import { level19 } from "./level19";

const levels: LevelDefinition[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10,
  level11,
  level12,
  level13,
  level14,
  level15,
  level16,
  level17,
  level18,
  level19,
  createPlaceholderLevel(20),
];

const levelMap = new Map(levels.map((level) => [level.number, level]));

export const registeredLevelNumbers = levels.map((level) => level.number).sort((a, b) => a - b);

export function getLevel(levelNumber: number): LevelDefinition | undefined {
  return levelMap.get(levelNumber);
}
