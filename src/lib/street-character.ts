import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { engravedMaterial } from "./engraved-material";
import { createWalkerRig, prepareWalkerModel, type IdlePose } from "./walker-rig";

/** Licensed CC0 mesh, compact static pose, and an original procedural walk.
 * Only the model, skin and small pose are fetched; the old animation FBXs stay dormant. */
export async function createStreetCharacter() {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => /\.(png|jpe?g|tga)(\?.*)?$/i.test(url) ? "/models/courier/skin.png" : url);
  const loaded = await Promise.allSettled([
    new FBXLoader(manager).loadAsync("/models/courier/character.fbx"),
    new THREE.TextureLoader().loadAsync("/models/courier/skin.png"),
    new THREE.FileLoader().setResponseType("json").loadAsync("/models/courier/idle-pose.json"),
  ]);
  const failed = loaded.find((item) => item.status === "rejected");
  if (failed) {
    for (const item of loaded) if (item.status === "fulfilled") {
      if (item.value instanceof THREE.Texture) item.value.dispose();
      else if (item.value instanceof THREE.Object3D) item.value.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose(); });
    }
    throw failed.reason;
  }
  const [model, texture, pose] = loaded.map((item) => (item as PromiseFulfilledResult<unknown>).value) as [THREE.Group, THREE.Texture, IdlePose];
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 2;
  const materials = new Set<THREE.Material>(), geometries = new Set<THREE.BufferGeometry>(), skeletons = new Set<THREE.Skeleton>();
  model.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    if (node instanceof THREE.SkinnedMesh) skeletons.add(node.skeleton);
    for (const original of Array.isArray(node.material) ? node.material : [node.material]) original.dispose();
    const material = engravedMaterial(0x9eaaba, .17); material.map = texture; material.roughness = .98;
    materials.add(material); node.material = material; node.frustumCulled = false;
  });
  prepareWalkerModel(model, pose);
  const root = new THREE.Group(); root.add(model); root.updateMatrixWorld(true);
  const rig = createWalkerRig(model, root);
  return { root, feet: rig.feet, update: rig.update,
    dispose() { geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); skeletons.forEach((s) => s.dispose()); texture.dispose(); },
  };
}
