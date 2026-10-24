import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { engravedMaterial } from "./engraved-material";

/** A fictional, CC0 Kenney character, not a portrait of the portfolio owner.
 * Source files, license and modifications are recorded in the asset notes. */
export async function createStreetCharacter() {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => /\.(png|jpe?g|tga)(\?.*)?$/i.test(url) ? "/models/courier/skin.png" : url);
  const loader = new FBXLoader(manager);
  const loaded = await Promise.allSettled([
    loader.loadAsync("/models/courier/character.fbx"),
    loader.loadAsync("/models/courier/idle.fbx"),
    loader.loadAsync("/models/courier/run.fbx"),
    new THREE.TextureLoader().loadAsync("/models/courier/skin.png"),
  ]);
  const failed = loaded.find((item) => item.status === "rejected");
  if (failed) {
    for (const item of loaded) if (item.status === "fulfilled") {
      if (item.value instanceof THREE.Texture) item.value.dispose();
      else item.value.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); for (const m of Array.isArray(object.material) ? object.material : [object.material]) m.dispose(); } });
    }
    throw failed.reason;
  }
  // All four loads succeeded; retain the tuple's individual resource types.
  const [model, idle, locomotion, texture] = loaded.map((item) => (item as PromiseFulfilledResult<unknown>).value) as [THREE.Group, THREE.Group, THREE.Group, THREE.Texture];
  texture.colorSpace = THREE.SRGBColorSpace;
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const original of Array.isArray(object.material) ? object.material : [object.material]) original.dispose();
    const material = engravedMaterial(0xffffff, .19); material.map = texture; material.roughness = .88;
    materials.add(material); object.material = material; object.castShadow = true; object.receiveShadow = true;
  });
  const bounds = new THREE.Box3().setFromObject(model);
  const factor = 2.12 / bounds.getSize(new THREE.Vector3()).y;
  model.scale.multiplyScalar(factor); model.position.y = -bounds.min.y * factor;
  const root = new THREE.Group(); root.add(model); root.rotation.y = Math.PI;
  const mixer = new THREE.AnimationMixer(model);
  const idleClip = idle.animations[0], moveClip = locomotion.animations[0];
  const idleAction = idleClip ? mixer.clipAction(idleClip).play() : null;
  const moveAction = moveClip ? mixer.clipAction(moveClip).play() : null;
  moveAction?.setEffectiveTimeScale(.65); moveAction?.setEffectiveWeight(0);
  // Animation FBXs can contain duplicate source meshes; only their clips survive.
  for (const source of [idle, locomotion]) source.traverse((object) => {
    if (object instanceof THREE.Mesh) { object.geometry.dispose(); for (const m of Array.isArray(object.material) ? object.material : [object.material]) m.dispose(); }
  });
  let weight = 0;
  return { root, update(delta: number, speed: number, paused: boolean) {
    const target = paused ? 0 : Math.min(.72, speed * .42);
    weight += (target - weight) * (1 - Math.exp(-delta * 9));
    idleAction?.setEffectiveWeight(1 - weight); moveAction?.setEffectiveWeight(weight);
    if (!paused) mixer.update(delta);
  }, dispose() { mixer.stopAllAction(); mixer.uncacheRoot(model); geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); texture.dispose(); } };
}
