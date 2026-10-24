import * as THREE from "three";
import { gsap } from "gsap";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { engravedMaterial } from "./engraved-material";
import { createStreetCharacter } from "./street-character";

export type StreetInput = { progress: number; x: number; y: number; pressed: boolean; paused: boolean; reduced: boolean; rainy: boolean; glow: boolean };

/** A real, traversable scene graph: the street, courier, buildings, signage,
 * reflections and rain all occupy world space. No city image is projected. */
export async function createNightStreet(canvas: HTMLCanvasElement, input: StreetInput) {
  const compact = innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x07101e); scene.fog = new THREE.FogExp2(0x102035, .032);
  const camera = new THREE.PerspectiveCamera(compact ? 56 : 48, 1, .1, 145);
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  const ink = (color: number, density = 11) => { const m = engravedMaterial(color, density); materials.add(m); return m; };
  const matte = (color: number, roughness = .8) => { const m = new THREE.MeshStandardMaterial({ color, roughness }); materials.add(m); return m; };
  const emit = (color: number, strength = 1) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength) }); materials.add(m); return m; };
  const slate = ink(0x314253), blue = ink(0x233448), pale = ink(0x6c7f89), cream = ink(0xb1aba0), concrete = ink(0x485463, 17);
  const black = matte(0x101821), metal = matte(0x27313a, .45), red = ink(0x922c32), glass = matte(0x0a1924, .25);
  const amber = emit(0xffb361, 2.4), cyan = emit(0x65d9ec, 2), vermilion = emit(0xf4484b, 2.2);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x03070d, transparent: true, opacity: .88 }); materials.add(lineMaterial);
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>(), lineParts: THREE.BufferGeometry[] = [];
  function part(geometry: THREE.BufferGeometry, m: THREE.Material, p: number[], rotation: number[] = [0, 0, 0], outline = false) {
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(1, 1, 1));
    if (outline) { const edge = new THREE.EdgesGeometry(geometry, 28); edge.applyMatrix4(matrix); lineParts.push(edge); }
    const baked = geometry.index ? geometry.toNonIndexed() : geometry.clone(); baked.applyMatrix4(matrix); geometry.dispose();
    if (!buckets.has(m)) buckets.set(m, []); buckets.get(m)!.push(baked);
  }
  const box = (w: number, h: number, d: number, m: THREE.Material, p: number[], outline = false, rotation: number[] = [0, 0, 0]) => part(new THREE.BoxGeometry(w, h, d), m, p, rotation, outline);
  const tube = (points: number[][], radius: number, m: THREE.Material) => part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 18, radius, 5, false), m, [0, 0, 0]);
  let seed = 12703;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };

  // A broad street with raised sidewalks, kerbs, gutters and broken lane marks.
  box(38, .22, 125, black, [0, -.17, -40]);
  for (const side of [-1, 1]) {
    box(3.4, .22, 115, concrete, [side * 6.2, .015, -37]);
    box(.2, .32, 115, pale, [side * 4.45, .055, -37], true);
    for (let i = 0; i < 38; i++) box(3.4, .012, .025, black, [side * 6.2, .132, 17 - i * 3]);
  }
  for (let i = 0; i < 22; i++) box(.1, .012, 1.25, cream, [0, .012, 14 - i * 4.7]);
  for (let i = 0; i < 7; i++) box(1.6, .015, .35, pale, [-2.8 + i * .94, .015, -4]);
  // Subtle emissive reflections remain as a low-cost fallback below the mirror.
  const puddleMaterials = [0x264958, 0x554032].map((color) => { const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .35, depthWrite: false }); materials.add(m); return m; });
  for (let i = 0; i < 32; i++) {
    const m = puddleMaterials[i % 2];
    box(.06 + random() * .14, .002, .8 + random() * 3, m, [(random() - .5) * 7.5, .025, 9 - random() * 80]);
  }

  // Architectural masses and facade detail are merged by material, rather than
  // creating hundreds of independent render calls.
  const windowPositions: { x: number; y: number; z: number; side: number; warm: boolean; lit: boolean }[] = [];
  for (const side of [-1, 1]) for (let i = 0; i < 13; i++) {
    const z = 12 - i * 7.8, height = 7 + random() * 12, width = 4 + random() * 2;
    const x = side * (7.9 + width * .5);
    const face = side * 7.88;
    const facade = [slate, blue, pale, concrete, red][(i + (side === 1 ? 1 : 0)) % 5];
    box(width, height, 7.1, facade, [x, height / 2 + .15, z], true);
    box(width + .25, .22, 7.3, metal, [x, height + .3, z], true);
    box(.16, height + .35, .16, metal, [face, height / 2 + .15, z + 3.3], true);
    for (let floor = 0; floor < Math.floor(height / 2.3); floor++) {
      const y = 1.6 + floor * 2.25;
      box(.22, .1, 7.25, metal, [face - side * .13, y - .85, z], true);
      for (let col = 0; col < 3; col++) {
        const wz = z - 2.3 + col * 2.3;
        box(.14, 1.4, 1.35, black, [face - side * .08, y, wz], true);
        box(.065, 1.28, .04, metal, [face - side * .21, y, wz]);
        box(.065, .04, 1.15, metal, [face - side * .21, y, wz]);
        windowPositions.push({ x: face - side * .17, y, z: wz, side, warm: random() > .33, lit: random() > .35 });
        box(.3, .09, 1.55, pale, [face - side * .15, y - .77, wz]);
      }
    }
    // Ground-floor shop bays, awnings, steps and service doors.
    box(.2, 2.35, 2.4, black, [face - side * .13, 1.22, z + .7], true);
    box(.06, 1.85, 1.84, i % 2 ? glass : amber, [face - side * .27, 1.25, z + .7]);
    for (const frame of [-.6, 0, .6]) box(.07, 1.9, .035, metal, [face - side * .32, 1.25, z + .7 + frame]);
    // Recessed shutters, wall seams and ribbed shop awnings.
    for (let rib = 0; rib < 9; rib++) {
      if (i % 2) box(.08, .025, 1.8, pale, [face - side * .33, .5 + rib * .17, z + .7]);
      box(.04, .05, 3.35, black, [face - side * (.1 + rib * .12), 2.89 - rib * .014, z + .65]);
    }
    box(1.25, .13, 3.6, i % 3 ? metal : red, [face - side * .55, 2.8, z + .65], true, [0, 0, side * .12]);
    box(.8, .13, 3.2, concrete, [face - side * .45, .2, z + .65], true);
    if (i % 2 === 0) {
      box(.8, .65, .9, metal, [face - side * .42, 4.1, z + 2.6], true);
      for (let vent = 0; vent < 6; vent++) box(.015, .03, .65, pale, [face - side * .84, 3.9 + vent * .07, z + 2.6]);
    }
    // Rooftop tanks, plant equipment and antennae add depth above the street.
    part(new THREE.CylinderGeometry(.55, .55, 1.45, 14), metal, [x, height + 1.1, z - 1.4], [0, 0, 0], true);
    box(1.2, .55, 1.35, pale, [x, height + .68, z + 1.7], true);
    part(new THREE.CylinderGeometry(.025, .025, 2.6, 5), black, [x + .7, height + 1.55, z + 2.4]);
    box(.9, .025, .035, pale, [x + .7, height + 2.4, z + 2.4]);
    // Ladders / fire escapes, assembled from real mesh rails and rungs.
    if (i % 3 === 1) {
      for (const rail of [-.35, .35]) box(.06, height - 1, .05, metal, [face - side * .35, height / 2 + .55, z - 2.5 + rail]);
      for (let rung = 0; rung < Math.floor(height / .4); rung++) box(.09, .045, .8, metal, [face - side * .4, .8 + rung * .4, z - 2.5]);
    }
  }
  const windowGeometry = new THREE.BoxGeometry(.035, 1.17, 1.1); geometries.add(windowGeometry);
  const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); materials.add(windowMaterial);
  const windows = new THREE.InstancedMesh(windowGeometry, windowMaterial, windowPositions.length);
  const dummy = new THREE.Object3D();
  windowPositions.forEach((w, i) => {
    dummy.position.set(w.x, w.y, w.z); dummy.updateMatrix(); windows.setMatrixAt(i, dummy.matrix);
    windows.setColorAt(i, new THREE.Color(w.lit ? w.warm ? 0xffc17a : 0x70c8dd : 0x142233).multiplyScalar(w.lit ? 1.8 : 1));
  }); scene.add(windows);

  // Hanging utility lines and lit shop signs break up the repeated facades.
  for (let i = 0; i < 9; i++) {
    const z = 5 - i * 10;
    tube([[-8, 6.8, z], [-2, 5.4, z - .3], [3, 5.1, z + .4], [8, 6.4, z + .9]], .023, black);
    tube([[-8, 7.15, z], [-1, 6, z + .8], [8, 6.9, z + 1.2]], .015, black);
  }
  const signLabels = ["WORK", "VISION", "CURIOUS", "IDEAS", "BUILD", "BP"];
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? -1 : 1, z = 9 - i * 7.5;
    const c = document.createElement("canvas"); c.width = 128; c.height = 512;
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#101926"; ctx.fillRect(0, 0, 128, 512);
    const color = i % 3 === 0 ? "#f36a61" : i % 3 === 1 ? "#f7c48d" : "#8cdeef";
    ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(7, 7, 114, 498); ctx.fillStyle = color; ctx.font = "bold 56px sans-serif"; ctx.textAlign = "center";
    [...signLabels[i % signLabels.length]].forEach((letter, j) => ctx.fillText(letter, 64, 88 + j * 66));
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const m = new THREE.MeshBasicMaterial({ map: texture, color: new THREE.Color(0xffffff).multiplyScalar(1.65), side: THREE.DoubleSide }); materials.add(m);
    box(.15, 3.6, 1.1, metal, [side * 6.8, 4.8, z], true);
    const geometry = new THREE.PlaneGeometry(1, 3.45); geometries.add(geometry);
    const sign = new THREE.Mesh(geometry, m); sign.position.set(side * 6.7, 4.8, z + .58); scene.add(sign);
    box(1.4, .08, .08, metal, [side * 7.35, 6.5, z], true);
    box(.05, 3.1, .05, i % 2 ? cyan : vermilion, [side * 6.12, 4.8, z + .55]);
  }
  // Foreground street furniture gives the moving camera a convincing scale.
  for (const z of [6, -9, -25, -43, -61]) for (const side of [-1, 1]) {
    part(new THREE.CylinderGeometry(.065, .095, 5.7, 10), metal, [side * 5.3, 2.85, z], [0, 0, 0], true);
    tube([[side * 5.3, 5.6, z], [side * 5.15, 6, z], [side * 4.5, 6.05, z]], .07, metal);
    box(.8, .13, .4, black, [side * 4.35, 5.95, z], true); box(.6, .025, .26, amber, [side * 4.35, 5.87, z]);
    part(new THREE.CylinderGeometry(.28, .3, .8, 12), metal, [side * 6.5, .53, z - 1.5], [0, 0, 0], true);
  }
  for (let i = 0; i < 35; i++) {
    const x = (random() > .5 ? -1 : 1) * (11 + random() * 20), h = 12 + random() * 24, z = -55 - random() * 45;
    box(2 + random() * 4, h, 3 + random() * 4, i % 2 ? slate : blue, [x, h / 2, z], true);
    for (let line = 0; line < 3; line++) box(.035, h * .6, .06, cyan, [x + line * .55 - .5, h * .6, z + 2.1]);
  }

  // Merge static geometry into material batches; engraving remains world-locked.
  buckets.forEach((parts, m) => {
    const geometry = mergeGeometries(parts); parts.forEach((g) => g.dispose());
    if (geometry) { geometries.add(geometry); const mesh = new THREE.Mesh(geometry, m); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh); }
  });
  const lineGeometry = mergeGeometries(lineParts); lineParts.forEach((g) => g.dispose());
  if (lineGeometry) { geometries.add(lineGeometry); scene.add(new THREE.LineSegments(lineGeometry, lineMaterial)); }

  const reflectionGeometry = new THREE.PlaneGeometry(8.7, 115); geometries.add(reflectionGeometry);
  const reflector = new Reflector(reflectionGeometry, { color: 0x505c6b, textureWidth: compact ? 256 : 512, textureHeight: compact ? 256 : 512, clipBias: .004, multisample: 0 });
  reflector.rotation.x = -Math.PI / 2; reflector.position.set(0, .006, -37); scene.add(reflector);
  let drawFrame = 0;
  const reflectionRender = reflector.onBeforeRender;
  reflector.onBeforeRender = function (...args) { if (drawFrame % 2 === 0) reflectionRender.apply(this, args); };
  // Distort just the reflection sample, so the geometry itself stays stable.
  const reflected = reflector.material as THREE.ShaderMaterial;
  reflected.fragmentShader = reflected.fragmentShader.replace("vec4 base = texture2DProj( tDiffuse, vUv );", `vec4 sampleUv=vUv;sampleUv.x+=sin(vUv.y*270.)*.0007*vUv.w;vec4 base=texture2DProj(tDiffuse,sampleUv);`).replace(
    "gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );",
    `vec2 uv=vUv.xy/vUv.w;
    float grain=fract(sin(dot(floor(uv*2200.),vec2(12.9898,78.233)))*43758.5453);
    float wet=.48+.16*sin(uv.y*95.+sin(uv.x*24.)*2.);
    vec3 asphalt=vec3(.008,.016,.026)*(1.+grain*.4);
    gl_FragColor=vec4(mix(asphalt,blendOverlay(base.rgb,color),wet),1.);`);

  const ambient = new THREE.HemisphereLight(0x9abada, 0x101728, 1.1); scene.add(ambient);
  const moonLight = new THREE.DirectionalLight(0x9cc8ed, 2.2); moonLight.position.set(-8, 18, 10); moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024); Object.assign(moonLight.shadow.camera, { left: -13, right: 13, top: 15, bottom: -15, near: .1, far: 65 });
  moonLight.shadow.normalBias = .04; moonLight.shadow.bias = -.0002; scene.add(moonLight, moonLight.target);
  for (const [x, z, color] of [[-5, 3, 0xffae61], [5, -14, 0x71d8ed], [-5, -31, 0xf45659], [5, -48, 0xffbe7b]]) {
    const light = new THREE.PointLight(color, 95, 22, 2); light.position.set(x, 4.5, z); scene.add(light);
  }
  const moonGeometry = new THREE.SphereGeometry(2.6, 28, 18); geometries.add(moonGeometry);
  const moon = new THREE.Mesh(moonGeometry, emit(0xa4cce5, 1.15)); moon.position.set(-9, 21, -78); scene.add(moon);

  const rainCount = compact ? 500 : 1100;
  const rainPositions = new Float32Array(rainCount * 6), tails = new Float32Array(rainCount * 2);
  for (let i = 0; i < rainCount; i++) { const p = [(random() - .5) * 24, random() * 22, 17 - random() * 110]; rainPositions.set([...p, ...p], i * 6); tails[i * 2 + 1] = 1; }
  const rainGeometry = new THREE.BufferGeometry(); geometries.add(rainGeometry);
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3)); rainGeometry.setAttribute("tail", new THREE.BufferAttribute(tails, 1));
  const rainMaterial = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, strength: { value: 1 } },
    vertexShader: `uniform float time;attribute float tail;varying float a;void main(){vec3 p=position;p.y=mod(p.y-time*(9.+sin(p.x)),22.)+tail*.27;p.x+=tail*.035;vec4 v=modelViewMatrix*vec4(p,1.);a=clamp(1.-length(v.xyz)/65.,0.,1.)*.25;gl_Position=projectionMatrix*v;}`,
    fragmentShader: `uniform float strength;varying float a;void main(){gl_FragColor=vec4(.55,.72,.9,a*strength);}`, transparent: true, depthWrite: false }); materials.add(rainMaterial);
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial); rain.frustumCulled = false; scene.add(rain);

  let character: Awaited<ReturnType<typeof createStreetCharacter>>;
  try { character = await createStreetCharacter(); }
  catch (error) { geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose()); reflector.dispose(); renderer.dispose(); throw error; }
  scene.add(character.root); character.root.position.set(-.6, .01, 6);
  const rig = { x: -3.2, y: 2.9, z: 13, tx: -.6, ty: 1.45, tz: 3.6 };
  const journey = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut", duration: 1 } });
  const locations = [
    { z: -2, x: -.6, cx: -2.8, cy: 3.1, cz: 5, tx: -.5, ty: 1.5, tz: -4 },
    { z: -11, x: .4, cx: 3.4, cy: 2.7, cz: -4, tx: .3, ty: 1.5, tz: -13 },
    { z: -19, x: -.4, cx: -3.1, cy: 3.6, cz: -12, tx: -.2, ty: 1.4, tz: -21 },
    { z: -27, x: -.4, cx: 2.8, cy: 4.8, cz: -20, tx: -.3, ty: 1.9, tz: -30 },
  ];
  locations.forEach((p, i) => {
    journey.to(character.root.position, { x: p.x, z: p.z, ease: "none" }, i);
    journey.to(rig, { x: p.cx, y: p.cy, z: p.cz, tx: p.tx, ty: p.ty, tz: p.tz }, i);
  });
  const target = new THREE.Vector3();
  const composer = new EffectComposer(renderer); const renderPass = new RenderPass(scene, camera); composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(640, 400), compact ? .22 : .4, .35, 1.2); composer.addPass(bloom); const output = new OutputPass(); composer.addPass(output);
  let disposed = false, frame = 0, previous = 0, time = 0, visible = true, progress = 0, yaw = 0, pitch = 0, rainy = 1, dirty = true, lastState = "";
  let width = 1, height = 1, sampled = 0, frameSum = 0;
  const lastCharacter = character.root.position.clone();
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight; if (!width || !height) return;
    renderer.setSize(width, height, false); composer.setSize(width, height); bloom.setSize(Math.min(width, 900) * .65, Math.min(height, 700) * .65);
    camera.aspect = width / height; camera.updateProjectionMatrix(); dirty = true;
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); intersection.observe(canvas);
  function tick(now: number) {
    if (disposed) return;
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 0; previous = now;
    if (visible && !document.hidden) {
      const alpha = input.reduced ? 1 : 1 - Math.exp(-delta * 8);
      const ease = (v: number, goal: number) => Math.abs(v - goal) < .00001 ? goal : v + (goal - v) * alpha;
      const oldProgress = progress;
      progress = ease(progress, input.reduced ? 0 : input.progress); yaw = ease(yaw, input.x); pitch = ease(pitch, input.y); rainy = ease(rainy, input.rainy ? 1 : 0);
      if (!input.paused && !input.reduced) time += delta;
      journey.progress(progress);
      const speed = delta ? character.root.position.distanceTo(lastCharacter) / delta : 0;
      lastCharacter.copy(character.root.position);
      character.update(delta, speed, input.paused || input.reduced);
      const state = [time, progress, yaw, pitch, rainy, input.glow].join(",");
      if (dirty || state !== lastState || Math.abs(progress - oldProgress) > .00001) {
        dirty = false; lastState = state;
        camera.position.set(rig.x + yaw * 1.15, rig.y + pitch * .6, rig.z);
        target.set(rig.tx, rig.ty + pitch * .2, rig.tz); camera.lookAt(target);
        moonLight.position.z = character.root.position.z + 10; moonLight.target.position.set(0, 0, character.root.position.z - 3);
        rainMaterial.uniforms.time.value = time; rainMaterial.uniforms.strength.value = input.reduced ? 0 : rainy;
        bloom.strength = input.glow ? .72 : compact ? .22 : .4;
        drawFrame++; composer.render();
      }
      if (delta > 0 && !input.paused && sampled < 75) {
        sampled++; frameSum += delta;
        if (sampled === 75 && frameSum / sampled > .028) {
          renderer.setPixelRatio(1); composer.setPixelRatio(1); reflector.visible = false; bloom.enabled = false; resize();
        }
      }
    }
    frame = requestAnimationFrame(tick);
  }
  function dispose() {
    disposed = true; cancelAnimationFrame(frame); journey.kill(); observer.disconnect(); intersection.disconnect(); character.dispose();
    geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose()); reflector.dispose(); bloom.dispose(); renderPass.dispose(); output.dispose(); composer.dispose(); renderer.dispose();
  }
  try { await renderer.compileAsync(scene, camera); tick(performance.now()); } catch (error) { dispose(); throw error; }
  return { dispose };
}
