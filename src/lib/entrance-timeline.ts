// Shared entrance timing, graphics warmup, and the reveal handoff.
export const ENTRANCE_DURATION = 3400;
export const CUBE_REVEAL_START = ENTRANCE_DURATION - 450;
export const CUBE_ENTRANCE_DURATION = 900;

export function entrancePose(elapsed: number) {
  return Math.pow(1 - Math.max(0, Math.min(1, elapsed / CUBE_ENTRANCE_DURATION)), 3);
}

let startedAt: number | null = null;
const listeners = new Set<(time: number | null) => void>();
export function setEntranceStart(time: number | null) {
  startedAt = time;
  if (time === null) {
    drawingReserved = false;
    drawingWaiters.forEach((resolve) => resolve());
    drawingWaiters.clear();
  }
  listeners.forEach((listener) => listener(time));
}
export function subscribeEntrance(listener: (time: number | null) => void) {
  listeners.add(listener);
  listener(startedAt);
  return () => { listeners.delete(listener); };
}

// A short asset-loading allowance lets a cached scene finish before drawing.
// Once GPU work has started, finish its first frame before starting the ink clock.
// Late assets wait until the drawing ends instead of interrupting its frames.
let graphicsStarted = false;
let drawingReserved = false;
const drawingWaiters = new Set<() => void>();
let releasePrepared: () => void = () => {};
const cubePrepared = new Promise<void>((resolve) => { releasePrepared = resolve; });

export async function beginCubePreparation() {
  if (drawingReserved) await new Promise<void>((resolve) => { drawingWaiters.add(resolve); });
  graphicsStarted = true;
}

export function markCubePrepared() { releasePrepared(); }

export async function reserveEntranceDrawing(assetAllowance: Promise<unknown>, signal: AbortSignal) {
  await Promise.race([cubePrepared, assetAllowance]);
  if (signal.aborted) return;
  drawingReserved = true;
  if (graphicsStarted) await cubePrepared;
}
