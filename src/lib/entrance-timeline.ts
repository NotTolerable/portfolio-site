// One shared clock coordinates the name ink drawing and intact cube's arrival.
export const ENTRANCE_DURATION = 3000;
export const CUBE_ENTRANCE_DURATION = 900;

export function entrancePose(elapsed: number) {
  return Math.pow(1 - Math.max(0, Math.min(1, elapsed / CUBE_ENTRANCE_DURATION)), 3);
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
