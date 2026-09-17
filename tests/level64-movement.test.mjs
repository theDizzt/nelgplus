import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function moduleUrl(path, replace = value => value) {
  const source = replace(readFileSync(new URL(path, import.meta.url), "utf8"));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const maskedInputUrl = moduleUrl("../src/core/StarMaskedInput.ts");
const { level64 } = await import(moduleUrl("../src/levels/level64.ts", source =>
  source.replace('"../core/StarMaskedInput"', JSON.stringify(maskedInputUrl))));

function mount() {
  const input = new EventTarget();
  Object.assign(input, {
    value: "", maxLength: -1, selectionStart: 0, selectionEnd: 0,
    setAttribute() {}, focus() {},
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
  });
  const form = new EventTarget();
  form.querySelector = () => input;
  form.requestSubmit = () => form.dispatchEvent(new Event("submit", { cancelable: true }));
  const six = { style: {}, classList: { toggle() {} } };
  const target = { hidden: false };
  const screen = { querySelector: selector => selector === "form" ? form : selector.includes("__six") ? six : target };
  const timers = [];
  let completed = 0;
  level64.mount({ screen, listen: (el, type, callback) => el.addEventListener(type, callback),
    timeout: callback => timers.push(callback), complete: () => completed++ });
  return { six, target, input, timers, completed: () => completed,
    submit(answer, enter = false) {
      const event = new Event("beforeinput", { cancelable: true });
      Object.assign(event, { inputType: "insertText", data: answer });
      input.dispatchEvent(event);
      if (enter) {
        const key = new Event("keydown", { cancelable: true });
        Object.assign(key, { key: "Enter", repeat: false });
        input.dispatchEvent(key);
      } else form.requestSubmit();
    },
  };
}

test("ordered passwords follow the reference route and require 816 after arrival", () => {
  const game = mount();
  game.submit("5");
  game.submit("816");
  game.submit("right");
  assert.equal(game.six.style.transform, undefined);
  assert.equal(game.completed(), 0);
  const route = [
    ["down", 0, 100], ["right", 100, 100], ["down", 100, 200],
    ["south", 100, 300], ["up", 100, 200], ["diagnal", 0, 300],
    ["left", -100, 300], ["northwest", -200, 200], ["north", -200, 100],
    ["southwest", -300, 200], ["down", -300, 300], ["south", -300, 400],
  ];
  route.forEach(([answer, x, y], index) => {
    game.submit(answer, index % 2 === 0);
    assert.equal(game.six.style.transform, `translate(${x}px, ${y}px)`);
    assert.equal(game.input.value, "");
    assert.equal(game.completed(), 0);
    assert.equal(game.target.hidden, index === route.length - 1);
    game.timers.shift()();
  });
  assert.equal(game.completed(), 0);
  game.submit("south");
  assert.equal(game.completed(), 0);
  game.submit("816", true);
  assert.equal(game.completed(), 1);
  game.submit("816");
  assert.equal(game.completed(), 1);
  const fresh = mount();
  fresh.submit("south");
  assert.equal(fresh.six.style.transform, undefined);
});
