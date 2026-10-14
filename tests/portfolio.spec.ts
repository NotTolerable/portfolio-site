import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("project explorer works with keyboard, content views, and clipboard", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hey, I’mBabisan.");
  await page.getByRole("link", { name: "My projects", exact: true }).click();
  await expect(page).toHaveURL(/#projects$/);
  const governance = page.getByRole("tab", { name: /AI governance/ });
  await governance.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: /Mock interviews/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "AI mock interview", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Project file", exact: true }).click();
  await expect(page.locator(".project-code")).toContainText('"AI mock interview"');
  await page.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('name: "AI mock interview"');
  await page.getByRole("link", { name: "Cloud / Infra", exact: true }).click();
  await expect(page).toHaveURL(/\/infrastructure$/);
  await page.getByRole("button", { name: /02 \/ DELIVERY CloudFront/ }).click();
  await expect(page.locator(".flow-description")).toContainText("deliver cached assets");
  await page.getByRole("button", { name: /03 \/ ORIGIN Private S3/ }).click();
  await expect(page.locator(".flow-description")).toContainText("origin access control");
  expect(errors).toEqual([]);
});

test("WebGL cube supports hover, drag, pause, keyboard rotation, and reset", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator(".site-intro")).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
  const stage = page.getByRole("group", { name: /Interactive black cube/ });
  await page.getByRole("button", { name: "Pause cube animation" }).click();
  await expect(page.getByRole("button", { name: "Resume cube animation" })).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(600);
  const canvas = page.locator(".cube-stage canvas");
  const before = await canvas.screenshot({ path: "test-results/cube-lighting.png" });
  await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(before), "paused cube should remain still").toBe(true);
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  expect((await canvas.screenshot()).equals(before), "keyboard input should rotate the cube").toBe(false);
  const bounds = await stage.boundingBox();
  if (!bounds) throw new Error("Cube has no visible bounds");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  const beforeHover = await canvas.screenshot();
  await page.mouse.move(bounds.x + bounds.width / 2 + 60, bounds.y + bounds.height / 2 + 15, { steps: 8 });
  await page.waitForTimeout(100);
  const afterHover = await canvas.screenshot();
  expect(afterHover.equals(beforeHover), "hover should rotate the cube").toBe(false);
  await page.waitForTimeout(150);
  expect((await canvas.screenshot()).equals(afterHover), "paused cube should stay at its new hover angle").toBe(true);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 90, bounds.y + bounds.height / 2 + 25, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(100);
  const afterDrag = await canvas.screenshot();
  await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(afterDrag), "paused cube should have no release momentum").toBe(true);
  await page.getByRole("button", { name: "Reset cube view" }).click();
  await stage.focus();
  await page.keyboard.press(" ");
  await expect(page.getByRole("button", { name: "Pause cube animation" })).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(1300);
  await canvas.screenshot({ path: "test-results/cube-turning.png" });
  expect(errors).toEqual([]);
});

test("responsive layouts, reduced motion, and automated accessibility", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".cube-figure")).toHaveAttribute("data-renderer", "webgl", { timeout: 20000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `overflow at ${width}px`).toBe(true);
    if (width === 1280 || width === 390) {
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
  await expect(page.getByText("GEOMETRY STUDY / STATIC PREVIEW")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause cube animation" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "My projects", exact: true })).toBeVisible();
});

test("the quick intro clears and does not replay on internal navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site-intro")).toHaveCount(0, { timeout: 3000 });
  await page.getByRole("link", { name: "Cloud / Infra", exact: true }).click();
  await expect(page).toHaveURL(/\/infrastructure$/);
  await expect(page.locator(".site-intro")).toHaveCount(0);
});
