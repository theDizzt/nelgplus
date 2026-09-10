import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/core/MobileControls.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { MobileControls } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

class InputEvent extends Event {
  constructor(type, options) {
    super(type, options);
    Object.assign(this, options && Object.fromEntries(
      Object.entries(options).filter(([key]) => !["bubbles", "cancelable"].includes(key)),
    ));
  }
}
globalThis.PointerEvent = InputEvent;
globalThis.MouseEvent = InputEvent;

test("releasing A emits one release and click without re-entering the hold", () => {
  const controls = new MobileControls({ querySelector: () => null });
  const events = [];
  const target = {
    isConnected: true,
    dispatchEvent(event) {
      events.push(event.type);
      assert.equal(controls.primaryTarget, undefined);
      // Model the synthetic event bubbling back to the window listener.
      if (event.type === "pointerup") controls.handlePointerUp(event);
      return true;
    },
  };
  controls.primaryTarget = target;
  controls.primaryPointerId = 7;
  controls.handlePointerUp(new InputEvent("pointerup", { pointerId: 7 }));
  assert.deepEqual(events, ["pointerup", "click"]);
});

test("virtual pointer releases do not release a physical direction hold", () => {
  const controls = new MobileControls({});
  controls.directionPointers.set(7, "left");
  controls.directions.add("left");
  const event = new InputEvent("pointerup", { pointerId: 7 });
  event.__nelgMobileControl = true;
  controls.handlePointerUp(event);
  assert.equal(controls.directions.has("left"), true);
  assert.equal(controls.directionPointers.get(7), "left");
});

test("hiding controls releases A without clicking the game", () => {
  const controls = new MobileControls({ querySelector: () => null });
  const events = [];
  controls.primaryTarget = {
    isConnected: true,
    dispatchEvent: (event) => events.push(event.type),
  };
  controls.releasePrimary(false);
  assert.deepEqual(events, ["pointerup"]);
  assert.equal(controls.primaryTarget, undefined);
});
