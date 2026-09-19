import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const base = process.env.TEST_URL || "http://127.0.0.1:5174";
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/maze-harness", route => route.fulfill({ contentType: "text/html", body: '<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px;overflow:hidden;transform-origin:top left"></section>' }));
  await page.goto(`${base}/maze-harness`);
  await page.clock.install();
  const initialize = () => page.evaluate(async () => {
    const { level61 } = await import("/src/levels/level61.ts");
    let cleanup, abort;
    window.mount61 = (scene = "1") => {
      cleanup?.(); abort?.abort(); abort = new AbortController();
      cleanup = level61.mount({ screen: document.querySelector("#screen"), initialScene: scene,
        audio: { playMusic: async () => {}, stopMusic: () => {} },
        listen: (target, type, callback) => target.addEventListener(type, callback, { signal: abort.signal }) });
    };
    window.mount61();
  });
  await initialize();
  const scene = () => page.locator("#screen").getAttribute("data-scene");
  const ready = () => page.waitForSelector('.level-61__maze-world[data-ready]', { state: 'attached' });
  const start = async () => {
    await page.evaluate(() => window.mount61()); await ready();
    await page.locator("[data-start]").click();
    assert.equal(await scene(), "2");
  };
  await start();
  const stage = await page.locator("#screen").boundingBox();
  const maze = await page.locator(".level-61__maze-world img").boundingBox();
  assert.equal(maze.width, stage.width);
  await page.mouse.move(stage.x + 400, stage.y + 300);
  assert.equal(await scene(), "2", "transparent image pixels are safe");
  await page.mouse.move(stage.x + 5, stage.y + 300);
  assert.equal(await scene(), "3", "opaque pixels fail");
  await page.locator("[data-retry]").click();
  assert.equal(await scene(), "2", "retry resets scroll and collision history");
  await page.clock.fastForward(500);
  assert.ok(await page.locator(".level-61__maze-world").evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42 < 0));
  await page.mouse.move(stage.x + stage.width + 10, stage.y + 300);
  assert.equal(await scene(), "3", "leaving the stage fails");
  await start();
  await page.clock.fastForward(5000);
  assert.equal(await scene(), "3", "scrolling a wall under a stationary pointer fails");
  await start();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  assert.equal(await scene(), "3", "window focus loss fails");
  await start();
  await page.locator('.level-61__maze-goal').evaluate(el => el.click());
  assert.equal(await scene(), "2", "offscreen programmatic exit cannot skip maze");

  await page.evaluate(() => window.mount61()); await ready();
  await page.keyboard.type('melonsoda84');
  await page.locator('[data-start]').click();
  await page.mouse.move(stage.x + 5, stage.y + 300);
  assert.equal(await scene(), '2', 'Scene 1 cheat prevents wall deaths');
  await page.mouse.move(stage.x + stage.width + 10, stage.y + 300);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.equal(await scene(), '2', 'invincibility also prevents exit and focus deaths');
  await page.mouse.move(stage.x + 400, stage.y + 300);
  await page.clock.fastForward(100000);
  await page.locator('.level-61__maze-goal').click();
  assert.equal(await scene(), '4', 'invincibility permits completing the real maze');
  // Re-enter within the same mount to verify Scene 4 cleared the cheat state.
  await page.mouse.move(stage.x + 400, stage.y + 300);
  await page.locator('[data-retry]').evaluate(button => button.click());
  await page.mouse.move(stage.x + 5, stage.y + 300);
  assert.equal(await scene(), '3', 'Scene 4 clears invincibility');
  await start();
  await page.keyboard.type('melonsoda84');
  await page.mouse.move(stage.x + 5, stage.y + 300);
  assert.equal(await scene(), '3', 'cheat cannot be activated in Scene 2');

  // A transparent fixture with the same dimensions exercises a full timed run and
  // the opaque red marker override without encoding a solver for this artwork.
  const fixture = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 800; c.height = 20024;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#f00'; ctx.fillRect(582, 10327, 40, 40);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.route('**/assets/images/level61maze1.png', route => route.fulfill({ contentType: 'image/png', body: Buffer.from(fixture, 'base64') }));
  await page.reload();
  await initialize();
  await start();
  await page.clock.fastForward(150000);
  assert.equal(await scene(), "2");
  const goal = await page.locator('.level-61__maze-goal').boundingBox();
  assert.ok(Math.abs(goal.x + goal.width / 2 - stage.x - 602) < 1);
  assert.ok(Math.abs(goal.y + goal.height / 2 - stage.y - 300) < 1, "goal scrolls with image");
  await page.locator('.level-61__maze-goal').click();
  assert.equal(await scene(), "4", "clicking the circle covering the X enters Scene 4");

  for (const scale of [1, .65]) {
    await page.evaluate(scale => { window.mount61('4'); document.querySelector('#screen').style.transform = `scale(${scale})`; }, scale);
    for (let i = 1; i <= 3; i++) {
      const layer = page.locator(`[data-password-layer="${i}"]`);
      const before = await layer.boundingBox();
      await page.mouse.move(before.x + 5 * scale, before.y + 54 * scale);
      await page.mouse.down();
      await page.mouse.move(before.x + 5 * scale, before.y + (54 - 80 * i) * scale, { steps: 4 });
      await page.mouse.up();
      const after = await layer.boundingBox();
      assert.ok(Math.abs(after.y - before.y + 80 * i * scale) < 1, `layer ${i} drags at scale ${scale}`);
    }
    const bottom = page.locator('[data-password-layer="4"]');
    const before = await bottom.boundingBox();
    await page.mouse.move(before.x + 5 * scale, before.y + 54 * scale);
    await page.mouse.down(); await page.mouse.move(before.x + 20, before.y - 80); await page.mouse.up();
    assert.deepEqual(await bottom.boundingBox(), before, 'bottom layer is fixed');
    await page.getByRole('textbox', { name: 'Password 4', exact: true }).fill('test');
    assert.equal(await page.getByRole('textbox', { name: 'Password 4', exact: true }).inputValue(), '****');
  }
  assert.deepEqual(errors, []);
  console.log('PASS: real image alpha collision, scrolling, retry, exit/focus guards, goal transition, three draggable layers, fixed editable bottom, scaled coordinates.');
} finally { await browser.close(); }
