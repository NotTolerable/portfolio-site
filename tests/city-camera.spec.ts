import { expect, test } from "@playwright/test";
import { Euler, Vector3 } from "three";
import {
  createCityDirector,
  sampleCityCamera,
  springStep,
} from "../src/lib/city/camera";

test("the four compositions travel through a connected street and leave the bookshop behind", () => {
  const a = sampleCityCamera(0),
    b = sampleCityCamera(0.36),
    c = sampleCityCamera(0.66),
    d = sampleCityCamera(1);
  expect(a.position.z).toBeGreaterThan(9);
  expect(b.position.z).toBeLessThan(-9);
  expect(c.position.z).toBeLessThan(-22);
  expect(d.position.x).toBeGreaterThan(12);
  const yaw = (p: ReturnType<typeof sampleCityCamera>) =>
    new Euler().setFromQuaternion(p.quaternion, "YXZ").y;
  expect(yaw(b)).toBeGreaterThan(0.9);
  expect(yaw(d)).toBeLessThan(-1.5);
  expect(c.position.y - b.position.y).toBeGreaterThan(0.8);
  const toShop = new Vector3(-5.95, 1.6, -10).sub(c.position),
    forward = new Vector3(0, 0, -1).applyQuaternion(c.quaternion);
  expect(toShop.dot(forward)).toBeLessThan(-10);
});
test("quaternion direction is continuous, horizon-level and reversible across every shot boundary", () => {
  const poses = Array.from({ length: 2001 }, (_, i) =>
    sampleCityCamera(i / 2000),
  );
  for (let i = 2000; i >= 0; i--) {
    const p = sampleCityCamera(i / 2000);
    expect(p.position.distanceTo(poses[i].position)).toBeLessThan(1e-10);
    expect(p.quaternion.angleTo(poses[i].quaternion)).toBeLessThan(1e-6);
    expect(
      Math.abs(new Euler().setFromQuaternion(p.quaternion, "YXZ").z),
    ).toBeLessThan(1e-6);
    if (i) {
      expect(p.position.distanceTo(poses[i - 1].position)).toBeLessThan(0.1);
      expect(p.quaternion.angleTo(poses[i - 1].quaternion)).toBeLessThan(0.02);
    }
  }
});
test("render-clock travel and damped sign dynamics remain stable across display rates", () => {
  const values = [30, 60, 120].map((fps) => {
    const d = createCityDirector();
    d.setTarget(0.66);
    d.setPointer(1, -1);
    for (let i = 0; i < fps * 2; i++) d.update(1 / fps);
    return d.frame;
  });
  for (const v of values) {
    expect(v.progress).toBeCloseTo(values[0].progress, 8);
    expect(v.signAngle).toBeCloseTo(values[0].signAngle, 3);
    const base = sampleCityCamera(v.progress);
    expect(v.position.distanceTo(base.position)).toBeLessThan(0.07);
    expect(v.quaternion.angleTo(base.quaternion)).toBeLessThan(0.025);
  }
  const springs = [30, 60, 120].map((fps) => {
    let value = 0,
      velocity = 0;
    for (let i = 0; i < fps; i++) {
      const next = springStep(value, velocity, 0.04, 1 / fps);
      value = next.value;
      velocity = next.velocity;
    }
    return value;
  });
  expect(springs[0]).toBeCloseTo(springs[2], 10);
});
test("pause holds the sign while intentional camera navigation and hover can continue", () => {
  const d = createCityDirector(0.36);
  d.setPointer(0.8, 0);
  for (let i = 0; i < 120; i++) d.update(1 / 60);
  const angle = d.frame.signAngle;
  d.setTarget(1);
  d.setHover(true);
  for (let i = 0; i < 180; i++) d.update(1 / 60, false);
  expect(d.frame.signAngle).toBe(angle);
  expect(d.frame.progress).toBeGreaterThan(0.99);
  expect(d.frame.hover).toBeGreaterThan(0.99);
});
