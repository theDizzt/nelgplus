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
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.route('**/level67-harness', route => route.fulfill({ contentType: 'text/html', body:
    '<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px;transform-origin:top left"></section>' }));
  await page.goto('http://127.0.0.1:5197/level67-harness');
  await page.evaluate(async () => {
    const { level67 } = await import('/src/levels/level67.ts');
    const { LevelScope } = await import('/src/core/LevelScope.ts');
    const { InteractionGuard } = await import('/src/core/InteractionGuard.ts');
    new InteractionGuard().enable();
    window.time67 = new Date(2026, 9, 3, 0, 0, 0).getTime();
    window.audio67 = { musicEnabled: true, effectsEnabled: true, musicVolume: 70, effectsVolume: 80,
      setMusicEnabled(v) { this.musicEnabled = v; }, setEffectsEnabled(v) { this.effectsEnabled = v; },
      setMusicVolume(v) { this.musicVolume = v; }, setEffectsVolume(v) { this.effectsVolume = v; } };
    window.menuVisits67 = 0;
    window.mount67 = (scene = 1) => {
      window.scope67?.dispose();
      window.scope67 = new LevelScope({ screen: document.querySelector('#screen'), initialScene: String(scene), levelNumber: 67, audio: window.audio67, goToMenu: () => window.menuVisits67++, now: () => new Date(window.time67) });
      window.scope67.setCustomCleanup(level67.mount(window.scope67.context));
    };
    const draw = CanvasRenderingContext2D.prototype.fillText;
    window.colors67 = new Set(); window.zeros67 = 0;
    CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
      if (this.canvas.isConnected) { window.colors67.add(this.fillStyle); if (this.fillStyle === '#ff5555' && text === '0') window.zeros67++; }
      return draw.call(this, text, ...args);
    };
    window.mount67(); await document.fonts.ready;
  });
  const counter = name => page.locator(`[data-counter="${name}"]`);
  const display = name => counter(name).locator('input');
  const scene = () => page.locator('#screen').getAttribute('data-scene');
  const click = async (name, delta, count) => { for (let i = 0; i < count; i++) await counter(name).locator(`[data-step="${delta}"]`).click(); };
  const reset = async () => { await page.evaluate(() => { window.time67 = new Date(2026, 9, 3, 0, 0, 0).getTime(); window.mount67(); }); };
  const openMenu = async () => { await counter('blue').click({ button: 'right', position: { x: 90, y: 10 } }); };
  const back = () => page.getByRole('button', { name: 'BACK', exact: true }).click();
  const deleteCyan = async () => {
    await click('cyan', -1, 3);
    await display('cyan').focus(); await display('cyan').evaluate(el => el.setSelectionRange(0, 8));
    await display('cyan').press('Backspace');
    assert.equal(await display('cyan').inputValue(), '0');
    assert.equal(await counter('cyan').getAttribute('data-clicks'), '3');
  };
  mkdirSync('tmp/level67', { recursive: true });
  assert.equal(await page.locator('[data-counter]').count(), 8);
  for (const name of ['red', 'yellow', 'orange', 'green', 'blue', 'pink']) {
    const original = await display(name).inputValue();
    await display(name).focus(); await display(name).press('Control+a');
    await display(name).press('Backspace'); await display(name).press('Delete');
    assert.equal(await display(name).inputValue(), original, `${name} cannot delete text`);
    assert.ok(await display(name).evaluate(el => {
      const event = new InputEvent('beforeinput', { inputType: 'deleteByCut', cancelable: true, bubbles: true });
      el.dispatchEvent(event); return event.defaultPrevented;
    }));
    assert.equal(await counter(name).getAttribute('data-clicks'), '0');
  }
  await openMenu();
  assert.deepEqual(await page.locator('.level-67__menu > button').evaluateAll(els => els.map(el => el.dataset.command)),
    ['music', 'effects', 'music-volume', 'effects-volume', 'zoom-in', 'zoom-out', 'show-all', 'forward', 'back', 'rewind', 'radix']);
  await page.locator('[data-command="music"]').click();
  assert.equal(await page.locator('[data-command="music"]').getAttribute('aria-checked'), 'false');
  await page.locator('[data-command="music-volume"]').click(); await page.locator('[data-volume="30"]').click();
  assert.equal(await page.evaluate(() => window.audio67.musicVolume), 30);
  await page.locator('[data-command="effects-volume"]').click(); await page.locator('[data-volume="40"]').click();
  assert.equal(await page.evaluate(() => window.audio67.effectsVolume), 40);
  await page.locator('[data-command="zoom-in"]').click();
  assert.ok(await page.locator('.level-67__world').evaluate(el => el.style.transform.includes('scale(1.25)')));
  await openMenu(); await page.locator('[data-command="show-all"]').click();
  assert.ok(await page.locator('.level-67__world').evaluate(el => el.style.transform.includes('scale(1)')));
  await openMenu(); await page.locator('[data-command="radix"]').click();
  assert.equal(await page.locator('[data-command="corrupt"]').textContent(), 'Gibberish');
  await page.keyboard.press('Escape');
  await openMenu(); await page.locator('[data-command="rewind"]').click();
  assert.equal(await page.evaluate(() => window.menuVisits67), 1);
  await page.locator('#screen').screenshot({ path: 'tmp/level67/counters.png' });
  await display('red').press('ArrowDown'); assert.equal(await counter('red').getAttribute('data-clicks'), '1');
  await reset();
  await click('red', -1, 15); assert.equal(await display('red').inputValue(), '0');
  await click('yellow', 1, 13); assert.equal(await display('yellow').inputValue(), '0');
  await deleteCyan();
  await display('cyan').pressSequentially('9'); assert.equal(await display('cyan').inputValue(), '0');
  await counter('orange').locator('[data-reset]').click();
  await click('green', -1, 41); assert.equal(await display('green').inputValue(), 'ZERO');
  await openMenu(); await page.locator('[data-command="radix"]').click(); await page.locator('[data-base="2"]').click();
  await click('blue', -1, 42); assert.equal(await display('blue').inputValue(), '0');
  const b = await counter('purple').boundingBox();
  await page.mouse.move(b.x + 90, b.y + 10); await page.mouse.down();
  for (let i = 0; i < 24; i++) await page.mouse.move(b.x + 90 + (i % 2 ? -40 : 40), b.y + 10, { steps: 3 });
  await page.mouse.up();
  assert.equal(await display('purple').inputValue(), '0'); assert.equal(await counter('purple').getAttribute('data-clicks'), '0');
  await page.evaluate(() => { window.time67 = new Date(2026, 9, 3, 2, 39, 42).getTime(); });
  await page.waitForFunction(() => document.querySelector('#screen').dataset.scene === '2');
  assert.equal(await page.locator('#screen').getAttribute('data-optimal'), 'true');
  await page.waitForFunction(() => window.zeros67 > 100);
  await page.locator('#screen').screenshot({ path: 'tmp/level67/optimal.png' });
  await back(); assert.equal(await display('red').inputValue(), '15'); assert.equal(await counter('red').getAttribute('data-clicks'), '0');
  await display('cyan').focus(); await display('cyan').press('Control+a'); await display('cyan').press('Delete');
  assert.equal(await scene(), '2'); assert.equal(await page.locator('#screen').getAttribute('data-optimal'), 'false');
  await back(); assert.equal(await display('cyan').inputValue(), '694877683');
  for (const command of ['back', 'forward']) {
    await openMenu(); await page.locator(`[data-command="${command}"]`).click(); assert.equal(await scene(), '2'); await back();
  }
  await openMenu(); await page.locator('[data-command="radix"]').click(); await page.locator('[data-command="corrupt"]').click();
  await page.waitForFunction(() => [...document.querySelectorAll('.level-67__display')].every(el => /^[\u2500-\u257f]{9}$/.test(el.value)));
  assert.equal(await scene(), '1');
  await page.waitForFunction(() => document.querySelector('#screen').dataset.scene === '2');
  await reset(); await deleteCyan(); await click('cyan', 1, 67);
  for (const name of ['red', 'yellow', 'orange', 'blue', 'purple', 'pink']) await display(name).fill('67');
  await display('green').fill('SIXSEVEN');
  await page.waitForFunction(() => document.querySelector('#screen').dataset.scene === '3');
  await page.waitForFunction(() => window.colors67.has('#bbffbb') && window.colors67.has('#004d12'));
  await page.locator('#screen').screenshot({ path: 'tmp/level67/secret.png' });
  await back(); assert.equal(await display('green').inputValue(), 'ZEST');
  await page.evaluate(() => { window.time67 = new Date(2026, 9, 3, 2, 39, 42).getTime(); });
  await page.waitForFunction(() => document.querySelector('[data-counter="pink"] input').value === '0');
  await page.evaluate(() => { window.time67 += 5000; });
  await click('pink', 1, 1); assert.equal(await display('pink').inputValue(), '1');
  await click('purple', -1, 1); const frozen = await display('purple').inputValue();
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 150)));
  assert.equal(await display('purple').inputValue(), frozen);
  await click('purple', 1, 1); await page.waitForFunction(old => document.querySelector('[data-counter="purple"] input').value !== old, frozen);
  await page.evaluate(() => window.scope67.dispose());
  assert.deepEqual(errors, []);
  console.log('PASS Level 67: minimum route, keyboard/deletion, wrap, radix, shaking, clock, reset, corruption, secret');
} finally { await browser?.close(); await server.close(); }
