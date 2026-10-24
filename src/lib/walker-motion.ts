/** A distance-based locomotion controller. World units are metres, time is seconds. */
export const WALK_SPEED = .9;
export const ROUTE_LENGTH = 7.8;
const TAU = Math.PI * 2;
export const damp = (value: number, target: number, rate: number, dt: number) => target + (value - target) * Math.exp(-rate * dt);
export const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
export function routeX(distance: number) { return -.35 + Math.sin(distance * .34) * .48; }
export function routeHeading(distance: number, direction = 1) { return Math.atan2(Math.cos(distance * .34) * .1632 * direction, -direction); }
export function createWalkerMotion() {
  const state = { distance: 0, velocity: 0, heading: routeHeading(0), turn: 0, phase: .42, weight: 0, settling: false };
  return {
    state,
    update(dt: number, target: number, paused = false) {
      if (paused || dt <= 0) return state;
      target = Math.max(0, Math.min(ROUTE_LENGTH, target));
      const steps = Math.max(1, Math.ceil(dt / (1 / 120))), h = Math.min(dt, .2) / steps;
      for (let i = 0; i < steps; i++) {
        const error = Math.max(0, Math.min(ROUTE_LENGTH, target)) - state.distance;
        const desiredHeading = Math.abs(error) > .045 ? routeHeading(state.distance, Math.sign(error)) : state.heading;
        const headingError = angleDelta(state.heading, desiredHeading);
        const oldHeading = state.heading;
        state.heading += Math.max(-2.5 * h, Math.min(2.5 * h, headingError * (1 - Math.exp(-8 * h))));
        state.turn = damp(state.turn, angleDelta(oldHeading, state.heading) / h, 8, h);
        // Brake before the target, and plant/turn before changing travel direction.
        const alignment = Math.max(0, Math.cos(headingError));
        const desiredSpeed = Math.sign(error) * Math.min(WALK_SPEED, Math.sqrt(Math.abs(error) * 2 * 1.75)) * alignment;
        state.velocity = damp(state.velocity, Math.abs(error) < .006 ? 0 : desiredSpeed, Math.abs(desiredSpeed) > Math.abs(state.velocity) ? 4 : 7, h);
        const next = state.distance + state.velocity * h;
        if (Math.abs(error) < .006 && Math.abs(state.velocity) < .02) { state.distance = target; state.velocity = 0; }
        else state.distance = Math.max(0, Math.min(ROUTE_LENGTH, next));
        const moving = Math.abs(state.velocity) > .015 || Math.abs(state.turn) > .12;
        const cycle = ((state.phase % 1) + 1) % 1;
        const doubleSupport = cycle < .12 || (cycle >= .5 && cycle < .62);
        state.settling = !moving && !doubleSupport && state.weight > .025;
        state.phase += (Math.abs(state.velocity) / 1.04 + Math.abs(state.turn) * .09 + (state.settling ? .65 : 0)) * h;
        const activity = moving || state.settling ? Math.min(1, Math.abs(state.velocity) / .4 + Math.abs(state.turn) * .55 + (state.settling ? .5 : 0)) : 0;
        state.weight = damp(state.weight, activity, activity > state.weight ? 7 : 5, h);
        if (state.phase > TAU * 100) state.phase %= 1;
      }
      return state;
    },
  };
}
