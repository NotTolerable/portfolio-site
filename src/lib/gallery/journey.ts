/** Reauthored from measured public reference compositions, not its application code. */
import { Vector3 } from "three";
export const exhibits = [
  {
    id: "introduction",
    title: "babisan.",
    subtitle: "software engineer. always curious.",
    phrases: [
      "Waterloo · Computational Mathematics",
      "Systems, infrastructure, and what’s underneath.",
    ],
    center: [0, 0, 0],
    size: 3.6,
    action: "Meet Babisan",
  },
  {
    id: "experience",
    title: "experience",
    subtitle: "built, shipped, and operated.",
    phrases: [
      "Platforms. Infrastructure. Production.",
      "From game servers to engineering platforms.",
    ],
    center: [-6, -2, -44],
    size: 6,
    action: "View experience",
  },
  {
    id: "projects",
    title: "projects",
    subtitle: "ideas, made tangible.",
    phrases: [
      "Axiom. Verilly. Behaviourly.",
      "A closer look at what I’ve built.",
    ],
    center: [5, 1.5, -86],
    size: 4.5,
    action: "Explore projects",
  },
] as const;
const spans = [0, 0.25, 0.5, 1.5, 1.75, 2, 3, 3.25, 3.5, 5, 5.9, 7.1];
export const stops = spans.map((v) => v / 7.1);
const directions = [
  [0.39, 0.185, 0.889, 3],
  [0.62, -0.05, 0.78, 2.05],
  [-0.75, 0.08, 0.66, 2.3],
];
const focus = [
  [0, 0, 0],
  [0.12, 0, 0],
  [-0.04, 0.03, 0],
];
export function cameraTrack(mobile: boolean) {
  const positions: Vector3[] = [],
    targets: Vector3[] = [];
  exhibits.forEach((e) =>
    directions.forEach((d, i) => {
      const center = new Vector3(...e.center);
      positions.push(
        new Vector3(d[0], d[1], d[2])
          .normalize()
          .multiplyScalar(d[3] * e.size * (mobile ? 1.46 : 1))
          .add(center),
      );
      targets.push(new Vector3(...focus[i]).multiplyScalar(e.size).add(center));
    }),
  );
  positions.push(
    new Vector3(0, -84, mobile ? -65 : -88),
    new Vector3(0, -84, mobile ? -65 : -88),
    new Vector3(0, -118, -104),
  );
  targets.push(
    new Vector3(0, -84, -128),
    new Vector3(0, -84, -128),
    new Vector3(0, -122, -150),
  );
  return { positions, targets };
}
export function sampleTrack(
  progress: number,
  track: ReturnType<typeof cameraTrack>,
  position: Vector3,
  target: Vector3,
) {
  const p = Math.max(0, Math.min(1, progress));
  let i = 0;
  while (i < stops.length - 2 && p > stops[i + 1]) i++;
  const t = Math.max(
    0,
    Math.min(1, (p - stops[i]) / (stops[i + 1] - stops[i])),
  );
  const eased = t * t * (3 - 2 * t);
  position.lerpVectors(track.positions[i], track.positions[i + 1], eased);
  target.lerpVectors(track.targets[i], track.targets[i + 1], eased);
}
export function exhibitAt(progress: number) {
  return progress < 0.15 ? 0 : progress < 0.36 ? 1 : progress < 0.535 ? 2 : -1;
}

/** Reading order follows the three authored views, independently of cursor or spin. */
export function hotspotForProgress(
  progress: number,
  exhibit = exhibitAt(progress),
) {
  if (exhibit < 0) return -1;
  const base = exhibit * 3;
  return progress >= stops[base + 2] ? 2 : progress >= stops[base + 1] ? 1 : 0;
}
