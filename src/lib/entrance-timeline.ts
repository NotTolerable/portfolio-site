// Shared timestamps keep the page, typography, and WebGL choreography in step.
export const ENTRANCE_DURATION = 2600;
export const CUBE_ENTRANCE_DURATION = 2380;
// Two paper cuts and two dark contact drawings, all within one short flurry.
export const IMPACT_BEATS = [
  { start: 480, end: 522, paper: false, direction: 1 },
  { start: 560, end: 600, paper: true, direction: -1 },
  { start: 640, end: 676, paper: false, direction: 1 },
  { start: 724, end: 766, paper: true, direction: -1 },
] as const;
export const SLICE_STARTS = [480, 610, 740] as const;

export function entranceBeat(elapsed: number) {
  return IMPACT_BEATS.findIndex((beat) => elapsed >= beat.start && elapsed < beat.end);
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function entrancePose(elapsed: number) {
  // Brief held drawings punctuate otherwise continuous, time-based motion.
  const beat = IMPACT_BEATS[entranceBeat(elapsed)];
  const t = beat ? beat.start : elapsed;
  return SLICE_STARTS.map((start, index) => {
    const opening = 1 - Math.pow(1 - clamp((t - start) / 300), 3);
    const closing = smooth((t - 1110 - index * 65) / (1080 - index * 30));
    return opening * (1 - closing);
  });
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
