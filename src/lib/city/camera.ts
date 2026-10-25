import * as T from "three";
import { monotoneTrack } from "../camera-tracks";
import { cityShots, type CityShot } from "./route";
export { cityShots } from "./route";
export type CityFrame = {
  progress: number;
  target: number;
  position: T.Vector3;
  quaternion: T.Quaternion;
  fov: number;
  shot: CityShot;
  moving: boolean;
  cursor: T.Vector2;
  hover: number;
  signAngle: number;
};
const points: [
  number,
  number,
  number
][] = [
  [.4, 2.15, 10], [.2, 2.1, 5], [.3, 1.35, -2], [.6, 1.55, -6], [1.2, 1.7, -9.5], [.8, 1.9, -15], [-.2, 2.75, -23], [.1, 2.8, -26], [1.8, 2.8, -29], [5, 2.8, -31.2], [11, 2.8, -31.5],
  [20, 2.15, -31.4], [27, 1.8, -31.1], [34, 2.2, -30.7], [41, 2.6, -30.6], [49, 2.9, -31.7], [55, 3.2, -31.8], [59, 3.25, -34.5], [60.7, 2.8, -40.5], [60, 2.25, -47], [61.2, 1.6, -56], [60.5, 1.9, -62], [60.4, 1.9, -68.5], [60.2, 1.9, -73.5], [61, 1.85, -78], [60.2, 2.7, -82], [58.3, 3.2, -85], [53, 3.2, -86], [42, 3.1, -86], [33, 2.8, -86.5], [30.8, 2.4, -90], [30, 2.15, -99], [30, 2.2, -109], [30.3, 2.2, -118], [30.4, 2.35, -126]
];
const rail = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)), false, 'centripetal');
rail.arcLengthDivisions = 3200;
rail.updateArcLengths();
const lengths = rail.getLengths(), totalLength = rail.getLength();
function distanceAtIndex(index: number) {
  const scaled = index / (points.length - 1) * 3200, i = Math.min(3199, Math.floor(scaled));
  return T.MathUtils.lerp(lengths[i], lengths[i + 1], scaled - i) / totalLength;
}
const pace = monotoneTrack(cityShots.map(s => [s.at, distanceAtIndex(s.index)]));
export const cityJourneyLength = totalLength;
export function cityDistanceAt(progress: number) {
  return pace(T.MathUtils.clamp(progress, 0, 1)) * totalLength;
}
function progressAtDistance(distance: number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 32; i++) {
    const m = (lo + hi) / 2;
    if (cityDistanceAt(m) < distance)
      lo = m;
    else
      hi = m;
  }
  return (lo + hi) / 2;
}
const lens = monotoneTrack([[0, 54], [.065, 57], [.12, 48], [.20, 55], [.28, 56], [.36, 51], [.43, 49], [.52, 58], [.59, 49], [.67, 48], [.74, 51], [.83, 58], [.93, 54], [1, 54]]);
const yawTrack = monotoneTrack([[0, -8], [.065, 28], [.12, 68], [.16, 40], [.20, -12], [.25, -70], [.28, -94], [.33, -82], [.36, -60], [.40, -90], [.43, -120], [.47, -80], [.52, -20], [.55, -2], [.59, -55], [.63, 18], [.67, 70], [.70, 35], [.74, 68], [.78, 42], [.83, 90], [.87, 90], [.90, 20], [.93, 65], [1, 0]]);
const pitchTrack = monotoneTrack([[0, 3], [.065, 12], [.12, -1], [.20, -3], [.28, 2], [.36, 1], [.43, 0], [.52, -5], [.59, 2], [.67, -1], [.74, 2], [.83, -3], [.93, 4], [1, 5]]);
const yaw = Array.from({ length: 49 }, (_, i) => yawTrack(i / 48)), pitch = Array.from({ length: 49 }, (_, i) => pitchTrack(i / 48));
const orientations = yaw.map((y, i) => new T.Quaternion().setFromEuler(new T.Euler(T.MathUtils.degToRad(pitch[i]), T.MathUtils.degToRad(y), 0, "YXZ")));
// SQUAD tangents are precomputed for a C1 quaternion track on uniform time keys.
function log(q: T.Quaternion) {
  const n = Math.hypot(q.x, q.y, q.z), scale = n < 1e-10 ? 1 : Math.atan2(n, q.w) / n;
  return new T.Vector3(q.x * scale, q.y * scale, q.z * scale);
}
function exp(v: T.Vector3) {
  const n = v.length(), s = n < 1e-10 ? 1 : Math.sin(n) / n;
  return new T.Quaternion(v.x * s, v.y * s, v.z * s, Math.cos(n));
}
const tangents = orientations.map((q, i) => {
  if (i === 0 || i === orientations.length - 1)
    return q.clone();
  const inverse = q.clone().invert();
  return q.clone().multiply(exp(log(inverse.clone().multiply(orientations[i - 1]))
    .add(log(inverse.multiply(orientations[i + 1])))
    .multiplyScalar(-0.25)));
});
const qa = new T.Quaternion(), qb = new T.Quaternion(), euler = new T.Euler(0, 0, 0, "YXZ");
function level(q: T.Quaternion) {
  euler.setFromQuaternion(q, "YXZ");
  euler.z = 0;
  q.setFromEuler(euler);
}
export function sampleCityCamera(progress: number, out = { position: new T.Vector3(), quaternion: new T.Quaternion(), fov: 54 }) {
  const p = T.MathUtils.clamp(progress, 0, 1), scaled = p * 48, i = Math.min(47, Math.floor(scaled)), t = scaled - i;
  rail.getPointAt(pace(p), out.position);
  qa.slerpQuaternions(orientations[i], orientations[i + 1], t);
  qb.slerpQuaternions(tangents[i], tangents[i + 1], t);
  out.quaternion.slerpQuaternions(qa, qb, 2 * t * (1 - t));
  level(out.quaternion);
  out.fov = lens(p);
  return out;
}
/** Exact critically-damped spring; stable at different update frequencies. */
export function springStep(value: number, velocity: number, target: number, delta: number, frequency = 5) {
  const offset = value - target, c = velocity + frequency * offset, decay = Math.exp(-frequency * delta);
  return {
    value: target + (offset + c * delta) * decay,
    velocity: (velocity - frequency * c * delta) * decay,
  };
}
export function createCityDirector(initial = 0) {
  let progress = T.MathUtils.clamp(initial, 0, 1), target = progress, px = 0, py = 0, hoverTarget = 0, signVelocity = 0, time = 0, available = 1, reduced = false;
  const position = new T.Vector3(), quaternion = new T.Quaternion(), pointerQ = new T.Quaternion(), right = new T.Vector3();
  const frame: CityFrame = {
    progress,
    target,
    position,
    quaternion,
    fov: 54,
    shot: cityShots[0],
    moving: false,
    cursor: new T.Vector2(),
    hover: 0,
    signAngle: 0,
  };
  return {
    frame,
    setTarget(p: number) {
      target = T.MathUtils.clamp(p, 0, 1);
    },
    setAvailableProgress(value: number) {
      available = T.MathUtils.clamp(value, 0, 1);
    },
    setReducedMotion(value: boolean) {
      reduced = value;
    },
    setPointer(x: number, y: number) {
      px = T.MathUtils.clamp(x, -1, 1);
      py = T.MathUtils.clamp(y, -1, 1);
    },
    setHover(active: boolean) {
      hoverTarget = active ? 1 : 0;
    },
    update(delta: number, ambient = true) {
      const dt = T.MathUtils.clamp(delta, 0, 0.1), a = 1 - Math.exp(-5.5 * dt);
      const permitted = Math.min(target, available), distance = cityDistanceAt(progress), desired = cityDistanceAt(permitted);
      const speed = progress < .28 ? 17 : progress < .52 ? 15 : progress < .83 ? 13 : 11;
      const travel = T.MathUtils.clamp((desired - distance) * a, -speed * dt, speed * dt);
      progress = reduced ? permitted : progressAtDistance(distance + travel);
      if (Math.abs(permitted - progress) < 1e-6)
        progress = permitted;
      if (reduced)
        frame.cursor.set(0, 0);
      frame.cursor.x += ((reduced ? 0 : px) - frame.cursor.x) * a;
      frame.cursor.y += ((reduced ? 0 : py) - frame.cursor.y) * a;
      frame.hover += (hoverTarget - frame.hover) * a;
      sampleCityCamera(progress, frame);
      right.set(1, 0, 0).applyQuaternion(quaternion);
      position.addScaledVector(right, frame.cursor.x * 0.06);
      position.y -= frame.cursor.y * 0.025;
      pointerQ.setFromEuler(euler.set(-frame.cursor.y * 0.007, -frame.cursor.x * 0.011, 0, "YXZ"));
      quaternion.multiply(pointerQ);
      level(quaternion);
      if (ambient && !reduced) {
        time += dt;
        const s = springStep(frame.signAngle, signVelocity, Math.sin(time * 0.72) * 0.012 + frame.cursor.x * 0.025, dt);
        frame.signAngle = s.value;
        signVelocity = s.velocity;
      }
      frame.progress = progress;
      frame.target = target;
      frame.shot =
        cityShots.findLast((s) => progress >= s.start) ?? cityShots[0];
      frame.moving =
        Math.abs(Math.min(target, available) - progress) > 1e-6 ||
          Math.abs(frame.cursor.x - (reduced ? 0 : px)) > 0.0001 ||
          Math.abs(frame.cursor.y - (reduced ? 0 : py)) > 0.0001 ||
          Math.abs(frame.hover - hoverTarget) > 0.0001;
      return frame;
    },
  };
}
