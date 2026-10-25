import { test, expect } from '@playwright/test';
import * as T from 'three';
import { NodeIO, type Node as GltfNode } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { collectCafeSeats } from '../src/lib/city/staging';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
/** Use real packed animation channels/transforms, without needing a browser image decoder for this kinematic check. */
async function readRig(name: string) {
  const document = await io.read('public/city/people/' + name + '.glb'), root = new T.Group(), nodes = new Map<GltfNode, T.Object3D>();
  for (const node of document.getRoot().listNodes()) {
    const o = new T.Object3D();
    o.name = node.getName();
    new T.Matrix4().fromArray(node.getMatrix()).decompose(o.position, o.quaternion, o.scale);
    nodes.set(node, o);
  }
  for (const [node, o] of nodes)
    for (const child of node.listChildren())
      o.add(nodes.get(child)!);
  for (const node of document.getRoot().listScenes()[0].listChildren())
    root.add(nodes.get(node)!);
  const clips = document.getRoot().listAnimations().map(animation => {
    const tracks: T.KeyframeTrack[] = [];
    for (const channel of animation.listChannels()) {
      const sampler = channel.getSampler()!, input = sampler.getInput()!, output = sampler.getOutput()!, path = channel.getTargetPath(), target = nodes.get(channel.getTargetNode()!)!, values: number[] = [];
      let times = Array.from(input.getArray()!) as number[];
      if (sampler.getInterpolation() === 'CUBICSPLINE') {
        const duration = times.at(-1)!, steps = Math.round(duration * 240), original = times;
        times = Array.from({ length: steps + 1 }, (_, i) => i / steps * duration);
        let key = 0;
        for (const t of times) {
          while (key < original.length - 2 && t > original[key + 1])
            key++;
          const span = original[key + 1] - original[key], u = (t - original[key]) / span, u2 = u * u, u3 = u2 * u;
          const p0 = output.getElement(key * 3 + 1, []), m0 = output.getElement(key * 3 + 2, []), p1 = output.getElement((key + 1) * 3 + 1, []), m1 = output.getElement((key + 1) * 3, []);
          const v = p0.map((p, j) => (2 * u3 - 3 * u2 + 1) * p + (u3 - 2 * u2 + u) * span * m0[j] + (-2 * u3 + 3 * u2) * p1[j] + (u3 - u2) * span * m1[j]);
          if (path === 'rotation') {
            const q = new T.Quaternion().fromArray(v).normalize();
            values.push(...q.toArray());
          }
          else
            values.push(...v);
        }
      }
      else
        for (let i = 0; i < output.getCount(); i++)
          values.push(...output.getElement(i, []));
      const property = path === 'rotation' ? 'quaternion' : path === 'translation' ? 'position' : 'scale';
      tracks.push(path === 'rotation' ? new T.QuaternionKeyframeTrack(target.uuid + '.' + property, times, values) : new T.VectorKeyframeTrack(target.uuid + '.' + property, times, values));
    }
    return new T.AnimationClip(animation.getName(), -1, tracks);
  });
  return { root, clips };
}
for (const name of ['sam', 'harper', 'maya'])
  test(`${name}: real packed walk keeps stance feet planted at scaled scene travel speed and sitting fits a chair`, async () => {
    const { root, clips } = await readRig(name), wrapper = new T.Group();
    wrapper.add(root);
    wrapper.scale.setScalar(.96);
    wrapper.position.y = .1;
    const mixer = new T.AnimationMixer(root), walk = mixer.clipAction(clips.find(a => a.name === 'Walk_Relaxed')!);
    walk.play();
    const feet = [root.getObjectByName('foot_l')!, root.getObjectByName('foot_r')!], positions = feet.map(() => new T.Vector3()), previous = feet.map(() => new T.Vector3()), speed = .72, scale = .96, minY = .1 + .0705 * scale;
    let maxDrift = 0, samples = 0;
    for (let i = 0; i < 360; i++) {
      const t = i / 60;
      wrapper.position.z = t * speed;
      mixer.setTime(t * speed / (1.3 * scale));
      wrapper.updateMatrixWorld(true);
      for (let j = 0; j < 2; j++) {
        feet[j].getWorldPosition(positions[j]);
        if (i && positions[j].y < minY + .009 && previous[j].y < minY + .009) {
          maxDrift = Math.max(maxDrift, Math.abs(positions[j].z - previous[j].z));
          samples++;
        }
        previous[j].copy(positions[j]);
      }
    }
    expect(samples).toBeGreaterThan(90);
    expect(maxDrift).toBeLessThan(.003);
    walk.stop();
    const sit = mixer.clipAction(clips.find(a => a.name === 'Sit_Stand')!);
    sit.play();
    mixer.setTime(3);
    wrapper.position.set(0, 0, 0);
    wrapper.scale.setScalar(1);
    wrapper.updateMatrixWorld(true);
    const pelvis = root.getObjectByName('pelvis')!.getWorldPosition(new T.Vector3());
    expect(pelvis.y).toBeGreaterThan(.54);
    expect(pelvis.y).toBeLessThan(.62);
    expect(pelvis.z).toBeGreaterThan(-.39);
    expect(pelvis.z).toBeLessThan(-.3);
  });
test('seating anchors follow the actual licensed bistro chair geometry and face the table', async () => {
  const document = await io.read('public/city/cafe.glb'), source = new T.Group(), nodes = new Map<GltfNode, T.Object3D>();
  for (const node of document.getRoot().listNodes()) {
    const group = new T.Group();
    group.name = node.getName();
    new T.Matrix4().fromArray(node.getMatrix()).decompose(group.position, group.quaternion, group.scale);
    for (const p of node.getMesh()?.listPrimitives() ?? []) {
      const a = p.getAttribute('POSITION')!, values: number[] = [];
      for (let i = 0; i < a.getCount(); i++)
        values.push(...a.getElement(i, []));
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(values, 3));
      const mesh = new T.Mesh(geometry);
      mesh.name = node.getName();
      group.add(mesh);
    }
    nodes.set(node, group);
  }
  for (const [node, group] of nodes)
    for (const c of node.listChildren())
      group.add(nodes.get(c)!);
  for (const node of document.getRoot().listScenes()[0].listChildren())
    source.add(nodes.get(node)!);
  const bounds = new T.Box3().setFromObject(source), center = bounds.getCenter(new T.Vector3()), height = bounds.max.y - bounds.min.y;
  source.position.set(-center.x, -bounds.min.y, -center.z);
  const set = new T.Group(), owner = new T.Group();
  set.add(source);
  set.scale.setScalar(.9 / height);
  set.position.set(23, .1, -26);
  set.rotation.y = Math.PI / 2;
  owner.add(set);
  collectCafeSeats(set, owner, 'cafe');
  const seats = owner.userData.seats;
  expect(seats).toHaveLength(2);
  for (const seat of seats) {
    expect(seat.floor).toBeCloseTo(.1, 3);
    expect(Math.hypot(seat.x - 23, seat.z + 26)).toBeLessThan(1.2);
  }
  expect(Math.cos(seats[0].heading - seats[1].heading)).toBeLessThan(-.8);
});
