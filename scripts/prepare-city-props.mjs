/**
 * Prepare licensed street props without reducing their source geometry detail.
 * Provenance and source layout: docs/assets/city-street-props.md.
 * node scripts/prepare-city-props.mjs /path/to/city-prop-sources
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  flatten,
  getBounds,
  join,
  meshopt,
  prune,
  textureCompress,
} from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const [source] = process.argv.slice(2);
if (!source) throw Error("Provide the street-prop source directory.");
const output = path.resolve("public/city/props");
await fs.mkdir(output, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });

for (const [name, input] of [
  ["bicycle", "bicycle-original.glb"],
  ["trash-can", "metal_trash_can/metal_trash_can.gltf"],
  ["covered-car", "covered_car/covered_car.gltf"],
]) {
  const doc = await io.read(path.join(source, input));
  const scene = doc.getRoot().listScenes()[0];
  if (!scene) throw Error(`Missing scene in ${input}`);

  if (name === "trash-can") {
    // The source is a side-by-side product display. Keep the intact can, its
    // handles and leaning lid; omit only the separate duplicate rusty variant.
    for (const node of [...scene.listChildren()]) {
      if (node.getName().startsWith("metal_trash_can_rust")) node.dispose();
    }
  }

  const bounds = getBounds(scene);
  const offset = [
    -(bounds.min[0] + bounds.max[0]) / 2,
    -bounds.min[1],
    -(bounds.min[2] + bounds.max[2]) / 2,
  ];
  for (const node of scene.listChildren()) {
    const t = node.getTranslation();
    node.setTranslation(t.map((value, axis) => value + offset[axis]));
  }
  // Static nodes are baked and joined by material to avoid one draw per spoke.
  // No simplify/decimate pass is applied to any of the models.
  await doc.transform(
    dedup(),
    flatten(),
    join(),
    prune(),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [1024, 1024],
      quality: 90,
    }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  doc.getRoot().getAsset().copyright =
    name === "bicycle"
      ? "City bicycle by Innerscene, CC0 1.0. See /city/props/LICENSE.txt."
      : `${name === "trash-can" ? "Metal Trash Can by GurJas Studios" : "Covered Car by MP"}, Poly Haven, CC0 1.0. See /city/props/LICENSE.txt.`;
  const target = path.join(output, `${name}.glb`);
  await io.write(target, doc);

  // Re-read the shipped file so this reports its decoded, quantized geometry.
  const packed = await io.read(target);
  const packedScene = packed.getRoot().listScenes()[0];
  let triangles = 0;
  let primitives = 0;
  packedScene.traverse((node) => {
    for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
      triangles +=
        (primitive.getIndices()?.getCount() ??
          primitive.getAttribute("POSITION").getCount()) / 3;
      primitives += 1;
    }
  });
  const binary = await fs.readFile(target);
  console.log(JSON.stringify({
    name,
    bytes: binary.byteLength,
    triangles,
    primitives,
    bounds: getBounds(packedScene),
    textures: packed.getRoot().listTextures().map((texture) => ({
      format: texture.getMimeType(),
      size: texture.getSize(),
    })),
    sha256: createHash("sha256").update(binary).digest("hex"),
  }));
}
