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
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
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

test("the entrance settles the real headline, cube, and dot without replacing them", async ({ page }) => {
  await page.route("**/textures/resend/**", (route) => route.abort());
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-entrance", "running");
    const name = await page.locator(".intro-firstname").elementHandle();
    const letter = await page.locator(".intro-firstname > span").first().elementHandle();
    const canvas = await page.locator(".cube-stage canvas").elementHandle();
    const dot = await page.locator(".intro-signal").elementHandle();
    if (!name || !letter || !canvas || !dot) throw new Error("Missing permanent hero elements");
    await page.evaluate(() => document.getAnimations().filter((animation) => animation.timeline === document.timeline).forEach((animation) => { animation.pause(); animation.currentTime = 120; }));
    const entering = await letter.boundingBox();
    if (!entering) throw new Error("Name missing during entrance");
    await page.evaluate(() => document.getAnimations().filter((animation) => animation.timeline === document.timeline).forEach((animation) => { animation.currentTime = 2600; }));
    const settled = await letter.boundingBox();
    if (!settled) throw new Error("Missing settled headline");
    expect(entering.y - settled.y).toBeGreaterThan(20);
    const settledName = await name.boundingBox(), settledDot = await dot.boundingBox();
    await page.clock.runFor(2600);
    await expect(page.locator(".site-intro")).toHaveCount(0);
    expect(await name.evaluate((element) => element === document.querySelector("#intro-title .intro-firstname"))).toBe(true);
    expect(await canvas.evaluate((element) => element === document.querySelector(".cube-stage canvas"))).toBe(true);
    expect(await dot.evaluate((element) => element === document.querySelector(".intro-signal"))).toBe(true);
    expect(await name.boundingBox(), "ending the entrance must not swap or jump the headline").toEqual(settledName);
    expect(await dot.boundingBox()).toEqual(settledDot);
    await expect(page.getByRole("heading", { name: "Babisan Pirapakaran", level: 1 })).toHaveCount(1);
    await expect(page.getByText("PORTFOLIO", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Cloud lab/ })).toBeVisible();
    await expect(page.locator(".intro-cinema:visible")).toHaveCount(0);
  }
});

test("precise slices cross the composition with clean page-wide impact cuts", async ({ page }) => {
  await page.route("**/textures/resend/**", (route) => route.abort());
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-entrance", "running");
    const setFrame = async (time: number) => page.evaluate((t) => document.getAnimations().filter((animation) => animation.timeline === document.timeline).forEach((animation) => { animation.pause(); animation.currentTime = t; }), time);
    await setFrame(430);
    await expect(page.locator('[data-slice-stroke="0"]')).not.toHaveCSS("opacity", "0");
    // Four restrained palette cuts punctuate the fast, staggered slices.
    for (const [time, paper] of [[500, false], [580, true], [655, false], [745, true]] as const) {
      await setFrame(time);
      await expect(page.locator(".intro-sticky")).toHaveCSS("filter", paper ? /invert\(1\)/ : /contrast\(1.15\)/);
      await expect(page.locator(".site-header")).toHaveCSS("filter", paper ? /invert\(1\)/ : /contrast\(1.15\)/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await setFrame(1050);
    await expect(page.locator(".intro-sticky")).toHaveCSS("filter", "none");
    await expect(page.locator('[data-slice-seam="1"]')).not.toHaveCSS("opacity", "0");
    await page.keyboard.press("Escape");
    await expect(page.locator(".intro-sticky")).toHaveCSS("filter", "none");
    await expect(page.locator(".site-header")).toHaveCSS("filter", "none");
    await expect(page.locator(".intro-cinema")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Babisan Pirapakaran", level: 1 })).toBeVisible();
  }
});

test("the cuts separate real cube sections, then reconstruct their exact paused pose", async ({ page }) => {
  // Keep the whole canvas in view: element screenshots resize a shorter viewport,
  // which deliberately dismisses the entrance before the scene can be sampled.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  await expect(page.locator("html")).toHaveAttribute("data-entrance", "running");
  // Isolate WebGL from decorative layers: removing a filter changes Chrome's
  // compositing of SVG gradients by a few RGB levels, even with no cube movement.
  await page.addStyleTag({ content: ".site-header, .site-intro, .intro-cinema, .cube-ray, .intro-grid, .intro-dust, .intro-identity, .intro-copy, .intro-next, .intro-footer { visibility: hidden !important; }" });
  await page.evaluate(() => document.getAnimations().filter((a) => a.timeline === document.timeline).forEach((a) => { a.pause(); a.currentTime = 2600; }));
  await page.getByRole("group", { name: /Interactive black cube/ }).focus();
  await page.keyboard.press(" ");
  const canvas = page.locator(".cube-stage canvas");
  await page.clock.runFor(32);
  const initial = await canvas.screenshot();
  await expect(page.locator("html")).toHaveAttribute("data-entrance", "running");
  await page.clock.runFor(758);
  const sliced = await canvas.screenshot();
  expect(sliced.equals(initial), "the cuts must physically offset the rendered cube sections").toBe(false);
  await page.clock.runFor(310);
  const opened = await canvas.screenshot();
  expect(opened.equals(sliced), "successive slices must displace additional cube sections").toBe(false);
  await page.clock.runFor(1300);
  expect((await canvas.screenshot()).equals(initial), "reassembly must restore the original exact cube pose and materials").toBe(true);
  await page.clock.runFor(400);
  expect((await canvas.screenshot()).equals(initial), "the restored paused cube must stay stable after entrance cleanup").toBe(true);
});

test("skipping during cube deformation restores a stable interactive cube", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  await expect(page.locator("html")).toHaveAttribute("data-entrance", "running");
  // Hold the surrounding DOM at its destination to isolate the scene's deformation.
  await page.evaluate(() => document.getAnimations().filter((animation) => animation.timeline === document.timeline).forEach((animation) => { animation.pause(); animation.currentTime = 2600; }));
  await page.clock.runFor(790);
  const canvas = page.locator(".cube-stage canvas");
  const assembling = await canvas.screenshot();
  await page.keyboard.press("Escape");
  const stage = page.getByRole("group", { name: /Interactive black cube/ });
  await stage.focus();
  await page.keyboard.press(" ");
  await page.clock.runFor(64);
  const settled = await canvas.screenshot();
  expect(settled.equals(assembling), "skipping must finish the physical cube deformation").toBe(false);
  await page.clock.runFor(1000);
  expect((await canvas.screenshot()).equals(settled), "paused cubelets must not keep assembling or drift after skip").toBe(true);
  await page.keyboard.press("ArrowRight");
  await page.clock.runFor(32);
  expect((await canvas.screenshot()).equals(settled), "manual rotation must still work after an interrupted entrance").toBe(false);
  await expect(page.locator(".intro-cinema:visible")).toHaveCount(0);
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
  // The intro remains dismissible even when cube assets fail; avoid software shader compilation here.
  await page.route("**/textures/resend/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
  const skip = page.getByRole("button", { name: "Skip intro" });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
  await expect(skip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
  await page.keyboard.press("Tab");
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.goto("/");
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "fallback");
  await page.mouse.wheel(0, 80);
  await expect(page.locator(".site-intro")).toHaveCount(0);
  await page.goto("/");
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
  await page.keyboard.press("Escape");
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
