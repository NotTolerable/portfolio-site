import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { boxingGloves } from "./sports";

/** CC0 sculpted gloves, consumed only as a one-time particle sampling source. */
export async function loadGloveArt(): Promise<T.Group> {
  try {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const { scene } = await loader.loadAsync("/gallery/boxing-gloves.glb");
    const center = new T.Box3().setFromObject(scene).getCenter(new T.Vector3());
    scene.position.sub(center);
    const art = new T.Group();
    art.name = "Vintage boxing gloves / Joachim Bornemann / CC0";
    art.add(scene);
    art.rotation.set(.05, -.35, .12);
    return art;
  } catch (error) {
    console.warn("Glove artwork unavailable; using local particle shape.", error);
    return boxingGloves();
  }
}
