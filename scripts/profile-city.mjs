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
  const initialization=await page.locator("canvas").evaluate(c=>({assetLoadMs:c.dataset.assetLoadMs,preparationMs:c.dataset.preparationMs,compileMs:c.dataset.compileMs}));
  const cdp = await browser.newBrowserCDPSession(),
    gpu = (await cdp.send("SystemInfo.getInfo")).gpu;
  const results = [];
  for (const [id,p] of [
    ['arrival',0],['bookshop',.12],['corner',.28],['arcade',.36],['music',.43],
    ['north-turn',.52],['gym',.59],['alley',.67],['printshop',.74],['quiet-turn',.83],['residential',.93],['last-light',1]
  ]) {
    await page.evaluate(p=>{const t=document.querySelector('.city-scroll-track');scrollTo({top:t.getBoundingClientRect().top+scrollY+p*(t.offsetHeight-innerHeight),behavior:'instant'});},p);
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
        loadedDistricts:c.dataset.loaded,
        pedestrians:c.dataset.pedestrians,
        lights:c.dataset.lights,
      }))),
    });
  }
  const initialResources=await page.evaluate(()=>{const e=performance.getEntriesByType('resource').filter(e=>/\/(city|world|models\/courier)\//.test(e.name));return {count:e.length,encodedBytes:e.reduce((a,e)=>a+e.encodedBodySize,0),transferBytes:e.reduce((a,e)=>a+e.transferSize,0)};});
  // A fresh scene build captures preloading and travel stalls, not only settled views.
  await page.reload();
  await page.locator('.city-preview[data-renderer="ready"]').waitFor({timeout:90000});
  const travel=[];
  for(const destination of [1,0]){
    travel.push(await page.evaluate(destination=>new Promise(resolve=>{
      const samples=[];let previous=0,start=performance.now();
      const t=document.querySelector('.city-scroll-track');
      scrollTo({top:t.getBoundingClientRect().top+scrollY+destination*(t.offsetHeight-innerHeight),behavior:'instant'});
      function tick(now){if(previous)samples.push(now-previous);previous=now;const p=Number(document.querySelector('canvas').dataset.progress);
        if(Math.abs(p-destination)<.00001&&samples.length>30){const sorted=[...samples].sort((a,b)=>a-b);resolve({destination,durationMs:Math.round(now-start),meanFps:+(1000/(samples.reduce((a,b)=>a+b,0)/samples.length)).toFixed(1),p95FrameMs:+sorted[Math.floor(sorted.length*.95)].toFixed(2),maxFrameMs:+sorted.at(-1).toFixed(2),framesOver50Ms:samples.filter(n=>n>50).length});}else requestAnimationFrame(tick);}
      requestAnimationFrame(tick);
    }),destination));
  }
  const resources = await page.evaluate(() => {
    const entries = performance
      .getEntriesByType("resource")
      .filter((e) => /\/(city|world|models\/courier)\//.test(e.name));
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
        initialization,
        resources:initialResources,
        reloadResources:resources,
        travel,
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
