import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/level61-harness", route => route.fulfill({ contentType: "text/html", body: '<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px;overflow:hidden"></section>' }));
  await page.goto(`${process.env.TEST_URL || "http://127.0.0.1:5173"}/level61-harness`);
  await page.evaluate(async () => {
    const { level61 } = await import("/src/levels/level61.ts");
    let cleanup, abort;
    window.music61 = [];
    window.warps61 = [];
    window.mount61 = scene => {
      cleanup?.(); abort?.abort(); abort = new AbortController();
      cleanup = level61.mount({ screen: document.querySelector("#screen"), initialScene: scene,
        goToWarpZone: number => window.warps61.push(number),
        audio: { playMusic: async (source, loop) => window.music61.push([source, loop]), stopMusic: () => window.music61.push("stop") },
        listen: (target, type, callback) => target.addEventListener(type, callback, { signal: abort.signal }) });
    };
    window.mount61("1");
  });
  assert.equal(await page.locator("[data-panel='1'] p").textContent(), "そろそろ狂い始めています >:D");
  assert.deepEqual(await page.evaluate(() => window.music61), [["music/level61.mp3", true]]);
  const stage = await page.locator("#screen").boundingBox();
  for (const selector of ["[data-panel='1'] p", "[data-start]"]) {
    const box = await page.locator(selector).boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - stage.x - stage.width / 2) < 1, "Scene 1 content is centered");
  }
  const musicResponse = await page.request.get(`${process.env.TEST_URL || "http://127.0.0.1:5173"}/assets/music/level61.mp3`);
  assert.ok(musicResponse.ok() && musicResponse.headers()["content-type"].includes("audio/"));
  await page.locator(".level-61__art").evaluate(img => img.decode());
  await page.getByRole("button", { name: "Hajimari" }).click();
  assert.equal(await page.locator("#screen").getAttribute("data-scene"), "2");
  assert.deepEqual(await page.evaluate(() => window.music61), [["music/level61.mp3", true]], "music continues across scenes");
  assert.equal(await page.locator(".level-61__pulse").evaluate(el => getComputedStyle(el).animationName), "level-61-pulse");
  await page.evaluate(() => window.mount61("3"));
  assert.deepEqual(await page.evaluate(() => window.music61.at(-1)), ["music/level61.mp3", true]);
  assert.equal(await page.locator("[data-panel='3'] p").textContent(), "あなたは死にました。");
  await page.getByRole("button", { name: "もう一度" }).click();
  assert.equal(await page.locator("#screen").getAttribute("data-scene"), "2");
  await page.evaluate(() => window.mount61("4"));
  assert.equal(await page.evaluate(() => window.music61.at(-1)), "stop");
  assert.equal(await page.locator(".level-61__ring").count(), 9);
  const forms = await page.locator("form").evaluateAll(els => els.map(el => {
    const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height];
  }));
  forms.forEach(bounds => assert.deepEqual(bounds, forms[0]));
  assert.equal(await page.locator("[data-password-drag]").count(), 3);
  for (const scale of [1, .65]) {
    await page.evaluate(scale => { window.mount61("4"); document.querySelector("#screen").style.transform = `scale(${scale})`; }, scale);
    const bounds = await page.locator("#screen").boundingBox();
    for (let i = 0; i < 9; i++) {
      const ring = page.locator(`[data-ring="${i}"]`);
      await page.mouse.move(bounds.x + 400 * scale, bounds.y + (337 - (166 - i * 17)) * scale);
      await page.mouse.down();
      await page.mouse.move(bounds.x + 415 * scale, bounds.y + (347 - (166 - i * 17)) * scale, { steps: 4 });
      await page.mouse.up();
      assert.ok(Math.abs(Number(await ring.getAttribute("cx")) - 415) < 1, `ring ${i} drags at scale ${scale}`);
    }
  }
  await page.locator("[data-ring='8']").focus();
  await page.keyboard.press("ArrowRight");
  assert.ok(Math.abs(Number(await page.locator("[data-ring='8']").getAttribute("cx")) - 420) < 1);
  await page.getByRole("textbox", { name: "Password 1", exact: true }).fill("test");
  await page.locator('[data-layer="1"] button').click();
  assert.equal(await page.locator("#screen").getAttribute("data-scene"), "4");
  const setPassword = (layer, value) => page.locator(`[data-layer="${layer}"] input`).evaluate((input, value) => {
    input.select();
    input.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: value }));
  }, value);
  const submit = () => page.locator('[data-layer="1"]').evaluate(form => form.requestSubmit());
  await setPassword(1, 'kukui1191');
  await setPassword(2, 'ArchBear08');
  await setPassword(3, 'matchoi');
  await submit();
  assert.deepEqual(await page.evaluate(() => window.warps61), [], 'all four answers are required');
  await setPassword(4, 'zeram');
  await submit();
  assert.deepEqual(await page.evaluate(() => window.warps61), [], 'answers are case-sensitive');
  await setPassword(3, 'Zeram');
  await setPassword(4, 'matchoi');
  await submit();
  assert.deepEqual(await page.evaluate(() => window.warps61), [], 'green and blue answers cannot be swapped');
  await setPassword(3, 'matchoi');
  await setPassword(4, 'Zeram');
  await setPassword(1, 'incorrect');
  await submit();
  assert.deepEqual(await page.evaluate(() => window.warps61), [], 'current values must all remain correct');
  await setPassword(1, 'kukui1191');
  await page.locator('[data-layer="1"] input').press('Enter');
  assert.deepEqual(await page.evaluate(() => window.warps61), [15], 'correct answers enter Warp Zone 15');
  await submit();
  assert.deepEqual(await page.evaluate(() => window.warps61), [15], 'warp fires only once');
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.fonts.check('27px "Mochiy Pop One"')), true);
  assert.deepEqual(errors, []);
  console.log("PASS: scenes, artwork/font, music, rings, four case-sensitive color passwords, and Warp Zone 15.");
} finally { await browser.close(); }
