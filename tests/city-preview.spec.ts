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
  await expect(page.locator(".city-preview")).toHaveAttribute(
    "data-renderer",
    "ready",
    { timeout: 45000 },
  );
  await expect(page.locator("canvas")).toHaveAttribute("data-frames", /\d+/);
}
async function shot(page: Page, id: string, p: number) {
  await page.locator('.city-footer a[href="#' + id + '"]').click();
  await expect
    .poll(
      async () =>
        Number(await page.locator("canvas").getAttribute("data-progress")),
      { timeout: 18000 },
    )
    .toBeCloseTo(p, 3);
  await expect(page.locator(".city-preview")).toHaveAttribute("data-shot", id);
}
async function audit(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
}

test("four real compositions progress through one world, reverse, and restore the portfolio renderer", async ({
  page,
}) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/city-preview");
  await ready(page);
  await expect(page.locator("canvas")).toHaveCount(1);
  const positions: number[][] = [],
    orientations: string[] = [];
  for (const [id, p] of [
    ["arrival", 0],
    ["bookshop", 0.36],
    ["passing", 0.66],
    ["corner", 1],
  ] as const) {
    await shot(page, id, p);
    positions.push(
      (await page.locator("canvas").getAttribute("data-position"))!
        .split(",")
        .map(Number),
    );
    orientations.push(
      (await page.locator("canvas").getAttribute("data-quaternion"))!,
    );
  }
  expect(new Set(orientations).size).toBe(4);
  expect(positions[2][2]).toBeLessThan(-22);
  expect(positions[3][0]).toBeGreaterThan(12);
  await shot(page, "bookshop", 0.36);
  expect(
    Math.abs(
      Number(
        (await page.locator("canvas").getAttribute("data-position"))!.split(
          ",",
        )[2],
      ) - positions[1][2],
    ),
  ).toBeLessThan(0.15);
  expect(
    requests.some((u) =>
      /\/(optics|radio|relay|desk|searchlight)\.glb/.test(u),
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
  await page
    .getByRole("link", { name: "Back to portfolio", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(page.locator(".world-shell")).toHaveAttribute(
    "data-scene",
    "ready",
    { timeout: 30000 },
  );
  await expect(page.locator("canvas")).toHaveCount(1);
});

test("cursor, hanging sign, keyboard warmth, pause and still-mode return behave coherently", async ({
  page,
}) => {
  await page.goto("/city-preview#bookshop");
  await ready(page);
  await shot(page, "bookshop", 0.36);
  await page.mouse.move(100, 400);
  await page.waitForTimeout(1200);
  const first = Number(await page.locator("canvas").getAttribute("data-sign"));
  await page.mouse.move(1350, 400);
  await page.waitForTimeout(1600);
  expect(
    Math.abs(
      Number(await page.locator("canvas").getAttribute("data-sign")) - first,
    ),
  ).toBeGreaterThan(0.004);
  const warmth = page.getByRole("button", { name: "A little warmth" });
  await warmth.focus();
  await expect
    .poll(async () =>
      Number(await page.locator("canvas").getAttribute("data-hover")),
    )
    .toBeGreaterThan(0.9);
  await page.keyboard.press("Enter");
  await expect(warmth).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Pause atmosphere", exact: true })
    .click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(2300);
  const count = Number(
    await page.locator("canvas").getAttribute("data-frames"),
  );
  await page.waitForTimeout(500);
  expect(
    Number(await page.locator("canvas").getAttribute("data-frames")) - count,
  ).toBeLessThan(3);
  await shot(page, "corner", 1);
  await page.getByRole("button", { name: "Still views", exact: true }).click();
  await expect(page.locator(".city-preview")).toHaveAttribute(
    "data-world",
    "false",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Return to the street" }).click();
  await ready(page);
  await expect(page.locator("canvas")).toHaveCount(1);
  await audit(page);
});

for (const mode of ["mobile", "reduced"] as const)
  test(`${mode} uses scene captures without downloading the WebGL environment`, async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (r) => requests.push(r.url()));
    if (mode === "mobile")
      await page.setViewportSize({ width: 390, height: 844 });
    else await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/city-preview");
    await expect(page.locator(".city-preview")).toHaveAttribute(
      "data-world",
      "false",
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(requests.some((u) => u.endsWith(".glb") || u.endsWith(".hdr"))).toBe(
      false,
    );
    await page
      .getByRole("navigation", { name: "Street compositions" })
      .getByRole("link", { name: "Around the corner" })
      .click();
    await expect(page.locator("#corner")).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await audit(page);
  });

for (const failure of ["asset", "context", "webgl"] as const)
  test(`${failure} failure leaves a complete still narrative and portfolio links`, async ({
    page,
  }) => {
    if (failure === "webgl")
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...args: unknown[]
        ) {
          if (type === "webgl" || type === "webgl2") return null;
          return Reflect.apply(original, this, [type, ...args]);
        } as typeof original;
      });
    if (failure === "asset")
      await page.route("**/city/architecture.glb", (r) => r.abort());
    await page.goto("/city-preview");
    if (failure === "context") {
      await ready(page);
      await page
        .locator("canvas")
        .evaluate((c) =>
          c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
        );
    }
    await expect(page.locator(".city-preview")).toHaveAttribute(
      "data-renderer",
      "unavailable",
      { timeout: 30000 },
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".city-still-note")).toContainText(
      "could not load",
    );
    await expect(
      page.getByRole("link", { name: "Explore the portfolio" }),
    ).toHaveAttribute("href", "/");
  });

test("a 320px no-JavaScript visitor can view all four images and reach the resume through the portfolio", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 740 },
  });
  const page = await context.newPage();
  await page.goto("/city-preview");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".city-still-view img")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("link", { name: "Back to portfolio", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("link", { name: /resume/i }).first(),
  ).toHaveAttribute("href", "/resume");
  await context.close();
});
