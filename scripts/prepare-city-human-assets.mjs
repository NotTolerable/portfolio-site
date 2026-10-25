/** Prepare the licensed Innerscene / MakeHuman civilian crowd.
 * Run: node scripts/prepare-city-human-assets.mjs [source-cache-directory]
 * Downloads are pinned by SHA-256. Provenance: docs/assets/city-people.md.
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplifyPrimitive, textureCompress, resample, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const sources = [
  { name: 'sam', id: 'locomotion-collection-sam-3d-person-animated-dc23800f', sha256: '288af86ec0581d78bb8dc495e036736adfc35f8c7c11dc6a0d6b538ad2c0d7b7' },
  { name: 'harper', id: 'locomotion-collection-harper-3d-person-animated-797e1e2a', sha256: 'aa8cc1f80f09c6c110ddfcc534b245a41ec2efb0a8035e44e56b229711675db1' },
  { name: 'maya', id: 'locomotion-collection-maya-3d-person-animated-1499b2fd', sha256: '1b1ffa3d8640c65da89b840bc318be9edc913f734802634357d43a781eef4033' },
];
const cacheDir = process.argv[2] ?? tmpdir();
const outputDir = new URL('../public/city/people/', import.meta.url);
await mkdir(cacheDir, { recursive: true });
await mkdir(outputDir, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
  'meshopt.decoder': MeshoptDecoder,
});
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const selectedClips = new Set(['Idle_Standing', 'Walk_Relaxed', 'Walk_Brisk', 'Sit_Stand']);
const results = [];
for (const source of sources) {
  const sourcePath = join(cacheDir, `city-human-${source.name}-source.glb`);
  let bytes;
  try { bytes = await readFile(sourcePath); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const response = await fetch(`https://www.innerscene.com/api/library/${source.id}/download`);
    if (!response.ok) throw Error(`Source download failed: ${response.status} ${source.id}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (sha256(bytes) !== source.sha256) throw Error(`Unreviewed source revision: ${source.name}`);
    await writeFile(sourcePath, bytes);
  }
  if (sha256(bytes) !== source.sha256) throw Error(`Source checksum mismatch: ${source.name}`);
  const document = await io.readBinary(bytes);
  const root = document.getRoot();
  const originalJoints = root.listSkins()[0].listJoints().map(node => node.getName());
  const triangleCount = () => root.listMeshes().reduce((total, mesh) => total + mesh.listPrimitives().reduce((sum, primitive) => sum + primitive.getIndices().getCount() / 3, 0), 0);
  const sourceTriangles = triangleCount();
  for (const animation of root.listAnimations()) if (!selectedClips.has(animation.getName())) animation.dispose();
  // Closed mouths do not need internal teeth. Fine scalp roots are invisible at
  // street distances; retain the actual alpha hair cards and face features.
  // Carry-only accessories are omitted because the carrying clip is not used.
  for (const node of [...root.listNodes()]) {
    const name = node.getMesh()?.getName() ?? '';
    if (/teeth_base|fine scalp roots|Original held accessory/.test(name)) node.dispose();
  }
  await document.transform(prune({ keepAttributes: true, keepLeaves: true }), weld());
  for (const mesh of root.listMeshes()) {
    // Preserve eyes/brows/lashes and garment seams. Body error is bounded to
    // 0.1% of mesh extent, retaining face/hand silhouette at background distances.
    const name = mesh.getName();
    if (/eyebrow|eyelash|low-poly|Ankle lining/.test(name)) continue;
    const ratio = name === 'base' ? 0.26 : /short01|ponytail/.test(name) ? 0.65 : 0.72;
    for (const primitive of mesh.listPrimitives()) simplifyPrimitive(primitive, {
      simplifier: MeshoptSimplifier, ratio, error: 0.001, lockBorder: true,
    });
  }
  await document.transform(
    dedup(),
    resample({ tolerance: 0.00005 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88, effort: 80 }),
    // Normal maps preserve high quality but do not need 1k sampling on distant NPCs.
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /normalTexture/, resize: [512, 512], quality: 95, effort: 80 }),
    prune({ keepAttributes: true, keepLeaves: true }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  root.getAsset().copyright = 'Innerscene, adapted from MakeHuman/MPFB CC0 graphical assets. CC0-1.0.';
  const output = await io.writeBinary(document);
  const reread = await io.readBinary(output);
  const actualJoints = reread.getRoot().listSkins()[0].listJoints().map(node => node.getName());
  if (actualJoints.join('|') !== originalJoints.join('|')) throw Error(`Joint hierarchy changed: ${source.name}`);
  const clips = reread.getRoot().listAnimations().map(animation => ({
    name: animation.getName(),
    duration: Math.max(...animation.listSamplers().map(sampler => sampler.getInput().getMax([0])[0])),
    channels: animation.listChannels().length,
  }));
  if (clips.length !== selectedClips.size || clips.some(clip => !selectedClips.has(clip.name))) throw Error(`Missing animation: ${source.name}`);
  for (const animation of reread.getRoot().listAnimations()) {
    for (const channel of animation.listChannels()) {
      const sampler = channel.getSampler();
      if (![...sampler.getOutput().getArray()].every(Number.isFinite)) throw Error(`Non-finite animation: ${source.name}`);
      if (channel.getTargetNode().getName() !== 'Root') continue;
      // Cubic splines store incoming tangent, value, outgoing tangent per key.
      const stride = sampler.getInterpolation() === 'CUBICSPLINE' ? 3 : 1;
      const offset = stride === 3 ? 1 : 0;
      const first = sampler.getOutput().getElement(offset, []);
      for (let index = offset; index < sampler.getOutput().getCount(); index += stride) {
        const value = sampler.getOutput().getElement(index, []);
        if (value.some((n, component) => Math.abs(n - first[component]) > 0.00001)) throw Error(`Unexpected root motion: ${source.name}`);
      }
    }
  }
  for (const texture of reread.getRoot().listTextures()) if (Math.max(...texture.getSize()) > 1024) throw Error('Texture exceeds 1k limit.');
  for (const mesh of reread.getRoot().listMeshes()) for (const primitive of mesh.listPrimitives()) {
    if (!primitive.getAttribute('JOINTS_0') || !primitive.getAttribute('WEIGHTS_0')) throw Error(`Missing skin attributes: ${mesh.getName()}`);
  }
  await writeFile(new URL(`${source.name}.glb`, outputDir), output);
  results.push({ name: source.name, source: `https://www.innerscene.com/tools/library/3d-parts/${source.id}`, sourceSha256: source.sha256, bytes: output.byteLength, sha256: sha256(output), sourceTriangles, triangles: triangleCount(), primitives: root.listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0), joints: actualJoints, clips, textures: root.listTextures().map(t => ({ name: t.getName(), size: t.getSize(), bytes: t.getImage().byteLength })) });
}
await writeFile(new URL('manifest.json', outputDir), JSON.stringify({ license: 'CC0-1.0', preparation: 'scripts/prepare-city-human-assets.mjs', characters: results }, null, 2) + '\n');
console.log(JSON.stringify(results.map(({ name, bytes, triangles, primitives, clips }) => ({ name, bytes, triangles, primitives, clips })), null, 2));
