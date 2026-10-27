import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { processor } from "./art";
/** A quiet hardware chamber; original manufactured geometry, not a second ice scene. */
export function createRuntimeCore() {
  let simplified = false;
  const group = new T.Group();
  group.position.set(6, -84, -128);
  const hardware = processor();
  hardware.scale.setScalar(4.3);
  group.add(hardware);
  const alloy = new T.MeshStandardMaterial({
      color: 0x080f17,
      metalness: 0.42,
      envMapIntensity: 0.24,
      roughness: 0.66,
    }),
    edge = new T.MeshStandardMaterial({
      color: 0x6e929b,
      metalness: 0.72,
      roughness: 0.3,
    }),
    signal = new T.MeshBasicMaterial({
      color: 0x9acac2,
      transparent: true,
      opacity: 0.55,
    }),
    warm = new T.MeshBasicMaterial({
      color: 0xbc9664,
      transparent: true,
      opacity: 0.65,
    });
  const pedestal = new T.Mesh(
    new T.CylinderGeometry(7.4, 7.8, 0.55, 64),
    alloy,
  );
  pedestal.position.y = -8.2;
  group.add(pedestal);
  const rings = new T.Group();
  rings.position.y = -7.88;
  group.add(rings);
  for (const [radius, material] of [
    [7.2, signal],
    [6.7, edge],
    [8.6, warm],
  ] as const) {
    const ring = new T.Mesh(
      new T.TorusGeometry(radius, 0.025, 5, 128),
      material,
    );
    ring.rotation.x = Math.PI / 2;
    rings.add(ring);
  }
  const ticks = new T.InstancedMesh(
      new T.BoxGeometry(0.035, 0.025, 0.42),
      edge,
      48,
    ),
    matrix = new T.Matrix4(),
    quaternion = new T.Quaternion(),
    position = new T.Vector3(),
    scale = new T.Vector3(1, 1, 1),
    up = new T.Vector3(0, 1, 0);
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    position.set(Math.sin(angle) * 7.75, -7.87, Math.cos(angle) * 7.75);
    quaternion.setFromAxisAngle(up, angle);
    matrix.compose(position, quaternion, scale);
    ticks.setMatrixAt(i, matrix);
  }
  group.add(ticks);
  const orbit = new T.Group();
  group.add(orbit);
  for (let i = 0; i < 2; i++) {
    const arc = new T.Mesh(
      new T.TorusGeometry(8.7 + i * 0.5, 0.018, 4, 112, Math.PI * 1.18),
      i ? warm : signal,
    );
    arc.rotation.set(0.22 + i * 0.52, 0.5 - i * 0.7, 0.25 + i * 2.3);
    orbit.add(arc);
  }
  const frame = new T.InstancedMesh(
    new RoundedBoxGeometry(0.32, 0.12, 0.7, 2, 0.025),
    alloy,
    8,
  );
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    position.set(Math.sin(angle) * 9.4, -7.75, Math.cos(angle) * 9.4);
    quaternion.setFromAxisAngle(up, angle);
    matrix.compose(position, quaternion, scale);
    frame.setMatrixAt(i, matrix);
  }
  group.add(frame);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#243340";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "#91b1ba";
    ctx.strokeRect(14, 14, 228, 228);
    ctx.fillStyle = "#d5e4e6";
    ctx.font = "500 74px monospace";
    ctx.textAlign = "center";
    ctx.fillText("BP", 128, 132);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#afc5c9";
    ctx.fillText("SYSTEMS / 01", 128, 175);
  }
  const labelTexture = new T.CanvasTexture(canvas);
  labelTexture.colorSpace = T.SRGBColorSpace;
  const label = new T.Mesh(
    new T.PlaneGeometry(0.88, 0.88),
    new T.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.48,
      metalness: 0.4,
    }),
  );
  label.position.set(0, 0, 0.219);
  hardware.add(label);
  const light = new T.PointLight(0x91bdb8, 95, 36, 2);
  light.position.set(-5, 4, 8);
  group.add(light);
  const amber = new T.PointLight(0xe1ad71, 55, 28, 2);
  amber.position.set(6, -4, 4);
  group.add(amber);
  return {
    group,
    update(time: number, presence: number) {
      group.visible = presence > 0.01;
      hardware.rotation.set(
        0.14 + Math.sin(time * 0.17) * 0.04,
        -0.32 + time * 0.045,
        -0.12,
      );
      hardware.position.y = Math.sin(time * 0.42) * 0.12;
      orbit.rotation.y = time * 0.035;
      orbit.rotation.z = Math.sin(time * 0.12) * 0.08;
      signal.opacity = (0.35 + Math.sin(time * 0.9) * 0.1) * presence;
      warm.opacity = (0.45 + Math.sin(time * 0.7 + 0.6) * 0.1) * presence;
      light.intensity = 95 * presence;
      amber.intensity = (simplified ? 20 : 55) * presence;
    },
    setSimple(simple: boolean) {
      simplified = simple;
      frame.visible = !simple;
      orbit.visible = !simple;
      light.visible = !simple;
      amber.intensity = simple ? 20 : 55;
    },
  };
}
