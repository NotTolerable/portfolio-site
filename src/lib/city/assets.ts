import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

export class CityResources {
  geometries = new Set<T.BufferGeometry>();
  materials = new Set<T.Material>();
  textures = new Set<T.Texture>();
  bitmaps = new Set<ImageBitmap>();
  geometry<G extends T.BufferGeometry>(g: G) {
    this.geometries.add(g);
    return g;
  }
  material<M extends T.Material>(m: M) {
    this.materials.add(m);
    return m;
  }
  texture<G extends T.Texture>(t: G) {
    this.textures.add(t);
    return t;
  }
  track(root: T.Object3D) {
    root.traverse((o) => {
      if (!(o instanceof T.Mesh)) return;
      this.geometry(o.geometry);
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        this.material(m);
        for (const t of Object.values(m))
          if (t instanceof T.Texture) {
            this.texture(t);
            if (
              typeof ImageBitmap !== "undefined" &&
              t.source.data instanceof ImageBitmap
            )
              this.bitmaps.add(t.source.data);
          }
      }
    });
  }
  dispose() {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.bitmaps.forEach((b) => b.close());
    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();
    this.bitmaps.clear();
  }
}
export const cityAssetNames = [
  "architecture",
  "lantern",
  "bench",
  "cafe",
  "books",
  "shelf",
  "planter",
] as const;
export type CityAssets = {
  models: Record<(typeof cityAssetNames)[number], T.Group>;
  maps: Record<string, T.Texture>;
  hdr: T.DataTexture;
};
export async function loadCityAssets(
  resources: CityResources,
  signal: AbortSignal,
): Promise<CityAssets> {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),
    textures = new T.TextureLoader();
  const keys = ["cobbles", "brick"]
    .flatMap((n) => ["diff", "nor_gl", "rough", "ao"].map((t) => n + "-" + t))
    .concat(["concrete-diff", "concrete-nor_gl", "concrete-rough"]);
  const results = await Promise.allSettled([
    ...cityAssetNames.map((n) => loader.loadAsync("/city/" + n + ".glb")),
    new HDRLoader().loadAsync("/world/city-light.hdr"),
    ...keys.map((n) =>
      textures.loadAsync(
        n.startsWith("concrete-")
          ? "/world/" + n.replace("-diff", "-diffuse") + ".webp"
          : "/city/" + n + ".webp",
      ),
    ),
  ]);
  for (const r of results)
    if (r.status === "fulfilled") {
      if ("scene" in r.value) resources.track(r.value.scene);
      else if (r.value instanceof T.Texture) resources.texture(r.value);
    }
  if (signal.aborted || results.some((r) => r.status === "rejected")) {
    resources.dispose();
    throw Error("City assets unavailable");
  }
  const models = Object.fromEntries(
    cityAssetNames.map((n, i) => [
      n,
      (
        results[i] as PromiseFulfilledResult<
          Awaited<ReturnType<GLTFLoader["loadAsync"]>>
        >
      ).value.scene,
    ]),
  ) as CityAssets["models"];
  const hdr = (
    results[cityAssetNames.length] as PromiseFulfilledResult<T.DataTexture>
  ).value;
  const maps = Object.fromEntries(
    keys.map((n, i) => [
      n,
      (
        results[
          cityAssetNames.length + 1 + i
        ] as PromiseFulfilledResult<T.Texture>
      ).value,
    ]),
  );
  for (const [name, t] of Object.entries(maps)) {
    t.wrapS = t.wrapT = T.RepeatWrapping;
    if (name.endsWith("-diff")) t.colorSpace = T.SRGBColorSpace;
    t.channel = 0;
  }
  return { models, maps, hdr };
}
