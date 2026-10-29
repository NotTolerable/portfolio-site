import * as T from "three";

type Point = { x: number; y: number };
type Triangle = { a: number; b: number; c: number; x: number; y: number; radius: number };

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** A circumcircle is cached once per triangle during incremental triangulation. */
function triangle(points: Point[], a: number, b: number, c: number): Triangle | undefined {
  const p = points[a], q = points[b], r = points[c];
  const denominator = 2 * (p.x * (q.y - r.y) + q.x * (r.y - p.y) + r.x * (p.y - q.y));
  if (Math.abs(denominator) < 1e-12) return;
  const pp = p.x * p.x + p.y * p.y;
  const qq = q.x * q.x + q.y * q.y;
  const rr = r.x * r.x + r.y * r.y;
  const x = (pp * (q.y - r.y) + qq * (r.y - p.y) + rr * (p.y - q.y)) / denominator;
  const y = (pp * (r.x - q.x) + qq * (p.x - r.x) + rr * (q.x - p.x)) / denominator;
  return { a, b, c, x, y, radius: (x - p.x) ** 2 + (y - p.y) ** 2 };
}

/** Original periodic irregular lattice, generated once; no reference bitmap is used. */
export function createTrianglePattern(seed = 7183): T.CanvasTexture {
  const size = 512, random = seededRandom(seed), base: Point[] = [];
  const count = 156, spacingSquared = 0.038 ** 2;
  // A toroidal blue-noise distribution avoids rows, checkerboards and tiny cells.
  for (let attempt = 0; base.length < count && attempt < 20000; attempt++) {
    const candidate = { x: random(), y: random() };
    const close = base.some((point) => {
      const x = Math.abs(point.x - candidate.x), y = Math.abs(point.y - candidate.y);
      return Math.min(x, 1 - x) ** 2 + Math.min(y, 1 - y) ** 2 < spacingSquared;
    });
    if (!close) base.push(candidate);
  }
  const points: Point[] = [];
  // The neighboring copies make the center tile's triangulation periodic.
  for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
    for (const point of base) points.push({ x: point.x + x, y: point.y + y });
  }
  const total = points.length;
  points.push({ x: -12, y: -8 }, { x: 12, y: -8 }, { x: 0, y: 14 });
  let triangles = [triangle(points, total, total + 1, total + 2)!];
  const stride = points.length;
  for (let i = 0; i < total; i++) {
    const point = points[i], boundary = new Map<number, [number, number]>();
    const remaining: Triangle[] = [];
    for (const face of triangles) {
      if ((point.x - face.x) ** 2 + (point.y - face.y) ** 2 > face.radius + 1e-10) {
        remaining.push(face);
        continue;
      }
      for (const [a, b] of [[face.a, face.b], [face.b, face.c], [face.c, face.a]]) {
        const key = Math.min(a, b) * stride + Math.max(a, b);
        if (boundary.has(key)) boundary.delete(key);
        else boundary.set(key, [a, b]);
      }
    }
    for (const [a, b] of boundary.values()) {
      const face = triangle(points, a, b, i);
      if (face) remaining.push(face);
    }
    triangles = remaining;
  }

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Cannot initialize the triangle data texture.");
  context.fillStyle = "#000";
  context.fillRect(0, 0, size, size);
  const visited = new Set<number>();
  context.beginPath();
  let edgeCount = 0, edgeLength = 0;
  for (const face of triangles) {
    if (face.a >= total || face.b >= total || face.c >= total) continue;
    for (const [a, b] of [[face.a, face.b], [face.b, face.c], [face.c, face.a]]) {
      const key = Math.min(a, b) * stride + Math.max(a, b);
      if (visited.has(key)) continue;
      visited.add(key);
      const p = points[a], q = points[b];
      if (Math.max(p.x, q.x) < -0.004 || Math.min(p.x, q.x) > 1.004
        || Math.max(p.y, q.y) < -0.004 || Math.min(p.y, q.y) > 1.004) continue;
      context.moveTo(p.x * size, p.y * size);
      context.lineTo(q.x * size, q.y * size);
      // Count only edges whose midpoint is in the center tile for useful stats.
      const x = (p.x + q.x) / 2, y = (p.y + q.y) / 2;
      if (x >= 0 && x < 1 && y >= 0 && y < 1) {
        edgeCount++;
        edgeLength += Math.hypot(p.x - q.x, p.y - q.y) * size;
      }
    }
  }
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 2;
  context.strokeStyle = "rgba(115,115,115,.16)";
  context.stroke();
  context.lineWidth = 0.8;
  context.strokeStyle = "#888";
  context.stroke();
  for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
    for (const point of base) {
      const px = (point.x + x) * size, py = (point.y + y) * size;
      if (px < -2 || px > size + 2 || py < -2 || py > size + 2) continue;
      const glow = context.createRadialGradient(px, py, 0, px, py, 1.5);
      glow.addColorStop(0, "rgba(225,225,225,.9)");
      glow.addColorStop(0.35, "rgba(180,180,180,.55)");
      glow.addColorStop(1, "rgba(100,100,100,0)");
      context.fillStyle = glow;
      context.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
  }
  const texture = new T.CanvasTexture(canvas);
  texture.name = "Original periodic triangle lattice";
  texture.colorSpace = T.NoColorSpace;
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.minFilter = T.LinearMipmapLinearFilter;
  texture.magFilter = T.LinearFilter;
  texture.generateMipmaps = true;
  texture.userData = { nodes: base.length, edges: edgeCount, meanEdgePixels: edgeLength / edgeCount };
  return texture;
}
