import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Vector3 } from "three";
import { cameraTrack, sampleTrack } from "../src/lib/gallery/journey";
import { cpuParticleGeometry } from "../src/lib/gallery/art";
import { sampleFishMotion } from "../src/lib/gallery/motion";

test.use({ launchOptions: { args: [] } });
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/gallery-enhanced/, {
    timeout: 30000,
  });
  await expect(page.locator(".gallery-loader")).toBeHidden({ timeout: 8000 });
}
async function travel(page: Page, p: number) {
  await page.evaluate(
    (p) =>
      scrollTo({
        top: (document.documentElement.scrollHeight - innerHeight) * p,
        behavior: "instant",
      }),
    p,
  );
}

test("the authored camera is continuous and reversible through its complete depth", () => {
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
    }
    expect(longest).toBeLessThan(0.6);
    sampleTrack(1, track, position, target);
    expect(position.y).toBe(-118);
    expect(position.z).toBe(-104);
  }
});

test("the processor is volumetric on both faces and the fish actually travels a smooth circuit", () => {
  const geometry = cpuParticleGeometry(12000);
  geometry.computeBoundingBox();
  const size = geometry.boundingBox!.getSize(new Vector3());
  expect(size.z).toBeGreaterThan(6);
  expect(size.x).toBeGreaterThan(20);
  expect(size.y).toBeGreaterThan(20);
  const points = geometry.getAttribute("position");
  let front = 0,
    back = 0;
  for (let i = 0; i < points.count; i++) {
    if (points.getZ(i) > 3) front++;
    if (points.getZ(i) < -1.5) back++;
  }
  expect(front).toBeGreaterThan(500);
  expect(back).toBeGreaterThan(500);
  geometry.dispose();
  const previous = new Vector3(),
    current = new Vector3(),
    direction = new Vector3();
  sampleFishMotion(0.76, 0, previous, direction);
  const initial = previous.clone();
  for (let i = 1; i <= 240; i++) {
    sampleFishMotion(0.76, i / 30, current, direction);
    expect(current.distanceTo(previous)).toBeLessThan(0.5);
    expect(direction.length()).toBeCloseTo(1, 4);
    previous.copy(current);
  }
  expect(current.distanceTo(initial)).toBeGreaterThan(4);
});

