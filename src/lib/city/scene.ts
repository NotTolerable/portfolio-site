import * as T from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { CityResources, loadCityAssets } from "./assets";
import { buildCityEnvironment } from "./environment";
import { createCitySnow } from "./effects";
import { createCityDirector, type CityFrame } from "./camera";

export type CityScene = {
  setProgress(p: number): void;
  setPointer(x: number, y: number, active?: boolean): void;
  setPaused(v: boolean): void;
  setStorefront(active: boolean): void;
  dispose(): void;
};
export async function createCityScene(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onFrame: (frame: CityFrame) => void,
  onFailure: () => void,
  initial = 0,
): Promise<CityScene> {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.info.autoReset = false;
  const r = new CityResources(),
    scene = new T.Scene(),
    camera = new T.PerspectiveCamera(54, 1, 0.1, 150),
    director = createCityDirector(initial);
  scene.background = new T.Color("#091626");
  scene.fog = new T.FogExp2("#142333", 0.022);
  let disposed = false,
    initialized = false,
    raf = 0,
    previous = 0,
    time = 0,
    paused = false,
    dirty = true,
    width = 1,
    height = 1,
    dpr = Math.min(devicePixelRatio, 1.5),
    forceHover = false,
    pointerInside = false,
    lastHover = false;
  let composer: EffectComposer | undefined,
    bloom: UnrealBloomPass | undefined,
    output: OutputPass | undefined,
    antialiasing: SMAAPass | undefined,
    environment: T.WebGLRenderTarget | undefined;
  const pointer = new T.Vector2(),
    ray = new T.Raycaster(),
    cursor = new T.Vector3(),
    intersection = new T.Vector3();
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", lost);
    scene.traverse((o) => {
      if (o instanceof T.InstancedMesh) o.dispose();
      if (
        o instanceof T.DirectionalLight ||
        o instanceof T.SpotLight ||
        o instanceof T.PointLight
      )
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
  signal.addEventListener("abort", abort, { once: true });
  function lost(e: Event) {
    e.preventDefault();
    dispose();
    signal.removeEventListener("abort", abort);
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
    } else wake();
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
    bloom?.setSize(
      Math.ceil(width * dpr * 0.45),
      Math.ceil(height * dpr * 0.45),
    );
    dirty = true;
    wake();
  }
  let set: ReturnType<typeof buildCityEnvironment>;
  let snow: ReturnType<typeof createCitySnow>;
  try {
    const assets = await loadCityAssets(r, signal);
    if (signal.aborted) throw Error("Aborted");
    const pmrem = new T.PMREMGenerator(renderer);
    environment = pmrem.fromEquirectangular(assets.hdr);
    pmrem.dispose();
    assets.hdr.dispose();
    r.textures.delete(assets.hdr);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.08;
    set = buildCityEnvironment(scene, assets, r);
    snow = createCitySnow(scene, r);
    scene.add(new T.HemisphereLight("#729bd0", "#0b1727", 0.22));
    const moon = new T.DirectionalLight("#86b0ee", 0.72);
    moon.position.set(-12, 27, 8);
    moon.target.position.set(0, 0, -12);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    Object.assign(moon.shadow.camera, {
      left: -23,
      right: 24,
      top: 30,
      bottom: -30,
      near: 0.5,
      far: 85,
    });
    moon.shadow.normalBias = 0.025;
    moon.shadow.bias = -0.0002;
    scene.add(moon, moon.target);
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      if (o !== scene && o !== set.sign) {
        o.updateMatrix();
        o.matrixAutoUpdate = false;
      }
    });
    const target = new T.WebGLRenderTarget(1, 1, {
      type: T.HalfFloatType,
      samples: 0,
    });
    composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new T.Vector2(512, 512), 0.14, 0.5, 1.8);
    composer.addPass(bloom);
    // r186 SMAA operates in linear-sRGB, before the final tone/color output pass.
    antialiasing = new SMAAPass();
    composer.addPass(antialiasing);
    output = new OutputPass();
    composer.addPass(output);
    resize();
    const first = director.update(0);
    camera.position.copy(first.position);
    camera.quaternion.copy(first.quaternion);
    camera.updateMatrixWorld();
    await renderer.compileAsync(scene, camera);
    if (signal.aborted) throw Error("Aborted");
    renderer.shadowMap.needsUpdate = true;
  } catch (error) {
    disposed = false;
    dispose();
    signal.removeEventListener("abort", abort);
    throw error;
  }
  let lastFov = 0,
    lastStats = 0,
    frames = 0,
    totalFrames = 0,
    slowTime = 0;
  function tick(stamp: number) {
    raf = 0;
    if (disposed || document.hidden) return;
    const elapsed = previous ? (stamp - previous) / 1000 : 1 / 60,
      dt = Math.min(0.1, elapsed);
    previous = stamp;
    const state = director.update(dt, !paused);
    if (!paused) time += dt;
    if (dirty || state.moving || !paused) {
      camera.position.copy(state.position);
      camera.quaternion.copy(state.quaternion);
      if (Math.abs(lastFov - state.fov) > 0.0001) {
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
        lastFov = state.fov;
      }
      camera.updateMatrixWorld();
      ray.setFromCamera(pointer, camera);
      const hit =
        pointerInside && ray.ray.intersectBox(set.bookshopHit, intersection);
      const hover = forceHover || !!hit;
      if (hover !== lastHover) {
        lastHover = hover;
        director.setHover(hover);
        wake();
      }
      cursor.copy(ray.ray.direction).multiplyScalar(8).add(camera.position);
      snow.uCursor.value.copy(cursor);
      snow.uWind.value.set(state.cursor.x, -state.cursor.y);
      snow.uTime.value = time;
      snow.uPixelRatio.value = dpr;
      set.sign.rotation.z = state.signAngle;
      set.bookLight.intensity = 2.2 + state.hover * 0.85;
      set.doorLight.intensity = 22 + state.hover * 6;
      // Small, slow variation reads as occupied rooms, without random flicker.
      set.doorLight.color.setRGB(1, 0.68 + Math.sin(time * 0.35) * 0.012, 0.4);
      renderer.info.reset();
      const renderStarted = performance.now();
      composer!.render(dt);
      const renderMs = performance.now() - renderStarted;
      dirty = false;
      frames++;
      totalFrames++;
      canvas.dataset.progress = state.progress.toFixed(5);
      canvas.dataset.shot = state.shot.id;
      canvas.dataset.position = `${state.position.x.toFixed(4)},${state.position.y.toFixed(4)},${state.position.z.toFixed(4)}`;
      canvas.dataset.quaternion = state.quaternion
        .toArray()
        .map((n) => n.toFixed(6))
        .join(",");
      canvas.dataset.hover = state.hover.toFixed(3);
      canvas.dataset.sign = state.signAngle.toFixed(5);
      canvas.dataset.frames = String(totalFrames);
      if (stamp - lastStats > 1000) {
        canvas.dataset.calls = String(renderer.info.render.calls);
        canvas.dataset.triangles = String(renderer.info.render.triangles);
        canvas.dataset.textures = String(renderer.info.memory.textures);
        canvas.dataset.geometries = String(renderer.info.memory.geometries);
        canvas.dataset.fps = ((frames * 1000) / (stamp - lastStats)).toFixed(1);
        canvas.dataset.dpr = dpr.toFixed(2);
        canvas.dataset.cpuRenderMs = renderMs.toFixed(2);
        lastStats = stamp;
        frames = 0;
      }
      onFrame(state);
      // Preserve assets; reduce fill rate only after sustained slow rendering.
      if (elapsed > 0.036 && !paused) slowTime += Math.min(elapsed, 0.2);
      else slowTime = Math.max(0, slowTime - dt);
      if (slowTime > 3 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        slowTime = 0;
        resize();
      }
    }
    if (!paused || state.moving) wake();
  }
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", lost);
  initialized = true;
  wake();
  return {
    setProgress(p) {
      director.setTarget(p);
      dirty = true;
      wake();
    },
    setPointer(x, y, active = true) {
      pointerInside = active;
      pointer.set(x, -y);
      director.setPointer(x, y);
      wake();
    },
    setPaused(v) {
      paused = v;
      dirty = true;
      wake();
    },
    setStorefront(v) {
      forceHover = v;
      director.setHover(v);
      dirty = true;
      wake();
    },
    dispose() {
      signal.removeEventListener("abort", abort);
      dispose();
    },
  };
}
