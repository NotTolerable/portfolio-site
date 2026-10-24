import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ENTRANCE_DURATION } from "../src/lib/entrance-timeline";

test.use({ viewport: { width: 1280, height: 900 } });

async function startClockedIntro(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  // Advance the two paint opportunities used by the entrance's real-frame gate.
  await page.clock.runFor(50);
  await expect(page.locator("html")).toHaveAttribute("data-entrance", "running");
}

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
  await page.keyboard.press("Escape");
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
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback", { timeout: 20000 });
  await expect(page.getByRole("img", { name: "Static preview of a black geometric cube." })).toBeVisible();
  await expect(page.locator(".cube-figure button, .cube-figure figcaption")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explore my work", exact: true })).toBeVisible();
});

test("the kinetic intro clears and does not replay on internal navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  await expect(page.locator(".site-intro")).toHaveCount(0, { timeout: 5000 });
  await page.getByRole("link", { name: /Cloud lab/ }).click();
  await expect(page).toHaveURL(/\/infrastructure$/);
  await expect(page.locator(".site-intro")).toHaveCount(0);
});

test("the lettering advances on the real browser clock before graphics startup", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-entrance", "running");
  const sample = () => page.evaluate(() => ({
    time: performance.now(),
    timeline: Number(document.timeline.currentTime),
    remaining: [...document.querySelectorAll(".name-ink mask path")].reduce((sum, path) => sum + Number.parseFloat(getComputedStyle(path).strokeDashoffset), 0),
  }));
  const before = await sample();
  expect(before.timeline, "the compositor must have started before the intro clock").toBeGreaterThan(0);
  await page.waitForTimeout(220);
  const after = await sample();
  expect(after.remaining, "real time must reveal strokes without manually seeking animations").toBeLessThan(before.remaining);
  expect(after.timeline).toBeGreaterThan(before.timeline);
  expect(after.time - before.time, "graphics initialization must not block these frames").toBeLessThan(1000);
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "loading");
});

test("the name draws through strokes and settles without replacing or shifting the headline", async ({ page }) => {
  await page.route("**/textures/resend/**", (route) => route.abort());
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await startClockedIntro(page);
    const name = await page.locator(".intro-firstname").elementHandle();
    const canvas = await page.locator(".cube-stage canvas").elementHandle();
    const dot = await page.locator(".intro-signal").elementHandle();
    if (!name || !canvas || !dot) throw new Error("Missing permanent hero elements");
    const sample = async (time: number) => {
      await page.evaluate((t) => document.getAnimations().filter((a) => a.timeline === document.timeline).forEach((a) => { a.pause(); a.currentTime = t; }), time);
      return page.locator("#intro-title").screenshot();
    };
    const beginning = await sample(90);
    await expect(page.locator(".intro-firstname .name-ink-text")).toHaveCSS("opacity", "0");
    const firstStroke = page.locator(".intro-firstname mask path").first();
    const initialOffset = Number.parseFloat(await firstStroke.evaluate((path) => getComputedStyle(path).strokeDashoffset));
    const writing = await sample(230);
    const laterOffset = Number.parseFloat(await firstStroke.evaluate((path) => getComputedStyle(path).strokeDashoffset));
    expect(laterOffset).toBeLessThan(initialOffset);
    expect(writing.equals(beginning), "ink must visibly progress within a letter").toBe(false);
    await expect(page.locator(".intro-surname mask rect").first()).toHaveCSS("opacity", "0");
    const entering = await name.boundingBox();
    if (!entering) throw new Error("Name missing during entrance");
    const complete = await sample(ENTRANCE_DURATION);
    expect(complete.equals(writing), "the full name must form after the partial strokes").toBe(false);
    await expect(page.locator(".intro-surname mask rect").last()).toHaveCSS("opacity", "1");
    const settled = await name.boundingBox();
    if (!settled) throw new Error("Missing settled headline");
    expect(entering).toEqual(settled);
    const settledName = await name.boundingBox(), settledDot = await dot.boundingBox();
    await page.clock.runFor(ENTRANCE_DURATION);
    await expect(page.locator(".site-intro, .name-ink, [data-ink]")).toHaveCount(0);
    await expect(page.locator(".name-ink-text").first()).toHaveCSS("opacity", "1");
    expect(await name.evaluate((element) => element === document.querySelector("#intro-title .intro-firstname"))).toBe(true);
    expect(await canvas.evaluate((element) => element === document.querySelector(".cube-stage canvas"))).toBe(true);
    expect(await dot.evaluate((element) => element === document.querySelector(".intro-signal"))).toBe(true);
    expect(await name.boundingBox(), "ending the entrance must not swap or jump the headline").toEqual(settledName);
    expect(await dot.boundingBox()).toEqual(settledDot);
    await expect(page.getByRole("heading", { name: "Babisan Pirapakaran", level: 1 })).toHaveCount(1);
    await expect(page.getByText("PORTFOLIO", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Cloud lab/ })).toBeVisible();
    await expect(page.locator(".intro-cinema, [data-slice-stroke]")).toHaveCount(0);
  }
});