test("introduction, experience and projects lead to a complete resume with working links", async ({
  page,
}) => {
  const errors: string[] = [],
    oldAssets: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("request", (r) => {
    if (/\/(city|world|models\/courier)\/|baby-angel|nike.glb/.test(r.url()))
      oldAssets.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "babisan.", exact: true }),
  ).toBeVisible();
  await travel(page, 0.25);
  await expect(
    page.getByRole("heading", { name: "experience", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".depth-meter")).toHaveText("−080 M");
  await travel(page, 0.48);
  await expect(
    page.getByRole("heading", { name: "projects", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore Verilly", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Verilly", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await travel(page, 0.74);
  await expect(
    page.getByRole("heading", { name: "one layer deeper.", exact: true }),
  ).toBeVisible();
  await travel(page, 1);
  const finale = page.locator(".gallery-finale");
  await expect(
    finale.getByRole("heading", { name: "My resume." }),
  ).toBeVisible();
  const image = finale.getByRole("img", {
    name: "Full-page preview of Babisan Pirapakaran’s resume",
  });
  await expect(image).toBeVisible();
  expect(
    await image.evaluate(
      (node: HTMLImageElement) => node.complete && node.naturalHeight === 1980,
    ),
  ).toBe(true);
  await expect(finale.locator("object,iframe")).toHaveCount(0);
  await expect(finale.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/NotTolerable",
  );
  await expect(
    finale.locator('a[href="mailto:babisanp@gmail.com"]'),
  ).toBeVisible();
  await expect(
    finale.getByRole("link", { name: "View resume PDF" }),
  ).toHaveAttribute("href", "/resume");
  await travel(page, 0);
  await expect(page.locator(".depth-meter")).toHaveText("−000 M");
  expect(errors).toEqual([]);
  expect(oldAssets).toEqual([]);
});

test("minimal panels preserve full experience and projects, scrolling and restored focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  const meet = page.getByRole("button", { name: "Meet Babisan", exact: true });
  await meet.click();
  const panel = page.getByRole("dialog");
  await expect(
    panel.getByRole("heading", { name: "Babisan Pirapakaran", exact: true }),
  ).toBeVisible();
  await expect(panel.locator(".full-record")).not.toHaveAttribute("open");
  await page.keyboard.press("Escape");
  await expect(meet).toBeFocused();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Experience", exact: true })
    .click();
  await panel.getByText("Full technical record", { exact: false }).click();
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
  await travel(page, 0.48);
  await page
    .getByRole("button", { name: "Explore projects", exact: true })
    .click();
  await expect(panel).toContainText("DPDK");
  await panel.getByRole("button", { name: "Behaviourly", exact: true }).click();
  await expect(panel).toContainText("Whisper");
});

test("normal-motion entrance cycles languages and the compact HUD really types its text", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const name = page.locator(".loader-name");
  const seen = new Set<string>();
  const start = Date.now();
  while (Date.now() - start < 3000) {
    seen.add((await name.textContent()) ?? "");
    await page.waitForTimeout(90);
  }
  expect(seen.size).toBeGreaterThan(3);
  expect([...seen].some((s) => /[^\u0000-\u007f]/.test(s))).toBe(true);
  await expect(name).toHaveText("Babisan Pirapakaran");
  await expect(page.locator("html")).toHaveClass(/gallery-enhanced/);
  await expect(page.locator(".gallery-loader")).toBeHidden();
  await page.getByRole("button", { name: "Meet Babisan", exact: true }).click();
  const typed = page.locator("dialog .typed-copy>span[aria-hidden=true]");
  await expect(typed).toHaveAttribute("data-typing", "true");
  const early = (await typed.textContent())!.length;
  await expect(typed).toHaveAttribute("data-typing", "false", {
    timeout: 5000,
  });
  expect((await typed.textContent())!.length).toBeGreaterThan(early + 50);
});

test("reading and pause controls preserve all content and navigation", async ({
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
    page.getByRole("heading", { name: "babisan.", exact: true }),
  ).toBeVisible();
});

test("mobile HUD and the complete resume fit within the viewport with accessible controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.getByRole("button", { name: "Meet Babisan", exact: true }).click();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press("Escape");
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 1024, height: 600 },
    { width: 640, height: 360 },
    { width: 320, height: 500 },
  ]) {
    await page.setViewportSize(viewport);
    await travel(page, 1);
    const img = page.locator(".gallery-finale img");
    await expect(img).toBeVisible();
    const box = (await img.boundingBox())!;
    expect(box.y).toBeGreaterThan(60);
    expect(box.y + box.height).toBeLessThan(viewport.height - 45);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("no JavaScript and unavailable WebGL retain all public content and the resume preview", async ({
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
    await expect(page.locator(".reading-portfolio img")).toBeVisible();
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

test("infrastructure stays honest and legacy prototypes redirect home", async ({
  page,
}) => {
  await page.goto("/infrastructure");
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

test("missing external artwork degrades gracefully and context loss releases the scene", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/gallery/*", (route) => route.abort());
  await ready(page);
  await page.getByRole("button", { name: "Meet Babisan", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Waterloo");
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    document
      .querySelector("canvas")!
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext(),
  );
  await expect(page.locator(".fallback-notice")).toBeVisible();
  await expect(page.locator(".gallery-interface")).toBeHidden();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
});

test("skipping pending loading cannot enable the gallery after the assets arrive", async ({
  page,
}) => {
  await page.route("**/gallery/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Read portfolio instead" }).click();
  await expect(page.locator(".reading-portfolio")).toBeVisible();
  await page.waitForTimeout(4500);
  await expect(page.locator("html")).not.toHaveClass(/gallery-enhanced/);
  await expect(page.locator(".gallery-interface")).toBeHidden();
});
