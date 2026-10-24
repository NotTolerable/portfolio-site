// A small CPU projection of the opening cube; never initializes WebGL. Keep the
// camera and view values aligned with cube-scene.ts so ink can become the scene.
type Point = readonly [number, number, number];
type ScreenPoint = readonly [number, number];
const dot = (a: Point, b: Point) => a.reduce((sum, v, i) => sum + v * b[i], 0);
const cross = (a: Point, b: Point): Point => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (p: Point): Point => { const length = Math.hypot(...p); return p.map((v) => v / length) as unknown as Point; };
const camera: Point = [4.8, 3.4, 5.8];
const back = unit(camera), right = unit(cross([0, 1, 0], back)), up = cross(back, right);
const mix = (a: ScreenPoint, b: ScreenPoint, t: number): ScreenPoint => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const xy = (p: ScreenPoint) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

function rotate([x, y, z]: Point): Point {
  const a = -.12, b = -.17, c = .03;
  const zx = x * Math.cos(a) - y * Math.sin(a), zy = x * Math.sin(a) + y * Math.cos(a);
  const yx = zx * Math.cos(b) + z * Math.sin(b), yz = -zx * Math.sin(b) + z * Math.cos(b);
  return [yx, zy * Math.cos(c) - yz * Math.sin(c), zy * Math.sin(c) + yz * Math.cos(c)];
}

function roundedFace(points: ScreenPoint[], rounding = .07) {
  return points.map((p, i) => {
    const previous = points[(i + points.length - 1) % points.length], next = points[(i + 1) % points.length];
    return `${i ? "L" : "M"}${xy(mix(p, previous, rounding))}Q${xy(p)} ${xy(mix(p, next, rounding))}`;
  }).join("") + "Z";
}

export function projectCubeDrawing(width: number, height: number, pitch = 0, yaw = 0) {
  const compact = width < 760, scale = compact ? .83 : .78;
  const focal = Math.min(1.06, width / height * 1.06) / Math.tan(Math.PI / 9) * height / 2;
  const shift = compact ? 0 : .4;
  function orient([x, y, z]: Point): Point {
    const rx = x * Math.cos(yaw) + z * Math.sin(yaw), rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return rotate([rx, y * Math.cos(pitch) - rz * Math.sin(pitch), y * Math.sin(pitch) + rz * Math.cos(pitch)]);
  }
  function project(p: Point): ScreenPoint {
    const turned = orient(p);
    const world = turned.map((v, i) => v * scale + right[i] * shift - up[i] * .5) as unknown as Point;
    const depth = Math.hypot(...camera) - dot(world, back);
    return [width / 2 + dot(world, right) * focal / depth, height / 2 - dot(world, up) * focal / depth];
  }
  const faces = [];
  for (let side = 0; side < 3; side++) {
    for (let row = -1; row <= 1; row++) for (let column = -1; column <= 1; column++) {
      const point = (u: number, v: number): Point => side === 0 ? [1.495, row + v, column + u] : side === 1 ? [column + u, 1.495, row + v] : [column + u, row + v, 1.495];
      const corners = [[-.475, -.475], [.475, -.475], [.475, .475], [-.475, .475]].map(([u, v]) => project(point(u, v)));
      const hatch = Array.from({ length: 7 }, (_, line) => {
        const t = .08 + line * .125;
        return `M${xy(mix(corners[0], corners[1], t))}L${xy(mix(corners[3], corners[2], Math.min(.98, t + .2)))}`;
      }).join("");
      const center = orient(point(0, 0));
      faces.push({ id: `${side}-${row}-${column}`, d: roundedFace(corners), hatch, corners, side, row, column, depth: dot(center, back) });
    }
  }
  faces.sort((a, b) => a.depth - b.depth);
  const points = faces.flatMap((face) => face.corners);
  const ordered = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const turn = (a: ScreenPoint, b: ScreenPoint, c: ScreenPoint) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const half = (vertices: ScreenPoint[]) => {
    const chain: ScreenPoint[] = [];
    vertices.forEach((point) => {
      while (chain.length > 1 && turn(chain[chain.length - 2], chain[chain.length - 1], point) <= 0) chain.pop();
      chain.push(point);
    });
    return chain.slice(0, -1);
  };
  const silhouette = roundedFace([...half(ordered), ...half([...ordered].reverse())], .012);
  return { faces, silhouette, bounds: { left: Math.min(...points.map((p) => p[0])), right: Math.max(...points.map((p) => p[0])), top: Math.min(...points.map((p) => p[1])), bottom: Math.max(...points.map((p) => p[1])) } };
}
