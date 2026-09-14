import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/core/utilityDrawing.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { floodFill, rectangleSelection } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("fill respects a closed boundary and leaves the outside transparent", () => {
  const image = { width: 7, height: 7, data: new Uint8ClampedArray(7 * 7 * 4) };
  for (let y = 1; y <= 5; y++) for (let x = 1; x <= 5; x++) {
    if (x === 1 || x === 5 || y === 1 || y === 5) image.data.set([0, 0, 0, 255], (y * 7 + x) * 4);
  }
  floodFill(image, 3, 3, "#ff5533");
  assert.deepEqual(Array.from(image.data.slice((3 * 7 + 3) * 4, (3 * 7 + 3) * 4 + 4)), [255, 85, 51, 255]);
  assert.equal(image.data[3], 0);
  assert.equal(image.data[(1 * 7 + 1) * 4], 0);
});

test("fill handles an entire empty game-sized canvas without recursion", () => {
  const image = { width: 800, height: 600, data: new Uint8ClampedArray(800 * 600 * 4) };
  floodFill(image, 400, 300, "#112233");
  assert.deepEqual(Array.from(image.data.slice(-4)), [17, 34, 51, 255]);
  floodFill(image, 400, 300, "#112233");
  assert.deepEqual(Array.from(image.data.slice(0, 4)), [17, 34, 51, 255]);
});

test("rectangle selection keeps independent dimensions and clamps all drag directions", () => {
  assert.deepEqual(rectangleSelection({ x: 100, y: 100 }, { x: 250, y: 160 }, 800, 600), { x: 100, y: 100, width: 150, height: 60 });
  assert.deepEqual(rectangleSelection({ x: 100, y: 100 }, { x: 10, y: 30 }, 800, 600), { x: 10, y: 30, width: 90, height: 70 });
  assert.deepEqual(rectangleSelection({ x: 760, y: 570 }, { x: 799, y: 599 }, 800, 600), { x: 760, y: 570, width: 39, height: 29 });
});

test("background fill uses puzzle boundaries but only changes the annotation layer", () => {
  const reference = { width: 5, height: 3, data: new Uint8ClampedArray(5 * 3 * 4) };
  const image = { width: 5, height: 3, data: new Uint8ClampedArray(5 * 3 * 4) };
  for (let y = 0; y < 3; y++) for (let x = 0; x < 5; x++) {
    reference.data.set(x === 2 ? [0, 0, 0, 255] : [255, 255, 0, 255], (y * 5 + x) * 4);
  }
  const original = reference.data.slice();
  image.data.set([255, 0, 0, 255], (1 * 5 + 4) * 4);
  floodFill(image, 0, 1, "#228b22", reference);
  assert.deepEqual(Array.from(image.data.slice(0, 4)), [34, 139, 34, 255]);
  assert.equal(image.data[(1 * 5 + 2) * 4 + 3], 0);
  assert.equal(image.data[(1 * 5 + 3) * 4 + 3], 0);
  assert.deepEqual(Array.from(image.data.slice((1 * 5 + 4) * 4, (1 * 5 + 5) * 4)), [255, 0, 0, 255]);
  assert.deepEqual(reference.data, original);
});

test("precision fill preserves one-step differences and fills disconnected background pixels", () => {
  const reference = { width: 5, height: 1, data: new Uint8ClampedArray([
    255, 255, 255, 255, 255, 255, 254, 255, 255, 255, 252, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  ]) };
  const connected = { width: 5, height: 1, data: new Uint8ClampedArray(20) };
  assert.equal(floodFill(connected, 0, 0, "#228b22", reference, { tolerance: 0 }), 1);
  assert.equal(connected.data[15], 0);
  const all = { width: 5, height: 1, data: new Uint8ClampedArray(20) };
  assert.equal(floodFill(all, 0, 0, "#228b22", reference, { tolerance: 0, contiguous: false }), 3);
  assert.equal(all.data[7], 0);
  assert.equal(all.data[11], 0);
  assert.equal(all.data[15], 255);
  assert.equal(all.data[19], 255);
  assert.equal(floodFill(connected, 0, 0, "#228b22", reference, { tolerance: 3 }), 5);
});

