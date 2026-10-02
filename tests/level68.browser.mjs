import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5198, strictPort: true } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.route('**/level68-harness', route => route.fulfill({ contentType: 'text/html', body:
    '<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px;transform-origin:top left"></section>' }));
  await page.goto('http://127.0.0.1:5198/level68-harness');
  await page.evaluate(async () => {
    const { level68 } = await import('/src/levels/level68.ts');
    const { CONSTANT_CLUES } = await import('/src/levels/level68Constants.ts');
    const { getLevel } = await import('/src/levels/registry.ts');
    const { LevelScope } = await import('/src/core/LevelScope.ts');
    const { InteractionGuard } = await import('/src/core/InteractionGuard.ts');
    window.guard68 = new InteractionGuard(); window.guard68.enable();
    window.completed68 = 0; window.wrong68 = 0;
    window.constants68 = CONSTANT_CLUES;
    window.definition68 = { registered: getLevel(68) === level68, scenes: level68.scenes.length };
    window.scope68 = new LevelScope({ screen: document.querySelector('#screen'), levelNumber: 68,
      audio: {}, now: () => new Date(), complete: () => window.completed68++,
      wrongAnswer: () => { window.wrong68++; return false; } });
    window.scope68.setCustomCleanup(level68.mount(window.scope68.context));
    await Promise.all([...document.images].map(img => img.decode()));
    await document.fonts.ready;
  });
  assert.deepEqual(await page.evaluate(() => window.definition68), { registered: true, scenes: 1 });
  const input = page.locator('input');
  const clue = page.locator('.level-68__clue');
  const go = page.locator('button');
  const paste = async value => {
    await input.focus(); await input.press('Control+a');
    await input.evaluate((el, value) => {
      const clipboardData = new DataTransfer(); clipboardData.setData('text/plain', value);
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
    }, value);
  };
  mkdirSync('tmp/level68', { recursive: true });
  await page.locator('#screen').screenshot({ path: 'tmp/level68/main.png' });
  assert.equal(await input.getAttribute('maxlength'), '768');
  assert.equal(await clue.textContent(), '??');
  assert.equal(await page.locator('.level-68__stars').count(), 4);
  assert.deepEqual(await page.evaluate(() => [
    getComputedStyle(document.querySelector('.level-68__shade')).opacity,
    getComputedStyle(document.querySelector('form')).opacity,
    getComputedStyle(document.querySelector('.level-heading__number')).fontFamily,
  ]), ['0.64', '0.76', '"NELG Perpetua", Perpetua, Georgia, "Times New Roman", serif']);
  await page.locator('.level-68__eight').hover();
  assert.equal(await page.locator('.level-68__eight > span').evaluate(el => getComputedStyle(el).transform), 'matrix(0, 1, -1, 0, 0, 0)');
  await page.locator('#screen').screenshot({ path: 'tmp/level68/hover.png' });
  await page.mouse.move(850, 650);
  assert.equal(await page.locator('.level-68__eight > span').evaluate(el => getComputedStyle(el).transform), 'none');
  for (const key of ['Tab', 'Shift+Tab']) {
    await input.focus(); await input.press(key);
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'BODY');
  }
  assert.deepEqual(await page.evaluate(() => [false, true].map(shiftKey => {
    const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
    document.dispatchEvent(e); return e.defaultPrevented;
  })), [true, true]);
  const constants = await page.evaluate(() => window.constants68);
  assert.deepEqual(constants.map(c => c.fragment), ['un', 'Li', 'mi', 'te', 'd!']);
  assert.deepEqual(constants.map(c => c.password.slice(-10)), ['2891516645', '2990981629', '2434203285', '4998920868', '2113499999']);
  for (const [i, c] of constants.entries()) {
    assert.equal(c.password.length, 768);
    await paste(c.password);
    assert.equal(await input.inputValue(), '*'.repeat(768));
    if (i % 2) await input.press('Enter'); else await go.click();
    assert.equal(await clue.textContent(), c.fragment);
    assert.equal(await page.evaluate(() => window.wrong68), 0, 'valid clues are not wrong answers');
    await input.press('End'); await input.press('Backspace');
    assert.equal(await clue.textContent(), '??', 'deletion clears a revealed fragment immediately');
    await input.pressSequentially(c.password.at(-1));
    await go.click(); assert.equal(await clue.textContent(), c.fragment);
    // Replacing selected content also clears the fragment, including through paste.
    await paste('wrong'); assert.equal(await clue.textContent(), '??');
  }
  await paste(constants[0].password + '123');
  assert.equal((await input.inputValue()).length, 768, 'paste is capped');
  await input.press('End'); await input.pressSequentially('9');
  assert.equal((await input.inputValue()).length, 768, 'typing is capped');
  await go.click(); assert.equal(await clue.textContent(), 'un');
  for (const wrong of [constants[0].password.slice(1), constants[1].password.slice(0, -1),
    constants[2].password.slice(0, -1) + '6', 'unlimited!', 'Unlimited!', 'unLimited']) {
    await paste(wrong); await go.click(); assert.equal(await clue.textContent(), '??');
    assert.equal(await page.evaluate(() => window.completed68), 0);
  }
  assert.equal(await page.evaluate(() => window.wrong68), 6);
  await page.locator('#screen').evaluate(el => { el.style.transform = 'scale(.55)'; });
  await paste(constants[4].password); await go.click();
  assert.equal(await clue.textContent(), 'd!');
  await paste('unLimited!'); await input.press('Enter');
  assert.equal(await page.evaluate(() => window.completed68), 1);
  await page.locator('form').evaluate(el => el.requestSubmit());
  assert.equal(await page.evaluate(() => window.completed68), 1, 'completion only fires once');
  await page.evaluate(() => window.scope68.dispose());
  assert.equal(await page.evaluate(() => {
    const e = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true });
    document.dispatchEvent(e); return e.defaultPrevented;
  }), false, 'Tab listener is removed on exit');
  assert.deepEqual(errors, []);
  console.log('PASS Level 68: assets, title hover, Tab, five constants, 768-character limit, edit reset, exact answer, scaling, cleanup');
} finally {
  await browser?.close();
  await server.close();
}
