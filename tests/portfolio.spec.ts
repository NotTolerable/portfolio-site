import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ viewport: { width: 1280, height: 900 } });

test("portfolio projects have accessible notes and link to the cloud plan", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Babisan Pirapakaran" })).toBeVisible();
  await page.getByRole("link", { name: "Explore my work", exact: true }).click();
  await expect(page).toHaveURL(/#projects$/);
  const governance = page.getByRole("article", { name: "AI governance compliance checker" });
  await governance.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(governance.getByText("DETAILED WRITE-UP IN PROGRESS")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(governance.locator("details")).not.toHaveAttribute("open");
  await expect(page.getByRole("article", { name: "AI mock interview", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Explore the plan", exact: true }).click();
  await expect(page).toHaveURL(/\/infrastructure$/);
  await page.getByRole("button", { name: /02 \/ DELIVERY CloudFront/ }).click();
  await expect(page.locator(".flow-description")).toContainText("deliver cached assets");
  await page.getByRole("button", { name: /03 \/ ORIGIN Private S3/ }).click();
  await expect(page.locator(".flow-description")).toContainText("origin access control");
  expect(errors).toEqual([]);
});

test("cube animates automatically while manual rotation requires dragging, with no visible overlay", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  const stage = page.getByRole("group", { name: /Interactive black cube/ });
  await expect(page.locator(".cube-figure button, .cube-figure figcaption, .cube-figure a")).toHaveCount(0);
  await page.waitForTimeout(600);
  const canvas = page.locator(".cube-stage canvas");
  const before = await canvas.screenshot({ path: "test-results/cube-lighting.png" });
  await page.waitForTimeout(2200);
  expect((await canvas.screenshot()).equals(before), "automatic cube motion should remain enabled").toBe(false);
  await stage.focus();
  await page.keyboard.press(" ");
  await page.waitForTimeout(100);
  const paused = await canvas.screenshot();
  await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(paused), "Space should pause animation without a visible button").toBe(true);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  expect((await canvas.screenshot()).equals(paused), "keyboard input should rotate the cube").toBe(false);
  const bounds = await stage.boundingBox();
  if (!bounds) throw new Error("Cube has no visible bounds");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  const beforeHover = await canvas.screenshot();
  await page.mouse.move(bounds.x + bounds.width / 2 + 60, bounds.y + bounds.height / 2 + 15, { steps: 8 });
  await page.waitForTimeout(100);
  const afterHover = await canvas.screenshot();
  expect(afterHover.equals(beforeHover), "hover should not rotate the cube").toBe(true);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 90, bounds.y + bounds.height / 2 + 25, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(100);
  const afterDrag = await canvas.screenshot();
  expect(afterDrag.equals(afterHover), "dragging should rotate the cube").toBe(false);
  await page.mouse.move(bounds.x + bounds.width / 2 + 160, bounds.y + bounds.height / 2 + 40, { steps: 8 });
  await page.waitForTimeout(1300);
  expect((await canvas.screenshot()).equals(afterDrag), "release should stop rotation immediately, including subsequent hover").toBe(true);
  await canvas.screenshot({ path: "test-results/cube-dragged.png" });
  await stage.focus();
  await page.keyboard.press(" ");
  await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(afterDrag), "Space should resume automatic motion").toBe(false);
  expect(errors).toEqual([]);
});

test("touch dragging rotates the cube and cancellation releases the gesture", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3012/");
    await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
    await page.waitForTimeout(600);
    const canvas = page.locator(".cube-stage canvas");
    const before = await canvas.screenshot();
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 160, y: 440 }] });
    for (let step = 1; step <= 5; step++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 160 + step * 18, y: 440 + step }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await page.waitForTimeout(100);
    const after = await canvas.screenshot();
    expect(after.equals(before), "horizontal touch drag should rotate").toBe(false);
    await page.mouse.move(260, 450);
    await page.mouse.move(300, 460, { steps: 5 });
    await page.waitForTimeout(200);
    expect((await canvas.screenshot()).equals(after), "cancelled gesture should not leave a drag active").toBe(true);
    await session.detach();
  } finally { await context.close(); }
});

test("responsive layouts, reduced motion, and automated accessibility", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `overflow at ${width}px`).toBe(true);
    if (width === 1280 || width === 768 || width === 390) {
      await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(result.violations).toEqual([]);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  await page.waitForTimeout(100);
  const stillImage = await page.locator(".cube-stage canvas").screenshot();
  await page.waitForTimeout(250);
  expect((await page.locator(".cube-stage canvas").screenshot()).equals(stillImage), "reduced motion should keep the cube still").toBe(true);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.goto("/infrastructure");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({ path: "test-results/infrastructure-mobile.png", fullPage: true });
});

test("a failed WebGL initialization keeps an accessible static cube", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.getByRole("img", { name: "Static preview of a black geometric cube." })).toBeVisible();
  await expect(page.locator(".cube-figure button, .cube-figure figcaption")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explore my work", exact: true })).toBeVisible();
});

test("the quick intro clears and does not replay on internal navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  await expect(page.locator(".site-intro")).toHaveCount(0, { timeout: 3000 });
  await page.getByRole("link", { name: /Cloud lab/ }).click();
  await expect(page).toHaveURL(/\/infrastructure$/);
  await expect(page.locator(".site-intro")).toHaveCount(0);
});

test("a missing cube material keeps the static fallback and page usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/textures/resend/roughness-3.png", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.getByRole("img", { name: "Static preview of a black geometric cube." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore my work", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("scroll morphs the cube into still particles and reverses without losing its dragged pose", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  const stage = page.getByRole("group", { name: /Interactive black cube/ });
  await stage.focus();
  await page.keyboard.press(" ");
  await page.keyboard.press("ArrowRight");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const canvas = page.locator(".cube-stage canvas");
  const before = await canvas.screenshot();
  await page.evaluate(() => window.scrollTo({ top: 520, behavior: "instant" }));
  await page.waitForTimeout(350);
  expect(await page.locator(".intro-sticky").evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(1);
  const particles = await canvas.screenshot();
  expect(particles.equals(before), "scroll should deconstruct the cube").toBe(false);
  await page.screenshot({ path: "test-results/intro-particles.png" });
  await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(particles), "particles should remain still between inputs").toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(350);
  expect((await canvas.screenshot()).equals(before), "scrolling back should restore the exact cube pose").toBe(true);
  expect(errors).toEqual([]);
});
