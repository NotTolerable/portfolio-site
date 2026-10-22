// Shared timestamps keep the page, typography, and WebGL choreography in step.
export const ENTRANCE_DURATION = 2600;
export const CUBE_ENTRANCE_DURATION = 2380;
// Two very short pose holds give the cuts weight without changing page luminance.
const CONTACT_BEATS = [{ start: 510, end: 542 }, { start: 720, end: 752 }] as const;
export const SLICE_STARTS = [440, 510, 580, 650, 720, 790] as const;

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function entrancePose(elapsed: number) {
  // Brief held drawings punctuate otherwise continuous, time-based motion.
  const beat = CONTACT_BEATS.find((contact) => elapsed >= contact.start && elapsed < contact.end);
  const t = beat ? beat.start : elapsed;
  return SLICE_STARTS.map((start, index) => {
    const opening = 1 - Math.pow(1 - clamp((t - start) / 300), 3);
    const closing = smooth((t - 1110 - index * 65) / (1080 - index * 30));
    return opening * (1 - closing);
  });
}

// Paired boundaries on each axis open all 26 pieces into a centered 3D lattice.
export function entranceOffset(position: readonly number[], cuts: readonly number[]) {
  const gap = (coordinate: number, lower: number, upper: number) =>
    .48 * ((coordinate >= 0 ? lower : 0) + (coordinate === 1 ? upper : 0) - (lower + upper) / 2);
  return [gap(position[0], cuts[3], cuts[2]), gap(position[1], cuts[0], cuts[1]), gap(position[2], cuts[4], cuts[5])];
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
