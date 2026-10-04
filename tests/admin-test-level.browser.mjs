import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5196, strictPort: true } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.route('**/admin-harness', route => route.fulfill({ contentType: 'text/html', body:
    '<link rel="stylesheet" href="/src/styles/global.css"><div id="game-root"></div>' }));
  await page.goto('http://127.0.0.1:5196/admin-harness');
  await page.evaluate(async () => {
    const { Game } = await import('/src/core/Game.ts');
    const { getLevel, registeredLevelNumbers } = await import('/src/levels/registry.ts');
    window.lookup = [getLevel(255)?.title, registeredLevelNumbers.includes(255),
      Array.from({ length: 104 }, (_, i) => getLevel(i + 151)).every(x => x === undefined)];
    window.game = new Game(document.querySelector('#game-root'));
    window.game.renderOptions();
  });
  assert.deepEqual(await page.evaluate(() => window.lookup), ['Test', false, true]);
  await page.keyboard.type('melonsoda84');
  const input = page.locator('#admin-level-number');
  assert.equal(await input.getAttribute('max'), '255');
  for (const n of [151, 200, 254]) {
    await input.fill(String(n)); await input.press('Enter');
    assert.equal(await page.locator('#admin-level-feedback').textContent(), `LEVEL ${n} DOES NOT EXIST.`);
  }
  await input.fill('255'); await input.press('Enter');
  await page.waitForSelector('.test-level');
  assert.equal(await page.locator('.level-heading__number').textContent(), 'Level 255');
  assert.equal(await page.locator('.level-heading h1').textContent(), 'Test');
  console.log('PASS admin: Level 255 opens Test; 151–254 absent; test excluded from normal progression');
} finally { await browser?.close(); await server.close(); }
