import { CatmullRomCurve3, MathUtils, Vector3 } from "three";

const center = new Vector3(2, -84, -128);
const entryStart = new Vector3(12, 28, -98),
  entryControl = new Vector3(6, -38, -110),
  entryEnd = new Vector3(-6, -88, -144);
const lap = new CatmullRomCurve3(
  [
    [12, 8, 9],
    [5, 4, 2],
    [0, 0, -1],
    [-4, -6, 3],
    [-1, -9, 8],
    [8, -1, 10],
  ].map((p) => new Vector3(...p).multiplyScalar(0.7).add(center)),
  true,
  "catmullrom",
  0.5,
);
const lapPosition = new Vector3(),
  nextPosition = new Vector3(),
  footer = new Vector3(20, -112, -141);
function fishPoint(progress: number, time: number, out: Vector3) {
  const t = MathUtils.smoothstep(progress, 0.493, 0.704);
  out
    .copy(entryStart)
    .multiplyScalar((1 - t) * (1 - t))
    .addScaledVector(entryControl, 2 * (1 - t) * t)
    .addScaledVector(entryEnd, t * t);
  out.x += Math.sin(t * Math.PI * 6) * Math.sin(t * Math.PI) * 12;
  out.y -= Math.sin(t * Math.PI) * 8;
  lap.getPointAt((time * 0.036 + 0.48) % 1, lapPosition);
  out.lerp(lapPosition, MathUtils.smoothstep(progress, 0.685, 0.735));
  const end = MathUtils.smoothstep(progress, 0.83, 1);
  out.lerp(footer, end);
  return out;
}
/** A scroll-driven entrance, ambient closed lap, and exit; motion never depends on FPS. */
export function sampleFishMotion(
  progress: number,
  time: number,
  position: Vector3,
  direction: Vector3,
) {
  fishPoint(progress, time, position);
  const blend = MathUtils.smoothstep(progress, 0.68, 0.735);
  if (blend > 0.01) {
    lap.getTangentAt((time * 0.036 + 0.48) % 1, direction);
    direction
      .lerp(
        nextPosition.set(1, 0.03, 0),
        MathUtils.smoothstep(progress, 0.83, 1),
      )
      .normalize();
  } else {
    const p = Math.min(0.704, progress + 0.0005);
    fishPoint(p, time, nextPosition);
    direction.copy(nextPosition).sub(position).normalize();
    if (direction.lengthSq() < 0.1) direction.set(-1, -0.2, -0.25).normalize();
  }
}

export const loaderGreetingStepMs = 420;
export const loaderWordTransitionMs = 280;
export const loaderGreetings = [
  { text: "Hello", lang: "en" },
  { text: "வணக்கம்", lang: "ta" },
  { text: "你好", lang: "zh-CN" },
  { text: "Hola", lang: "es" },
  { text: "مرحبا", lang: "ar" },
  { text: "नमस्ते", lang: "hi" },
  { text: "Bonjour", lang: "fr" },
  { text: "Babisan Pirapakaran", lang: "en" },
] as const;
export const loaderMinimumMs = loaderGreetingStepMs * (loaderGreetings.length - 1) + 850;
