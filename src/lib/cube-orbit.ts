export type OrbitInput = { x: number; y: number; pressed: boolean };

/** Direct pointer tracking and an eased, wandering idle orbit. */
export class CubeOrbit {
  private previous = { x: 0, y: 0 };
  private drift = { x: 0, y: 0 };
  private heading = 0.15;
  private targetHeading = 0.15;
  private speed = 0.28;
  private idleTime = 0;
  private nextChange = 3.2;
  private seed = 731;

  update(input: OrbitInput, delta: number, automatic: boolean) {
    const dx = input.x - this.previous.x;
    const dy = input.y - this.previous.y;
    const distance = Math.hypot(dx, dy);
    const moving = distance > 0.0005;
    if (moving) {
      this.heading = this.targetHeading = Math.atan2(dy, dx);
      this.idleTime = 0;
      this.nextChange = 3.2;
    }
    this.previous = { x: input.x, y: input.y };
    // Keep the orbit's speed while tracking the pointer, then carry on next frame.
    // A stationary hovering cursor does not delay the handoff to idle rotation.
    if (automatic && !input.pressed && !moving) {
      this.idleTime += delta;
      if (this.idleTime >= this.nextChange) {
        const random = () => { this.seed = (this.seed * 16807) % 2147483647; return (this.seed - 1) / 2147483646; };
        this.targetHeading += (random() < 0.5 ? -1 : 1) * (1.1 + random() * 1.2);
        this.nextChange = this.idleTime + 2.8 + random() * 1.6;
      }
      const difference = Math.atan2(Math.sin(this.targetHeading - this.heading), Math.cos(this.targetHeading - this.heading));
      this.heading += difference * (1 - Math.exp(-delta * 1.3));
      this.speed += (0.36 - this.speed) * (1 - Math.exp(-delta * 2.2));
      const x = Math.cos(this.heading);
      const y = Math.sin(this.heading);
      this.drift.x += (Math.abs(x) < 1e-10 ? 0 : x) * delta * this.speed;
      this.drift.y += (Math.abs(y) < 1e-10 ? 0 : y) * delta * this.speed;
    }
    return { x: input.x + this.drift.x, y: input.y + this.drift.y };
  }

  reset() {
    this.previous = { x: 0, y: 0 };
    this.drift = { x: 0, y: 0 };
    this.heading = this.targetHeading = 0.15;
    this.speed = 0.28;
    this.idleTime = 0;
    this.nextChange = 3.2;
    this.seed = 731;
  }
}
