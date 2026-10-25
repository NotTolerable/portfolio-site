import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Vector3 } from "three";
import { cameraTrack, sampleTrack } from "../src/lib/gallery/journey";

test.use({ launchOptions: { args: [] } });
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/gallery-enhanced/, {
    timeout: 30000,
  });
  await expect(page.locator(".gallery-loader")).toBeHidden({ timeout: 8000 });
}
async function travel(page: Page, progress: number) {
  await page.evaluate(
    (p) =>
      window.scrollTo({
        top: (document.documentElement.scrollHeight - innerHeight) * p,
        behavior: "instant",
      }),
    progress,
  );
}

test("authored camera advances and reverses continuously across the entire journey", () => {
  for (const mobile of [false, true]) {
    const track = cameraTrack(mobile),
      position = new Vector3(),
      target = new Vector3(),
      previous = new Vector3();
    let longest = 0;
    for (let i = 0; i <= 2000; i++) {
      sampleTrack(i / 2000, track, position, target);
      expect(position.distanceTo(target)).toBeGreaterThan(2);
      if (i) longest = Math.max(longest, position.distanceTo(previous));
      previous.copy(position);
      const reverse = new Vector3();
      sampleTrack(i / 2000, track, reverse, new Vector3());
      expect(reverse.distanceTo(position)).toBe(0);
    }
    expect(longest).toBeLessThan(0.6);
    sampleTrack(1, track, position, target);
    expect(position.y).toBe(-118);
    expect(position.z).toBe(-104);
  }
});

test("one gallery drives reversible project chapters, processor closing and contact", async ({
  page,
}) => {
  const errors: string[] = [],
    cityRequests: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("request", (r) => {
    if (/\/(city|world|models\/courier)\//.test(r.url()))
      cityRequests.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "axiom", exact: true }),
  ).toBeVisible();
  await travel(page, 0.25);
  await expect(
    page.getByRole("heading", { name: "verilly", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".depth-meter")).toHaveText("−080 M");
  await travel(page, 0.48);
  await expect(
    page.getByRole("heading", { name: "behaviourly", exact: true }),
  ).toBeVisible();
  await travel(page, 0.74);
  await expect(
    page.getByRole("heading", { name: "i’m babisan." }),
  ).toBeVisible();
  await travel(page, 1);
  await expect(page.getByRole("button", { name: "LET’S TALK" })).toBeVisible();
  await page.getByRole("button", { name: "LET’S TALK" }).click();
  await expect(page.getByRole("dialog")).toContainText("babisanp@gmail.com");
  await page.keyboard.press("Escape");
  await travel(page, 0);
  await expect(page.locator(".depth-meter")).toHaveText("−000 M");
  await expect(
    page.getByRole("heading", { name: "axiom", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(cityRequests).toEqual([]);
});

test("project and experience panels preserve content, focus and scroll position", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  const explore = page.getByRole("button", {
    name: "Explore project",
    exact: true,
  });
  await explore.click();
  await expect(page.getByRole("dialog")).toContainText("DPDK");
  await expect(page.getByRole("dialog")).toContainText(
    "measured latency results are not published",
  );
  await page.keyboard.press("Escape");
  await expect(explore).toBeFocused();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Experience", exact: true })
    .click();
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  for (const name of [
    "407 ETR",
    "DevRoom",
    "Orbital Studios",
    "Polaris Studios",
    "Anti-cheat & exploit prevention",
    "200M+",
  ])
    await expect(panel).toContainText(name);
  const before = await page.evaluate(() => scrollY);
  await panel.hover();
  await page.mouse.wheel(0, 700);
  await expect
    .poll(() => panel.evaluate((e) => e.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
});

test("reading mode and animation controls remain functional without hiding content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: "Pause animation" }).click();
  await expect(
    page.getByRole("button", { name: "Resume animation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Read portfolio without 3D" }).click();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
  await expect(page.locator(".reading-portfolio")).toContainText(
    "Game server infrastructure & development",
  );
  await page.getByRole("button", { name: "Return to the gallery" }).click();
  await expect(page.locator(".reading-portfolio")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "axiom", exact: true }),
  ).toBeVisible();
});

test("mobile gallery and dialog fit narrow screens and meet contrast and keyboard requirements", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page
    .getByRole("button", { name: "Explore project", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 320, height: 740 });
  await travel(page, 0.74);
  await expect(
    page.getByRole("heading", { name: "i’m babisan." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("no JavaScript and unavailable WebGL expose the complete readable portfolio", async ({
  browser,
}) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 320, height: 850 },
    });
    if (javaScriptEnabled)
      await context.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = (() =>
          null) as typeof HTMLCanvasElement.prototype.getContext;
      });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".reading-portfolio")).toBeVisible();
    await expect(page.locator(".reading-portfolio")).toContainText(
      "Orbital Studios",
    );
    await expect(page.locator(".reading-portfolio")).toContainText("Verilly");
    if (javaScriptEnabled)
      await expect(page.locator(".fallback-notice")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await context.close();
  }
});

test("infrastructure stays honest and archived prototype URLs return to the portfolio", async ({
  page,
}) => {
  await page.goto("/infrastructure");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "My cloud",
  );
  await page.getByRole("button", { name: /CloudFront/ }).click();
  await expect(page.locator(".flow-description")).toContainText(
    "restricted access",
  );
  await expect(page.locator(".infra-notes")).toContainText(
    "Next.js app hosted on Vercel",
  );
  for (const route of ["/camera-study", "/city-preview"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/$/);
  }
});

test("missing artwork degrades gracefully and a lost context releases the gallery", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/gallery/*", (route) => route.abort());
  await ready(page);
  await page
    .getByRole("button", { name: "Explore project", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Axiom");
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas")!;
    canvas
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  });
  await expect(page.locator(".fallback-notice")).toBeVisible();
  await expect(page.locator(".gallery-interface")).toBeHidden();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/gallery-enhanced/);
});

test("skipping a pending loader cannot re-enable the gallery after assets arrive", async ({
  page,
}) => {
  await page.route("**/gallery/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Read portfolio instead" }).click();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
  await page.waitForTimeout(2500);
  await expect(page.locator("html")).not.toHaveClass(/gallery-enhanced/);
  await expect(page.locator(".gallery-interface")).toBeHidden();
});
