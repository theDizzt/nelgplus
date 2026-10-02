import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5197, strictPort: true } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/level67-harness', route => route.fulfill({ contentType: 'text/html', body:
    '<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px"></section>' }));
  await page.goto('http://127.0.0.1:5197/level67-harness');
  await page.evaluate(async () => {
    const { level67, MATRIX_COLORS } = await import('/src/levels/level67.ts');
    const { getLevel } = await import('/src/levels/registry.ts');
    const { LevelScope } = await import('/src/core/LevelScope.ts');
    window.meta67 = [getLevel(67) === level67, level67.scenes.length, MATRIX_COLORS];
    window.paint67 = { count: 0, columns: new Set(), invalid: false };
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
      window.paint67.count++; window.paint67.columns.add(x);
      if (!/^[A-Z0-9]$/.test(text) || !MATRIX_COLORS.includes(this.fillStyle) || !this.font.includes('Courier')) window.paint67.invalid = true;
      return original.call(this, text, x, y);
    };
    window.mount67 = scene => {
      window.scope67?.dispose();
      window.scope67 = new LevelScope({ screen: document.querySelector('#screen'), initialScene: String(scene), levelNumber: 67, audio: {} });
      window.scope67.setCustomCleanup(level67.mount(window.scope67.context));
    };
    window.mount67(1);
    await document.fonts.ready;
    await document.querySelector('img').decode();
  });
  const meta = await page.evaluate(() => window.meta67);
  assert.deepEqual(meta.slice(0, 2), [true, 3]);
  assert.equal(new Set(meta[2]).size, 215);
  assert.ok(meta[2].every(c => /^#(?:00|33|66|99|cc|ff){3}$/.test(c) && c !== '#000000'));
  assert.deepEqual(await page.evaluate(() => ['#screen', 'input', 'button'].map(s => {
    const c = getComputedStyle(document.querySelector(s)); return [c.backgroundColor, c.color, c.opacity];
  })), [['rgb(30, 144, 255)', 'rgb(0, 0, 0)', '1'], ['rgb(51, 51, 51)', 'rgb(255, 0, 0)', '1'], ['rgb(255, 255, 0)', 'rgb(17, 17, 17)', '0.76']]);
  await page.locator('input').pressSequentially('test');
  assert.equal(await page.locator('input').inputValue(), '****');
  await page.locator('button').click();
  assert.equal(await page.locator('#screen').getAttribute('data-scene'), '1');
  mkdirSync('tmp/level67', { recursive: true });
  await page.locator('#screen').screenshot({ path: 'tmp/level67/zero.png' });
  await page.evaluate(() => window.mount67(2));
  await page.waitForFunction(() => window.paint67.columns.size === 64);
  assert.equal(await page.evaluate(() => window.paint67.invalid), false);
  await page.locator('#screen').screenshot({ path: 'tmp/level67/one.png' });
  await page.getByRole('button', { name: 'BACK' }).click();
  assert.equal(await page.locator('#screen').getAttribute('data-scene'), '1');
  const count = await page.evaluate(() => window.paint67.count);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.evaluate(() => window.paint67.count), count, 'BACK cancels animation');
  await page.evaluate(() => window.mount67(3));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'), '3');
  assert.equal(await page.locator('canvas, input, button').count(), 0);
  await page.evaluate(() => window.mount67(2));
  await page.waitForFunction(old => window.paint67.count > old, count);
  await page.evaluate(() => window.scope67.dispose());
  const stopped = await page.evaluate(() => window.paint67.count);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.evaluate(() => window.paint67.count), stopped, 'level disposal cancels animation');
  assert.deepEqual(errors, []);
  console.log('PASS Level 67: three scenes, form styling/masking, 64 matrix columns, palette/characters, BACK, disposal');
} finally {
  await browser?.close(); await server.close();
}
