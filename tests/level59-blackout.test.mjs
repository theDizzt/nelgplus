import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/levels/level59Blackout.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { BlackoutCycle } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("blackout waits 20–24 seconds, fades gradually, then stays locked", () => {
  for (const random of [0, 0.5, 0.999]) {
    const cycle = new BlackoutCycle(() => random);
    const delay = 20000 + random * 4000;
    cycle.advance(delay - 1);
    assert.equal(cycle.active, false);
    cycle.advance(1);
    assert.equal(cycle.phase, "fading");
    assert.equal(cycle.opacity, 0);
    cycle.advance(900);
    assert.equal(cycle.opacity, 0.5);
    assert.equal(cycle.key("1"), "pending");
    assert.equal(cycle.entry, "");
    cycle.advance(900);
    assert.equal(cycle.phase, "locked");
    assert.equal(cycle.opacity, 1);
    cycle.advance(100000);
    assert.equal(cycle.phase, "locked");
  }
});

test("four-digit PIN preserves leading zeros and unlock restarts the cycle", () => {
  const cycle = new BlackoutCycle(() => 0.0042);
  cycle.advance(24000);
  assert.equal(cycle.pin, "0042");
  for (const key of cycle.pin) cycle.key(key);
  cycle.key("9");
  assert.equal(cycle.entry, "0042");
  assert.equal(cycle.key("Enter"), "unlocked");
  assert.equal(cycle.active, false);
  assert.equal(cycle.opacity, 0);
  assert.equal(cycle.entry, "");
  cycle.advance(19999);
  assert.equal(cycle.active, false);
  cycle.advance(4001);
  assert.equal(cycle.phase, "locked");
});

test("wrong or incomplete PIN stays locked, and editing/reset clear input", () => {
  const cycle = new BlackoutCycle(() => 0);
  cycle.advance(21800);
  cycle.key("1");
  assert.equal(cycle.key("Enter"), "wrong");
  assert.equal(cycle.entry, "");
  for (const key of "1234") cycle.key(key);
  assert.equal(cycle.key("Enter"), "wrong");
  assert.equal(cycle.phase, "locked");
  cycle.key("5");
  cycle.key("6");
  cycle.key("Backspace");
  assert.equal(cycle.entry, "5");
  cycle.key("Escape");
  assert.equal(cycle.entry, "");
  cycle.key("7");
  cycle.reset();
  assert.equal(cycle.active, false);
  assert.equal(cycle.pin, "");
  assert.equal(cycle.entry, "");
});
