/** Reproducible software-rendered baseline; use a dedicated production server on 3012. */
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => {
    window.__districtDraws = 0;
    for (const method of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"]) {
      const original = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function (...args) { window.__districtDraws++; return Reflect.apply(original, this, args); };
    }
  });
  await page.goto(process.env.PORTFOLIO_PROFILE_URL ?? "http://127.0.0.1:3012/");
  await page.locator('[data-world="webgl"]').waitFor({ timeout: 30000 });
  if (process.argv.includes("--walk")) await page.getByRole("button", { name: /Auto walk/ }).click();
  await page.waitForTimeout(2000);
  const report = await page.evaluate(async () => {
    const samples = []; let previous = performance.now(), draws = window.__districtDraws;
    await new Promise((resolve) => {
      function frame(now) { samples.push({ ms: now - previous, calls: window.__districtDraws - draws }); previous = now; draws = window.__districtDraws; if (samples.length === 100) resolve(); else requestAnimationFrame(frame); }
      requestAnimationFrame(frame);
    });
    const times = samples.map((item) => item.ms).sort((a,b) => a-b), canvas = document.querySelector("canvas");
    return {
      viewport: [innerWidth, innerHeight], buffer: [canvas.width, canvas.height], quality: canvas.dataset.quality,
      meanFrameMs: +((samples.reduce((sum,item)=>sum+item.ms,0))/samples.length).toFixed(2), p95FrameMs: +times[95].toFixed(2),
      drawCallsPerFrame: samples.reduce((sum,item)=>sum+item.calls,0)/samples.length,
      characterDecodedBytes: performance.getEntriesByType("resource").filter((item)=>item.name.includes("/models/courier/")).reduce((sum,item)=>sum+item.decodedBodySize,0),
    };
  });
  console.log(JSON.stringify({ renderer: "Headless Chrome / ANGLE SwiftShader", walking: process.argv.includes("--walk"), ...report }, null, 2));
} finally { await browser.close(); }
