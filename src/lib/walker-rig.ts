import * as THREE from "three";
import { damp } from "./walker-motion";

export type IdlePose = Record<string, Record<"position" | "quaternion" | "scale", number[]>>;
/** Normalize the licensed rig once, in its grounded reference pose. */
export function prepareWalkerModel(model: THREE.Group, pose: IdlePose) {
  model.traverse((node) => {
    const reference = pose[node.name];
    if (reference) { node.position.fromArray(reference.position); node.quaternion.fromArray(reference.quaternion); node.scale.fromArray(reference.scale); }
    if (node.name === "Head") node.scale.multiplyScalar(.78);
    if (/^(Left|Right)(UpLeg|Leg)$/.test(node.name)) node.scale.multiplyScalar(1.1);
  });
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model), factor = 1.92 / bounds.getSize(new THREE.Vector3()).y;
  model.scale.multiplyScalar(factor); model.position.y = -bounds.min.y * factor + .025;
  model.updateMatrixWorld(true);
}

type Gait = { velocity: number; heading: number; turn: number; phase: number; weight: number };
const UP = new THREE.Vector3(0, 1, 0);
/** Analytic two-bone legs and world-space stance anchors, on the curated flat route.
 * Scratch objects are reused; the animation does not allocate per frame. */
export function createWalkerRig(model: THREE.Group, root: THREE.Group) {
  const bones = new Map<string, THREE.Bone>();
  model.traverse((node) => { if (node instanceof THREE.Bone) bones.set(node.name, node); });
  const bone = (name: string) => { const value = bones.get(name); if (!value) throw new Error(`Missing courier rig bone: ${name}`); return value; };
  const rest = Array.from(bones.values(), (node) => ({ node, q: node.quaternion.clone(), p: node.position.clone(), s: node.scale.clone() }));
  const baseY = model.position.y;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), dir = new THREE.Vector3(), pole = new THREE.Vector3(), knee = new THREE.Vector3(), hip = new THREE.Vector3();
  const q = new THREE.Quaternion(), currentQ = new THREE.Quaternion(), parentQ = new THREE.Quaternion(), rotation = new THREE.Quaternion();
  const right = new THREE.Vector3(), forward = new THREE.Vector3(), origin = new THREE.Vector3(), restTarget = new THREE.Vector3(), desired = new THREE.Vector3();
  root.updateMatrixWorld(true);
  const feet = ["Left", "Right"].map((side, i) => {
    const thigh = bone(`${side}UpLeg`), shin = bone(`${side}Leg`), ankle = bone(`${side}Foot`);
    thigh.getWorldPosition(a); shin.getWorldPosition(b); ankle.getWorldPosition(c);
    const reference = c.clone(); root.worldToLocal(reference);
    return { thigh, shin, ankle, l1: a.distanceTo(b), l2: b.distanceTo(c), reference,
      plant: c.clone(), swing: c.clone(), contact: c.clone(), q: ankle.getWorldQuaternion(new THREE.Quaternion()),
      lastCycle: i ? .92 : .42, yaw: 0, initialized: false };
  });
  function worldRotation(node: THREE.Object3D, desiredQ: THREE.Quaternion) {
    node.parent!.getWorldQuaternion(parentQ).invert(); node.quaternion.copy(parentQ.multiply(desiredQ)); node.updateMatrixWorld(true);
  }
  function align(node: THREE.Object3D, child: THREE.Object3D, end: THREE.Vector3) {
    node.getWorldPosition(a); child.getWorldPosition(b); b.sub(a).normalize(); dir.copy(end).sub(a).normalize();
    q.setFromUnitVectors(b, dir); node.getWorldQuaternion(currentQ); q.multiply(currentQ); worldRotation(node, q);
  }
  function twist(node: THREE.Object3D, axis: THREE.Vector3, amount: number) {
    node.getWorldQuaternion(currentQ); rotation.setFromAxisAngle(axis, amount).multiply(currentQ); worldRotation(node, rotation);
  }
  let breathing = 0;
  return { feet,
    update(dt: number, gait: Gait, paused: boolean) {
      if (paused) return;
      breathing += dt;
      for (const item of rest) { item.node.quaternion.copy(item.q); item.node.position.copy(item.p); item.node.scale.copy(item.s); }
      const cycle = gait.phase * Math.PI * 2, weight = gait.weight;
      const breath = Math.sin(breathing * 1.55);
      // Small pelvis rise and lateral weight transfer; planted feet compensate with IK.
      model.position.y = baseY + breath * .0025 + Math.cos(cycle * 2) * .007 * weight;
      model.position.x = Math.sin(cycle) * .013 * weight;
      root.rotation.y = gait.heading;
      root.updateMatrixWorld(true);
      forward.set(Math.sin(gait.heading), 0, Math.cos(gait.heading)); right.set(forward.z, 0, -forward.x);
      twist(bone("Hips"), UP, Math.sin(cycle) * .035 * weight - gait.turn * .028);
      twist(bone("Chest"), UP, -Math.sin(cycle) * .05 * weight + gait.turn * .065);
      twist(bone("UpperChest"), right, breath * .004 - Math.min(.025, Math.abs(gait.velocity) * .018));
      twist(bone("Head"), UP, gait.turn * .045 + Math.sin(breathing * .37) * .009);
      for (const [index, side] of ["Left", "Right"].entries()) {
        const swing = Math.sin(cycle + index * Math.PI);
        twist(bone(`${side}Arm`), right, swing * .22 * weight + breath * .006);
        twist(bone(`${side}ForeArm`), right, -.035 * weight + Math.max(0, -swing) * .07 * weight);
      }
      root.getWorldPosition(origin);
      for (let i = 0; i < feet.length; i++) {
        const foot = feet[i], phase = ((gait.phase + i * .5) % 1 + 1) % 1;
        restTarget.copy(foot.reference); root.localToWorld(restTarget);
        if (!foot.initialized) { foot.plant.copy(restTarget); foot.swing.copy(restTarget); foot.yaw = gait.heading; foot.initialized = true; }
        if (phase < .62 && foot.lastCycle >= .62) { foot.plant.copy(foot.swing); foot.plant.y = restTarget.y; foot.yaw = gait.heading; }
        if (phase >= .62 && foot.lastCycle < .62) foot.swing.copy(foot.plant);
        if (phase < .62) desired.copy(foot.plant);
        else {
          const t = (phase - .62) / .38, smooth = t * t * (3 - 2 * t);
          // Land ahead of the moving pelvis, then keep the stance foot world-locked.
          b.copy(restTarget).addScaledVector(forward, .31 * weight);
          desired.copy(foot.plant).lerp(b, smooth); desired.y += Math.sin(t * Math.PI) * .095 * weight;
          foot.swing.copy(desired); foot.yaw = damp(foot.yaw, gait.heading, 12, dt);
        }
        desired.lerp(restTarget, (1 - weight) * .8);
        if (weight < .02) { foot.plant.lerp(restTarget, 1 - Math.exp(-dt * 9)); desired.copy(foot.plant); }
        foot.lastCycle = phase; foot.contact.copy(desired);
        foot.thigh.getWorldPosition(hip);
        dir.copy(desired).sub(hip); const length = Math.min(dir.length(), foot.l1 + foot.l2 - .002); dir.normalize();
        pole.copy(forward).addScaledVector(dir, -forward.dot(dir)).normalize();
        const along = (foot.l1 * foot.l1 - foot.l2 * foot.l2 + length * length) / (2 * Math.max(length, .01));
        const rise = Math.sqrt(Math.max(.0001, foot.l1 * foot.l1 - along * along));
        knee.copy(hip).addScaledVector(dir, along).addScaledVector(pole, rise);
        align(foot.thigh, foot.shin, knee); align(foot.shin, foot.ankle, desired);
        q.setFromAxisAngle(UP, foot.yaw).multiply(foot.q); worldRotation(foot.ankle, q);
      }
      root.updateMatrixWorld(true);
    },
  };
}
