import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5199, strictPort: true } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.route('**/level69-harness', route => route.fulfill({ contentType: 'text/html', body:
    '<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px;transform-origin:top left"></section>' }));
  await page.goto('http://127.0.0.1:5199/level69-harness');
  await page.evaluate(async () => {
    const { level69 } = await import('/src/levels/level69.ts');
    const { LevelScope } = await import('/src/core/LevelScope.ts');
    const { InteractionGuard } = await import('/src/core/InteractionGuard.ts');
    const { getLevel } = await import('/src/levels/registry.ts');
    window.guard69 = new InteractionGuard(); window.guard69.enable();
    // Reproducible swim paths with genuine animation frames.
    let randomSeed = 69;
    Math.random = () => ((randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0) / 4294967296);
    window.warps69 = []; window.music69 = [];
    window.mount69 = scene => {
      window.scope69?.dispose();
      window.scope69 = new LevelScope({
        screen: document.querySelector('#screen'), levelNumber: 69, initialScene: scene,
        audio: { playMusic: async source => window.music69.push(source), stopMusic: () => {} },
        goToWarpZone: n => window.warps69.push(n), now: () => new Date(),
      });
      window.scope69.setCustomCleanup(level69.mount(window.scope69.context));
    };
    window.definition69 = { count: level69.scenes.length, registered: getLevel(69) === level69 };
    window.mount69('1');
  });
  await page.evaluate(() => document.fonts.ready);
  assert.deepEqual(await page.evaluate(() => window.definition69), { count: 19, registered: true });
  const scene = () => page.locator('#screen').getAttribute('data-scene');
  const mount = async n => { await page.mouse.move(850, 650); await page.evaluate(n => window.mount69(String(n)), n); };
  mkdirSync('tmp/level69', { recursive: true });
  await page.locator('#screen').screenshot({ path: 'tmp/level69/scene1.png' });

  // Direct admin entry and Tab/Shift+Tab are checked on every scene, not just Main.
  for (let n = 1; n <= 19; n++) {
    await mount(n);
    assert.equal(await scene(), String(n));
    assert.deepEqual(await page.evaluate(() => [false, true].map(shiftKey => {
      const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
      document.dispatchEvent(e); return e.defaultPrevented;
    })), [true, true], `Tab blocked in scene ${n}`);
    if (n >= 3 && n <= 17) {
      assert.equal(await page.locator('.level-69__article section').count(), 11);
      assert.ok(await page.locator('.level-69__article').evaluate(el => el.scrollHeight > el.clientHeight));
    }
  }
  await mount(1);
  await page.evaluate(() => {
    window.water69 = document.querySelector('.level-69__water');
    window.flow69 = document.querySelector('.level-69__rainbow').getAnimations()[0];
    window.flowTime69 = window.flow69.currentTime;
    window.musicCount69 = window.music69.length;
  });
  await page.locator('[data-start]').click();
  assert.equal(await scene(), '2');

  async function clickFish(index, opaque) {
    await page.locator('[data-fish]').evaluateAll(async images => { await Promise.all(images.map(img => img.decode())); });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return page.locator(`[data-fish="${index}"]`).evaluate((img, opaque) => {
      window.fishPixelCache69 ??= new Map();
      const otherFish = [...document.querySelectorAll('[data-fish]')].map(other => {
        let pixels = window.fishPixelCache69.get(other.src);
        if (!pixels) {
          const c = document.createElement('canvas'); c.width = other.naturalWidth; c.height = other.naturalHeight;
          const context = c.getContext('2d'); context.drawImage(other, 0, 0);
          pixels = context.getImageData(0, 0, c.width, c.height);
          window.fishPixelCache69.set(other.src, pixels);
        }
        return { image: other, pixels, bounds: other.getBoundingClientRect(),
          inverse: new DOMMatrix(getComputedStyle(other).transform).inverse(),
          zoom: other.parentElement.getBoundingClientRect().width / other.parentElement.offsetWidth };
      });
      otherFish.reverse();
      const hitAt = (x, y) => otherFish.find(({ image, pixels, bounds, inverse, zoom }) => {
        const p = inverse.transformPoint(new DOMPoint((x - bounds.left - bounds.width / 2) / zoom,
          (y - bounds.top - bounds.height / 2) / zoom));
        const s = Math.min(image.offsetWidth / pixels.width, image.offsetHeight / pixels.height);
        const px = Math.floor(p.x / s + pixels.width / 2), py = Math.floor(p.y / s + pixels.height / 2);
        return px >= 0 && py >= 0 && px < pixels.width && py < pixels.height
          && pixels.data[(py * pixels.width + px) * 4 + 3] > 0;
      });
      const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const bounds = img.getBoundingClientRect();
      const parent = img.parentElement;
      const gameScale = parent.getBoundingClientRect().width / parent.offsetWidth;
      const scale = Math.min(img.offsetWidth / canvas.width, img.offsetHeight / canvas.height);
      const rotation = new DOMMatrix(getComputedStyle(img).transform);
      const radius = Math.ceil(2 / (scale * gameScale));
      // Find a real solid interior or truly transparent pixel, away from anti-aliased boundaries.
      for (let y = 5; y < canvas.height - 5; y += 5) for (let x = 5; x < canvas.width - 5; x += 5) {
        const a = data[(y * canvas.width + x) * 4 + 3];
        const solidPatch = opaque && a > 128 && [-radius, 0, radius].every(dy => [-radius, 0, radius].every(dx =>
          x + dx >= 0 && y + dy >= 0 && x + dx < canvas.width && y + dy < canvas.height
          && data[((y + dy) * canvas.width + x + dx) * 4 + 3] > 128));
        if (opaque ? solidPatch : a === 0) {
          const point = rotation.transformPoint(new DOMPoint((x + .5 - canvas.width / 2) * scale, (y + .5 - canvas.height / 2) * scale));
          const client = { x: Math.round(bounds.left + bounds.width / 2 + point.x * gameScale),
            y: Math.round(bounds.top + bounds.height / 2 + point.y * gameScale) };
          if (document.elementFromPoint(client.x, client.y)?.closest('.level-69__index')
            && (opaque ? hitAt(client.x, client.y)?.image === img
              : [-3, 0, 3].every(dy => [-3, 0, 3].every(dx => !hitAt(client.x + dx, client.y + dy))))) {
            // Sample and click in the same frame so a direction change cannot stale the point.
            document.elementFromPoint(client.x, client.y).dispatchEvent(new MouseEvent('click', {
              bubbles: true, cancelable: true, clientX: client.x, clientY: client.y,
            }));
            return;
          }
        }
      }
      throw Error(`No ${opaque ? 'opaque' : 'transparent'} pixel in ${img.src}`);
    }, opaque);
  }
  await page.locator('#screen').screenshot({ path: 'tmp/level69/scene2.png' });
  await page.evaluate(() => {
    window.swimStart69 = [...document.querySelectorAll('[data-fish]')].map(img => ({
      position: img.parentElement.style.transform,
      facing: (() => { const m = new DOMMatrix(getComputedStyle(img).transform); return Math.sign(m.a * m.d - m.b * m.c); })(),
    }));
  });
  await page.waitForFunction(() => [...document.querySelectorAll('[data-fish]')].every((img, i) =>
    img.parentElement.style.transform !== window.swimStart69[i].position));
  await page.waitForFunction(() => [...document.querySelectorAll('[data-fish]')].some((img, i) => {
    const m = new DOMMatrix(getComputedStyle(img).transform);
    return Math.sign(m.a * m.d - m.b * m.c) !== window.swimStart69[i].facing;
  }), undefined, { timeout: 10000 });
  assert.ok(await page.locator('.level-69__index').evaluate(index => {
    const area = index.getBoundingClientRect();
    return [...index.querySelectorAll('img')].every(img => {
      const b = img.getBoundingClientRect();
      return b.left >= area.left && b.right <= area.right && b.top >= area.top && b.bottom <= area.bottom;
    });
  }), 'swimming fish remain clear of the title and BACK');
  for (let i = 0; i < 15; i++) {
    await clickFish(i, false);
    assert.equal(await scene(), '2', `transparent part of fish ${i} ignored`);
    await clickFish(i, true);
    assert.equal(await scene(), String(i + 3), `fish ${i} opens matching entry`);
    if (i === 6) {
      await page.locator('#screen').screenshot({ path: 'tmp/level69/scene9.png' });
      await page.locator('.level-69__article').hover(); await page.mouse.wheel(0, 500);
      await page.waitForFunction(() => document.querySelector('.level-69__article').scrollTop > 0);
    }
    await page.locator('[data-back]').click();
  }
  assert.ok(await page.evaluate(() => document.querySelector('.level-69__water') === window.water69
    && document.querySelector('.level-69__rainbow').getAnimations()[0] === window.flow69
    && window.flow69.currentTime > window.flowTime69 && window.music69.length === window.musicCount69));

  await page.locator('#screen').evaluate(el => { el.style.transform = 'scale(.55)'; });
  for (const i of [0, 3, 10, 11]) {
    await clickFish(i, false);
    assert.equal(await scene(), '2');
    await clickFish(i, true);
    assert.equal(await scene(), String(i + 3), 'alpha hit testing handles game scaling');
    await page.locator('[data-back]').click();
  }
  await page.locator('#screen').evaluate(el => { el.style.transform = ''; });

  // Exact alphabetical order; use hard-coded expected order independent of implementation.
  const order = [0, 11, 7, 10, 8, 3, 2, 5, 1, 6, 9, 14, 4, 12, 13];
  await mount(2);
  // Wrong-order clicks cannot count as progress.
  for (const i of [0, 7, ...order.slice(2)]) {
    await clickFish(i, true);
    assert.notEqual(await scene(), '18'); await page.locator('[data-back]').click();
  }
  for (const [position, i] of order.entries()) {
    await clickFish(i, true);
    assert.equal(await scene(), position === 14 ? '18' : String(i + 3));
    if (position !== 14) await page.locator('[data-back]').click();
  }
  await page.locator('#screen').screenshot({ path: 'tmp/level69/scene18.png' });
  await page.locator('[data-back]').click(); assert.equal(await scene(), '1');

  // Count real cursor entries, not pointermove events within the START button.
  for (const count of [68, 69]) {
    await mount(1);
    const b = await page.locator('[data-start]').boundingBox();
    for (let i = 0; i < count; i++) {
      await page.mouse.move(30, 30); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    }
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    assert.equal(await scene(), count === 68 ? '2' : '19', `${count} hover threshold`);
  }
  await page.locator('#screen').screenshot({ path: 'tmp/level69/scene19.png' });
  assert.ok(await page.evaluate(() => {
    const reference = document.createElement('form');
    reference.className = 'level-08__form';
    reference.innerHTML = '<input class="nelg-password-input"><button type="button">GO</button>';
    document.querySelector('#screen').append(reference);
    const expected = reference.querySelector('input').getBoundingClientRect();
    const actual = document.querySelector('.level-69__form input').getBoundingClientRect();
    reference.remove();
    return ['x', 'y', 'width', 'height'].every(key => Math.abs(actual[key] - expected[key]) < .1);
  }), 'Scene 19 input matches Level 8 position and dimensions');

  for (const scale of [1, .55]) {
    for (const edge of ['top', 'right', 'bottom', 'left']) {
      await mount(19);
      await page.locator('#screen').evaluate((el, scale) => { el.style.transform = `scale(${scale})`; }, scale);
      await page.locator('input').pressSequentially('salmon');
      assert.equal(await page.locator('input').inputValue(), '******');
      const before = await page.evaluate(() => window.warps69.length);
      await page.locator('input').press('Enter');
      const b = await page.locator('.level-69__go').boundingBox();
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      assert.equal(await page.evaluate(() => window.warps69.length), before, 'Enter and center cannot submit');
      const x = edge === 'left' ? b.x + 1.5 * scale : edge === 'right' ? b.x + b.width - 1.5 * scale : b.x + b.width / 2;
      const y = edge === 'top' ? b.y + 1.5 * scale : edge === 'bottom' ? b.y + b.height - 1.5 * scale : b.y + b.height / 2;
      await page.mouse.click(x, y);
      assert.equal(await page.evaluate(() => window.warps69.length), before + 1, `${edge} stroke works at scale ${scale}`);
      assert.equal(await page.evaluate(() => window.warps69.at(-1)), 17);
    }
  }
  await mount(19);
  await page.locator('input').pressSequentially('wrong');
  const b = await page.locator('.level-69__go').boundingBox();
  const before = await page.evaluate(() => window.warps69.length);
  await page.mouse.click(b.x + b.width / 2, b.y + .8);
  assert.equal(await page.evaluate(() => window.warps69.length), before);
  assert.equal(await page.locator('[role="status"]').count(), 0, 'wrong answers display no message');

  await page.evaluate(() => window.scope69.dispose());
  assert.equal(await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true });
    document.dispatchEvent(event); return event.defaultPrevented;
  }), false, 'Tab handler is removed on level exit');
  assert.deepEqual(errors, []);
  console.log('PASS Level 69: swimming, direction flips, bounds, 19 scenes, Tab, alpha hitboxes, scroll, persistent animation/music, sequence, hover threshold, border-only warp, cleanup');
} finally {
  await browser?.close();
  await server.close();
}
