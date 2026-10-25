import { expect, test } from '@playwright/test';
import { Euler, Vector3 } from 'three';
import { createCityDirector, sampleCityCamera, cityDistanceAt, cityJourneyLength, springStep } from '../src/lib/city/camera';
import { onWalkableGround, districtAt } from '../src/lib/city/layout';
import { createPedestrianMotion, pedestrianSpecs } from '../src/lib/city/pedestrian-motion';
test('the route occupies connected roads, clears architecture and reverses exactly over all four districts', () => {
  expect(cityJourneyLength).toBeGreaterThan(190);
  const poses = Array.from({ length: 4001 }, (_, i) => sampleCityCamera(i / 4000));
  for (let i = 4000; i >= 0; i--) {
    const p = sampleCityCamera(i / 4000);
    expect(onWalkableGround(p.position.x, p.position.z)).toBe(true);
    expect(p.position.y).toBeGreaterThan(1.3);
    expect(p.position.distanceTo(poses[i].position)).toBeLessThan(1e-9);
    expect(p.quaternion.angleTo(poses[i].quaternion)).toBeLessThan(1e-6);
    expect(Math.abs(new Euler().setFromQuaternion(p.quaternion, 'YXZ').z)).toBeLessThan(1e-6);
    if (i) {
      expect(p.position.distanceTo(poses[i - 1].position)).toBeLessThan(.18);
      expect(p.quaternion.angleTo(poses[i - 1].quaternion)).toBeLessThan(.025);
      expect(cityDistanceAt(i / 4000)).toBeGreaterThan(cityDistanceAt((i - 1) / 4000));
    }
  }
  expect(poses[0].position.z).toBeGreaterThan(9);
  expect(poses[4000].position.z).toBeLessThan(-125);
  expect(poses[4000].position.x).toBeCloseTo(30.4);
  const yaw = (p: number) => new Euler().setFromQuaternion(sampleCityCamera(p).quaternion, 'YXZ').y;
  expect(yaw(.12)).toBeGreaterThan(1);
  expect(yaw(.28)).toBeLessThan(-1.5);
  expect(yaw(.67)).toBeGreaterThan(1);
  expect(yaw(.83)).toBeGreaterThan(1.5);
  const toShop = new Vector3(-5.9, 1.6, -10).sub(sampleCityCamera(.2).position), forward = new Vector3(0, 0, -1).applyQuaternion(sampleCityCamera(.2).quaternion);
  expect(toShop.dot(forward)).toBeLessThan(-10);
});
test('loading limits travel, keeps rendered state authoritative and releases smoothly without teleporting', () => {
  const d = createCityDirector();
  d.setTarget(1);
  d.setAvailableProgress(.278);
  const last = d.update(0).position.clone();
  for (let i = 0; i < 1200; i++) {
    const f = d.update(1 / 60);
    expect(f.position.distanceTo(last)).toBeLessThan(.285);
    last.copy(f.position);
    expect(f.progress).toBeLessThanOrEqual(.278);
  }
  expect(d.frame.progress).toBeCloseTo(.278, 5);
  expect(districtAt(d.frame.progress).id).toBe('a');
  d.setAvailableProgress(1);
  for (let i = 0; i < 1800; i++) {
    const f = d.update(1 / 60);
    expect(f.position.distanceTo(last)).toBeLessThan(.285);
    last.copy(f.position);
  }
  expect(d.frame.progress).toBe(1);
  d.setTarget(0);
  for (let i = 0; i < 1800; i++)
    d.update(1 / 60);
  expect(d.frame.progress).toBe(0);
});
test('camera motion and a critically damped sign remain stable at different display rates', () => {
  const values = [30, 60, 120].map(fps => {
    const d = createCityDirector();
    d.setTarget(.12);
    d.setPointer(1, -1);
    for (let i = 0; i < fps * 5; i++)
      d.update(1 / fps);
    return d.frame;
  });
  for (const v of values) {
    expect(v.progress).toBeCloseTo(values[0].progress, 4);
    expect(v.signAngle).toBeCloseTo(values[0].signAngle, 3);
    const base = sampleCityCamera(v.progress);
    expect(v.position.distanceTo(base.position)).toBeLessThan(.07);
    expect(v.quaternion.angleTo(base.quaternion)).toBeLessThan(.025);
  }
  const springs = [30, 60, 120].map(fps => {
    let value = 0, velocity = 0;
    for (let i = 0; i < fps; i++) {
      const n = springStep(value, velocity, .04, 1 / fps);
      value = n.value;
      velocity = n.velocity;
    }
    return value;
  });
  expect(springs[0]).toBeCloseTo(springs[2], 10);
});
test('pause holds ambient movement while intentional travel continues; reduced mode removes parallax', () => {
  const d = createCityDirector(.12);
  d.setPointer(.8, 0);
  for (let i = 0; i < 120; i++)
    d.update(1 / 60);
  const angle = d.frame.signAngle;
  d.setTarget(.28);
  d.setHover(true);
  for (let i = 0; i < 600; i++)
    d.update(1 / 60, false);
  expect(d.frame.signAngle).toBe(angle);
  expect(d.frame.progress).toBe(.28);
  expect(d.frame.hover).toBeGreaterThan(.99);
  d.setReducedMotion(true);
  d.setTarget(.59);
  d.update(1 / 60);
  expect(d.frame.progress).toBe(.59);
});
test('pedestrians remain on walkable lanes, avoid each other and turn without teleporting over a five-minute cycle', () => {
  const actors = pedestrianSpecs.map(createPedestrianMotion);
  let entering = false, leaving = false;
  const minDistance = { value: Infinity };
  let maxStep = 0, offLane = 0;
  for (let i = 0; i < 18000; i++) {
    for (let a = 0; a < actors.length; a++) {
      const actor = actors[a], old = actor.state.position.clone();
      const state = actor.update(1 / 60);
      if (i % 60 === 0 && !onWalkableGround(state.position.x, state.position.z))
        offLane++;
      maxStep = Math.max(maxStep, state.position.distanceTo(old));
      if (pedestrianSpecs[a].id === 'b-entry' && state.position.z < -37) {
        entering ||= state.velocity > .05 && Math.cos(state.heading) < -.5;
        leaving ||= state.velocity > .05 && Math.cos(state.heading) > .5;
      }
    }
    if (i % 12 === 0)
      for (let a = 0; a < actors.length; a++)
        for (let b = a + 1; b < actors.length; b++) {
          const distance = actors[a].state.position.distanceTo(actors[b].state.position);
          minDistance.value = Math.min(minDistance.value, distance);
        }
  }
  expect(offLane).toBe(0);
  expect(maxStep).toBeLessThan(.018);
  expect(minDistance.value).toBeGreaterThan(.7);
  expect(entering).toBe(true);
  expect(leaving).toBe(true);
});