test("the name drawing finishes while cube assets are still loading", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/textures/resend/**", async (route) => { await gate; await route.abort(); });
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await startClockedIntro(page);
    await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "loading");
    for (const time of [150, 850, 1800, ENTRANCE_DURATION]) {
      await page.evaluate((t) => document.getAnimations().filter((a) => a.timeline === document.timeline).forEach((a) => { a.pause(); a.currentTime = t; }), time);
      await expect(page.locator(".intro-sticky")).toHaveCSS("filter", "none");
      await expect(page.locator(".site-header")).toHaveCSS("filter", "none");
    }
    await page.clock.runFor(ENTRANCE_DURATION + 50);
    await expect(page.locator(".site-intro")).toHaveCount(0);
    await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "loading");
    await expect(page.getByRole("heading", { name: "Babisan Pirapakaran", level: 1 })).toBeVisible();
    await expect(page.locator(".intro-cinema, [data-slice-stroke]")).toHaveCount(0);
    release();
    await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
    await expect(page.locator(".site-intro")).toHaveCount(0);
  } finally { release(); }
});

test("graphics initialization waits for the lettering, then the intact cube settles and pauses", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes("webgl")) document.documentElement.dataset.graphicsStarted = "true";
      return original.apply(this, args);
    } as typeof original;
  });
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  await page.goto("/");
  await startClockedIntro(page);
  await expect(page.locator("html")).not.toHaveAttribute("data-graphics-started");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "loading");
  await page.clock.runFor(ENTRANCE_DURATION);
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  await expect(page.locator("html")).toHaveAttribute("data-graphics-started", "true");
  // Isolate WebGL from decorative SVG and HTML layers in pixel comparisons.
  await page.addStyleTag({ content: ".site-header, .site-intro, .cube-ray, .intro-grid, .intro-dust, .intro-identity, .intro-copy, .intro-next, .intro-footer { visibility: hidden !important; }" });
  await page.getByRole("group", { name: /Interactive black cube/ }).focus();
  await page.keyboard.press(" ");
  const canvas = page.locator(".cube-stage canvas");
  await page.clock.runFor(240);
  const arriving = await canvas.screenshot();
  await page.clock.runFor(720);
  const settled = await canvas.screenshot();
  expect(settled.equals(arriving), "the intact cube must settle into its normal view").toBe(false);
  await page.clock.runFor(500);
  expect((await canvas.screenshot()).equals(settled), "a paused cube must stay still after settling").toBe(true);
});

test("skipping the lettering initializes the cube and leaves manual rotation working", async ({ page }) => {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  await page.goto("/");
  await startClockedIntro(page);
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "loading");
  await page.keyboard.press("Escape");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  const stage = page.getByRole("group", { name: /Interactive black cube/ });
  await stage.focus();
  await page.keyboard.press(" ");
  await page.clock.runFor(1000);
  const canvas = page.locator(".cube-stage canvas");
  const settled = await canvas.screenshot();
  await page.clock.runFor(1000);
  expect((await canvas.screenshot()).equals(settled), "a paused cube must not drift after skip").toBe(true);
  await page.keyboard.press("ArrowRight");
  await page.clock.runFor(32);
  expect((await canvas.screenshot()).equals(settled), "manual rotation must still work after an interrupted entrance").toBe(false);
});

test("resizing, direct links, and disabled JavaScript leave a usable landing page", async ({ page, browser }) => {
  await page.route("**/textures/resend/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Skip intro" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("html")).not.toHaveAttribute("data-entrance");
  await expect(page.locator(".intro-firstname")).toHaveCSS("transform", "none");
  await expect(page.locator(".intro-signal")).toBeVisible();
  await page.goto("/#projects");
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Things I’ve built." })).toBeInViewport();
  await page.goto("/infrastructure");
  await expect(page.locator("html")).not.toHaveAttribute("data-entrance");
  await expect(page.getByRole("link", { name: /Cloud lab/ })).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plainPage = await context.newPage();
    await plainPage.goto("http://127.0.0.1:3012/");
    await expect(plainPage.getByRole("heading", { name: "Babisan Pirapakaran", level: 1 })).toBeVisible();
    await expect(plainPage.getByRole("link", { name: "Explore my work", exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test("delayed hydration restores the homepage and never starts a late entrance", async ({ page }) => {
  await page.route("**/textures/resend/**", (route) => route.abort());
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/_next/static/chunks/*.js", async (route) => { await gate; await route.continue(); });
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-entrance", "pending");
    await expect(page.getByRole("heading", { name: "Babisan Pirapakaran", level: 1 })).toBeVisible();
    await expect(page.locator(".intro-firstname")).toBeHidden();
    await page.clock.runFor(4100);
    await expect(page.locator("html")).toHaveAttribute("data-entrance", "ready");
    await expect(page.locator(".intro-firstname")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const restored = await page.locator(".intro-firstname").boundingBox();
    release();
    await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
    await expect(page.locator("html")).not.toHaveAttribute("data-entrance");
    await expect(page.locator(".site-intro")).toHaveCount(0);
    expect(await page.locator(".intro-firstname").boundingBox()).toEqual(restored);
  } finally { release(); }
});

test("the opening can be skipped by button or keyboard and respects reduced motion", async ({ page }) => {
  // Hold the deadline while exercising each dismissal independently.
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  // The intro remains dismissible even when cube assets fail; avoid software shader compilation here.
  await page.route("**/textures/resend/**", (route) => route.abort());
  await page.goto("/");
  await startClockedIntro(page);
  const skip = page.getByRole("button", { name: "Skip intro" });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.locator(".site-intro, .name-ink, [data-ink]")).toHaveCount(0);
  await expect(page.locator(".name-ink-text").first()).toHaveCSS("opacity", "1");
  await page.goto("/");
  await startClockedIntro(page);
  await expect(skip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await page.goto("/");
  await startClockedIntro(page);
  await page.keyboard.press("Tab");
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.goto("/");
  await startClockedIntro(page);
  await page.mouse.wheel(0, 80);
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await page.goto("/");
  await startClockedIntro(page);
  await expect(skip).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await page.goto("/");
  await expect(page.locator(".site-intro")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Babisan Pirapakaran" })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".site-intro")).toHaveCount(0);
});

test("a missing cube material keeps the static fallback and page usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/textures/resend/roughness-3.png", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback", { timeout: 20000 });
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
  await page.keyboard.press("Escape");
  const stage = page.getByRole("group", { name: /Interactive black cube/ });
  await stage.focus();
  await page.keyboard.press(" ");
  await page.keyboard.press("ArrowRight");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
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
