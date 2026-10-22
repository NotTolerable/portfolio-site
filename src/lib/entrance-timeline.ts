// A shared clock connects the DOM entrance and the existing WebGL scene.
// Subscribers update mutable scene input; React does not render on every frame.
export const ENTRANCE_DURATION = 2600;
export const CUBE_ENTRANCE_DURATION = 1900;
export const IMPACT_START = 320;
export const IMPACT_END = 480;
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
