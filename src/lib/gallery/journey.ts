/** Reauthored from measured public reference compositions, not its application code. */
import { Vector3 } from "three";
export const exhibits = [
  {
    id: "introduction",
    title: "About me",
    subtitle: "Software engineer & Waterloo student.",
    phrases: [
      "Waterloo · Computational Mathematics",
      "A bit about me and what I’ve worked on.",
    ],
    center: [0, 0, 0],
    size: 3.6,
    action: "Meet Babisan",
  },
  {
    id: "experience",
    title: "Experience",
    subtitle: "Places I’ve worked.",
    phrases: [
      "Software, infrastructure, and game servers.",
      "Here’s what I worked on.",
    ],
    center: [-6, -2, -44],
    size: 6,
    action: "View experience",
  },
  {
    id: "projects",
    title: "Projects",
    subtitle: "Some things I’ve been working on.",
    phrases: [
      "Axiom. Verilly. Behaviourly.",
      "What each project does and how I built it.",
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
export function cameraTrack(mobile: boolean, compact = false) {
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
    new Vector3(0, -27, mobile ? -88 : -101),
    new Vector3(-3, -34, mobile ? -92 : -112),
    new Vector3(0, -45, -156),
  );
  targets.push(
    new Vector3(mobile ? 7 : 4, mobile ? (compact ? -35 : -38) : -30, -136),
    new Vector3(mobile ? 7 : 4, mobile ? (compact ? -35 : -38) : -30, -136),
    new Vector3(0, -42, -200),
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

/** Clear destinations for both direct navigation and scroll status. */
export const journeyChapters = [
  { label: "About", progress: 0, end: .15 },
  { label: "Experience", progress: .212, end: .36 },
  { label: "Projects", progress: .423, end: .58 },
  { label: "Interests", progress: .73, end: .9 },
  { label: "Resume", progress: 1, end: 1.01 },
] as const;
export function chapterForProgress(progress:number) {
  return journeyChapters.findIndex(chapter=>progress<chapter.end);
}
