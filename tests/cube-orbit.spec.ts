import { expect, test } from "@playwright/test";
import { CubeOrbit, type OrbitInput } from "../src/lib/cube-orbit";

test("automatic tumble is frame-rate independent and has no loop seam", () => {
  for (const fps of [30, 60, 120]) {
    const orbit = new CubeOrbit();
    const input: OrbitInput = { x: 0, y: 0, pressed: false };
    let position = orbit.update(input, 0, true);
    for (let i = 0; i < fps * 10; i++) position = orbit.update(input, 1 / fps, true);
    const angle = -359 * Math.PI / 180;
    expect(position.x).toBeCloseTo(angle, 8);
    expect(position.y).toBeCloseTo(angle, 8);
    expect(orbit.update(input, 1 / fps, true).x - position.x).toBeCloseTo(angle / (10 * fps), 8);
  }
});

test("drag holds idle rotation, then rotation resumes in the last drag direction; pause suppresses it", () => {
  const orbit = new CubeOrbit();
  const input: OrbitInput = { x: 0, y: 0, pressed: true };
  orbit.update(input, 0, true);
  input.x = 0.3;
  const dragged = orbit.update(input, 1 / 60, true);
  expect(orbit.update(input, 1 / 60, true)).toEqual(dragged);
  input.pressed = false;
  const released = orbit.update(input, 1 / 60, true);
  expect(released.x).toBeGreaterThan(dragged.x);
  expect(released.y).toBeLessThan(dragged.y);
  expect(orbit.update(input, 10, false)).toEqual(released);
});
