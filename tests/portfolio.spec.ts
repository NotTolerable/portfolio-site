import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ viewport: { width: 1280, height: 900 } });

async function ready(page: Page) {
  await expect(page.locator(".world-hero")).toHaveAttribute("data-world", "webgl", { timeout: 20000 });
  await page.waitForTimeout(1400);
}

test("the portfolio introduces its owner and keeps project notes and cloud planning accessible", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Babisan Pirapakaran" })).toBeVisible();
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/#projects$/);
  const article = page.getByRole("article", { name: /AI GOVERNANCE COMPLIANCE CHECKER/i });
  await article.locator("summary").focus(); await page.keyboard.press("Enter");
  await expect(article.getByText("DETAILED WRITE-UP IN PROGRESS")).toBeVisible();
  await page.keyboard.press("Enter"); await expect(article.locator("details")).not.toHaveAttribute("open");
  await expect(page.getByRole("article", { name: /AI MOCK INTERVIEW/i })).toBeVisible();
  await page.getByRole("link", { name: "Explore the plan" }).click();
  await expect(page).toHaveURL(/\/infrastructure$/);
  await page.getByRole("button", { name: /02 \/ DELIVERY CloudFront/ }).click();
  await expect(page.locator(".flow-description")).toContainText("deliver cached assets");
  await page.getByRole("button", { name: /03 \/ ORIGIN Private S3/ }).click();
  await expect(page.locator(".flow-description")).toContainText("origin access control");
  expect(errors).toEqual([]);
});

test("interests support roving keyboard navigation and distinguish learning from experience", async ({ page }) => {
  await page.goto("/#about");
  const systems = page.getByRole("tab", { name: "Systems" });
  await systems.focus(); await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "GPUs" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("areas I’m exploring");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Cloud" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("next experiment on the drawing board");
  await page.keyboard.press("Home");
  await expect(systems).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("where I want to go deeper");
});

test("city motion, pause, lighting and rain controls work without loading the old cube", async ({ page }) => {
  const requests: string[] = [], errors: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/"); await ready(page);
  const canvas = page.locator(".world-stage canvas");
  const moving = await canvas.screenshot(); await page.waitForTimeout(220);
  expect((await canvas.screenshot()).equals(moving), "the city atmosphere should animate").toBe(false);
  await page.getByRole("button", { name: "Pause scene motion" }).click();
  await page.waitForTimeout(1800);
  const paused = await canvas.screenshot(); await page.waitForTimeout(220);
  expect((await canvas.screenshot()).equals(paused), "paused atmosphere must hold still").toBe(true);
  const rain = page.getByRole("button", { name: "Rain on" }); await rain.click();
  await expect(page.getByRole("button", { name: "Rain off" })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Neon glow" }).click(); await page.waitForTimeout(1400);
  expect((await canvas.screenshot()).equals(paused), "neon grading must affect the scene").toBe(false);
  await page.getByRole("button", { name: "Resume scene motion" }).click();
  await expect(page.getByRole("button", { name: "Pause scene motion" })).toHaveAttribute("aria-pressed", "false");
  expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).width / c.clientWidth)).toBeLessThanOrEqual(1.5);
  expect(requests.filter((r) => r.includes("/textures/resend/") || r.includes("/floating-garden"))).toEqual([]);
  await expect(page.locator(".cube-figure, .site-intro, .opening-paper")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("drag and arrow input change the city view; hover does not", async ({ page }) => {
  await page.goto("/"); await ready(page);
  await page.getByRole("button", { name: "Pause scene motion" }).click(); await page.waitForTimeout(1600);
  const stage = page.getByRole("group", { name: /Interactive night city/ });
  const canvas = page.locator(".world-stage canvas");
  const before = await canvas.screenshot();
  await page.mouse.move(800, 450); await page.mouse.move(950, 500, { steps: 8 }); await page.waitForTimeout(250);
  expect((await canvas.screenshot()).equals(before), "hover must not steer the camera").toBe(true);
  await page.mouse.down(); await page.mouse.move(1080, 530, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(1600);
  const dragged = await canvas.screenshot(); expect(dragged.equals(before)).toBe(false);
  await stage.focus(); await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(1600);
  expect((await canvas.screenshot()).equals(dragged)).toBe(false);
  await page.keyboard.press(" "); await expect(page.getByRole("button", { name: "Pause scene motion" })).toBeVisible();
});

test("the scene stops issuing draw calls offscreen", async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as Window & { __worldDraws?: number }; state.__worldDraws = 0;
    for (const method of ["drawArrays", "drawElements"] as const) {
      const original = WebGL2RenderingContext.prototype[method];
      Object.defineProperty(WebGL2RenderingContext.prototype, method, { value: function (this: WebGL2RenderingContext, ...args: unknown[]) { state.__worldDraws!++; return Reflect.apply(original, this, args); } });
    }
  });
  await page.goto("/"); await ready(page);
  const draws = () => page.evaluate(() => (window as Window & { __worldDraws?: number }).__worldDraws ?? 0);
  expect(await draws()).toBeGreaterThan(0);
  await page.locator("#about").scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
  const before = await draws(); await page.waitForTimeout(300);
  expect(await draws(), "hidden scene must not use the GPU").toBe(before);
});

