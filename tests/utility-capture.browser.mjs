import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:5173");
  await page.locator("[data-menu-action=start]").waitFor();
  for (const scale of [0.4875, 0.75, 1, 1.25]) {
    const result = await page.evaluate(async scale => {
      const { capturePuzzle } = await import("/src/core/utilityCapture.ts");
      const root = document.querySelector("#game-root");
      root.innerHTML = `<main class="game-frame" style="transform:scale(${scale});left:80px;top:70px">
        <section class="level-screen" style="background:rgb(18,52,86)">
          <div style="position:absolute;left:600px;top:450px;width:100px;height:80px;background:rgb(255,204,0)"></div>
        </section>
        <canvas class="utility-drawing utility-drawing--active" width="800" height="600"></canvas>
        <div class="utility-selection" style="left:0;top:0;width:800px;height:600px;background:red"></div>
      </main>`;
      const frame = root.querySelector("main");
      const annotation = root.querySelector("canvas");
      annotation.getContext("2d").fillStyle = "rgb(34,139,34)";
      annotation.getContext("2d").fillRect(300, 250, 40, 40);
      const before = frame.getBoundingClientRect().toJSON();
      const snapshot = await capturePuzzle(frame);
      const ctx = snapshot.getContext("2d");
      const pixel = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);
      return {
        size: [snapshot.width, snapshot.height],
        corners: [[5, 5], [795, 5], [5, 595], [795, 595]].map(([x, y]) => pixel(x, y)),
        marker: pixel(650, 490), annotation: pixel(320, 270),
        liveUnchanged: JSON.stringify(before) === JSON.stringify(frame.getBoundingClientRect().toJSON()),
      };
    }, scale);
    assert.deepEqual(result.size, [800, 600]);
    assert.deepEqual(result.corners, Array(4).fill([18, 52, 86, 255]), `Puzzle clipping at scale ${scale}`);
    assert.deepEqual(result.marker, [255, 204, 0, 255]);
    assert.deepEqual(result.annotation, [34, 139, 34, 255]);
    assert.equal(result.liveUnchanged, true);
  }
  console.log("Passed: capture bounds, corner pixels, scene/annotation alignment, selection exclusion and unchanged live layout at 4 display scales.");
} finally { await browser.close(); }
