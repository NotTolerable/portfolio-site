/** Measure the actual local production scene; never a universal frame-rate promise.
 * node scripts/profile-city.mjs http://127.0.0.1:3014 [--software] */
import { chromium } from "playwright-core";
const origin = process.argv[2] ?? "http://127.0.0.1:3014",
  software = process.argv.includes("--software");
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: software
    ? ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"]
    : [],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const started = Date.now();
  await page.goto(origin + "/city-preview");
  await page
    .locator('.city-preview[data-renderer="ready"]')
    .waitFor({ timeout: 90000 });
  await page.locator("canvas[data-frames]").waitFor({ timeout: 30000 });
  const firstSceneMs = Date.now() - started;
  const cdp = await browser.newBrowserCDPSession(),
    gpu = (await cdp.send("SystemInfo.getInfo")).gpu;
  const results = [];
  for (const [id, p] of [
    ["arrival", 0],
    ["bookshop", 0.36],
    ["passing", 0.66],
    ["corner", 1],
  ]) {
    await page.locator('.city-footer a[href="#' + id + '"]').click();
    await page.waitForFunction(
      (p) =>
        Math.abs(
          Number(
            document.querySelector("canvas")?.getAttribute("data-progress"),
          ) - p,
        ) < 0.0005,
      p,
      { timeout: 45000 },
    );
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          let n = 0;
          const tick = () =>
            ++n > 30 ? resolve() : requestAnimationFrame(tick);
          requestAnimationFrame(tick);
        }),
    );
    const times = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const samples = [];
          let previous = 0;
          const tick = (t) => {
            if (previous) samples.push(t - previous);
            previous = t;
            if (samples.length >= 180) resolve(samples);
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
    const sorted = [...times].sort((a, b) => a - b),
      mean = times.reduce((a, b) => a + b, 0) / times.length;
    results.push({
      shot: id,
      meanFps: +(1000 / mean).toFixed(1),
      p50FrameMs: +sorted[Math.floor(sorted.length * 0.5)].toFixed(2),
      p95FrameMs: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
      ...(await page.locator("canvas").evaluate((c) => ({
        calls: c.dataset.calls,
        triangles: c.dataset.triangles,
        textures: c.dataset.textures,
        geometries: c.dataset.geometries,
        dpr: c.dataset.dpr,
        cpuRenderMs: c.dataset.cpuRenderMs,
      }))),
    });
  }
  const resources = await page.evaluate(() => {
    const entries = performance
      .getEntriesByType("resource")
      .filter((e) => /\/(city|world)\//.test(e.name));
    return {
      count: entries.length,
      encodedBytes: entries.reduce((a, e) => a + e.encodedBodySize, 0),
      transferBytes: entries.reduce((a, e) => a + e.transferSize, 0),
    };
  });
  console.log(
    JSON.stringify(
      {
        date: new Date().toISOString(),
        origin,
        browser: browser.version(),
        viewport: "1440x900",
        deviceScaleFactor: 1,
        software,
        gpu: gpu.auxAttributes?.glRenderer,
        firstSceneMs,
        resources,
        results,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
