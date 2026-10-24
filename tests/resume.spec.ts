import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the resume button opens a new page with the real embedded PDF and a working download", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Resume (opens in a new tab)", exact: true }).click();
  const resumePage = await popupPromise;
  try {
    await expect(resumePage).toHaveURL(/\/resume$/);
    await expect(resumePage.getByRole("heading", { level: 1 })).toHaveText("MY RESUME.");
    const viewer = resumePage.locator("object[type='application/pdf']");
    await expect(viewer).toBeVisible();
    const resource = (await viewer.getAttribute("data"))!.split("#")[0];
    const response = await page.request.get(resource);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
    const downloadPromise = resumePage.waitForEvent("download");
    await resumePage.getByRole("link", { name: "Download PDF" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Babisan-Pirapakaran-Resume.pdf");
    expect(await download.failure()).toBeNull();
    await expect(page).toHaveURL(/\/$/);
  } finally { await resumePage.close(); }
});

test("the resume page supports narrow screens, accessible controls and no JavaScript", async ({ browser, page: accessiblePage }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3012/resume");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download PDF" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("link", { name: "Back to the portfolio" }).click();
    await expect(page).toHaveURL(/\/$/);
  } finally { await context.close(); }
  // Axe uses asynchronous browser scripts; audit the same UI with scripts enabled.
  // Chrome's native PDF viewer is browser-owned, rather than site HTML.
  await accessiblePage.setViewportSize({ width: 320, height: 900 });
  await accessiblePage.goto("/resume");
  const result = await new AxeBuilder({ page: accessiblePage }).options({ iframes: false }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
});
