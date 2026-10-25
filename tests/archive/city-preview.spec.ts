import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// Production WebGL behavior is tested on installed Chrome's actual GPU here.
// Other suites retain their software-rendering failure-path configuration.
test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: [] },
});
test.setTimeout(90000);
async function ready(page: Page) {
  await expect(page.locator(".city-preview")).toHaveAttribute("data-renderer", "ready", { timeout: 45000 });
  await expect(page.locator("canvas")).toHaveAttribute("data-frames", /\d+/);
}
async function travel(page: Page, p: number) {
  await page.evaluate(p => {
    const track = document.querySelector('.city-scroll-track') as HTMLElement;
    scrollTo({ top: track.getBoundingClientRect().top + scrollY + p * (track.offsetHeight - innerHeight), behavior: 'instant' });
  }, p);
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-progress')), { timeout: 40000 }).toBeCloseTo(p, 3);
}
async function audit(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
}
test('four districts share one world, deferred assets, reversible travel and arrival-synchronized navigation', async ({ page }) => {
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => requests.push(r.url()));
  await page.goto('/city-preview');
  await ready(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-loaded', '1');
  expect(requests.some(u => u.includes('ippo-print'))).toBe(false);
  expect(requests.some(u=>u.includes('/props/covered-car.glb'))).toBe(false);
  const positions: number[][] = [];
  for (const [p, id] of [[0, 'a'], [.36, 'b'], [.59, 'c'], [.93, 'd']] as const) {
    await travel(page, p);
    await expect(page.locator('canvas')).toHaveAttribute('data-district', id);
    await expect(page.locator('.city-footer a[aria-current]')).toHaveAttribute('href', '#' + id);
    positions.push((await page.locator('canvas').getAttribute('data-position'))!.split(',').map(Number));
  }
  expect(positions[1][0]).toBeGreaterThan(26);
  expect(positions[2][0]).toBeGreaterThan(60);
  expect(positions[3][2]).toBeLessThan(-108);
  await expect(page.locator('canvas')).toHaveAttribute('data-loaded', '4');
  expect(Number(await page.locator('canvas').getAttribute('data-pedestrians'))).toBeGreaterThanOrEqual(45);
  expect(requests.some(u=>u.includes('/city/people/sam.glb'))).toBe(true);
  expect(requests.some(u=>u.includes('/city/pedestrian.glb')||u.includes('/models/courier/'))).toBe(false);
  await travel(page, .12);
  expect(Math.abs(Number((await page.locator('canvas').getAttribute('data-position'))!.split(',')[2]) + 9.5)).toBeLessThan(.1);
  await expect(page.locator('canvas')).toHaveAttribute('data-loaded', '4');
  expect(requests.filter(u => u.endsWith('/city/architecture.glb'))).toHaveLength(1);
  expect(requests.some(u => /\/(optics|radio|relay|desk|searchlight)\.glb/.test(u))).toBe(false);
  expect(errors).toEqual([]);
  await audit(page);
});
test('local warmth, sign response, ambient pause, keyboard shot navigation and still-mode return', async ({ page }) => {
  await page.goto('/city-preview#bookshop');
  await ready(page);
  await travel(page, .12);
  await page.mouse.move(100, 400);
  await page.waitForTimeout(1200);
  const first = Number(await page.locator('canvas').getAttribute('data-sign'));
  await page.mouse.move(1350, 400);
  await page.waitForTimeout(1600);
  expect(Math.abs(Number(await page.locator('canvas').getAttribute('data-sign')) - first)).toBeGreaterThan(.004);
  const warmth = page.getByRole('button', { name: 'A little warmth' });
  await warmth.focus();
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-hover'))).toBeGreaterThan(.9);
  await page.keyboard.press('Enter');
  await expect(warmth).toHaveAttribute('aria-pressed', 'true');
  const pose=await page.locator('canvas').getAttribute('data-people-pose');
  await expect.poll(()=>page.locator('canvas').getAttribute('data-people-pose')).not.toBe(pose);
  await page.getByRole('button', { name: 'Pause atmosphere', exact: true }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(3000);
  const count = Number(await page.locator('canvas').getAttribute('data-frames'));
  await page.waitForTimeout(500);
  expect(Number(await page.locator('canvas').getAttribute('data-frames')) - count).toBeLessThan(3);
  await page.getByRole('button', { name: 'Next composition' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-progress')), { timeout: 15000 }).toBeCloseTo(.2, 3);
  await page.getByRole('button', { name: 'Still views', exact: true }).click();
  await expect(page.locator('.city-preview')).toHaveAttribute('data-world', 'false');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Return to the street' }).click();
  await ready(page);
  await expect(page.locator('canvas')).toHaveCount(1);
});
test('mobile receives real 3D traversal, touch-sized navigation, adaptive DPR and no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/city-preview');
  await ready(page);
  await expect(page.locator('.city-preview')).toHaveAttribute('data-world', 'true');
  await page.getByRole('link', { name: 'Backstreets', exact: true }).click();
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-progress')), { timeout: 40000 }).toBeCloseTo(.59, 3);
  await expect(page.locator('canvas')).toHaveAttribute('data-district', 'c');
  expect(Number(await page.locator('canvas').getAttribute('data-dpr'))).toBeLessThanOrEqual(1.15);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await audit(page);
});
test('reduced motion uses four actual district captures without fetching the WebGL assets', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', r => requests.push(r.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/city-preview');
  await expect(page.locator('.city-preview')).toHaveAttribute('data-world', 'false');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(requests.some(u => u.endsWith('.glb') || u.endsWith('.hdr'))).toBe(false);
  await page.getByRole('navigation', { name: 'City districts' }).getByRole('link', { name: 'Residential', exact: true }).click();
  await expect(page.locator('#d')).toBeInViewport();
  for(const img of await page.locator('.city-still-view img').all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0)).toBe(true);}
  await audit(page);
});
test('returning home restores the original portfolio renderer and routes', async ({ page }) => {
  await page.goto('/city-preview');
  await ready(page);
  await page.getByRole('link', { name: 'Back to portfolio', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.world-shell')).toHaveAttribute('data-scene', 'ready', { timeout: 30000 });
  await expect(page.locator('canvas')).toHaveCount(1);
});
test('a deferred neighborhood asset failure falls back to the complete four-district narrative', async ({ page }) => {
  await page.route('**/city/art/ippo-print.webp', r => r.abort());
  await page.goto('/city-preview');
  await ready(page);
  await travel(page, .36);
  await expect(page.locator('.city-preview')).toHaveAttribute('data-renderer', 'unavailable', { timeout: 30000 });
  await expect(page.locator('.city-still-view')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Explore the portfolio' })).toHaveAttribute('href', '/');
});
for (const failure of ["asset", "people", "context", "webgl"] as const)
  test(`${failure} failure leaves a complete still narrative and portfolio links`, async ({ page, }) => {
    if (failure === "webgl")
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
          if (type === "webgl" || type === "webgl2")
            return null;
          return Reflect.apply(original, this, [type, ...args]);
        } as typeof original;
      });
    if (failure === "asset")
      await page.route("**/city/architecture.glb", (r) => r.abort());
    if(failure==="people")await page.route("**/city/people/sam.glb",r=>r.abort());
    await page.goto("/city-preview");
    if (failure === "context") {
      await ready(page);
      await page
        .locator("canvas")
        .evaluate((c) => c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
    }
    await expect(page.locator(".city-preview")).toHaveAttribute("data-renderer", "unavailable", { timeout: 30000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".city-still-note")).toContainText("could not load");
    await expect(page.getByRole("link", { name: "Explore the portfolio" })).toHaveAttribute("href", "/");
  });
test("a 320px no-JavaScript visitor can view all four images and reach the resume through the portfolio", async ({ browser, }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 740 },
  });
  const page = await context.newPage();
  await page.goto("/city-preview");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".city-still-view img")).toHaveCount(4);
  for(const img of await page.locator('.city-still-view img').all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0)).toBe(true);}
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page
    .getByRole("link", { name: "Back to portfolio", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: /resume/i }).first()).toHaveAttribute("href", "/resume");
  await context.close();
});
