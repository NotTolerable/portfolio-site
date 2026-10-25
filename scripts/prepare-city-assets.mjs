/** CC0 vertical-slice derivatives. Sources and licenses: docs/assets/city-preview.md.
 * node scripts/prepare-city-assets.mjs /path/to/city-sources /path/to/portfolio-assets */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  prune,
  meshopt,
  textureCompress,
  getBounds,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
const [source, previous] = process.argv.slice(2);
if (!source || !previous)
  throw Error("Provide city and original architecture source directories.");
const output = path.resolve("public/city");
await fs.mkdir(output, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const pack = async (doc, name) => {
  await doc.transform(
    dedup(),
    prune(),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [1024, 1024],
      quality: 90,
    }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write(path.join(output, name + ".glb"), doc);
  console.log(name, (await fs.stat(path.join(output, name + ".glb"))).size);
};
for (const [id, name] of [
  ["street_lamp_02", "lantern"],
  ["painted_wooden_bench", "bench"],
  ["outdoor_table_chair_set_01", "cafe"],
  ["book_encyclopedia_set_01", "books"],
  ["wooden_bookshelf_worn", "shelf"],
  ["planter_box_01", "planter"],
])
  await pack(await io.read(path.join(source, id, id + ".gltf")), name);
const kit = await io.read(
  path.join(
    previous,
    "modular_urban_apartments_facade/modular_urban_apartments_facade.gltf",
  ),
);
const keep = [
  "wall_window_centered_large_01",
  "window_centered_large_01",
  "wall_window_centered_small_01",
  "window_centered_small_01",
  "wall_standard_standard_01",
  "door_centered_small_01",
  "wall_door_centered_small_01",
  "cornice_standard_standard_01",
  "crown_standard_standard_01",
  "wall_pier_standard_01",
  "base_standard_01",
  "window_centered_double_01",
  "wall_door_window_small_01",
];
const found = new Set();
for (const node of [...kit.getRoot().listScenes()[0].listChildren()]) {
  if (!keep.includes(node.getName())) {
    node.dispose();
    continue;
  }
  found.add(node.getName());
  const b = getBounds(node),
    t = node.getTranslation();
  node.setTranslation([
    t[0] - (b.min[0] + b.max[0]) / 2,
    t[1] - b.min[1],
    t[2] - (b.min[2] + b.max[2]) / 2,
  ]);
}
for (const name of keep)
  if (!found.has(name)) throw Error("Missing architecture module " + name);
await pack(kit, "architecture");
for (const [id, name] of [
  ["cobblestone_floor_08", "cobbles"],
  ["brick_wall_02", "brick"],
])
  for (const type of ["diff", "nor_gl", "rough", "ao"])
    await sharp(path.join(source, id + "-" + type + ".jpg"))
      .resize(1024, 1024)
      .webp({ quality: type === "nor_gl" ? 92 : 88 })
      .toFile(path.join(output, name + "-" + type + ".webp"));
