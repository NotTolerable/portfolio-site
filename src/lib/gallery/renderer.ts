import * as T from "three";
import Lenis from "lenis";
import { gsap } from "gsap";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { cameraTrack, exhibits, exhibitAt, sampleTrack } from "./journey";
import {
  cpuParticleGeometry,
  frostTextures,
  iceGeometry,
  randomSource,
} from "./art";
import { basketball, boxingGloves, dumbbell, fitSportsArt } from "./sports";
import { createCursorField } from "./aurora";
import { sampleFishMotion } from "./motion";
import {
  skyVertex,
  skyFragment,
  snowVertex,
  snowFragment,
  cpuVertex,
  cpuFragment,
  gradeShader,
} from "./shaders";

export type GalleryElements = {
  canvas: HTMLCanvasElement;
  hotspots: HTMLElement[];
  onProgress: (progress: number) => void;
  onLoad: (progress: number) => void;
  onFailure: () => void;
};
export async function createGallery(elements: GalleryElements) {
  const { canvas, hotspots } = elements;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = media.matches;
  const mobile = () => innerWidth < 700;
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.5 : 1.8));
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
    snowPositions = new Float32Array(6400 * 3),
    seeds = new Float32Array(6400);
  for (let i = 0; i < 6400; i++) {
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
  const normal = frostTextures();
  const groups: T.Group[] = [],
    shells: T.Mesh[] = [],
    sculptures: T.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const e = exhibits[i],
      group = new T.Group();
    group.position.fromArray(e.center);
    scene.add(group);
    groups.push(group);
    const shell = new T.Mesh(
      iceGeometry(62 + i * 17, e.size),
      new T.MeshPhysicalMaterial({
        color: 0x8296ad,
        roughness: 0.14,
        metalness: 0,
        transmission: 0.97,
        thickness: 0.58,
        ior: 1.31,
        attenuationColor: 0x9aacbd,
        attenuationDistance: 4,
        envMapIntensity: 0.35,
        normalMap: normal,
        normalScale: new T.Vector2(0.12, 0.12),
        clearcoat: 0.2,
        clearcoatRoughness: 0.18,
        side: T.FrontSide,
      }),
    );
    shell.rotation.set(0.08 + i * 0.14, 0.2 - i * 0.3, 0.12 - i * 0.1);
    group.add(shell);
    shells.push(shell);
    const inner = new T.Group();
    group.add(inner);
    sculptures.push(inner);
    const light = new T.PointLight(0xc5deef, 7, e.size * 3, 2);
    light.position.set(-e.size * 0.7, e.size * 0.65, e.size * 0.6);
    group.add(light);
  }
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let disposed = false;
  [basketball(), boxingGloves(), dumbbell()].forEach((art, i) =>
    sculptures[i].add(fitSportsArt(art, exhibits[i].size)),
  );
  elements.onLoad(70);
  const cpuMaterial = new T.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      still: { value: reduced ? 1 : 0 },
      pixelRatio: { value: renderer.getPixelRatio() },
      cursor: { value: new T.Vector3(100, 100, 100) },
      swimmer: { value: new T.Vector3(100, 100, 100) },
    },
    vertexShader: cpuVertex,
    fragmentShader: cpuFragment,
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
  });
  const cpu = new T.Points(
    cpuParticleGeometry(mobile() ? 34000 : 85000),
    cpuMaterial,
  );
  cpu.position.set(6, -84, -128);
  cpu.scale.setScalar(0.67);
  cpu.rotation.set(0.14, 0.4, 0.04);
  scene.add(cpu);
  const fishGroup = new T.Group();
  scene.add(fishGroup);
  const fishTime = { value: 0 };
  try {
    const fishAsset = await loader.loadAsync("/gallery/fish.glb");
    const bounds = new T.Box3().setFromObject(fishAsset.scene),
      center = bounds.getCenter(new T.Vector3()),
      size = bounds.getSize(new T.Vector3());
    fishAsset.scene.position.sub(center);
    fishGroup.add(fishAsset.scene);
    fishGroup.scale.setScalar(10.5 / Math.max(size.x, size.y, size.z));
    fishAsset.scene.traverse((o) => {
      if (o instanceof T.Mesh) {
        const original = o.material as T.MeshStandardMaterial;
        original.map?.dispose();
        original.map = null;
        original.color.set(0xcce7ec);
        original.metalness = 0.16;
        original.roughness = 0.47;
        original.envMapIntensity = 0.9;
        original.onBeforeCompile = (shader) => {
          shader.uniforms.fishTime = fishTime;
          shader.vertexShader =
            "uniform float fishTime;\n" +
            shader.vertexShader.replace(
              "#include <begin_vertex>",
              "#include <begin_vertex>\n float tail=smoothstep(-.16,.31,position.z); transformed.x += sin(fishTime*4.2-position.z*9.)*.055*tail*tail;",
            );
        };
      }
    });
  } catch (error) {
    console.warn("Fish asset unavailable", error);
  }

  const waterMaterial = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: T.DoubleSide,
    uniforms: { time: { value: 0 } },
    vertexShader: `uniform float time;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.2+time*.3)*.3+sin(p.y*.17-time*.2)*.2;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float time;void main(){float a=pow(max(0.,sin(vUv.x*53.+sin(vUv.y*18.+time*.3)*2.)),25.);gl_FragColor=vec4(vec3(.07,.13,.15)*a,.015+a*.025);}`,
  });
  const water = new T.Mesh(
    new T.PlaneGeometry(180, 180, 60, 60),
    waterMaterial,
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -99, -125);
  water.visible = false;
  scene.add(water);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const grade = new ShaderPass(gradeShader);
  composer.addPass(grade);
  composer.addPass(new OutputPass());
  let shaderFailure = false;
  renderer.debug.onShaderError = () => {
    shaderFailure = true;
  };
  let track = cameraTrack(mobile()),
    progress = 0,
    targetProgress = 0,
    focused = false,
    paused = false,
    suspended = false,
    frame = 0,
    last = 0,
    time = 0,
    formationTime = 0,
    swimTime = 0,
    started = false;
  const intro = { value: reduced ? 1 : 0 };
  let tween: gsap.core.Tween | undefined;
  const pointer = new T.Vector2(),
    previousPointer = new T.Vector2(),
    ray = new T.Raycaster(),
    hoverSphere = new T.Sphere(),
    hoverProjection = new T.Vector3(),
    hoverTarget = new T.Vector2(),
    dragAngles = exhibits.map(() => new T.Vector2()),
    hoverAngles = exhibits.map(() => new T.Vector2()),
    cursorPlane = new T.Plane(),
    planeNormal = new T.Vector3(),
    cursorHit = new T.Vector3(),
    fishPosition = new T.Vector3(),
    fishDirection = new T.Vector3(),
    fishTarget = new T.Vector3(),
    fishMatrix = new T.Matrix4(),
    fishQuaternion = new T.Quaternion(),
    fishUp = new T.Vector3(0, 1, 0),
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
    fishStarted = false;
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
  function resize() {
    track = cameraTrack(mobile());
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.5 : 1.8));
    renderer.setSize(innerWidth, innerHeight);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(innerWidth, innerHeight);
    snowMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
    cpuMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
    skyMaterial.uniforms.resolution.value.set(
      innerWidth * renderer.getPixelRatio(),
      innerHeight * renderer.getPixelRatio(),
    );
    lenis.resize();
  }
  function preference() {
    reduced = media.matches;
    cpuMaterial.uniforms.still.value = reduced ? 1 : 0;
    if (reduced) {
      tween?.kill();
      intro.value = 1;
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
  function tick(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05) || 0.016;
    last = now;
    lenis.raf(now);
    if (document.hidden || suspended) return;
    const damping = 1 - Math.exp(-8 * dt);
    progress = reduced
      ? targetProgress
      : T.MathUtils.lerp(progress, targetProgress, damping);
    if (!reduced && !paused) time += dt;
    if (targetProgress > 0.003 && intro.value < 1) {
      tween?.kill();
      intro.value = 1;
    }
    smoothPointer.lerp(pointer, 1 - Math.exp(-4 * dt));
    sampleTrack(progress, track, desired, look);
    if (intro.value < 1) {
      const angle = (1 - intro.value) * 1.2;
      const offset = track.positions[0]
        .clone()
        .sub(track.targets[0])
        .applyAxisAngle(T.Object3D.DEFAULT_UP, angle)
        .multiplyScalar(1 + (1 - intro.value) * 0.6);
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
    skyMaterial.uniforms.depth.value = T.MathUtils.smoothstep(
      progress,
      0.35,
      0.85,
    );
    snow.position.copy(camera.position);
    snowMaterial.uniforms.time.value = time;
    cpuMaterial.uniforms.time.value = time;
    if (!reduced && !paused) {
      if (progress > 0.56 && progress < 0.9) formationTime += dt;
      if (progress > 0.493 && progress < 0.965) swimTime += dt;
    }
    cpu.rotation.y = 0.4 + formationTime * 0.05;
    cpu.updateMatrixWorld(true);
    ray.setFromCamera(pointer, camera);
    planeNormal.copy(camera.position).sub(cpu.position).normalize();
    cursorPlane.setFromNormalAndCoplanarPoint(planeNormal, cpu.position);
    if (ray.ray.intersectPlane(cursorPlane, cursorHit)) {
      cpu.worldToLocal(cursorHit);
      cpuMaterial.uniforms.cursor.value.copy(cursorHit);
    } else cpuMaterial.uniforms.cursor.value.set(100, 100, 100);
    if (!dragging && dragIndex >= 0 && !paused) {
      dragAngles[dragIndex].x += velocityX * dt * 60;
      dragAngles[dragIndex].y += velocityY * dt * 60;
      velocityX *= Math.exp(-4 * dt);
      velocityY *= Math.exp(-4 * dt);
    }
    const current = exhibitAt(progress);
    groups.forEach((g, i) => {
      const exhibit = exhibits[Math.max(0, i)];
      const hovered =
        i === current &&
        !focused &&
        !dragging &&
        !reduced &&
        !paused &&
        ray.ray.intersectsSphere(
          hoverSphere.set(g.position, exhibit.size * 0.55),
        );
      hoverProjection.copy(g.position).project(camera);
      hoverTarget.set(
        hovered ? (pointer.x - hoverProjection.x) * 0.8 : 0,
        hovered ? -(pointer.y - hoverProjection.y) * 0.5 : 0,
      );
      hoverAngles[i].lerp(hoverTarget, 1 - Math.exp(-6 * dt));
      g.rotation.y = dragAngles[i].x + hoverAngles[i].x;
      g.rotation.x = dragAngles[i].y + hoverAngles[i].y;
      if (!reduced && !paused) {
        g.position.y = exhibits[i].center[1] + Math.sin(time * 0.32 + i) * 0.09;
        sculptures[i].rotation.y = Math.sin(time * 0.12 + i) * 0.035;
      }
    });
    const movement = pointer.distanceTo(previousPointer);
    previousPointer.copy(pointer);
    pointerEnergy = T.MathUtils.lerp(
      pointerEnergy,
      Math.min(1.1, movement * 18),
      1 - Math.exp(-25 * dt),
    );
    if (!reduced && !paused)
      cursorField.update(dt, time, smoothPointer, pointerEnergy);
    skyMaterial.uniforms.auroraMap.value = cursorField.texture;
    skyMaterial.uniforms.ambientMotion.value = reduced || paused ? 0 : 1;
    const active = exhibitAt(progress);
    let nearestHotspot = -1;
    let nearestDistance = Infinity;
    hotspots.forEach((el, i) => {
      if (active < 0 || focused || intro.value < 0.96) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        el.tabIndex = -1;
        return;
      }
      projection
        .copy(anchorVectors[i])
        .multiplyScalar(exhibits[Math.max(0, active)].size * 0.6);
      groups[active].localToWorld(projection);
      const distance = projection.distanceToSquared(camera.position);
      projection.project(camera);
      const visible =
        projection.z > -1 &&
        projection.z < 1 &&
        Math.abs(projection.x) < 0.95 &&
        Math.abs(projection.y) < 0.95;
      if (visible && distance < nearestDistance) {
        nearestDistance = distance;
        nearestHotspot = i;
      }
      el.tabIndex = visible ? 0 : -1;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      el.style.transform = `translate(${(projection.x * 0.5 + 0.5) * innerWidth}px,${(-projection.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-50%)`;
    });
    hotspots.forEach((el, i) => {
      el.classList.toggle("is-nearest", i === nearestHotspot);
    });
    sampleFishMotion(progress, swimTime, fishPosition, fishDirection);
    if (!fishStarted) {
      fishGroup.position.copy(fishPosition);
      fishStarted = true;
    } else
      fishGroup.position.lerp(
        fishPosition,
        reduced ? 1 : 1 - Math.exp(-7 * dt),
      );
    fishTarget.copy(fishGroup.position).add(fishDirection);
    fishMatrix.lookAt(fishTarget, fishGroup.position, fishUp);
    fishQuaternion.setFromRotationMatrix(fishMatrix);
    fishGroup.quaternion.slerp(
      fishQuaternion,
      reduced ? 1 : 1 - Math.exp(-6 * dt),
    );
    fishTime.value = time;
    fishGroup.visible = progress > 0.49 && progress < 0.965;
    cursorHit.copy(fishGroup.position);
    cpu.worldToLocal(cursorHit);
    cpuMaterial.uniforms.swimmer.value.copy(cursorHit);
    waterMaterial.uniforms.time.value = time;
    water.visible = progress > 0.83;
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
      last = performance.now();
      frame = requestAnimationFrame(tick);
      tween = gsap.to(intro, {
        value: 1,
        duration: reduced ? 0 : 3.2,
        ease: "power2.inOut",
      });
    },
    go(progress: number, immediate = false) {
      lenis.scrollTo(
        progress * (document.documentElement.scrollHeight - innerHeight),
        { immediate: immediate || reduced, duration: 1.6 },
      );
    },
    focus(value: boolean) {
      focused = value;
      if (value) {
        focusPosition.copy(camera.position).lerp(cameraLook, 0.1);
        focusTarget.copy(cameraLook);
        lenis.stop();
      } else if (!suspended) lenis.start();
    },
    pause(value: boolean) {
      paused = value;
      tween?.paused(value);
      cpuMaterial.uniforms.still.value = reduced || value ? 1 : 0;
    },
    suspend(value: boolean) {
      suspended = value;
      if (value) lenis.stop();
      else {
        lenis.start();
        lenis.resize();
      }
    },
    dispose,
  };
}
function disposeObject(root: T.Object3D) {
  const geometries = new Set<T.BufferGeometry>(),
    materials = new Set<T.Material>(),
    textures = new Set<T.Texture>();
  root.traverse((o) => {
    if (o instanceof T.Mesh || o instanceof T.Points) {
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
