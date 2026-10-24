import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { angleDelta, createWalkerMotion, routeX, ROUTE_LENGTH, WALK_SPEED } from "../src/lib/walker-motion";
import { createWalkerRig, prepareWalkerModel } from "../src/lib/walker-rig";

test("walking accelerates, brakes and turns consistently across display rates", () => {
  const results = [30, 60, 120].map((fps) => {
    const motion = createWalkerMotion(); let lastHeading = motion.state.heading;
    for (let i = 0; i < fps * 10; i++) {
      const state = motion.update(1 / fps, i < fps * 5 ? ROUTE_LENGTH : 0);
      expect(Math.abs(state.velocity)).toBeLessThanOrEqual(WALK_SPEED + .0001);
      expect(Math.abs(angleDelta(lastHeading, state.heading))).toBeLessThanOrEqual(2.5 / fps + .0001);
      expect(state.distance).toBeGreaterThanOrEqual(0);
      expect(state.distance).toBeLessThanOrEqual(ROUTE_LENGTH);
      lastHeading = state.heading;
    }
    return motion.state;
  });
  for (const state of results.slice(1)) {
    expect(state.distance).toBeCloseTo(results[0].distance, 2);
    expect(state.velocity).toBeCloseTo(results[0].velocity, 2);
    expect(state.heading).toBeCloseTo(results[0].heading, 2);
  }
});

test("the walker settles at a bounded destination and pause freezes all locomotion", () => {
  const motion = createWalkerMotion();
  for (let i = 0; i < 600; i++) motion.update(1 / 60, 1);
  expect(motion.state.distance).toBeCloseTo(1, 3);
  expect(Math.abs(motion.state.velocity)).toBeLessThan(.01);
  expect(motion.state.weight).toBeLessThan(.01);
  const paused = { ...motion.state }; motion.update(1, ROUTE_LENGTH, true);
  expect(motion.state).toEqual(paused);
  for (let i = 0; i < 1200; i++) motion.update(1 / 60, 1000);
  expect(motion.state.distance).toBeLessThanOrEqual(ROUTE_LENGTH);
});

test("the actual character rig keeps stance feet planted while its pelvis advances", () => {
  const bytes = readFileSync("public/models/courier/character.fbx");
  const model = new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
  prepareWalkerModel(model, JSON.parse(readFileSync("public/models/courier/idle-pose.json", "utf8")));
  const root = new THREE.Group(); root.add(model);
  const rig = createWalkerRig(model, root), motion = createWalkerMotion();
  const previous = rig.feet.map(() => new THREE.Vector3()); let samples = 0, maxSlide = 0;
  for (let frame = 0; frame < 360; frame++) {
    const state = motion.update(1 / 60, ROUTE_LENGTH);
    root.position.set(routeX(state.distance), 0, 5 - state.distance);
    rig.update(1 / 60, state, false);
    rig.feet.forEach((foot, i) => {
      const actual = foot.ankle.getWorldPosition(new THREE.Vector3()), phase = (state.phase + i * .5) % 1;
      if (state.weight > .995 && phase > .16 && phase < .56 && frame > 90) { maxSlide = Math.max(maxSlide, actual.distanceTo(previous[i])); samples++; }
      expect(Number.isFinite(actual.y)).toBe(true); previous[i].copy(actual);
    });
  }
  expect(samples).toBeGreaterThan(50);
  expect(maxSlide, "stance anchors should stay within 2cm between frames").toBeLessThan(.02);
});
