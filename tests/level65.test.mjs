import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function moduleUrl(path, replace = source => source) {
  const source = replace(readFileSync(new URL(path, import.meta.url), "utf8"));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const tabNavigationUrl = moduleUrl("../src/core/blockTabNavigation.ts");
const maskedInputUrl = moduleUrl("../src/core/StarMaskedInput.ts");
const { level65 } = await import(moduleUrl("../src/levels/level65.ts", source => source
  .replace('import { assetUrl } from "../core/assets";', 'const assetUrl = path => path;')
  .replace('"../core/StarMaskedInput"', JSON.stringify(maskedInputUrl))
  .replace('"../core/blockTabNavigation"', JSON.stringify(tabNavigationUrl))));

function element() {
  const classes = new Set();
  return Object.assign(new EventTarget(), {
    classList: { add: (...items) => items.forEach(item => classes.add(item)),
      remove: (...items) => items.forEach(item => classes.delete(item)),
      toggle: (item, enabled) => enabled ? classes.add(item) : classes.delete(item) },
  });
}
function emit(target, name, fields = {}) {
  const event = new Event(name, { cancelable: true });
  Object.assign(event, fields);
  target.dispatchEvent(event);
}
async function mount(scene) {
  globalThis.document = Object.assign(element(), { createElement: () => ({
    getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, 0, 255, 0, 255, 255]) }) }),
  }) });
  const image = { decode: async () => {}, naturalWidth: 2, naturalHeight: 1,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 }) };
  const button = Object.assign(element(), { querySelector: () => image });
  const input = Object.assign(element(), { value: "", maxLength: -1, selectionStart: 0, selectionEnd: 0,
    setAttribute() {}, focus() {}, setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; } });
  const form = Object.assign(element(), { querySelector: () => input, requestSubmit() { emit(this, "submit"); } });
  const screen = { dataset: {}, querySelector: selector => selector === "form" ? (scene === "equation" ? form : null) : button };
  const flags = new Set(), timers = [];
  let menus = 0, completed = 0, wrong = 0;
  const cleanup = level65.mount({ screen, initialScene: scene,
    session: { setFlag: flag => flags.add(flag) },
    listen: (target, name, listener) => target.addEventListener(name, listener),
    timeout: callback => timers.push(callback), goToMenu: () => menus++,
    complete: () => completed++, wrongAnswer: () => { wrong++; return false; } });
  await Promise.resolve();
  return { screen, flags, button, cleanup, flush: () => timers.splice(0).forEach(callback => callback()),
    menus: () => menus, completed: () => completed, wrong: () => wrong,
    submit(answer) {
      input.selectionStart = 0; input.selectionEnd = input.value.length;
      emit(input, "beforeinput", { inputType: "insertText", data: answer });
      emit(input, "keydown", { key: "Enter", repeat: false });
    } };
}

test("rewind ignores transparent pixels and arms the session only from Main", async () => {
  for (const scene of level65.scenes) {
    const game = await mount(scene.id);
    emit(game.button, "click", { detail: 1, clientX: 20, clientY: 50 });
    game.flush();
    assert.equal(game.menus(), 0);
    assert.equal(game.flags.size, 0);
    emit(game.button, "click", { detail: 1, clientX: 150, clientY: 50 });
    game.flush();
    assert.equal(game.menus(), 1);
    assert.equal(game.flags.has("level65-rewind"), scene.id === "main");
    game.cleanup();
  }
});

test("Equation rejects wrong answers and completes once for 20210 via Enter", async () => {
  const game = await mount("equation");
  game.submit("20211");
  assert.equal(game.wrong(), 1);
  assert.equal(game.completed(), 0);
  game.submit("20210");
  game.submit("20210");
  assert.equal(game.completed(), 1);
  assert.match(game.screen.innerHTML, /level65b5\.png/);
  assert.match(game.screen.innerHTML, /level65c5\.png/);
  game.cleanup();
});
