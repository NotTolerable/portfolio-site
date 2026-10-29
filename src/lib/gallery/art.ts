import * as T from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

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
  // Granular, pitted frost without the former long sinusoidal ridges.
  const height = (x: number, y: number) => {
    const coarse = noise(x * .11, y * .11);
    const middle = noise(x * .35, y * .35);
    const fine = noise(x * 1.1, y * 1.1);
    const pits = Math.pow(Math.max(0, .52 - noise(x * .19, y * .19)) * 2, 4);
    return coarse * .3 + middle * .25 + fine * .17 - pits * .22;
  };
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const k = (y * n + x) * 4,
        dx = height(x + 1, y) - height(x - 1, y),
        dy = height(x, y + 1) - height(x, y - 1);
      const normalX = -dx * 2.2, normalY = -dy * 2.2;
      const length = Math.hypot(normalX, normalY, 1);
      data[k] = Math.round((normalX / length * .5 + .5) * 255);
      data[k + 1] = Math.round((normalY / length * .5 + .5) * 255);
      data[k + 2] = Math.round((1 / length * .5 + .5) * 255);
      data[k + 3] = Math.round(T.MathUtils.clamp(height(x, y) * .8 + .2, 0, 1) * 255);
    }
  const texture = new T.DataTexture(data, n, n);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(5.5, 5.5);
  texture.magFilter = T.LinearFilter;
  texture.minFilter = T.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
/**
 * Original fractured slab, extracted once from intersecting cut planes and
 * subtractive wedges. The perimeter has real ledges and open concave chips;
 * only a narrow fracture seam is softened, not the entire boulder silhouette.
 */
export function iceGeometry(seed: number, size: number) {
  const random = randomSource(seed);
  for (let i = 0; i < 7; i++) random();
  const width = .385 + random() * .055;
  const planes: number[][] = [];
  function plane(x: number, y: number, z: number, distance: number) {
    const length = Math.hypot(x, y, z);
    planes.push([x / length, y / length, z / length, distance / length]);
  }
  // Six uneven principal fractures and oblique shoulder/edge breaks.
  plane(1, .08, -.07, width);
  plane(-1, -.07, .045, width * .96);
  plane(-.18, 1, .09, .59);
  plane(.23, -1, -.05, .575);
  plane(.075, -.04, 1, .325);
  plane(-.09, .025, -1, .31);
  plane(.85, .7, .13, .55 + random() * .025);
  plane(-.92, .56, -.15, .535 + random() * .025);
  plane(-.65, -.78, .18, .48 + random() * .025);
  plane(.64, -.83, -.13, .48 + random() * .025);
  plane(.8, -.04, .76, .465);
  plane(-.81, .07, .72, .47);
  plane(.83, .08, -.74, .465);
  plane(-.76, -.06, -.78, .46);

  type Wedge = { center: T.Vector3; half: T.Vector3; axes: T.Vector3[] };
  const wedges: Wedge[] = [];
  function wedge(x: number, y: number, z: number, hx: number, hy: number, hz: number, rx: number, ry: number, rz: number) {
    const rotation = new T.Quaternion().setFromEuler(new T.Euler(rx, ry, rz));
    const center = new T.Vector3(x + (random() - .5) * .025, y + (random() - .5) * .035, z);
    wedges.push({ center, half: new T.Vector3(hx, hy, hz), axes: [
      new T.Vector3(1, 0, 0).applyQuaternion(rotation),
      new T.Vector3(0, 1, 0).applyQuaternion(rotation),
      new T.Vector3(0, 0, 1).applyQuaternion(rotation),
    ] });
  }
  // These volumes actually intersect the front/back perimeter. They are open
  // broken chips, not Gaussian depressions hidden behind the visible surface.
  wedge(-width + .005, .235, .3, .12, .09, .17, .28, -.3, -.32);
  wedge(width - .005, -.055, .29, .09, .075, .19, -.25, .3, .28);
  wedge(-width + .01, -.255, .255, .105, .065, .17, .2, -.2, .38);
  wedge(width - .01, .255, -.285, .115, .085, .18, -.2, .27, -.28);
  wedge(-width + .005, -.09, -.285, .09, .065, .19, .3, -.25, .34);
  wedge(.12, -.525, .27, .13, .09, .15, -.25, -.18, .4);
  wedge(-.11, .565, .225, .1, .075, .13, .2, .1, -.3);

  const smoothMaximum = (a: number, b: number, radius: number) => {
    const blend = Math.max(radius - Math.abs(a - b), 0) / radius;
    return Math.max(a, b) + blend * blend * radius * .25;
  };
  const resolution = 62;
  const temporaryMaterial = new T.MeshBasicMaterial();
  const extraction = new MarchingCubes(resolution, temporaryMaterial, false, false, 24000);
  extraction.isolation = 0;
  const step = 2 / resolution;
  const phase = random() * 12;
  for (let iz = 0; iz < resolution; iz++) {
    const z = iz * step - 1;
    for (let iy = 0; iy < resolution; iy++) {
      const y = iy * step - 1;
      for (let ix = 0; ix < resolution; ix++) {
        const x = ix * step - 1;
        let distance = -10;
        for (const [nx, ny, nz, offset] of planes) {
          distance = smoothMaximum(distance, x * nx + y * ny + z * nz - offset, .009);
        }
        // Restrained large-scale fracture chatter; no rounded whole-face warp.
        const rim = T.MathUtils.smoothstep(Math.max(Math.abs(x) / width, Math.abs(y) / .6), .68, 1);
        distance += (Math.sin(x * 53 + phase) * Math.sin(y * 47 - z * 31)
          + Math.sin(z * 69 + x * 27) * .35) * (.001 + rim * .0028);
        for (const { center, half, axes } of wedges) {
          const dx = x - center.x, dy = y - center.y, dz = z - center.z;
          const qx = Math.abs(dx * axes[0].x + dy * axes[0].y + dz * axes[0].z) - half.x;
          const qy = Math.abs(dx * axes[1].x + dy * axes[1].y + dz * axes[1].z) - half.y;
          const qz = Math.abs(dx * axes[2].x + dy * axes[2].y + dz * axes[2].z) - half.z;
          const cut = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0))
            + Math.min(Math.max(qx, qy, qz), 0);
          distance = smoothMaximum(distance, -cut, .008);
        }
        extraction.field[iz * resolution * resolution + iy * resolution + ix] = -distance;
      }
    }
  }
  extraction.update();
  const detailed = new T.BufferGeometry();
  detailed.setAttribute("position", new T.Float32BufferAttribute(
    extraction.positionArray.slice(0, extraction.count * 3), 3,
  ));
  extraction.geometry.dispose();
  temporaryMaterial.dispose();
  const surface = mergeVertices(detailed, .00001);
  detailed.dispose();
  surface.computeBoundingBox();
  const box = surface.boundingBox!;
  const extent = box.getSize(new T.Vector3());
  const center = box.getCenter(new T.Vector3());
  surface.translate(-center.x, -center.y, -center.z);
  surface.scale(size / extent.y, size / extent.y, size / extent.y);
  surface.computeVertexNormals();
  surface.computeBoundingBox();
  surface.computeBoundingSphere();
  const position = surface.getAttribute("position");
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = position.getX(i) / size + .5;
    uv[i * 2 + 1] = position.getY(i) / size + .5;
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
