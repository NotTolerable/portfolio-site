/** Compact CC0 pedestrian derivative, retaining the original named rig and raw pose.
 * Run: node scripts/prepare-city-pedestrian.mjs
 * Sources, runtime preparation and skin handling: docs/assets/city-pedestrian.md.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder as BundledMeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";

// GLTFExporter uses browser FileReader even when exporting an untextured GLB.
globalThis.FileReader ??= class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.({ target: this });
  }
};
const sourceUrl = new URL("../public/models/courier/character.fbx", import.meta.url);
const outputUrl = new URL("../public/city/pedestrian.glb", import.meta.url);
const bufferSlice = (bytes) => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const sourceBytes = await readFile(sourceUrl);
// The original FBX refers to a skin by a workstation path. Texture is shared and
// loaded separately at runtime, so do not invoke a DOM image loader during parse.
const originalLoad = THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load = () => new THREE.Texture();
let source;
try {
  source = new FBXLoader().parse(bufferSlice(sourceBytes), "");
} finally {
  THREE.TextureLoader.prototype.load = originalLoad;
}
source.name = "CityPedestrian";
source.animations = [];
const material = new THREE.MeshStandardMaterial({
  name: "SharedPedestrianSkin",
  color: 0xffffff,
  roughness: 0.88,
  metalness: 0,
});
const boneNames = [];
let triangles = 0;
source.traverse((node) => {
  if (node.isBone) boneNames.push(node.name);
  if (node.isMesh) {
    node.material = material;
    triangles += (node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3;
  }
});
// Export raw source transforms; no idle pose, proportions, scaling or grounding
// are baked. Runtime must call prepareWalkerModel(model, idlePose) exactly once.
const binary = await new GLTFExporter().parseAsync(source, { binary: true, onlyVisible: false });
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.encoder": MeshoptEncoder,
  "meshopt.decoder": MeshoptDecoder,
});
const document = await io.readBinary(new Uint8Array(binary));
await document.transform(
  dedup(),
  prune({ keepAttributes: true, keepLeaves: true }),
  weld(),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
const packed = await io.writeBinary(document);

// Verify through the same Three.js bundled decoder used by the scene. Keep every
// named joint, UVs, skin indices and weights, while shipping no texture/animation.
const loader = new GLTFLoader().setMeshoptDecoder(BundledMeshoptDecoder);
const loaded = await loader.parseAsync(bufferSlice(packed), "");
const actualBones = [];
const actualNodeNames = new Set();
let loadedTriangles = 0;
let skinnedMeshes = 0;
loaded.scene.traverse((node) => {
  actualNodeNames.add(node.name);
  if (node.isBone) actualBones.push(node.name);
  if (node.isSkinnedMesh) {
    skinnedMeshes++;
    for (const name of ["uv", "skinIndex", "skinWeight"])
      if (!node.geometry.attributes[name]) throw Error(`Missing ${name} attribute.`);
    loadedTriangles += (node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3;
    if (node.material.map) throw Error("Skin must remain external.");
  }
});
for (const name of boneNames)
  if (!actualNodeNames.has(name)) throw Error(`Missing named rig node: ${name}`);
// glTF marks skin joints as Bone; unused FBX *_end leaf joints remain Object3D.
for (const name of ["Hips", "Chest", "UpperChest", "Head", "LeftUpLeg", "LeftLeg", "LeftFoot", "RightUpLeg", "RightLeg", "RightFoot", "LeftArm", "LeftForeArm", "RightArm", "RightForeArm"])
  if (!actualBones.includes(name)) throw Error(`Missing walker-rig bone: ${name}`);
if (triangles !== loadedTriangles || !skinnedMeshes || loaded.animations.length) throw Error("Unexpected mesh/animation change.");
const pose = JSON.parse(await readFile(new URL("../public/models/courier/idle-pose.json", import.meta.url), "utf8"));
// Match prepareWalkerModel's algorithm to compare source and packed posed bounds,
// without changing the exported file or baking a second runtime normalization.
function prepareForVerification(model) {
  model.traverse((node) => {
    const reference = pose[node.name];
    if (reference) {
      node.position.fromArray(reference.position);
      node.quaternion.fromArray(reference.quaternion);
      node.scale.fromArray(reference.scale);
    }
    if (node.name === "Head") node.scale.multiplyScalar(0.78);
    if (/^(Left|Right)(UpLeg|Leg)$/.test(node.name)) node.scale.multiplyScalar(1.1);
  });
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const factor = 1.92 / bounds.getSize(new THREE.Vector3()).y;
  model.scale.multiplyScalar(factor);
  model.position.y = -bounds.min.y * factor + 0.025;
  model.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(model);
}
const sourceBounds = prepareForVerification(source);
const preparedBounds = prepareForVerification(loaded.scene);
const boundsError = Math.max(sourceBounds.min.distanceTo(preparedBounds.min), sourceBounds.max.distanceTo(preparedBounds.max));
if (boundsError > 0.001) throw Error(`Packed reference pose bounds differ by ${boundsError} metres.`);
await mkdir(new URL("../public/city/", import.meta.url), { recursive: true });
await writeFile(outputUrl, packed);
const rounded = (vector) => vector.toArray().map((n) => +n.toFixed(5));
console.log(JSON.stringify({
  file: "public/city/pedestrian.glb",
  bytes: packed.byteLength,
  triangles,
  skinnedMeshes,
  referenceBoundsErrorMetres: +boundsError.toFixed(7),
  bones: actualBones.sort(),
  preparedBounds: { min: rounded(preparedBounds.min), max: rounded(preparedBounds.max), size: rounded(preparedBounds.getSize(new THREE.Vector3())) },
  runtimeNormalization: "prepareWalkerModel(model, idlePose) exactly once before createWalkerRig",
}, null, 2));
