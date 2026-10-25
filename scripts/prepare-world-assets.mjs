/** Rebuild the self-hosted CC0 props from Poly Haven's 1k glTF downloads.
 * Usage: node scripts/prepare-world-assets.mjs /path/to/polyhaven-downloads
 * Each source folder must preserve the original glTF's relative resources. */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
const source = process.argv[2];
if (!source) throw Error('Provide the directory containing the original CC0 downloads.');
const output = path.resolve('public/world');
await fs.mkdir(output, { recursive: true });
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
for (const [id, name] of [['industrial_microscope', 'optics'], ['vintage_radio_transceiver', 'radio'], ['utility_box_01', 'relay'], ['desk_lamp_arm_01', 'lamp'], ['metal_office_desk', 'desk'], ['portable_searchlight', 'searchlight']]) {
  const document = await io.read(path.join(source, id, id + '.gltf'));
  await document.transform(dedup(), prune(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 90 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await io.write(path.join(output, name + '.glb'), document);
  console.log(name, (await fs.stat(path.join(output, name + '.glb'))).size);
}
for (const type of ['Diffuse', 'Rough', 'nor_gl']) {
  await sharp(path.join(source, 'concrete-' + type + '.jpg')).resize(1024, 1024).webp({ quality: 85 }).toFile(path.join(output, 'concrete-' + type.toLowerCase() + '.webp'));
}
await fs.copyFile(path.join(source, 'modern_buildings_night.hdr'), path.join(output, 'city-light.hdr'));
// A small reusable subset of the modular architecture kit; discard unused modules.
const facade = await io.read(path.join(source, 'modular_urban_apartments_facade/modular_urban_apartments_facade.gltf'));
const { getBounds } = await import('@gltf-transform/functions');
const keep = ['wall_window_centered_large_01', 'window_centered_large_01', 'cornice_standard_standard_01', 'wall_pier_standard_01'];
for (const node of [...facade.getRoot().listScenes()[0].listChildren()]) {
  if (!keep.includes(node.getName())) { node.dispose(); continue; }
  const b = getBounds(node), t = node.getTranslation();
  node.setTranslation([t[0] - (b.min[0] + b.max[0]) / 2, t[1] - b.min[1], t[2]]);
}
await facade.transform(prune(), dedup(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024,1024], quality: 90 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(path.join(output, 'facade.glb'), facade);
console.log('facade', (await fs.stat(path.join(output, 'facade.glb'))).size);
