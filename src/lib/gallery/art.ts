import * as T from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function randomSource(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function frostTextures() {
  const n = 256,
    data = new Uint8Array(n * n * 4);
  const hash = (x: number, y: number) => {
    const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x),
      iy = Math.floor(y),
      fx = x - ix,
      fy = y - iy,
      sx = fx * fx * (3 - 2 * fx),
      sy = fy * fy * (3 - 2 * fy);
    return T.MathUtils.lerp(
      T.MathUtils.lerp(hash(ix, iy), hash(ix + 1, iy), sx),
      T.MathUtils.lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), sx),
      sy,
    );
  };
  const height = (x: number, y: number) =>
    noise(x * 0.06, y * 0.06) * 0.7 +
    noise(x * 0.17, y * 0.17) * 0.22 +
    noise(x * 0.7, y * 0.7) * 0.08 -
    Math.exp(
      -Math.abs(
        Math.sin(x * 0.055 + noise(x * 0.02, y * 0.02) * 4 + y * 0.027),
      ) * 38,
    ) *
      0.16;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const k = (y * n + x) * 4,
        dx = height(x + 1, y) - height(x - 1, y),
        dy = height(x, y + 1) - height(x, y - 1);
      data[k] = Math.round(128 + dx * 330);
      data[k + 1] = Math.round(128 + dy * 330);
      data[k + 2] = 245;
      data[k + 3] = 255;
    }
  const texture = new T.DataTexture(data, n, n);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}
