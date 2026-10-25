import * as T from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { pedestrianSpecs, createPedestrianMotion, type PedestrianSpec } from './pedestrian-motion';
import type { DistrictId } from './layout';
import type { SeatAnchor } from './staging';
import { CityResources } from './assets';
const people = ['sam', 'harper', 'maya'] as const;
type Person = typeof people[number];
const heights = { sam: 1.7743, harper: 1.6710, maya: 1.6683 };
/** Independent skeletons and animation clocks share geometry/textures and a small clothing palette. */
export async function createCityPedestrians(scene: T.Scene, r: CityResources, signal: AbortSignal) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const loaded = await Promise.allSettled(people.map(name => loader.loadAsync('/city/people/' + name + '.glb')));
  for (const result of loaded)
    if (result.status === 'fulfilled')
      r.track(result.value.scene);
  if (signal.aborted || loaded.some(x => x.status === 'rejected'))
    throw Error('City people unavailable');
  const assets = Object.fromEntries(people.map((p, i) => [p, (loaded[i] as PromiseFulfilledResult<GLTF>).value])) as Record<Person, GLTF>;
  const variations = new Map<string, T.Material>(), clothing = ['#53645d', '#333e4a', '#63574e', '#39494c'];
  function clothes(source: T.Material, index: number) {
    const key = source.uuid + '/' + index % 4;
    let m = variations.get(key);
    if (m)
      return m;
    m = r.material(source.clone());
    if (m instanceof T.MeshStandardMaterial) {
      if (source.name.includes('original top'))
        m.color.set(clothing[index % 4]);
      else if (source.name.includes('tailored business'))
        m.color.multiply(new T.Color(['#ffffff', '#aabac6', '#d2bbab', '#b6bca9'][index % 4]));
      if (source.name.endsWith('.body'))
        m.roughness = .58;
      if (source.name.includes('tailored business'))
        m.roughness = .84;
      if (source.name.startsWith('Harper') && source.name.endsWith('.short01'))
        m.color.multiply(new T.Color(['#ffffff', '#83746b', '#c6baa3', '#50545a'][index % 4]));
      m.envMapIntensity = .4;
    }
    variations.set(key, m);
    return m;
  }
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const c = cv.getContext('2d')!, g = c.createRadialGradient(32, 32, 1, 32, 32, 32);
  g.addColorStop(0, '#000a');
  g.addColorStop(1, '#0000');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
  const opacity = new T.InstancedBufferAttribute(new Float32Array(192), 1), shadowGeo = r.geometry(new T.PlaneGeometry(1, 1));
  shadowGeo.setAttribute('aOpacity', opacity);
  const shadowMat = r.material(new T.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uMap: { value: r.texture(new T.CanvasTexture(cv)) } }, vertexShader: 'attribute float aOpacity;varying vec2 vUv;varying float vAlpha;void main(){vUv=uv;vAlpha=aOpacity;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}', fragmentShader: 'uniform sampler2D uMap;varying vec2 vUv;varying float vAlpha;void main(){gl_FragColor=vec4(0.,0.,0.,texture2D(uMap,vUv).a*vAlpha);}' }));
  const contactShadows = new T.InstancedMesh(shadowGeo, shadowMat, 192);
  contactShadows.instanceMatrix.setUsage(T.DynamicDrawUsage);
  contactShadows.userData.dynamic = true;
  contactShadows.frustumCulled = false;
  contactShadows.count = 0;
  scene.add(contactShadows);
  const shadowTransform = new T.Object3D(), footPosition = new T.Vector3();
  shadowTransform.rotation.x = -Math.PI / 2;
  const actors: ReturnType<typeof makeActor>[] = [];
  function makeActor(spec: PedestrianSpec, index: number, seat?: SeatAnchor, indoor = false) {
    const person: Person = seat && indoor && index % 3 === 0 ? 'maya' : index % 2 === 0 ? 'sam' : 'harper', asset = assets[person], root = new T.Group(), body = clone(asset.scene) as T.Group, motion = createPedestrianMotion(spec);
    root.name = spec.id;
    root.userData.dynamic = true;
    root.add(body);
    const scale = seat ? 1 : spec.height / heights[person];
    root.scale.setScalar(scale);
    const floor = seat?.floor ?? (indoor ? .23 : .1);
    root.position.set(motion.state.position.x, floor - .002014 * scale, motion.state.position.z);
    root.rotation.y = motion.state.heading;
    body.traverse(o => {
      o.userData.dynamic = true;
      if (o instanceof T.Mesh) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        o.material = mats.map(m => clothes(m, index));
        if (o.material.length === 1)
          o.material = o.material[0];
        o.castShadow = false;
        o.receiveShadow = true;
        o.frustumCulled = false;
      }
    });
    scene.add(root);
    const mixer = new T.AnimationMixer(body), idle = mixer.clipAction(asset.animations.find(a => a.name === 'Idle_Standing')!), walk = mixer.clipAction(asset.animations.find(a => a.name === 'Walk_Relaxed')!), sitting = mixer.clipAction(asset.animations.find(a => a.name === 'Sit_Stand')!);
    for (const action of [idle, walk, sitting]) {
      action.play();
      action.paused = true;
    }
    idle.weight = seat ? 0 : 1;
    walk.weight = 0;
    sitting.weight = seat ? 1 : 0;
    sitting.time = 3;
    idle.time = spec.offset * 6;
    mixer.update(0);
    return { spec, person, root, body, motion, mixer, idle, walk, sitting, seat, floor, elapsed: 0, idleClock: spec.offset * 6, walkClock: spec.offset * 2, lastDistance: motion.state.distance, blend: 0, head: body.getObjectByName('head'), chest: body.getObjectByName('spine_03'), feet: [body.getObjectByName('foot_l')!, body.getObjectByName('foot_r')!] };
  }
  const forward = new T.Vector3(), toward = new T.Vector3();
  return {
    addDistrict(id: DistrictId, seats: SeatAnchor[] = []) {
      for (const spec of pedestrianSpecs.filter(p => p.district === id))
        if (!actors.some(a => a.spec.id === spec.id))
          actors.push(makeActor(spec, actors.length));
      for (const [i, seat] of seats.entries()) {
        const indoor = seat.floor > .17, spec: PedestrianSpec = { id: `${id}-patron-${i}`, district: id, path: [[seat.x, seat.z]], speed: 0, offset: ((i * 7) % 13) / 13, height: 1.72, wait: 0, heading: seat.heading };
        if (!actors.some(a => a.spec.id === spec.id))
          actors.push(makeActor(spec, actors.length, seat, indoor));
      }
      const indoorSpecs: Partial<Record<DistrictId, readonly [
        number,
        number,
        number
      ][]>> = { a: [[-6.85, -10.7, -Math.PI / 2], [10.7, -10.5, -Math.PI / 2], [8.9, 5.5, -Math.PI / 2]], b: [[46.3, -22.5, Math.PI], [41.9, -39.1, 0]], c: [[67.2, -55, Math.PI / 2]] };
      for (const [i, p] of (indoorSpecs[id] ?? []).entries()) {
        const spec: PedestrianSpec = { id: `${id}-inside-${i}`, district: id, path: [[p[0], p[1]]], speed: 0, offset: .17 + i * .23, height: i % 2 ? 1.69 : 1.8, heading: p[2], wait: 0 };
        if (!actors.some(a => a.spec.id === spec.id))
          actors.push(makeActor(spec, actors.length, undefined, true));
      }
    },
    update(dt: number, camera: T.Camera, paused: boolean) {
      camera.getWorldDirection(forward);
      for (const a of actors) {
        let blocked = false;
        const s = a.motion.state;
        if (a.spec.speed)
          for (const b of actors) {
            if (a === b || b.floor > .17)
              continue;
            const dx = b.root.position.x - a.root.position.x, dz = b.root.position.z - a.root.position.z, d = Math.hypot(dx, dz);
            if (d < .75 && (Math.sin(s.heading) * dx + Math.cos(s.heading) * dz) / Math.max(.01, d) > .55) {
              blocked = true;
              break;
            }
          }
        const state = paused ? a.motion.state : a.motion.update(dt, blocked), distance = state.distance;
        a.walkClock += Math.abs(distance - a.lastDistance) / (1.3 * a.root.scale.x);
        a.lastDistance = distance;
        if (!paused)
          a.idleClock += dt * (.85 + a.spec.offset * .24);
        a.root.position.x = state.position.x;
        a.root.position.z = state.position.z;
        a.root.rotation.y = state.heading;
        const floor = a.spec.id === 'b-entry' ? .1 + .13 * T.MathUtils.smoothstep(-state.position.z, 36.6, 37.1) : a.floor;
        a.root.position.y = floor - .002014 * a.root.scale.x;
        const d = a.root.position.distanceTo(camera.position);
        toward.copy(a.root.position).sub(camera.position);
        const visible = d < 65 && (toward.dot(forward) > -1.5 || d < 4);
        a.root.visible = visible;
        if (!paused)
          a.elapsed += dt;
        a.blend = T.MathUtils.damp(a.blend, T.MathUtils.smoothstep(state.velocity, .025, .22), 7, dt);
        if (!paused && visible && a.elapsed >= (d < 16 ? 1 / 60 : d < 32 ? 1 / 30 : 1 / 12)) {
          a.idle.time = a.idleClock % 6;
          a.walk.time = a.walkClock % 2;
          a.walk.weight = a.seat ? 0 : a.blend;
          a.idle.weight = a.seat ? 0 : 1 - a.blend;
          a.mixer.update(0);
          // Tiny conversational gaze/breathing stays secondary to the authored poses.
          if (a.head && state.velocity < .04)
            a.head.rotateY(Math.sin(a.idleClock * .65) * .035);
          if (a.chest && a.seat)
            a.chest.rotateX(Math.sin(a.idleClock * 1.3) * .006);
          a.elapsed = 0;
        }
        const slot = actors.indexOf(a) * 3;
        for (let j = 0; j < 3; j++) {
          if (j) {
            a.feet[j - 1].getWorldPosition(footPosition);
            shadowTransform.position.set(footPosition.x, floor + .006, footPosition.z);
            shadowTransform.scale.set(.27, .45, 1);
            opacity.setX(slot + j, visible ? .8 * (1 - T.MathUtils.smoothstep(footPosition.y - floor, .1, .2)) : 0);
          }
          else {
            shadowTransform.position.set(a.root.position.x, floor + .006, a.root.position.z);
            shadowTransform.scale.set(.75, .62, 1);
            opacity.setX(slot, visible ? .35 : 0);
          }
          shadowTransform.updateMatrix();
          contactShadows.setMatrixAt(slot + j, shadowTransform.matrix);
        }
      }
      contactShadows.count = actors.length * 3;
      contactShadows.instanceMatrix.needsUpdate = true;
      opacity.needsUpdate = true;
    },
    count() {
      return actors.length;
    },
    signature() {
      const a = actors.find(a => a.spec.speed > 0 && a.root.visible);
      return a ? a.feet[0].quaternion.toArray().map(n => n.toFixed(4)).join(',') : '';
    },
    positions() {
      return actors.map(a => ({ id: a.spec.id, x: a.root.position.x, z: a.root.position.z }));
    },
    dispose() {
      for (const a of actors) {
        a.mixer.stopAllAction();
        a.mixer.uncacheRoot(a.body);
        const skeletons = new Set<T.Skeleton>();
        a.body.traverse(o => {
          if (o instanceof T.SkinnedMesh)
            skeletons.add(o.skeleton);
        });
        skeletons.forEach(s => s.dispose());
        a.root.removeFromParent();
      }
      actors.length = 0;
      contactShadows.removeFromParent();
      contactShadows.dispose();
    }
  };
}
