export type OrbitInput = { x: number; y: number; pressed: boolean };

// Source-authored X/Y tumble: 359 degrees per ten seconds, without a reset seam.
const ANGULAR_SPEED = (359 * Math.PI / 180) / 10;

export class CubeOrbit {
  private previous = { x: 0, y: 0 };
  private drift = { x: 0, y: 0 };
  private direction = { x: -1, y: -1 };

  update(input: OrbitInput, delta: number, automatic: boolean) {
    const dx = input.x - this.previous.x;
    const dy = input.y - this.previous.y;
    const horizontal = Math.abs(dx) > 0.0005;
    const vertical = Math.abs(dy) > 0.0005;
    if (horizontal) this.direction.x = Math.sign(dx);
    if (vertical) this.direction.y = Math.sign(dy);
    this.previous = { x: input.x, y: input.y };
    if (automatic && !input.pressed && !horizontal && !vertical) {
      this.drift.x += this.direction.x * ANGULAR_SPEED * delta;
      this.drift.y += this.direction.y * ANGULAR_SPEED * delta;
    }
    return { x: input.x + this.drift.x, y: input.y + this.drift.y };
  }
}
