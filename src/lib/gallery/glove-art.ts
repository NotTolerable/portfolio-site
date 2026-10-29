import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { boxingGloves } from "./sports";

/** Pose at initialization; the final exhibit still contains just one Points draw. */
function hangingPair(sources: T.Object3D[]) {
  const art = new T.Group();
  art.name = "Hanging boxing gloves";
  // Keep the lace legible without spending the usual seam allocation on it.
  art.userData.particleDetailShare = .065;
  const apex = new T.Vector3(0, .145, .016);
  const laceMaterial = new T.MeshBasicMaterial({ color: 0xffffff });
  const frames = sources.map(object => {
    object.updateWorldMatrix(true, true);
    const bounds = new T.Box3().setFromObject(object);
    return { object, world: object.matrixWorld.clone(),
      center: bounds.getCenter(new T.Vector3()), size: bounds.getSize(new T.Vector3()) };
  });
  frames.forEach(({object, world, center, size}, index) => {
    object.removeFromParent();
    // Preserve the GLTF quantization transforms; never modify encoded vertices.
    world.decompose(object.position, object.quaternion, object.scale);
    object.position.sub(center);
    const centered = new T.Group();
    centered.add(object);
    centered.scale.setScalar(.2 / size.y);
    const pose = new T.Group();
    pose.add(centered);
    const left = index === 0;
    pose.position.set(left ? -.035 : .037, left ? -.015 : .01, left ? .018 : -.024);
    pose.rotation.set(left ? .08 : -.06, left ? .25 : -.45,
      Math.PI + (left ? -.22 : .28));
    art.add(pose);
    pose.updateWorldMatrix(true, true);
    // Measured lace-opening points on the normalized sculpted cuffs.
    const cuff = pose.localToWorld(new T.Vector3(left ? .0063 : -.0063, -.0764, .0166));
    const side = left ? -1 : 1;
    const shoulder = apex.clone().lerp(cuff, .38);
    shoulder.x += side * .006;
    const curve = new T.CatmullRomCurve3([
      apex.clone(),
      shoulder, apex.clone().lerp(cuff, .75), cuff,
    ]);
    const lace = new T.Mesh(new T.TubeGeometry(curve, 32, .00085, 5, false), laceMaterial);
    lace.name = "Shared hanging lace / particle source";
    art.add(lace);
  });
  // Include the laces in centering and final fitting inside the ice.
  const center = new T.Box3().setFromObject(art).getCenter(new T.Vector3());
  for (const child of art.children) child.position.sub(center);
  art.rotation.set(.05, -.18, .04);
  return art;
}

/** CC0 sculpted gloves, consumed only as a one-time particle sampling source. */
export async function loadGloveArt(): Promise<T.Group> {
  try {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const { scene } = await loader.loadAsync("/gallery/boxing-gloves.glb");
    const gloves: T.Mesh[] = [];
    scene.traverse(object => { if (object instanceof T.Mesh) gloves.push(object); });
    const art = hangingPair(gloves.sort((a, b) => a.name.localeCompare(b.name)));
    art.name = "Vintage boxing gloves / Joachim Bornemann / CC0";
    return art;
  } catch (error) {
    console.warn("Glove artwork unavailable; using local particle shape.", error);
    return hangingPair([...boxingGloves().children]);
  }
}
