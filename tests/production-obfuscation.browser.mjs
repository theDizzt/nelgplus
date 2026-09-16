// Build first, then run against vite preview on port 4173.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const assets = readdirSync(new URL("../dist/assets/", import.meta.url));
assert.ok(!assets.some(name => name.endsWith(".map")), "No production source maps");
const bundle = assets.filter(name => name.endsWith(".js"))
  .map(name => readFileSync(new URL(`../dist/assets/${name}`, import.meta.url), "utf8")).join("\n");
const gameSource = readFileSync(new URL("../src/core/Game.ts", import.meta.url), "utf8");
const passwords = [...gameSource.matchAll(/password: "([^"]+)"/g)].map(match => match[1]);
assert.ok(passwords.length > 0);
const shippedStrings = [];
function collectStrings(node) {
  if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) shippedStrings.push(node.text);
  ts.forEachChild(node, collectStrings);
}
collectStrings(ts.createSourceFile("bundle.js", bundle, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
for (const password of passwords) assert.ok(!shippedStrings.some(value => value.includes(password)), "Warp password must not ship as a readable string");

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${process.env.TEST_URL || "http://127.0.0.1:4173"}/?debug=1`);
  await page.locator("[data-menu-action=start]").click();
  await page.locator(".level-01__continue").click();
  await page.locator(".level-02__prompt").waitFor();
  await page.keyboard.press("n");
  await page.locator(".level-03__end-button").waitFor({ state: "attached" });
  // The puzzle's button is beyond the draggable viewport.
  await page.locator(".level-03__end-button").evaluate(button => button.click());
  const input = page.locator("#level-04-password");
  await input.fill("15");
  await page.locator(".level-04__form button").click();
  assert.equal(await page.locator(".level-04").count(), 1);
  await input.fill("16");
  await page.locator(".level-04__form button").click();
  await page.locator(".level-05").waitFor();
  assert.equal(await page.locator(".debug-controls").count(), 0);
  assert.deepEqual(errors, []);
  console.log("Production checks passed: password encoding, no maps/debug controls, levels 1–5, wrong/correct answers.");
} finally {
  await browser.close();
}