/** Original convex fracture geometry: uneven planar edges with an icy micro-normal. */
export function iceGeometry(seed: number, size: number) {
  const r = randomSource(seed),
    points: T.Vector3[] = [];
  for (let i = 0; i < 44; i++) {
    const phi = Math.acos(2 * r() - 1),
      theta = r() * Math.PI * 2,
      radius = 0.84 + r() * 0.2;
    points.push(
      new T.Vector3(
        Math.sin(phi) * Math.cos(theta) * 0.78,
        Math.cos(phi) * 1.1,
        Math.sin(phi) * Math.sin(theta) * 0.7,
      ).multiplyScalar(radius),
    );
  }
  const geometry = new ConvexGeometry(points);
  geometry.computeBoundingBox();
  const extent = geometry.boundingBox!.getSize(new T.Vector3());
  geometry.scale(
    size / Math.max(extent.x, extent.y, extent.z),
    size / Math.max(extent.x, extent.y, extent.z),
    size / Math.max(extent.x, extent.y, extent.z),
  );
  // Subdivide each cut face, then weld and soften the seams. The small continuous
  // world-space displacement makes this fractured ice rather than a gemstone hull.
  const source = geometry.getAttribute("position"),
    vertices: number[] = [],
    a = new T.Vector3(),
    b = new T.Vector3(),
    c = new T.Vector3(),
    point = new T.Vector3();
  const divisions = 7;
  function vertex(u: number, v: number) {
    point
      .copy(a)
      .multiplyScalar(1 - u - v)
      .addScaledVector(b, u)
      .addScaledVector(c, v);
    const x = point.x / size,
      y = point.y / size,
      z = point.z / size;
    const rough =
      (Math.sin(x * 39 + seed) * Math.sin(y * 27 - z * 19) +
        Math.sin(y * 61 + x * 31) * 0.3) *
      size *
      0.006;
    point.addScaledVector(point.clone().normalize(), rough);
    vertices.push(point.x, point.y, point.z);
  }
  for (let face = 0; face < source.count; face += 3) {
    a.fromBufferAttribute(source, face);
    b.fromBufferAttribute(source, face + 1);
    c.fromBufferAttribute(source, face + 2);
    for (let i = 0; i < divisions; i++)
      for (let j = 0; j < divisions - i; j++) {
        vertex(i / divisions, j / divisions);
        vertex((i + 1) / divisions, j / divisions);
        vertex(i / divisions, (j + 1) / divisions);
        if (j < divisions - i - 1) {
          vertex((i + 1) / divisions, j / divisions);
          vertex((i + 1) / divisions, (j + 1) / divisions);
          vertex(i / divisions, (j + 1) / divisions);
        }
      }
  }
  const detailed = new T.BufferGeometry();
  detailed.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  const surface = mergeVertices(detailed, size * 0.00001);
  surface.computeVertexNormals();
  detailed.dispose();
  geometry.dispose();
  // ConvexGeometry has no UVs: triplanar-ish normal coordinates are stable on each face.
  const pos = surface.getAttribute("position"),
    uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / size + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / size + 0.5;
  }
  surface.setAttribute("uv", new T.BufferAttribute(uv, 2));
  return surface;
}
export function processor() {
  const group = new T.Group(),
    metal = new T.MeshStandardMaterial({
      color: 0xa6b9ce,
      metalness: 0.88,
      roughness: 0.26,
    });
  const ceramic = new T.MeshStandardMaterial({
    color: 0x1b2938,
    metalness: 0.55,
    roughness: 0.28,
  });
  const base = new T.Mesh(
    new RoundedBoxGeometry(1.8, 1.8, 0.18, 3, 0.06),
    ceramic,
  );
  group.add(base);
  const die = new T.Mesh(
    new RoundedBoxGeometry(1.12, 1.12, 0.12, 3, 0.025),
    metal,
  );
  die.position.z = 0.15;
  group.add(die);
  const traces = new T.MeshStandardMaterial({
    color: 0xc2dbe0,
    metalness: 0.9,
    roughness: 0.3,
  });
  const pinGeo = new T.BoxGeometry(0.045, 0.24, 0.05);
  const pins = new T.InstancedMesh(pinGeo, traces, 64);
  const matrix = new T.Matrix4(),
    position = new T.Vector3(),
    rotation = new T.Quaternion(),
    axis = new T.Vector3(0, 0, 1),
    unit = new T.Vector3(1, 1, 1);
  for (let side = 0; side < 4; side++)
    for (let i = 0; i < 16; i++) {
      const angle = (side * Math.PI) / 2;
      position.set((i - 7.5) * 0.098, 1, 0).applyAxisAngle(axis, angle);
      rotation.setFromAxisAngle(axis, angle);
      matrix.compose(position, rotation, unit);
      pins.setMatrixAt(side * 16 + i, matrix);
    }
  group.add(pins);
  const lines = new T.InstancedMesh(
    new T.BoxGeometry(0.008, 0.8, 0.008),
    traces,
    7,
  );
  for (let i = 0; i < 7; i++) {
    matrix.makeTranslation((i - 3) * 0.115, 0, 0.218);
    lines.setMatrixAt(i, matrix);
  }
  group.add(lines);
  group.rotation.set(0.12, -0.4, -0.17);
  return group;
}
/** Samples all six faces and internal layers of a thick CPU, its die, pins and contacts. */
export function cpuParticleGeometry(count: number) {
  const r = randomSource(521),
    positions = new Float32Array(count * 3),
    seeds = new Float32Array(count);
  function box(
    cx: number,
    cy: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
  ) {
    let x = (r() - 0.5) * sx,
      y = (r() - 0.5) * sy,
      z = (r() - 0.5) * sz;
    if (r() > 0.12) {
      const face = Math.floor(r() * 6);
      if (face < 2) x = (face === 0 ? -1 : 1) * sx * 0.5;
      else if (face < 4) y = (face === 2 ? -1 : 1) * sy * 0.5;
      else z = (face === 4 ? -1 : 1) * sz * 0.5;
    }
    return [x + cx, y + cy, z + cz];
  }
  for (let i = 0; i < count; i++) {
    let point: number[];
    const section = r();
    if (section < 0.19) {
      const side = Math.floor(r() * 4),
        lane = Math.floor(r() * 26);
      point = box((lane - 12.5) * 0.61, 9.5, -0.35, 0.26, 3, 1);
      const a = (side * Math.PI) / 2,
        x = point[0],
        y = point[1];
      point[0] = x * Math.cos(a) - y * Math.sin(a);
      point[1] = x * Math.sin(a) + y * Math.cos(a);
    } else if (section < 0.49) point = box(0, 0, 2.8, 10.6, 10.6, 2.4);
    else if (section < 0.56)
      point = box(
        (Math.floor(r() * 10) - 4.5) * 1.35,
        (Math.floor(r() * 10) - 4.5) * 1.35,
        -2.05,
        0.42,
        0.42,
        0.6,
      );
    else point = box(0, 0, 0, 17, 17, 3.2);
    positions.set(point, i * 3);
    seeds[i] = r();
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
  geometry.setAttribute("seed", new T.BufferAttribute(seeds, 1));
  return geometry;
}
