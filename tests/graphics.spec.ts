import { test, expect } from "@playwright/test";
import { AdaptiveGraphics, graphicsProfiles } from "../src/lib/gallery/quality";
function run(controller: AdaptiveGraphics, ms: number, seconds: number) {
  for (let t = 0; t < seconds * 1000; t += ms) controller.sample(ms);
}
test("automatic graphics sustain 60fps without degrading or reacting to a single stall", () => {
  const graphics = new AdaptiveGraphics();
  run(graphics, 1000 / 60, 30);
  expect(graphics.tier).toBe(0);
  graphics.sample(700);
  run(graphics, 1000 / 60, 8);
  expect(graphics.tier).toBe(0);
});
test("sustained slow frames reduce actual render cost and eventually choose a deliberate low-spec tier", () => {
  const graphics = new AdaptiveGraphics();
  run(graphics, 40, 2);
  expect(graphics.tier).toBe(0);
  run(graphics, 40, 18);
  expect(graphics.tier).toBe(3);
  const high = graphicsProfiles[0],
    low = graphicsProfiles[graphics.tier];
  expect(low.dpr).toBeLessThan(high.dpr / 2);
  expect(low.points).toBeLessThan(high.points / 4);
  expect(low.snow).toBeLessThan(high.snow / 3);
  expect(low.transmission).toBe(false);
  expect(low.post).toBe(false);
  expect(low.pixelated).toBe(true);
});
test("recovery waits for sustained headroom, while manual quality remains stable", () => {
  const graphics = new AdaptiveGraphics();
  run(graphics, 40, 18);
  const low = graphics.tier;
  run(graphics, 1000 / 60, 10);
  expect(graphics.tier).toBe(low);
  run(graphics, 1000 / 60, 55);
  expect(graphics.tier).toBeLessThan(low);
  graphics.select("high");
  run(graphics, 50, 30);
  expect(graphics.tier).toBe(0);
  graphics.select("performance");
  run(graphics, 1000 / 120, 60);
  expect(graphics.tier).toBe(2);
  graphics.select("auto");
  run(graphics, 50, 12);
  expect(graphics.tier).toBe(3);
});

test("a sustained 50fps cadence also reduces quality toward the 60fps target", () => {
  const graphics = new AdaptiveGraphics();
  run(graphics, 20, 9);
  expect(graphics.tier).toBeGreaterThan(0);
});
