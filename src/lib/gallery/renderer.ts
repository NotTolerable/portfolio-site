import * as T from "three";
import Lenis from "lenis";
import { gsap } from "gsap";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import {
  cameraTrack,
  exhibits,
  exhibitAt,
  sampleTrack,
  hotspotForProgress,
} from "./journey";
import {
  frostTextures,
  iceGeometry,
  randomSource,
} from "./art";
import { basketball, dumbbell } from "./sports";
import { loadGloveArt } from "./glove-art";
import { createParticleSport } from "./particle-sports";
import { createCursorField } from "./aurora";
import {
  AdaptiveGraphics,
  graphicsProfiles,
  type GraphicsMode,
  type GraphicsState,
} from "./quality";
import { createRuntimeCore } from "./runtime-core";
import { createGpuHologram } from "./gpu-hologram";
import { createBlackIceMaterial, iceContactUv } from "./black-ice";
import { createFrostField } from "./frost-field";
import { createTrianglePattern } from "./triangle-pattern";
import { createExhibitSignals } from "./signals";
import {
  skyVertex,
  skyFragment,
  snowVertex,
  snowFragment,
  gradeShader,
} from "./shaders";

export type GalleryElements = {
  canvas: HTMLCanvasElement;
  hotspots: HTMLElement[];
  onProgress: (progress: number) => void;
  onLoad: (progress: number) => void;
  onFailure: () => void;
  onQuality?: (state: GraphicsState) => void;
  onInteraction?: (energy: number) => void;
};
export async function createGallery(elements: GalleryElements) {
  const { canvas, hotspots } = elements;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = media.matches;
  const mobile = () => innerWidth < 700;
  const quality = new AdaptiveGraphics(mobile());
  try {
    const stored = localStorage.getItem("bp-gallery-graphics");
    if (stored === "high" || stored === "balanced" || stored === "performance")
      quality.select(stored);
  } catch {}
  let profile = graphicsProfiles[quality.tier];
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, mobile() ? profile.mobileDpr : profile.dpr),
  );
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.setClearColor(0x030910);
  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x071120, 0.012);
  const camera = new T.PerspectiveCamera(
    35,
    innerWidth / innerHeight,
    0.1,
    240,
  );
  const pmrem = new T.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  // Start alongside the HDR; the loader owns a missing-asset fallback.
  const gloveArtwork = loadGloveArt();
  let environment = pmrem.fromScene(room, 0.045);
  room.dispose();
  try {
    const hdr = await new HDRLoader().loadAsync("/gallery/studio.hdr");
    const pixels = hdr.image.data;
    // HDRLoader's half-float values must be decoded before applying the cool grade.
    if (pixels instanceof Uint16Array)
      for (let i = 0; i < pixels.length; i += 4) {
        const r = T.DataUtils.fromHalfFloat(pixels[i]),
          g = T.DataUtils.fromHalfFloat(pixels[i + 1]),
          b = T.DataUtils.fromHalfFloat(pixels[i + 2]);
        const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
        pixels[i] = T.DataUtils.toHalfFloat((r * 0.55 + l * 0.45) * 0.88);
        pixels[i + 1] = T.DataUtils.toHalfFloat((g * 0.55 + l * 0.45) * 0.97);
        pixels[i + 2] = T.DataUtils.toHalfFloat((b * 0.55 + l * 0.45) * 1.1);
      }
    hdr.needsUpdate = true;
    environment.dispose();
    environment = pmrem.fromEquirectangular(hdr);
    hdr.dispose();
  } catch (error) {
    console.warn("HDR unavailable; using studio environment.", error);
  }
  scene.environment = environment.texture;
  pmrem.dispose();
  scene.add(new T.HemisphereLight(0xcfe6ff, 0x071220, 0.3));
  const key = new T.DirectionalLight(0xe4efff, 1.2);
  key.position.set(3, 7, 5);
  scene.add(key);
  const fill = new T.DirectionalLight(0x689cc7, 0.5);
  fill.position.set(-7, 2, -4);
  scene.add(fill);
  const cursorField = createCursorField(renderer, mobile());
  const skyMaterial = new T.ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    side: T.BackSide,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      depth: { value: 0 },
      resolution: {
        value: new T.Vector2(
          innerWidth * renderer.getPixelRatio(),
          innerHeight * renderer.getPixelRatio(),
        ),
      },
      auroraMap: { value: cursorField.texture },
      ambientMotion: { value: reduced ? 0 : 1 },
    },
  });
  const sky = new T.Mesh(new T.SphereGeometry(160, 32, 24), skyMaterial);
  sky.renderOrder = -10;
  scene.add(sky);
  const random = randomSource(72),
    snowPositions = new Float32Array(12000 * 3),
    seeds = new Float32Array(12000);
  for (let i = 0; i < 12000; i++) {
    snowPositions.set(
      [(random() - 0.5) * 85, (random() - 0.5) * 85, (random() - 0.5) * 130],
      i * 3,
    );
    seeds[i] = random();
  }
  const snowGeometry = new T.BufferGeometry();
  snowGeometry.setAttribute(
    "position",
    new T.BufferAttribute(snowPositions, 3),
  );
  snowGeometry.setAttribute("seed", new T.BufferAttribute(seeds, 1));
  const snowMaterial = new T.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      moving: { value: 0 },
      atmosphere: { value: 0 },
      pixelRatio: { value: renderer.getPixelRatio() },
    },
    vertexShader: snowVertex,
    fragmentShader: snowFragment,
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
  });
  const snow = new T.Points(snowGeometry, snowMaterial);
  snow.frustumCulled = false;
  scene.add(snow);
  const normal = frostTextures(), trianglePattern = createTrianglePattern();
  const frostFields = exhibits.map((_, index) => createFrostField(renderer, 707 + index * 31));
  const frostUvs = exhibits.map(() => new T.Vector2());
  const groups: T.Group[] = [],
    shells: T.Mesh[] = [],
    arrivalEdges: T.LineSegments[] = [],
    sculptures: T.Group[] = [],
    iceMaterials: ReturnType<typeof createBlackIceMaterial>[] = [],
    signals: ReturnType<typeof createExhibitSignals>[] = [];
  for (let i = 0; i < 3; i++) {
    const e = exhibits[i],
      group = new T.Group();
    group.position.fromArray(e.center);
    scene.add(group);
    groups.push(group);
    const ice = createBlackIceMaterial(normal, i, e.size, trianglePattern, frostFields[i].texture);
    iceMaterials.push(ice);
    const shell = new T.Mesh(iceGeometry(62 + i * 17, e.size), ice.material);
    const signal = createExhibitSignals(e.size, 751 + i);
    group.add(signal.group);
    signals.push(signal);
    shell.rotation.set(0.08 + i * 0.14, 0.2 - i * 0.3, 0.12 - i * 0.1);
    group.add(shell);
    signal.setSurface(shell);
    const edge = new T.LineSegments(new T.EdgesGeometry(shell.geometry, 22), new T.LineBasicMaterial({color:0xe8f3f7, transparent:true, opacity:0, depthWrite:false}));
    edge.rotation.copy(shell.rotation);
    group.add(edge);
    arrivalEdges.push(edge);
    ice.update(0, i === 0 && !reduced ? 0 : 1, frostFields[i].texture);
    shells.push(shell);
    const inner = new T.Group();
    group.add(inner);
    sculptures.push(inner);
    const light = new T.PointLight(0xc5deef, 7, e.size * 3, 2);
    light.position.set(-e.size * 0.7, e.size * 0.65, e.size * 0.6);
    group.add(light);
  }
  let disposed = false;
  const particleSports = [basketball(), await gloveArtwork, dumbbell()].map((art, i) => {
    const cloud = createParticleSport(art, exhibits[i].size, 1201 + i * 37);
    sculptures[i].add(cloud.group);
    cloud.update(0, i === 0 && !reduced ? 0 : 1);
    return cloud;
  });
  elements.onLoad(70);
  const hologram = createGpuHologram(), gpu = hologram.group;
  gpu.position.set(7, -30, -136);
  gpu.scale.setScalar(.7);
  // A pitched, rising diagonal keeps the faceplate, fan and card depth legible.
  gpu.rotation.set(.2, .4, .24);
  hologram.uniforms.still.value = reduced ? 1 : 0;
  scene.add(gpu);
  const runtime = createRuntimeCore();
  scene.add(runtime.group);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const grade = new ShaderPass(gradeShader);
  composer.addPass(grade);
  composer.addPass(new OutputPass());
  let shaderFailure = false;
  renderer.debug.onShaderError = () => {
    shaderFailure = true;
  };
  let track = cameraTrack(mobile(), innerHeight < 650),
    progress = 0,
    targetProgress = 0,
    focused = false,
    paused = false,
    suspended = false,
    frame = 0,
    last = 0,
    time = 0,
    formationTime = 0,
    renderCount = 0,
    auroraElapsed = 0,
    started = false;
  const intro = { value: reduced ? 1 : 0 };
  const firstRevealDuration = 1.8;
  let firstReveal = reduced ? 1 : 0,
    firstRevealElapsed = reduced ? firstRevealDuration : 0,
    firstRevealRequested = reduced;
  let tween: gsap.core.Tween | undefined;
  const pointer = new T.Vector2(),
    previousPointer = new T.Vector2(),
    ray = new T.Raycaster(),
    hoverSphere = new T.Sphere(),
    hoverProjection = new T.Vector3(),
    hoverTarget = new T.Vector2(),
    dragAngles = exhibits.map(() => new T.Vector2()),
    hoverAngles = exhibits.map(() => new T.Vector2()),
    autoAngles = exhibits.map(() => new T.Vector2()),
    cursorPlane = new T.Plane(),
    planeNormal = new T.Vector3(),
    cursorHit = new T.Vector3(),
    localHit = new T.Vector3(),
    shellHit = new T.Vector3(),
    shellIntersections: T.Intersection[] = [],
    thirdCenter = new T.Vector3(...exhibits[2].center),
    formationCenter = new T.Vector3(7, -30, -136),
    interaction = exhibits.map(() => 0),
    smoothPointer = new T.Vector2(),
    desired = new T.Vector3(),
    look = new T.Vector3(),
    cameraLook = new T.Vector3(),
    projection = new T.Vector3();
  const focusPosition = new T.Vector3(),
    focusTarget = new T.Vector3();
  const anchorVectors = [
    new T.Vector3(0.2, 0.72, 0.35),
    new T.Vector3(0.45, -0.14, 0.4),
    new T.Vector3(-0.24, -0.67, 0.3),
  ];
  let pointerEnergy = 0,
    pointerPresent = false,
    pointerSequence = 0,
    processedPointerSequence = 0;
  let dragging = false,
    dragIndex = -1,
    previousX = 0,
    previousY = 0,
    velocityX = 0,
    velocityY = 0;
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: !reduced,
    autoRaf: false,
    prevent: (node) => node.closest("dialog") !== null,
  });
  lenis.on("scroll", () => {
    targetProgress = Math.max(0, Math.min(1, lenis.progress));
  });
  function pointerMove(event: PointerEvent) {
    pointerSequence++;
    pointerPresent = true;
    pointer.set(
      (event.clientX / innerWidth) * 2 - 1,
      1 - (event.clientY / innerHeight) * 2,
    );
    if (dragging && dragIndex >= 0) {
      velocityX = (event.clientX - previousX) * 0.004;
      velocityY = (event.clientY - previousY) * 0.004;
      dragAngles[dragIndex].x += velocityX;
      dragAngles[dragIndex].y += velocityY;
      previousX = event.clientX;
      previousY = event.clientY;
    }
  }
  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || focused) return;
    dragIndex = exhibitAt(progress);
    if (dragIndex < 0) return;
    if (dragIndex === 0 && firstReveal < .8) return;
    pointerPresent = true;
    // Touch/pens may send pointerdown without an earlier pointermove.
    pointer.set((event.clientX / innerWidth) * 2 - 1, 1 - (event.clientY / innerHeight) * 2);
    ray.setFromCamera(pointer, camera);
    if (!ray.ray.intersectsSphere(hoverSphere.set(groups[dragIndex].position, exhibits[dragIndex].size * .6))) return;
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
  }
  function pointerUp() {
    dragging = false;
    canvas.style.cursor = "grab";
  }
  function applyGraphics() {
    profile = graphicsProfiles[quality.tier];
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, mobile() ? profile.mobileDpr : profile.dpr),
    );
    renderer.setSize(innerWidth, innerHeight);
    renderer.transmissionResolutionScale = quality.tier === 0 ? 1 : .75;
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(innerWidth, innerHeight);
    grade.enabled = profile.post;
    canvas.style.imageRendering = profile.pixelated ? "pixelated" : "auto";
    canvas.dataset.graphicsTier = String(quality.tier);
    snow.geometry.setDrawRange(0, profile.snow);
    hologram.setQuality(profile.points, renderer.getPixelRatio(), quality.tier >= 2);
    snowMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
    hologram.uniforms.pixelRatio.value = renderer.getPixelRatio();
    skyMaterial.uniforms.resolution.value.set(
      innerWidth * renderer.getPixelRatio(),
      innerHeight * renderer.getPixelRatio(),
    );
    frostFields.forEach((field) => field.setQuality(quality.tier >= 2));
    iceMaterials.forEach((ice, index) => {
      ice.setQuality(profile.transmission);
      ice.setViewport(innerHeight);
      ice.setField(frostFields[index].texture);
    });
    signals.forEach(signal => signal.setQuality(renderer.getPixelRatio(), quality.tier >= 2));
    particleSports.forEach(cloud => cloud.setQuality(renderer.getPixelRatio(), quality.tier));
    gpu.scale.setScalar(mobile() ? (innerHeight < 650 ? .42 : .56) : .7);
    runtime.group.scale.setScalar(mobile() ? (innerHeight < 650 ? .6 : .78) : 1);
    runtime.setSimple(quality.tier >= 2);
    elements.onQuality?.(quality.state);
  }
  function resize() {
    track = cameraTrack(mobile(), innerHeight < 650);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    applyGraphics();
    quality.resetSampling(1800);
    lenis.resize();
  }
  function selectGraphics(mode: GraphicsMode) {
    quality.select(mode);
    try {
      localStorage.setItem("bp-gallery-graphics", mode);
    } catch {}
    applyGraphics();
  }
  function preference() {
    reduced = media.matches;
    hologram.uniforms.still.value = reduced || paused ? 1 : 0;
    if (reduced) {
      tween?.kill();
      intro.value = 1;
      finishFirstReveal();
    }
  }
  function contextLost(event: Event) {
    event.preventDefault();
    elements.onFailure();
  }
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("webglcontextlost", contextLost);
  media.addEventListener("change", preference);
  function finishFirstReveal() {
    firstRevealRequested = true;
    firstRevealElapsed = firstRevealDuration;
    firstReveal = 1;
  }
  function tick(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const frameMs = now - last;
    const dt = Math.min(frameMs / 1000, 0.05) || 0.016;
    last = now;
    lenis.raf(now);
    if (document.hidden || suspended) {
      quality.resetSampling(1500);
      return;
    }
    if (quality.sample(frameMs)) applyGraphics();
    renderCount++;
    const damping = 1 - Math.exp(-8 * dt);
    progress = reduced
      ? targetProgress
      : T.MathUtils.lerp(progress, targetProgress, damping);
    if (!reduced && !paused) time += dt;
    if (targetProgress > 0.003 && intro.value < 1) {
      tween?.kill();
      intro.value = 1;
    }
    // Camera settling runs under the curtain. The visible exhibit has its own
    // clock, released by curtain completion and frozen with the gallery.
    if (targetProgress > .003 && firstReveal < 1) finishFirstReveal();
    if (firstRevealRequested && firstReveal < 1 && !paused && !reduced) {
      firstRevealElapsed = Math.min(firstRevealDuration, firstRevealElapsed + dt);
      const t = firstRevealElapsed / firstRevealDuration;
      firstReveal = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    smoothPointer.lerp(pointer, 1 - Math.exp(-4 * dt));
    sampleTrack(progress, track, desired, look);
    if (intro.value < 1) {
      const angle = (1 - intro.value) * .32;
      const offset = track.positions[0]
        .clone()
        .sub(track.targets[0])
        .applyAxisAngle(T.Object3D.DEFAULT_UP, angle)
        .multiplyScalar(1 + (1 - intro.value) * .12);
      desired.copy(track.targets[0]).add(offset);
      look.copy(track.targets[0]);
    }
    if (focused) {
      desired.copy(focusPosition);
      look.copy(focusTarget);
    }
    if (!reduced && !focused && !paused) {
      desired.x += smoothPointer.x * 0.22;
      desired.y += smoothPointer.y * 0.13;
    }
    if (!started) {
      camera.position.copy(desired);
      cameraLook.copy(look);
      started = true;
    } else {
      camera.position.lerp(desired, reduced ? 1 : 1 - Math.exp(-9 * dt));
      cameraLook.lerp(look, reduced ? 1 : 1 - Math.exp(-9 * dt));
    }
    camera.lookAt(cameraLook);
    camera.updateMatrixWorld();
    sky.position.copy(camera.position);
    skyMaterial.uniforms.time.value = time;
    skyMaterial.uniforms.depth.value = progress;
    snowMaterial.uniforms.atmosphere.value = T.MathUtils.smoothstep(progress, .58, .96);
    snow.position.copy(camera.position);
    snowMaterial.uniforms.time.value = time;
    hologram.uniforms.time.value = time;
    if (!reduced && !paused) {
      if (progress > 0.56 && progress < 0.9) formationTime += dt;
    }
    const assembly = T.MathUtils.smoothstep(progress, .52, .67);
    gpu.position.lerpVectors(thirdCenter, formationCenter, T.MathUtils.smoothstep(progress, .505, .704));
    gpu.rotation.y = .4 + formationTime * .1;
    hologram.update(formationTime, assembly,
      T.MathUtils.smoothstep(progress, .80, .90),
      T.MathUtils.smoothstep(progress, .50, .57) * (1-T.MathUtils.smoothstep(progress, .80, .89)));
    runtime.update(formationTime,
      T.MathUtils.smoothstep(progress, .66, .72) * (1-T.MathUtils.smoothstep(progress, .80, .88)));
    gpu.updateMatrixWorld(true);
    ray.setFromCamera(pointer, camera);
    planeNormal.copy(camera.position).sub(gpu.position).normalize();
    cursorPlane.setFromNormalAndCoplanarPoint(planeNormal, gpu.position);
    if (pointerPresent && !focused && ray.ray.intersectPlane(cursorPlane, cursorHit)) {
      gpu.worldToLocal(cursorHit);
      hologram.uniforms.cursor.value.copy(cursorHit);
    } else hologram.uniforms.cursor.value.set(100, 100, 100);
    if (!dragging && dragIndex >= 0 && !paused) {
      dragAngles[dragIndex].x += velocityX * dt * 60;
      dragAngles[dragIndex].y += velocityY * dt * 60;
      velocityX *= Math.exp(-4 * dt);
      velocityY *= Math.exp(-4 * dt);
    }
    const current = exhibitAt(progress);
    const movement = pointer.distanceTo(previousPointer);
    const freshPointerMotion = pointerSequence !== processedPointerSequence && movement > .00001;
    groups.forEach((g, i) => {
      const exhibit = exhibits[Math.max(0, i)];
      const hovered =
        pointerPresent && i === current && (i !== 0 || firstReveal > .8) && !focused && !reduced && !paused &&
        ray.ray.intersectsSphere(hoverSphere.set(g.position, exhibit.size * .6));
      interaction[i] = T.MathUtils.lerp(interaction[i], hovered || (dragging && i === dragIndex) ? 1 : 0, 1-Math.exp(-5*dt));
      shellIntersections.length = 0;
      if (hovered) {
        ray.intersectObject(shells[i], false, shellIntersections);
        if (shellIntersections.length) {
          shellHit.copy(shellIntersections[0].point);
          shells[i].worldToLocal(shellHit);
          localHit.copy(shellHit);
        }
      }
      const erosion = i === 2 ? 1-T.MathUtils.smoothstep(progress, .515, .565) : i === 0 ? T.MathUtils.smoothstep(firstReveal, 0, .88) : 1;
      const edgeMaterial = arrivalEdges[i].material as T.LineBasicMaterial;
      edgeMaterial.opacity = i === 0 && firstRevealRequested ?
        (.12 + Math.sin(firstReveal * Math.PI) * .22) * (1 - T.MathUtils.smoothstep(firstReveal, .55, 1)) : 0;
      arrivalEdges[i].visible = edgeMaterial.opacity > .001;
      const touchingSurface = hovered && shellIntersections.length > 0;
      if (touchingSurface && freshPointerMotion) iceContactUv(localHit, exhibit.size, frostUvs[i]);
      if (!reduced && !paused && (i === current || frostFields[i].active)) {
        frostFields[i].update(dt, time, touchingSurface ? frostUvs[i] : undefined,
          touchingSurface && freshPointerMotion ? Math.min(1, movement * 35) : 0);
      }
      iceMaterials[i].update(time, erosion, frostFields[i].texture);
      signals[i].update(time, dt, i === current && !focused && intro.value > .8 && (i !== 0 || firstReveal > .8), reduced);
      particleSports[i].update(time, i === 0 ? firstReveal : i === 2 ? 1-T.MathUtils.smoothstep(progress, .51, .56) : 1);
      sculptures[i].scale.setScalar(i === 2 ? Math.max(.001, 1-T.MathUtils.smoothstep(progress, .51, .56)) : 1);
      g.visible = i !== 2 || progress < .59;
      hoverProjection.copy(g.position).project(camera);
      hoverTarget.set(
        hovered && !dragging ? (pointer.x - hoverProjection.x) * 0.8 : 0,
        hovered && !dragging ? -(pointer.y - hoverProjection.y) * 0.5 : 0,
      );
      hoverAngles[i].lerp(hoverTarget, 1 - Math.exp(-6 * dt));
      if (!reduced && !paused && !focused && (!dragging || i !== dragIndex)) {
        autoAngles[i].x += dt * 0.045;
        autoAngles[i].y = T.MathUtils.lerp(
          autoAngles[i].y,
          Math.sin(time * 0.18 + i) * 0.055,
          1 - Math.exp(-3 * dt),
        );
      }
      g.rotation.y = dragAngles[i].x + hoverAngles[i].x + autoAngles[i].x;
      g.rotation.x = dragAngles[i].y + hoverAngles[i].y + autoAngles[i].y;
      if (!reduced && !paused) {
        g.position.y = exhibits[i].center[1] + Math.sin(time * 0.32 + i) * 0.09;
        sculptures[i].rotation.y = Math.sin(time * 0.12 + i) * 0.035;
      }
    });
    elements.onInteraction?.(focused || paused || reduced ? 0 : Math.max(...interaction) * (.18 + Math.min(1, pointer.distanceTo(previousPointer) * 35)));
    processedPointerSequence = pointerSequence;
    previousPointer.copy(pointer);
    pointerEnergy = T.MathUtils.lerp(
      pointerEnergy,
      Math.min(1.1, movement * 18),
      1 - Math.exp(-25 * dt),
    );
    auroraElapsed += dt;
    if (!reduced && !paused && renderCount % profile.auroraEvery === 0) {
      cursorField.update(auroraElapsed, time, smoothPointer, pointerEnergy);
      auroraElapsed = 0;
    }
    skyMaterial.uniforms.auroraMap.value = cursorField.texture;
    skyMaterial.uniforms.ambientMotion.value = reduced || paused ? 0 : 1;
    const active = exhibitAt(progress);
    const selectedHotspot = hotspotForProgress(progress, active);
    let highlighted = -1;
    hotspots.forEach((el, i) => {
      if (active < 0 || focused || intro.value < 0.96 || (active === 0 && firstReveal < .96)) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        el.tabIndex = -1;
        return;
      }
      projection
        .copy(anchorVectors[i])
        .multiplyScalar(exhibits[Math.max(0, active)].size * 0.6);
      groups[active].localToWorld(projection);
      projection.project(camera);
      const visible =
        projection.z > -1 &&
        projection.z < 1 &&
        Math.abs(projection.x) < 0.95 &&
        Math.abs(projection.y) < 0.95;
      if (visible && i === selectedHotspot) highlighted = i;
      el.tabIndex = visible ? 0 : -1;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      el.style.transform = `translate(${(projection.x * 0.5 + 0.5) * innerWidth}px,${(-projection.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-50%)`;
    });
    hotspots.forEach((el, i) => {
      el.classList.toggle("is-active", i === highlighted);
    });
    grade.uniforms.time.value = time;
    grade.uniforms.travel.value = Math.min(
      1,
      Math.abs(targetProgress - progress) * 18,
    );
    composer.render();
    elements.onProgress(progress);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    tween?.kill();
    lenis.destroy();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", pointerMove);
    canvas.removeEventListener("pointerdown", pointerDown);
    canvas.removeEventListener("pointerup", pointerUp);
    canvas.removeEventListener("pointercancel", pointerUp);
    canvas.removeEventListener("webglcontextlost", contextLost);
    media.removeEventListener("change", preference);
    disposeObject(scene);
    normal.dispose();
    trianglePattern.dispose();
    frostFields.forEach(field => field.dispose());
    cursorField.dispose();
    environment.dispose();
    composer.dispose();
    renderer.dispose();
  }
  resize();
  sampleTrack(0, track, camera.position, cameraLook);
  camera.lookAt(cameraLook);
  elements.onLoad(95);
  try {
    await renderer.compileAsync(scene, camera);
    composer.render();
    if (shaderFailure) throw new Error("Gallery shader compilation failed.");
  } catch (error) {
    dispose();
    throw error;
  }
  elements.onLoad(100);
  return {
    start() {
      if (disposed || frame) return;
      // Enhancement replaces the reading layout with the scroll journey. Do
      // not normalize its first frames against Lenis's cached reading height.
      lenis.resize();
      last = performance.now();
      frame = requestAnimationFrame(tick);
      tween = gsap.to(intro, {
        value: 1,
        duration: reduced ? 0 : 1.8,
        ease: "power2.inOut",
      });
    },
    reveal() {
      if (disposed || firstRevealRequested) return;
      if (reduced || focused || targetProgress > .003) finishFirstReveal();
      else firstRevealRequested = true;
    },
    go(progress: number, immediate = false) {
      lenis.resize();
      lenis.scrollTo(
        progress * (document.documentElement.scrollHeight - innerHeight),
        { immediate: immediate || reduced, duration: 1.6 },
      );
    },
    focus(value: boolean) {
      focused = value;
      if (value) {
        finishFirstReveal();
        focusPosition.copy(camera.position).lerp(cameraLook, 0.1);
        focusTarget.copy(cameraLook);
        lenis.stop();
      } else if (!suspended) lenis.start();
    },
    pause(value: boolean) {
      paused = value;
      tween?.paused(value);
      hologram.uniforms.still.value = reduced || value ? 1 : 0;
    },
    suspend(value: boolean) {
      suspended = value;
      if (value) lenis.stop();
      else {
        lenis.start();
        lenis.resize();
      }
    },
    setGraphics: selectGraphics,
    dispose,
  };
}
function disposeObject(root: T.Object3D) {
  const geometries = new Set<T.BufferGeometry>(),
    materials = new Set<T.Material>(),
    textures = new Set<T.Texture>();
  root.traverse((o) => {
    if (o instanceof T.Mesh || o instanceof T.Points || o instanceof T.Line) {
      geometries.add(o.geometry);
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(
        (m: T.Material) => {
          materials.add(m);
          Object.values(m).forEach((v) => {
            if (v instanceof T.Texture) textures.add(v);
          });
        },
      );
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}
export type GalleryController = Awaited<ReturnType<typeof createGallery>>;
