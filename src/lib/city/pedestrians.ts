import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { prepareWalkerModel, createWalkerRig, type IdlePose } from '../walker-rig';
import { pedestrianSpecs, createPedestrianMotion } from './pedestrian-motion';
import type { DistrictId } from './layout';
import { CityResources } from './assets';
export async function createCityPedestrians(scene: T.Scene, r: CityResources, signal: AbortSignal) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const results = await Promise.allSettled([loader.loadAsync('/city/pedestrian.glb'), new T.TextureLoader().loadAsync('/models/courier/skin.png'), fetch('/models/courier/idle-pose.json', { signal }).then(x => {
      if (!x.ok)
        throw Error('Pose unavailable');
      return x.json() as Promise<IdlePose>;
    })]);
  const asset = results[0], texture = results[1];
  if (asset.status === 'fulfilled')
    r.track(asset.value.scene);
  if (texture.status === 'fulfilled')
    r.texture(texture.value);
  if (signal.aborted || results.some(x => x.status === 'rejected'))
    throw Error('Pedestrian unavailable');
  const model = (asset as PromiseFulfilledResult<Awaited<ReturnType<GLTFLoader['loadAsync']>>>).value.scene, skin = (texture as PromiseFulfilledResult<T.Texture>).value, pose = (results[2] as PromiseFulfilledResult<IdlePose>).value;
  skin.colorSpace = T.SRGBColorSpace;
  skin.flipY = true;
  prepareWalkerModel(model, pose);
  const coats = ['#3e5057', '#605848', '#3d4a40'].map(color => {
    const m = r.material(new T.MeshStandardMaterial({ map: skin, roughness: .92, envMapIntensity: .2 }));
    m.onBeforeCompile = shader => {
      shader.uniforms.coatTint = { value: new T.Color(color) };
      shader.fragmentShader = 'uniform vec3 coatTint;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
 // Atlas regions: retain the face/hands; tone down the source sportswear for a winter night.
 if(vMapUv.x<.624 && vMapUv.y<.522){float fabric=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=coatTint*(.55+fabric*.8);}
 if(vMapUv.x>.624 && vMapUv.x<.805 && vMapUv.y>.48 && vMapUv.y<.87){float shoe=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=vec3(.16,.19,.20)*(.5+shoe);}
 `);
    };
    m.customProgramCacheKey = () => 'city-winter-clothing';
    return m;
  });
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const c = cv.getContext('2d')!, g = c.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, '#0008');
  g.addColorStop(1, '#0000');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
  const shadowMat = r.material(new T.MeshBasicMaterial({ map: r.texture(new T.CanvasTexture(cv)), transparent: true, depthWrite: false })), shadowGeo = r.geometry(new T.PlaneGeometry(.85, .6));
  const actors: ReturnType<typeof makeActor>[] = [];
  function makeActor(spec: typeof pedestrianSpecs[number], i: number) {
    const motion = createPedestrianMotion(spec), root = new T.Group(), body = clone(model) as T.Group;
    root.add(body);
    root.scale.setScalar(spec.height / 1.92);
    root.position.set(motion.state.position.x, .1 - .025 * root.scale.x, motion.state.position.z);
    root.rotation.y = motion.state.heading;
    root.traverse(o => {
      o.userData.dynamic = true;
      if (o instanceof T.Mesh) {
        o.material = coats[i % coats.length];
        o.castShadow = false;
        o.receiveShadow = true;
      }
    });
    scene.add(root);
    root.updateMatrixWorld(true);
    const rig = createWalkerRig(body, root), shadow = new T.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(root.position.x, .106, root.position.z);
    shadow.userData.dynamic = true;
    scene.add(shadow);
    return { spec, motion, root, body, rig, shadow, elapsed: 0, visible: false };
  }
  const cameraDirection = new T.Vector3(), toward = new T.Vector3();
  return {
    addDistrict(id: DistrictId) {
      for (const spec of pedestrianSpecs.filter(p => p.district === id)) {
        if (!actors.some(a => a.spec.id === spec.id))
          actors.push(makeActor(spec, actors.length));
      }
    },
    update(dt: number, camera: T.Camera, paused: boolean) {
      if (paused)
        return;
      camera.getWorldDirection(cameraDirection);
      for (const a of actors) {
        let blocked = false;
        const s = a.motion.state;
        for (const b of actors) {
          if (a === b)
            continue;
          const dx = b.root.position.x - a.root.position.x, dz = b.root.position.z - a.root.position.z, d = Math.hypot(dx, dz);
          if (d < .85 && (Math.sin(s.heading) * dx + Math.cos(s.heading) * dz) / Math.max(.01, d) > .45) {
            blocked = true;
            break;
          }
        }
        const motion = a.motion.update(dt, blocked);
        a.root.position.x = motion.position.x;
        a.root.position.z = motion.position.z;
        a.root.position.y = .1 + (a.spec.id === 'b-entry' ? .13 * T.MathUtils.smoothstep(-motion.position.z, 36.6, 37.1) : 0) - .025 * a.root.scale.x;
        a.root.rotation.y = motion.heading;
        a.shadow.position.x = motion.position.x;
        a.shadow.position.z = motion.position.z;
        const distance = a.root.position.distanceTo(camera.position);
        toward.copy(a.root.position).sub(camera.position);
        const visible = distance < 80 && (toward.dot(cameraDirection) > -2 || distance < 5);
        a.root.visible = a.shadow.visible = visible;
        a.elapsed += dt;
        if (visible) {
          if (!a.visible)
            for (const foot of a.rig.feet)
              foot.initialized = false;
          const frequency = distance < 12 ? 60 : distance < 30 ? 30 : 12;
          if (a.elapsed >= 1 / frequency) {
            a.rig.update(Math.min(a.elapsed, .1), motion, false);
            a.elapsed = 0;
          }
        }
        a.visible = visible;
      }
    },
    count() {
      return actors.length;
    },
    positions() {
      return actors.map(a => ({ id: a.spec.id, x: a.root.position.x, z: a.root.position.z }));
    },
    dispose() {
      for (const a of actors) {
        a.root.traverse(o => {
          if (o instanceof T.SkinnedMesh)
            o.skeleton.dispose();
        });
        a.root.removeFromParent();
        a.shadow.removeFromParent();
      }
      actors.length = 0;
    }
  };
}
