import type { LevelDefinition } from "../core/types";
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
import { level20 } from "./level20";
import { level21 } from "./level21";
import { level22 } from "./level22";
import { level23 } from "./level23";
import { level24 } from "./level24";
import { level25 } from "./level25";
import { level26 } from "./level26";
import { level27 } from "./level27";
import { level28 } from "./level28";
import { level29 } from "./level29";
import { level30 } from "./level30";
import { level31 } from "./level31";
import { level32 } from "./level32";
import { level33 } from "./level33";
import { level34 } from "./level34";
import { level35 } from "./level35";
import { level36 } from "./level36";
import { level37 } from "./level37";
import { level38 } from "./level38";
import { level39 } from "./level39";
import { level40 } from "./level40";
import { level41 } from "./level41";
import { level42 } from "./level42";
import { level43 } from "./level43";
import { level44 } from "./level44";
import { level45 } from "./level45";

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
  level20,
  level21,
  level22,
  level23,
  level24,
  level25,
  level26,
  level27,
  level28,
  level29,
  level30,
  level31,
  level32,
  level33,
  level34,
  level35,
  level36,
  level37,
  level38,
  level39,
  level40,
  level41,
  level42,
  level43,
  level44,
  level45,
];

const levelMap = new Map(levels.map((level) => [level.number, level]));

export const registeredLevelNumbers = levels.map((level) => level.number).sort((a, b) => a - b);

export function getLevel(levelNumber: number): LevelDefinition | undefined {
  return levelMap.get(levelNumber);
}
