import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { CityResources, loadCityAssets, loadNightlifeAssets, type CityAssets } from './assets';
import { buildCityEnvironment } from './environment';
import { createCityKit, createCityKitCache } from './building-kit';
import { createCitySnow } from './effects';
import { createCitySteam } from './atmosphere';
import { createCityDirector, type CityFrame } from './camera';
import { districts, districtAt, landmarks, type LandmarkId, type DistrictId } from './layout';
import { createCityLighting } from './lighting';
import { createCityPedestrians } from './pedestrians';
export type CityScene = {
  setProgress(p: number): void;
  setPointer(x: number, y: number, active?: boolean): void;
  setPaused(v: boolean): void;
  setStorefront(active: boolean): void;
  dispose(): void;
};
export async function createCityScene(canvas: HTMLCanvasElement, signal: AbortSignal, onFrame: (frame: CityFrame) => void, onFailure: () => void, initial = 0): Promise<CityScene> {
  const initializationStarted = performance.now();
  const mobile = matchMedia('(max-width:899px), (pointer:coarse)').matches;
  const renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.info.autoReset = false;
  const r = new CityResources(), scene = new T.Scene(), camera = new T.PerspectiveCamera(54, 1, .1, 145), director = createCityDirector(0), cache = createCityKitCache();
  scene.background = new T.Color('#091626');
  scene.fog = new T.FogExp2('#142333', .022);
  const lights = createCityLighting(scene, mobile), chunks = new Map<DistrictId, T.Group>(), signs: T.Group[] = [], fixtures = new Map<LandmarkId, T.Light>();
  const landmarkBoxes = landmarks.map(l => new T.Box3(new T.Vector3(l.box[0], .2, l.box[2]), new T.Vector3(l.box[1], 3.5, l.box[3])));
  let disposed = false, initialized = false, raf = 0, previous = 0, time = 0, paused = false, dirty = true, width = 1, height = 1, dpr = Math.min(devicePixelRatio, mobile ? 1.15 : 1.5), forceHover = false, pointerInside = false, lastHover = false;
  let composer: EffectComposer | undefined, bloom: UnrealBloomPass | undefined, output: OutputPass | undefined, antialiasing: SMAAPass | undefined, environment: T.WebGLRenderTarget | undefined;
  let pedestrians: Awaited<ReturnType<typeof createCityPedestrians>> | undefined, assets: CityAssets, set: ReturnType<typeof buildCityEnvironment>, snow: ReturnType<typeof createCitySnow>;
  const steam = createCitySteam(scene, r, mobile);
  let loaded = 0, wanted = 0, loading = false, available = .278, requested = initial, lastDistrict: DistrictId = 'a';
  const pointer = new T.Vector2(), ray = new T.Raycaster(), cursor = new T.Vector3(), intersection = new T.Vector3();
  const moon = new T.DirectionalLight('#86b0ee', .85);
  moon.castShadow = true;
  moon.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(moon.shadow.camera, { left: -26, right: 26, top: 32, bottom: -32, near: .5, far: 90 });
  moon.shadow.normalBias = .025;
  moon.shadow.bias = -.0002;
  scene.add(moon, moon.target, new T.HemisphereLight('#729bd0', '#0b1727', .32));
  function aimMoon() {
    moon.target.position.set(Math.round(camera.position.x / 4) * 4, 0, Math.round(camera.position.z / 4) * 4 - 8);
    moon.position.copy(moon.target.position).add(new T.Vector3(-12, 27, 20));
    moon.updateMatrixWorld();
    moon.target.updateMatrixWorld();
    moon.shadow.needsUpdate = true;
    renderer.shadowMap.needsUpdate = true;
  }
  function dispose() {
    if (disposed)
      return;
    disposed = true;
    cancelAnimationFrame(raf);
    removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibility);
    canvas.removeEventListener('webglcontextlost', lost);
    pedestrians?.dispose();
    scene.traverse(o => {
      if (o instanceof T.InstancedMesh)
        o.dispose();
      if (o instanceof T.DirectionalLight || o instanceof T.SpotLight || o instanceof T.PointLight)
        o.shadow.dispose();
    });
    bloom?.dispose();
    output?.dispose();
    antialiasing?.dispose();
    composer?.dispose();
    environment?.dispose();
    r.dispose();
    renderer.dispose();
    scene.clear();
  }
  const abort = () => dispose();
  signal.addEventListener('abort', abort, { once: true });
  function lost(e: Event) {
    e.preventDefault();
    dispose();
    signal.removeEventListener('abort', abort);
    onFailure();
  }
  function wake() {
    if (initialized && !disposed && !raf && !document.hidden)
      raf = requestAnimationFrame(tick);
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
    }
    else
      wake();
  }
  function resize() {
    width = canvas.clientWidth || innerWidth;
    height = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    composer?.setPixelRatio(dpr);
    composer?.setSize(width, height);
    bloom?.setSize(Math.ceil(width * dpr * (mobile ? .3 : .45)), Math.ceil(height * dpr * (mobile ? .3 : .45)));
    dirty = true;
    wake();
  }
  function freeze(root: T.Object3D) {
    root.updateMatrixWorld(true);
    root.traverse(o => {
      if (!o.userData.dynamic && !(o instanceof T.Light) && !(o instanceof T.Bone)) {
        o.updateMatrix();
        o.matrixAutoUpdate = false;
      }
    });
  }
  async function yieldFrame() {
    // Leave a presentation interval between background batches/uploads. Resolving every
    // scheduler task immediately can saturate the driver with uploads before it presents.
    await new Promise<void>(resolve => setTimeout(resolve, 16));
    if (signal.aborted || disposed)
      throw Error('Aborted');
  }
  async function stream() {
    if (loading || disposed || loaded >= wanted)
      return;
    loading = true;
    try {
      const { buildDistrict } = await import('./districts');
      while (loaded < wanted && !disposed) {
        const index = loaded + 1, id = districts[index].id as Exclude<DistrictId, 'a'>, root = new T.Group();
        root.name = 'district-' + id;
        root.visible = false;
        scene.add(root);
        const priorTextures = new Set(r.textures);
        if(id==='b')await loadNightlifeAssets(assets,r,signal);
        const details = await buildDistrict(id, root, assets, r, cache, yieldFrame);
        if (disposed)
          throw Error('Aborted');
        lights.register(root);
        signs.push(...details.signs);
        for (const [key, value] of Object.entries(details.fixtures))
          if (value)
            fixtures.set(key as LandmarkId, value);
        freeze(root);
        for (const texture of r.textures)
          if (!priorTextures.has(texture)) {
            renderer.initTexture(texture);
            await yieldFrame();
          }
        await renderer.compileAsync(root, camera, scene);
        if (disposed)
          throw Error('Aborted');
        root.visible = true;
        chunks.set(id, root);
        pedestrians?.addDistrict(id, root.userData.seats);
        loaded = index;
        available = index === 3 ? 1 : districts[index].end - .002;
        director.setAvailableProgress(available);
        canvas.dataset.loaded = String(loaded + 1);
        dirty = true;
        wake();
      }
    }
    catch (error) {
      if (!disposed) {
        console.error('City district unavailable', error);
        lost(new Event('webglcontextlost'));
      }
      else
        r.dispose();
    }
    finally {
      loading = false;
    }
  }
  function preload(p: number) {
    const next = p >= .67 ? 3 : p >= .36 ? 2 : p >= .12 ? 1 : 0;
    wanted = Math.max(wanted, next, districts.findIndex(d => d.id === districtAt(requested).id));
    void stream();
  }
  try {
    const results = await Promise.allSettled([loadCityAssets(r, signal), createCityPedestrians(scene, r, signal)]);
    if (signal.aborted || results.some(x => x.status === 'rejected'))
      throw Error('City assets unavailable');
    assets = (results[0] as PromiseFulfilledResult<CityAssets>).value;
    pedestrians = (results[1] as PromiseFulfilledResult<Awaited<ReturnType<typeof createCityPedestrians>>>).value;
    canvas.dataset.assetLoadMs = (performance.now() - initializationStarted).toFixed(1);
    const preparationStarted = performance.now();
    const pmrem = new T.PMREMGenerator(renderer);
    environment = pmrem.fromEquirectangular(assets.hdr);
    pmrem.dispose();
    assets.hdr.dispose();
    r.textures.delete(assets.hdr);
    scene.environment = environment.texture;
    scene.environmentIntensity = .17;
    const groundKit = createCityKit(new T.Group(), assets, r, cache);
    for (const map of [groundKit.road.map, groundKit.road.normalMap, groundKit.road.roughnessMap, groundKit.road.aoMap])
      map?.repeat.set(130, 120);
    groundKit.plane(scene, 260, 240, groundKit.road, 20, -.08, -60, new T.Euler(-Math.PI / 2, 0, 0));
    const arrival = new T.Group();
    arrival.name = 'district-a';
    scene.add(arrival);
    set = buildCityEnvironment(arrival, assets, r, cache);
    chunks.set('a', arrival);
    lights.register(arrival);
    signs.push(set.sign);
    fixtures.set('late-edition', set.bookLight);
    snow = createCitySnow(scene, r, mobile);
    freeze(arrival);
    pedestrians.addDistrict('a', arrival.userData.seats);
    composer = new EffectComposer(renderer, new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: 0 }));
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new T.Vector2(512, 512), .2, .5, 1.6);
    composer.addPass(bloom);
    // Three r186 SMAA consumes linear-sRGB; the output pass performs the one final display transform.
    antialiasing = new SMAAPass();
    composer.addPass(antialiasing);
    output = new OutputPass();
    composer.addPass(output);
    director.setAvailableProgress(available);
    director.setTarget(initial);
    resize();
    const first = director.update(0);
    camera.position.copy(first.position);
    camera.quaternion.copy(first.quaternion);
    camera.updateMatrixWorld();
    aimMoon();
    lights.update(0, camera, true);
    canvas.dataset.preparationMs = (performance.now() - preparationStarted).toFixed(1);
    const compileStarted = performance.now();
    await renderer.compileAsync(scene, camera);
    canvas.dataset.compileMs = (performance.now() - compileStarted).toFixed(1);
    if (signal.aborted)
      throw Error('Aborted');
    canvas.dataset.loaded = '1';
  }
  catch (error) {
    disposed = false;
    dispose();
    signal.removeEventListener('abort', abort);
    throw error;
  }
  let lastFov = 0, lastStats = 0, frames = 0, totalFrames = 0, slowTime = 0;
  function tick(stamp: number) {
    raf = 0;
    if (disposed || document.hidden)
      return;
    const elapsed = previous ? (stamp - previous) / 1000 : 1 / 60, dt = Math.min(.1, elapsed);
    previous = stamp;
    const state = director.update(dt, !paused);
    if (!paused)
      time += dt;
    preload(state.progress);
    if (dirty || state.moving || !paused || !lights.freezeSettled()) {
      camera.position.copy(state.position);
      camera.quaternion.copy(state.quaternion);
      if (Math.abs(lastFov - state.fov) > .0001) {
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
        lastFov = state.fov;
      }
      camera.updateMatrixWorld();
      const district = districtAt(state.progress);
      if (lastDistrict !== district.id || Math.hypot(camera.position.x - moon.target.position.x, camera.position.z - moon.target.position.z - 8) > 18) {
        lastDistrict = district.id;
        aimMoon();
      }
      for (const [id, root] of chunks) {
        const bounds = districts.find(d => d.id === id)!.bounds, dx = Math.max(bounds[0] - camera.position.x, 0, camera.position.x - bounds[1]), dz = Math.max(bounds[2] - camera.position.z, 0, camera.position.z - bounds[3]);
        root.visible = Math.hypot(dx, dz) < 100;
      }
      const landmarkIndex = landmarks.findIndex(l => state.progress >= l.from && state.progress <= l.to), landmark = landmarks[landmarkIndex];
      ray.setFromCamera(pointer, camera);
      const hit = landmark && pointerInside && ray.ray.intersectBox(landmarkBoxes[landmarkIndex], intersection), hover = !!landmark && (forceHover || !!hit);
      if (hover !== lastHover) {
        lastHover = hover;
        director.setHover(hover);
      }
      cursor.copy(ray.ray.direction).multiplyScalar(8).add(camera.position);
      snow.uCursor.value.copy(cursor);
      snow.uWind.value.set(state.cursor.x, -state.cursor.y);
      snow.uTime.value = time;
      steam.uTime.value = time;
      steam.uLoaded.value = loaded;
      steam.uScale.value = height * dpr;
      snow.uPixelRatio.value = dpr;
      snow.uCamera.value.copy(camera.position);
      snow.uQuiet.value = T.MathUtils.smoothstep(state.progress, .79, .94);
      for (let i = 0; i < signs.length; i++) {
        const sign = signs[i], distance = sign.position.distanceTo(camera.position);
        sign.rotation.z = (Math.sin(time * .72 + i * 1.7) * .012 + (distance < 16 ? state.signAngle * .6 : 0));
      }
      for (const [id, light] of fixtures) {
        if (light.userData.base === undefined)
          light.userData.base = light.intensity;
        light.intensity = light.userData.base * (1 + (landmark?.id === id ? state.hover * .38 : 0));
      }
      set.doorLight.intensity = 22 + (landmark?.id === 'late-edition' ? state.hover * 6 : 0);
      lights.update(dt, camera, false, time);
      pedestrians?.update(dt, camera, paused);
      renderer.info.reset();
      const start = performance.now();
      composer!.render(dt);
      const renderMs = performance.now() - start;
      dirty = false;
      frames++;
      totalFrames++;
      Object.assign(canvas.dataset, { progress: state.progress.toFixed(5), shot: state.shot.id, district: district.id, position: state.position.toArray().map(n => n.toFixed(4)).join(','), quaternion: state.quaternion.toArray().map(n => n.toFixed(6)).join(','), hover: state.hover.toFixed(3), sign: state.signAngle.toFixed(5), frames: String(totalFrames), landmark: landmark?.id ?? '', waiting: String(requested > available && state.progress > available - .002) });
      if (stamp - lastStats > 1000) {
        Object.assign(canvas.dataset, { calls: String(renderer.info.render.calls), triangles: String(renderer.info.render.triangles), textures: String(renderer.info.memory.textures), geometries: String(renderer.info.memory.geometries), fps: ((frames * 1000) / (stamp - lastStats)).toFixed(1), dpr: dpr.toFixed(2), cpuRenderMs: renderMs.toFixed(2), peoplePose: pedestrians?.signature(), pedestrians: String(pedestrians?.count()), lights: String(lights.count + 2) });
        lastStats = stamp;
        frames = 0;
      }
      onFrame(state);
      if (elapsed > .036 && !paused)
        slowTime += Math.min(elapsed, .2);
      else
        slowTime = Math.max(0, slowTime - dt);
      if (slowTime > 3 && dpr > 1) {
        dpr = Math.max(1, dpr - .25);
        slowTime = 0;
        resize();
      }
    }
    if (!paused || state.moving || loading || !lights.freezeSettled())
      wake();
  }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibility);
  canvas.addEventListener('webglcontextlost', lost);
  initialized = true;
  wake();
  return { setProgress(p) {
      requested = T.MathUtils.clamp(p, 0, 1);
      director.setTarget(requested);
      preload(director.frame.progress);
      dirty = true;
      wake();
    }, setPointer(x, y, active = true) {
      pointerInside = active;
      pointer.set(x, -y);
      director.setPointer(x, y);
      wake();
    }, setPaused(v) {
      paused = v;
      dirty = true;
      wake();
    }, setStorefront(v) {
      forceHover = v;
      director.setHover(v);
      dirty = true;
      wake();
    }, dispose() {
      signal.removeEventListener('abort', abort);
      dispose();
    } };
}
