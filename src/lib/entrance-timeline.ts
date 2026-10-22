// Shared timestamps keep the page, typography, and WebGL choreography in step.
export const ENTRANCE_DURATION = 2600;
export const CUBE_ENTRANCE_DURATION = 2380;
// Four drawings cut within 285 ms. Only two are light inversions; no looping strobe.
export const IMPACT_BEATS = [
  { start: 540, end: 596, paper: true, direction: -1 },
  { start: 600, end: 671, paper: false, direction: 1 },
  { start: 675, end: 731, paper: true, direction: -1 },
  { start: 735, end: 825, paper: false, direction: 1 },
] as const;

export function entranceBeat(elapsed: number) {
  return IMPACT_BEATS.findIndex((beat) => elapsed >= beat.start && elapsed < beat.end);
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

// Contact drawings hold their pose; the rest is a single strike, not four slow hits.
export function entrancePose(elapsed: number) {
  const t = elapsed >= 540 && elapsed < 600 ? 540 : elapsed >= 675 && elapsed < 735 ? 700 : elapsed;
  const compress = smooth((t - 510) / 180) * (1 - smooth((t - 810) / 180));
  const explode = Math.pow(smooth((t - 780) / 250), .65);
  const recover = smooth((t - 1200) / 1120);
  return {
    compress,
    spread: explode * (1 - recover),
    recoil: Math.sin(clamp((t - 540) / 1700) * Math.PI) * (1 - recover),
    settle: t > 2110 ? Math.sin((t - 2110) / 70) * .025 * (1 - smooth((t - 2110) / 270)) : 0,
  };
}

let startedAt: number | null = null;
const listeners = new Set<(time: number | null) => void>();
export function setEntranceStart(time: number | null) {
  startedAt = time;
  listeners.forEach((listener) => listener(time));
}
export function subscribeEntrance(listener: (time: number | null) => void) {
  listeners.add(listener);
  listener(startedAt);
  return () => { listeners.delete(listener); };
}
