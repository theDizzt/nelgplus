import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/levels/level58Notes.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { COSMIC_NOTES } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("the colored spacing clues still spell mount in the final note's order", () => {
  const clues = [
    ["now", "red", "num ber", "left"],
    ["own", "blue", "o ne", "left"],
    ["no", "green", "yo u", "right"],
    ["known", "yellow", "n ew", "left"],
    ["know", "purple", "lef t", "right"],
  ];
  const answer = clues.map(([key, color, split, direction]) => {
    assert.ok(COSMIC_NOTES[key].html.includes(split), `${key}: intentional space was lost`);
    assert.ok(COSMIC_NOTES[key].html.includes(`class="ink-${color}"`));
    assert.ok(COSMIC_NOTES["i love nelg++"].html.includes(`class="ink-${color}">${direction}</span>`));
    const [left, right] = split.split(" ");
    return direction === "left" ? left.at(-1) : right[0];
  }).join("");
  assert.equal(answer, "mount");
});

test("the matching escape notes reveal different level references", () => {
  assert.equal(COSMIC_NOTES["65536"].html, COSMIC_NOTES["53665"].html);
  assert.equal(COSMIC_NOTES["65536"].reveal, "29 41");
  assert.equal(COSMIC_NOTES["53665"].reveal, "50-11");
  assert.ok(COSMIC_NOTES["65536"].x < 0);
  assert.ok(COSMIC_NOTES["53665"].x > 700);
});

test("the color order is preserved and no replaces the old unknow command", () => {
  assert.match(COSMIC_NOTES.unknown.html, /ink-red">Green.*ink-purple">Red.*ink-yellow">Blue.*ink-green">Purple.*ink-blue">Yellow/);
  assert.match(COSMIC_NOTES.no.html, /ink-green">no<\/span>/);
  assert.equal(Object.hasOwn(COSMIC_NOTES, "unknow"), false);
  assert.equal(Object.keys(COSMIC_NOTES).length, 11);
});
