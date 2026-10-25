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
const points: [number, number, number][] = [
  [0.4, 2.15, 10],
  [0.2, 2.1, 5],
  [0.1, 1.95, 0],
  [0.6, 1.8, -5],
  [1.2, 1.7, -9],
  [0.8, 1.8, -13],
  [0.1, 2.2, -17],
  [-0.2, 2.75, -22],
  [0.1, 2.8, -26],
  [1.7, 2.6, -29],
  [4.5, 2.25, -31],
  [8, 2.2, -31.5],
  [13, 2.3, -31.5],
];
const rail = new T.CatmullRomCurve3(
  points.map((p) => new T.Vector3(...p)),
  false,
  "centripetal",
);
rail.arcLengthDivisions = 1500;
rail.updateArcLengths();
function distanceAtZ(z: number) {
  let lo = 0,
    hi = 1;
  const point = new T.Vector3();
  for (let i = 0; i < 32; i++) {
    const m = (lo + hi) / 2;
    rail.getPointAt(m, point);
    if (point.z > z) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
const pace = monotoneTrack([
  [0, 0],
  [0.12, distanceAtZ(3)],
  [0.36, distanceAtZ(-9.5)],
  [0.5, distanceAtZ(-14)],
  [0.66, distanceAtZ(-23)],
  [0.8, distanceAtZ(-29.5)],
  [1, 1],
]);
const lens = monotoneTrack([
  [0, 54],
  [0.36, 48],
  [0.66, 55],
  [0.85, 52],
  [1, 54],
]);
const yaw = [-8, 5, 35, 62, 68, 28, -6, -14, -42, -76, -94];
const pitch = [3, 2, 0, -1, 1, -3, -3, 3, 5, 2, 1];
const orientations = yaw.map((y, i) =>
  new T.Quaternion().setFromEuler(
    new T.Euler(
      T.MathUtils.degToRad(pitch[i]),
      T.MathUtils.degToRad(y),
      0,
      "YXZ",
    ),
  ),
);
// SQUAD tangents are precomputed for a C1 quaternion track on uniform time keys.
function log(q: T.Quaternion) {
  const n = Math.hypot(q.x, q.y, q.z),
    scale = n < 1e-10 ? 1 : Math.atan2(n, q.w) / n;
  return new T.Vector3(q.x * scale, q.y * scale, q.z * scale);
}
function exp(v: T.Vector3) {
  const n = v.length(),
    s = n < 1e-10 ? 1 : Math.sin(n) / n;
  return new T.Quaternion(v.x * s, v.y * s, v.z * s, Math.cos(n));
}
const tangents = orientations.map((q, i) => {
  if (i === 0 || i === orientations.length - 1) return q.clone();
  const inverse = q.clone().invert();
  return q.clone().multiply(
    exp(
      log(inverse.clone().multiply(orientations[i - 1]))
        .add(log(inverse.multiply(orientations[i + 1])))
        .multiplyScalar(-0.25),
    ),
  );
});
const qa = new T.Quaternion(),
  qb = new T.Quaternion(),
  euler = new T.Euler(0, 0, 0, "YXZ");
function level(q: T.Quaternion) {
  euler.setFromQuaternion(q, "YXZ");
  euler.z = 0;
  q.setFromEuler(euler);
}
export function sampleCityCamera(
  progress: number,
  out = { position: new T.Vector3(), quaternion: new T.Quaternion(), fov: 54 },
) {
  const p = T.MathUtils.clamp(progress, 0, 1),
    scaled = p * 10,
    i = Math.min(9, Math.floor(scaled)),
    t = scaled - i;
  rail.getPointAt(pace(p), out.position);
  qa.slerpQuaternions(orientations[i], orientations[i + 1], t);
  qb.slerpQuaternions(tangents[i], tangents[i + 1], t);
  out.quaternion.slerpQuaternions(qa, qb, 2 * t * (1 - t));
  level(out.quaternion);
  out.fov = lens(p);
  return out;
}
/** Exact critically-damped spring; stable at different update frequencies. */
export function springStep(
  value: number,
  velocity: number,
  target: number,
  delta: number,
  frequency = 5,
) {
  const offset = value - target,
    c = velocity + frequency * offset,
    decay = Math.exp(-frequency * delta);
  return {
    value: target + (offset + c * delta) * decay,
    velocity: (velocity - frequency * c * delta) * decay,
  };
}
export function createCityDirector(initial = 0) {
  let progress = T.MathUtils.clamp(initial, 0, 1),
    target = progress,
    px = 0,
    py = 0,
    hoverTarget = 0,
    signVelocity = 0,
    time = 0;
  const position = new T.Vector3(),
    quaternion = new T.Quaternion(),
    pointerQ = new T.Quaternion(),
    right = new T.Vector3();
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
    setPointer(x: number, y: number) {
      px = T.MathUtils.clamp(x, -1, 1);
      py = T.MathUtils.clamp(y, -1, 1);
    },
    setHover(active: boolean) {
      hoverTarget = active ? 1 : 0;
    },
    update(delta: number, ambient = true) {
      const dt = T.MathUtils.clamp(delta, 0, 0.1),
        a = 1 - Math.exp(-5.5 * dt);
      progress += (target - progress) * a;
      if (Math.abs(target - progress) < 1e-6) progress = target;
      frame.cursor.x += (px - frame.cursor.x) * a;
      frame.cursor.y += (py - frame.cursor.y) * a;
      frame.hover += (hoverTarget - frame.hover) * a;
      sampleCityCamera(progress, frame);
      right.set(1, 0, 0).applyQuaternion(quaternion);
      position.addScaledVector(right, frame.cursor.x * 0.06);
      position.y -= frame.cursor.y * 0.025;
      pointerQ.setFromEuler(
        euler.set(-frame.cursor.y * 0.007, -frame.cursor.x * 0.011, 0, "YXZ"),
      );
      quaternion.multiply(pointerQ);
      level(quaternion);
      if (ambient) {
        time += dt;
        const s = springStep(
          frame.signAngle,
          signVelocity,
          Math.sin(time * 0.72) * 0.012 + frame.cursor.x * 0.025,
          dt,
        );
        frame.signAngle = s.value;
        signVelocity = s.velocity;
      }
      frame.progress = progress;
      frame.target = target;
      frame.shot =
        cityShots.findLast((s) => progress >= s.start) ?? cityShots[0];
      frame.moving =
        Math.abs(target - progress) > 1e-6 ||
        Math.abs(frame.cursor.x - px) > 0.0001 ||
        Math.abs(frame.cursor.y - py) > 0.0001 ||
        Math.abs(frame.hover - hoverTarget) > 0.0001;
      return frame;
    },
  };
}
