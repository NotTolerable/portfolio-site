import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({ viewport: { width: 1280, height: 900 } });
test.setTimeout(70000);
async function ready(page: Page) { await expect(page.locator('.camera-study')).toHaveAttribute('data-renderer', 'ready', { timeout: 30000 }); }
async function seek(page: Page, name: string, id: string) {
    const stops: Record<string, number> = { street: 0, workshop: .22, service: .39, orbit: .565, threshold: .8, court: 1 };
    await page.getByRole('navigation', { name: 'Camera compositions' }).getByRole('link', { name, exact: true }).click();
    await expect(page.locator('.camera-study')).toHaveAttribute('data-shot', id);
    // Wait for arrival, rather than sampling the two directions at different points in the easing.
    await expect.poll(async () => Number(await page.locator('.study-stage canvas').getAttribute('data-progress')), { timeout: 12000 }).toBeCloseTo(stops[id], 3);
}
test('the camera prototype renders one world, moves forward, changes orientation and reverses coherently', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/camera-study');
    await ready(page);
    await expect(page.locator('canvas')).toHaveCount(1);
    const positions: number[][] = [], quaternions: string[] = [];
    for (const [name, id] of [['Street level', 'street'], ['Workshop approach', 'workshop'], ['Side-looking view', 'service'], ['Corner orbit', 'orbit'], ['Court threshold', 'threshold'], ['Empty court', 'court']]) {
        await seek(page, name, id);
        positions.push((await page.locator('canvas').getAttribute('data-position'))!.split(',').map(Number));
        quaternions.push((await page.locator('canvas').getAttribute('data-quaternion'))!);
    }
    for (let i = 1; i < positions.length; i++)
        expect(positions[i][2]).toBeLessThan(positions[i - 1][2]);
    expect(new Set(quaternions).size).toBe(6);
    expect(positions.at(-1)![2]).toBeLessThan(-77);
    await seek(page, 'Workshop approach', 'workshop');
    expect(Math.abs(Number((await page.locator('canvas').getAttribute('data-position'))!.split(',')[2]) - positions[1][2])).toBeLessThan(.25);
    expect(errors).toEqual([]);
});
test('returning from the camera study restores a single portfolio renderer', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/camera-study');
    await ready(page);
    await page.getByRole('link', { name: 'Back to portfolio' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('.world-shell')).toHaveAttribute('data-scene', 'ready', { timeout: 30000 });
    await expect(page.locator('canvas')).toHaveCount(1);
    expect(errors).toEqual([]);
});
test('each object has a custom focus composition and closing restores the same journey location', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/camera-study#workshop');
    await ready(page);
    await seek(page, 'Workshop approach', 'workshop');
    const before = await page.locator('canvas').getAttribute('data-position');
    await page.getByRole('button', { name: 'Inspect the workshop', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'The workshop' })).toBeVisible();
    await expect(page.locator('canvas')).toHaveAttribute('data-focus', 'workshop');
    const focused = await page.locator('canvas').getAttribute('data-position');
    expect(focused).not.toBe(before);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('canvas')).toHaveAttribute('data-focus', '');
    await expect(page.locator('canvas')).toHaveAttribute('data-position', before!);
    await seek(page, 'Side-looking view', 'service');
    await page.getByRole('button', { name: 'Inspect the service bay', exact: true }).click();
    await expect(page.locator('canvas')).toHaveAttribute('data-focus', 'service');
    expect(await page.locator('canvas').getAttribute('data-position')).not.toBe(focused);
});
test('mobile camera navigation, keyboard scrubbing and reduced motion remain usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/camera-study');
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const slider = page.getByRole('slider', { name: 'Camera journey' });
    await slider.focus();
    await page.keyboard.press('End');
    await expect(page.locator('.camera-study')).toHaveAttribute('data-shot', 'court');
    await expect(page.locator('canvas')).toHaveAttribute('data-progress', '1.000000');
    const draws = await page.locator('canvas').getAttribute('data-draws');
    await page.waitForTimeout(400);
    expect(await page.locator('canvas').getAttribute('data-draws')).toBe(draws);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
});
test('a failed prototype renderer exposes the shot list and the complete portfolio remains reachable', async ({ page }) => {
    await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) { if (type === 'webgl' || type === 'webgl2')
        return null; return Reflect.apply(original, this, [type, ...args]); } as typeof original; });
    await page.goto('/camera-study');
    await expect(page.locator('.camera-study')).toHaveAttribute('data-renderer', 'unavailable');
    await expect(page.getByRole('heading', { name: 'Empty court', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Return to the complete portfolio' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Babisan');
});

test('the shot sequence and portfolio navigation work without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
    const page = await context.newPage();
    await page.goto('/camera-study');
    await expect(page.getByRole('heading', { name: 'Street level', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Empty court', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: 'Return to the complete portfolio' }).click();
    await expect(page).toHaveURL('/');
    await context.close();
});

test('graphics loss during object focus closes the dialog and removes stale spatial controls', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/camera-study#workshop');
    await ready(page);
    await seek(page, 'Workshop approach', 'workshop');
    await page.getByRole('button', { name: 'Inspect the workshop', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'The workshop' })).toBeVisible();
    await page.locator('canvas').evaluate(c => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    await expect(page.locator('.camera-study')).toHaveAttribute('data-renderer', 'unavailable');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('.study-hotspot')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Empty court', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});