test("responsive pages and reduced motion remain readable and pass automated accessibility checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".world-hero")).toHaveAttribute("data-world", "still");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.locator(".world-poster img").evaluate((i) => (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    if (width === 390 || width === 1280) {
      await page.screenshot({ path: `test-results/night-city-${width}.png`, fullPage: true });
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); expect(result.violations).toEqual([]);
    }
  }
  await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.goto("/infrastructure");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); expect(result.violations).toEqual([]);
});

test("unavailable WebGL preserves the artwork and project navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".world-hero")).toHaveAttribute("data-world", "fallback", { timeout: 20000 });
  await expect(page.getByRole("img", { name: "Illustrated anime city at night." })).toBeVisible();
  await expect(page.locator(".world-poster")).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Explore my work" }).click(); await expect(page).toHaveURL(/#projects$/);
});

test("missing city artwork cannot hide the owner, work, or links", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/illustrations/night-city.webp", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".world-hero")).toHaveAttribute("data-world", "fallback", { timeout: 20000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Explore my work" }).click(); await expect(page).toHaveURL(/#projects$/);
  expect(errors).toEqual([]);
});

test("a lost GPU context restores the still city and leaves navigation usable", async ({ page }) => {
  await page.goto("/"); await ready(page);
  const supported = await page.locator(".world-stage canvas").evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2");
    const extension = gl?.getExtension("WEBGL_lose_context");
    extension?.loseContext(); return Boolean(extension);
  });
  expect(supported).toBe(true);
  await expect(page.locator(".world-hero")).toHaveAttribute("data-world", "fallback");
  await expect(page.locator(".world-poster")).toHaveCSS("opacity", "1");
  await expect(page.getByRole("button", { name: "Pause scene motion" })).toHaveCount(0);
  await page.getByRole("link", { name: "Explore my work" }).click(); await expect(page).toHaveURL(/#projects$/);
});

test("mobile touch dragging and cancellation work within the reduced pixel budget", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage(); await page.goto("http://127.0.0.1:3012/"); await ready(page);
    await page.getByRole("button", { name: "Pause scene motion" }).click(); await page.waitForTimeout(1000);
    const canvas = page.locator(".world-stage canvas"); const before = await canvas.screenshot();
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 220, y: 530 }] });
    for (let i = 1; i <= 5; i++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 220 + i * 14, y: 530 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] }); await page.waitForTimeout(1700);
    const dragged = await canvas.screenshot(); expect(dragged.equals(before)).toBe(false);
    await page.mouse.move(280, 540); await page.mouse.move(330, 545, { steps: 5 }); await page.waitForTimeout(300);
    expect((await canvas.screenshot()).equals(dragged), "cancelled touches must release the camera").toBe(true);
    expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).width / c.clientWidth)).toBeLessThanOrEqual(1.25);
    await session.detach();
  } finally { await context.close(); }
});

test("without JavaScript the full portfolio and native project notes remain usable", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  try {
    const page = await context.newPage(); await page.goto("http://127.0.0.1:3012/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".world-poster")).toBeVisible();
    const article = page.getByRole("article", { name: /AI MOCK INTERVIEW/i }); await article.locator("summary").click();
    await expect(article.getByText("DETAILED WRITE-UP IN PROGRESS")).toBeVisible();
    await page.getByRole("link", { name: "Explore the plan" }).click(); await expect(page).toHaveURL(/\/infrastructure$/);
  } finally { await context.close(); }
});
