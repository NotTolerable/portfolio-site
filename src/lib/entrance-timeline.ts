// Shared timestamps keep the page, typography, and WebGL choreography in step.
export const ENTRANCE_DURATION = 2600;
export const CUBE_ENTRANCE_DURATION = 2200;
export const IMPACT_BEATS = [
  { start: 520, end: 800, paper: true, direction: -1 },
  { start: 1080, end: 1300, paper: false, direction: 1 },
  { start: 1640, end: 1900, paper: true, direction: -1 },
] as const;

export function entranceBeat(elapsed: number) {
  return IMPACT_BEATS.findIndex((beat) => elapsed >= beat.start && elapsed < beat.end);
}

export function entrancePoseTime(elapsed: number) {
  const held = IMPACT_BEATS.reduce((total, beat) => total + Math.max(0, Math.min(elapsed - beat.start, beat.end - beat.start)), 0);
  return (elapsed - held) * 1.45;
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
