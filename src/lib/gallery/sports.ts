import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { randomSource } from "./art";
function leather() {
  const r = randomSource(719),
    size = 128,
    data = new Uint8Array(size * size * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 118 + r() * 20;
    data[i + 1] = 118 + r() * 20;
    data[i + 2] = 249;
    data[i + 3] = 255;
  }
  const map = new T.DataTexture(data, size, size);
  map.wrapS = map.wrapT = T.RepeatWrapping;
  map.repeat.set(8, 8);
  map.needsUpdate = true;
  return map;
}
function seam(points: T.Vector3[], material: T.Material, radius = 0.009) {
  return new T.Mesh(
    new T.TubeGeometry(new T.CatmullRomCurve3(points), 64, radius, 6, false),
    material,
  );
}
export function basketball() {
  const group = new T.Group(),
    normal = leather();
  const skin = new T.MeshStandardMaterial({
    color: 0x8b5740,
    emissive: 0x633923,
    emissiveIntensity: 0.35,
    roughness: 0.78,
    normalMap: normal,
    normalScale: new T.Vector2(0.45, 0.45),
  });
  group.add(new T.Mesh(new T.SphereGeometry(0.9, 64, 48), skin));
  const rubber = new T.MeshStandardMaterial({
    color: 0x11171d,
    roughness: 0.95,
  });
  for (let plane = 0; plane < 3; plane++) {
    const ring = new T.Mesh(new T.TorusGeometry(0.902, 0.012, 8, 128), rubber);
    if (plane === 1) ring.rotation.x = Math.PI / 2;
    if (plane === 2) ring.rotation.y = Math.PI / 2;
    group.add(ring);
  }
  for (const side of [-1, 1]) {
    const points: T.Vector3[] = [];
    for (let j = 0; j <= 128; j++) {
      const a = (j / 128) * Math.PI * 2,
        x = side * (0.46 + 0.16 * Math.cos(a * 2)),
        r = Math.sqrt(1 - x * x);
      points.push(
        new T.Vector3(x, r * Math.cos(a), r * Math.sin(a)).multiplyScalar(
          0.902,
        ),
      );
    }
    group.add(seam(points, rubber, 0.011));
  }
  group.rotation.set(0.2, -0.35, 0.28);
  return group;
}
export function boxingGloves() {
  const pair = new T.Group(),
    normal = leather(),
    skin = new T.MeshStandardMaterial({
      color: 0xb4bcc3,
      emissive: 0x697b8c,
      emissiveIntensity: 0.25,
      roughness: 0.47,
      normalMap: normal,
      normalScale: new T.Vector2(0.22, 0.22),
    }),
    cuff = new T.MeshStandardMaterial({ color: 0x253140, roughness: 0.66 }),
    stitch = new T.MeshStandardMaterial({ color: 0x536477, roughness: 0.8 });
  const sphere = new T.SphereGeometry(1, 40, 32);
  for (const side of [-1, 1]) {
    const glove = new T.Group();
    const fist = new T.Mesh(sphere, skin);
    fist.scale.set(0.46, 0.62, 0.39);
    fist.position.y = 0.25;
    glove.add(fist);
    const thumb = new T.Mesh(sphere, skin);
    thumb.scale.set(0.23, 0.4, 0.25);
    thumb.position.set(-0.4, 0.06, 0.2);
    thumb.rotation.z = -0.55;
    glove.add(thumb);
    const wrist = new T.Mesh(
      new RoundedBoxGeometry(0.65, 0.43, 0.56, 4, 0.09),
      cuff,
    );
    wrist.position.set(0, -0.46, 0);
    glove.add(wrist);
    const strap = new T.Mesh(
      new RoundedBoxGeometry(0.69, 0.15, 0.57, 3, 0.035),
      skin,
    );
    strap.position.set(0, -0.48, 0.025);
    glove.add(strap);
    glove.add(
      seam(
        [
          new T.Vector3(-0.35, 0.62, 0.16),
          new T.Vector3(-0.25, 0.31, 0.34),
          new T.Vector3(-0.26, -0.08, 0.31),
          new T.Vector3(-0.21, -0.25, 0.25),
        ],
        stitch,
        0.008,
      ),
    );
    glove.add(
      seam(
        [
          new T.Vector3(-0.28, -0.36, 0.29),
          new T.Vector3(0, -0.37, 0.3),
          new T.Vector3(0.28, -0.36, 0.29),
        ],
        stitch,
        0.006,
      ),
    );
    glove.position.set(side * 0.5, side * 0.14, side * 0.12);
    glove.rotation.set(0.08, side * 0.24, -side * 0.28);
    if (side > 0) glove.scale.x = -1;
    pair.add(glove);
  }
  pair.rotation.set(0.05, -0.35, 0.12);
  return pair;
}
export function dumbbell() {
  const group = new T.Group(),
    metal = new T.MeshStandardMaterial({
      color: 0xa5b9c8,
      metalness: 0.92,
      roughness: 0.26,
    }),
    rubber = new T.MeshStandardMaterial({
      color: 0x192330,
      emissive: 0x283747,
      emissiveIntensity: 0.2,
      metalness: 0.32,
      roughness: 0.5,
    }),
    edge = new T.MeshStandardMaterial({
      color: 0x708496,
      metalness: 0.8,
      roughness: 0.32,
    });
  const handle = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 1.5, 32), metal);
  handle.rotation.z = Math.PI / 2;
  group.add(handle);
  const grooves = new T.InstancedMesh(
      new T.TorusGeometry(0.112, 0.006, 4, 24),
      edge,
      28,
    ),
    matrix = new T.Matrix4(),
    rotation = new T.Matrix4().makeRotationY(Math.PI / 2);
  for (let i = 0; i < 28; i++) {
    matrix.makeTranslation((i - 13.5) * 0.035, 0, 0).multiply(rotation);
    grooves.setMatrixAt(i, matrix);
  }
  group.add(grooves);
  for (const side of [-1, 1])
    for (let i = 0; i < 3; i++) {
      const plate = new T.Mesh(
        new T.CylinderGeometry(0.48 - i * 0.035, 0.48 - i * 0.035, 0.17, 12),
        rubber,
      );
      plate.rotation.z = Math.PI / 2;
      plate.position.x = side * (0.73 + i * 0.175);
      group.add(plate);
      const rim = new T.Mesh(
        new T.TorusGeometry(0.45 - i * 0.035, 0.012, 6, 48),
        edge,
      );
      rim.rotation.y = Math.PI / 2;
      rim.position.x = side * (0.82 + i * 0.175);
      group.add(rim);
    }
  for (const side of [-1, 1]) {
    const end = new T.Mesh(
      new T.CylinderGeometry(0.15, 0.15, 0.045, 32),
      metal,
    );
    end.rotation.z = Math.PI / 2;
    end.position.x = side * 1.18;
    group.add(end);
  }
  group.rotation.set(0.12, -0.25, 0.52);
  return group;
}
export function fitSportsArt(art: T.Group, size: number) {
  const bounds = new T.Box3().setFromObject(art),
    extent = bounds.getSize(new T.Vector3());
  art.scale.setScalar((size * 0.6) / Math.max(extent.x, extent.y, extent.z));
  return art;
}
