import * as T from 'three';
import { angleDelta, damp } from '../walker-motion';
import type { DistrictId } from './layout';
export type PedestrianSpec = {
  id: string;
  district: DistrictId;
  path: readonly (readonly [
    number,
    number
  ])[];
  speed: number;
  offset: number;
  height: number;
  wait: number;
  heading?: number;
};
export const pedestrianSpecs: PedestrianSpec[] = [
  { id: 'a-north', district: 'a', path: [[-4.15, 3.5], [-4.15, 11]], speed: .72, offset: .22, height: 1.82, wait: 2 },
  { id: 'a-south', district: 'a', path: [[-4.96, 3.5], [-4.96, 11]], speed: .65, offset: .78, height: 1.72, wait: 3 },
  { id: 'a-shopper', district: 'a', path: [[4.15, 3], [4.15, -6.2]], speed: .76, offset: .5, height: 1.88, wait: 2.4 },
  { id: 'a-friend-one', district: 'a', path: [[4.2, -15.5]], speed: 0, offset: 0, height: 1.78, wait: 0, heading: 1.6 },
  { id: 'a-friend-two', district: 'a', path: [[5.14, -15.5]], speed: 0, offset: 0, height: 1.86, wait: 0, heading: -1.5 },
  { id: 'b-hotel', district: 'b', path: [[17.5, -35.3], [28, -35.3]], speed: .77, offset: .15, height: 1.8, wait: 2 },
  { id: 'b-afterwork', district: 'b', path: [[32, -26.65], [49, -26.65]], speed: .8, offset: .67, height: 1.86, wait: 2.8 },
  { id: 'b-late', district: 'b', path: [[48, -35.3], [55, -35.3]], speed: .69, offset: .45, height: 1.73, wait: 4 },
  { id: 'b-entry', district: 'b', path: [[38.6, -35.45], [40.5, -35.45], [40.5, -36.4], [40.5, -38.6]], speed: .64, offset: .6, height: 1.76, wait: 5.5 },
  { id: 'b-listener-one', district: 'b', path: [[51.2, -26.4]], speed: 0, offset: 0, height: 1.8, wait: 0, heading: 1.5 },
  { id: 'b-listener-two', district: 'b', path: [[52.2, -26.3]], speed: 0, offset: 0, height: 1.74, wait: 0, heading: -1.6 },
  { id: 'b-restaurant', district: 'b', path: [[29, -35.4], [34, -35.4]], speed: .62, offset: .4, height: 1.84, wait: 3 },
  { id: 'c-gym', district: 'c', path: [[64.8, -45], [64.8, -54]], speed: .73, offset: .45, height: 1.87, wait: 4 },
  { id: 'c-bookshop', district: 'c', path: [[55.3, -74], [55.3, -81]], speed: .59, offset: .2, height: 1.72, wait: 5 },
  { id: 'c-walker', district: 'c', path: [[64.7, -66], [64.7, -78]], speed: .67, offset: .75, height: 1.83, wait: 3 },
  { id: 'c-window', district: 'c', path: [[64.3, -60.5]], speed: 0, offset: 0, height: 1.77, wait: 0, heading: 1.5 },
  { id: 'd-home', district: 'd', path: [[25.9, -104], [25.9, -115]], speed: .56, offset: .45, height: 1.79, wait: 6 },
];
export function createPedestrianMotion(spec: PedestrianSpec) {
  const points = spec.path.map(p => new T.Vector3(p[0], 0, p[1]));
  if (points.length === 1)
    points.push(points[0].clone().add(new T.Vector3(0, 0, .001)));
  const curve = new T.CatmullRomCurve3(points, false, 'centripetal');
  curve.arcLengthDivisions = 160;
  curve.updateArcLengths();
  const length = curve.getLength();
  const position = new T.Vector3(), tangent = new T.Vector3();
  let direction = spec.offset > .5 ? -1 : 1, dwell = 0;
  const state = { distance: length * spec.offset, velocity: 0, heading: spec.heading ?? 0, turn: 0, phase: spec.offset + .42, weight: 0, position };
  curve.getPointAt(state.distance / length, position);
  curve.getTangentAt(state.distance / length, tangent);
  if (spec.heading === undefined)
    state.heading = Math.atan2(tangent.x * direction, tangent.z * direction);
  return { state, length, curve, update(delta: number, blocked = false) {
      if (spec.speed === 0)
        return state;
      const steps = Math.max(1, Math.ceil(Math.min(delta, .1) * 120)), dt = Math.min(delta, .1) / steps;
      for (let i = 0; i < steps; i++) {
        if (dwell > 0) {
          dwell = Math.max(0, dwell - dt);
          if (dwell === 0)
            direction *= -1;
        }
        const target = direction > 0 ? length : 0, error = target - state.distance;
        curve.getTangentAt(T.MathUtils.clamp(state.distance / length, .00001, .99999), tangent);
        const desired = Math.atan2(tangent.x * direction, tangent.z * direction), turn = angleDelta(state.heading, desired), old = state.heading;
        if (!dwell)
          state.heading += T.MathUtils.clamp(turn * (1 - Math.exp(-7 * dt)), -2.1 * dt, 2.1 * dt);
        state.turn = damp(state.turn, angleDelta(old, state.heading) / dt, 8, dt);
        const speed = dwell || blocked ? 0 : Math.min(spec.speed, Math.sqrt(Math.abs(error) * 2 * 1.2)) * Math.max(0, Math.cos(turn));
        state.velocity = damp(state.velocity, speed, speed > state.velocity ? 3.5 : 7, dt);
        const movement = Math.min(Math.abs(error), state.velocity * dt);
        state.distance = T.MathUtils.clamp(state.distance + movement * direction, 0, length);
        if (!dwell && Math.abs(target - state.distance) < .007 && state.velocity < .03) {
          state.distance = target;
          dwell = spec.wait;
        }
        const cycle = ((state.phase % 1) + 1) % 1, settling = state.velocity < .015 && !(cycle < .12 || (cycle >= .5 && cycle < .62)) && state.weight > .025;
        state.phase += movement / 1.04 + Math.abs(state.turn) * .06 * dt + (settling ? .65 * dt : 0);
        const activity = Math.min(1, state.velocity / .4 + Math.abs(state.turn) * .5 + (settling ? .45 : 0));
        state.weight = damp(state.weight, activity, activity > state.weight ? 7 : 5, dt);
      }
      curve.getPointAt(T.MathUtils.clamp(state.distance / length, 0, 1), position);
      return state;
    } };
}
