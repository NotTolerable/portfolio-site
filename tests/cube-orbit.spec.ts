import { expect, test } from "@playwright/test";
import { CubeOrbit, type OrbitInput } from "../src/lib/cube-orbit";

test("idle rotation starts on the first frame with a stationary cursor", () => {
  const orbit = new CubeOrbit();
  const input: OrbitInput = { x: 0, y: 0, pressed: false };
  expect(orbit.update(input, 0, true)).toEqual({ x: 0, y: 0 });
  expect(orbit.update(input, 1 / 60, true).x).toBeGreaterThan(0);
});

test("idle rotation follows and reverses with the last horizontal movement", () => {
  const orbit = new CubeOrbit();
  const input: OrbitInput = { x: 0, y: 0, pressed: false };
  orbit.update(input, 0, true);
  input.x = -0.3;
  const leftStart = orbit.update(input, 1 / 60, true);
  const left = orbit.update(input, 1 / 60, true);
  expect(left.x).toBeLessThan(-0.3);
  expect((leftStart.x - left.x) * 60).toBeGreaterThan(0.25);
  expect(left.y).toBe(0);
  input.x = 0.2;
  input.pressed = true;
  const rightStart = orbit.update(input, 1 / 60, true);
  expect(orbit.update(input, 1 / 60, true)).toEqual(rightStart);
  input.pressed = false;
  const released = orbit.update(input, 1 / 60, true);
  expect((released.x - rightStart.x) * 60).toBeGreaterThan(0.25);
  expect(released.y).toBe(rightStart.y);
});

test("diagonal input determines both axes of the idle orbit", () => {
  const orbit = new CubeOrbit();
  const input: OrbitInput = { x: 0, y: 0, pressed: false };
  orbit.update(input, 0, true);
  input.x = 0.3;
  input.y = -0.4;
  orbit.update(input, 1 / 60, true);
  const idle = orbit.update(input, 1 / 60, true);
  expect(idle.x).toBeGreaterThan(input.x);
  expect(idle.y).toBeLessThan(input.y);
});

test("pause, reduced motion, and a held pointer suppress idle rotation", () => {
  const orbit = new CubeOrbit();
  const input: OrbitInput = { x: 0, y: 0, pressed: true };
  orbit.update(input, 0, true);
  expect(orbit.update(input, 0.1, true)).toEqual({ x: 0, y: 0 });
  input.pressed = false;
  expect(orbit.update(input, 0.1, false)).toEqual({ x: 0, y: 0 });
  input.x = 0.4;
  expect(orbit.update(input, 0.1, false)).toEqual({ x: 0.4, y: 0 });
  orbit.reset(); input.x = 0;
  expect(orbit.update(input, 0, true)).toEqual({ x: 0, y: 0 });
});

test("idle orbit moves faster and changes direction gradually", () => {
  const orbit = new CubeOrbit();
  const input: OrbitInput = { x: 0, y: 0, pressed: false };
  let previous = orbit.update(input, 0, true);
  let previousHeading: number | null = null;
  let initialHeading = 0;
  let largestTurn = 0;
  let highestSpeed = 0;
  let headingChanged = false;
  for (let frame = 1; frame <= 1800; frame++) {
    const position = orbit.update(input, 1 / 60, true);
    const dx = position.x - previous.x;
    const dy = position.y - previous.y;
    const speed = Math.hypot(dx, dy) * 60;
    highestSpeed = Math.max(highestSpeed, speed);
    if (speed > 0.1) {
      const heading = Math.atan2(dy, dx);
      if (previousHeading === null) initialHeading = heading;
      else largestTurn = Math.max(largestTurn, Math.abs(Math.atan2(Math.sin(heading - previousHeading), Math.cos(heading - previousHeading))));
      if (Math.abs(heading - initialHeading) > 0.8) headingChanged = true;
      previousHeading = heading;
    }
    previous = position;
  }
  expect(highestSpeed).toBeGreaterThan(0.35);
  expect(highestSpeed).toBeLessThanOrEqual(0.37);
  expect(headingChanged).toBe(true);
  expect(largestTurn).toBeLessThan(0.08);
});
