import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { cubicBezier } from "motion";
import { createFaceMaterials } from "./cube-textures";
import { CubeOrbit, type OrbitInput } from "./cube-orbit";
import { createCubeParticles } from "./cube-particles";
import { CUBE_ENTRANCE_DURATION, IMPACT_BEATS, entranceBeat, entrancePose } from "./entrance-timeline";
import { applyTurn, createCubies, createScrambleSequence, createTurnSequence, FACE_NORMALS, hasSticker, type Cubie, type ScrambleMove } from "./rubik-state";

export type CubeInput = OrbitInput & {
  paused: boolean;
  reduced: boolean;
  scroll: number;
  entranceStartedAt: number | null;
};

const easeLayerTurn = cubicBezier(0.42, 0, 0.58, 1);

export async function createCubeScene(canvas: HTMLCanvasElement, input: CubeInput) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(4.8, 3.4, 5.8);
  camera.lookAt(0, 0, 0);

  let faces: Awaited<ReturnType<typeof createFaceMaterials>>;
  try {
    faces = await createFaceMaterials(renderer.capabilities.getMaxAnisotropy());
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  // Rounded solid blocks match the source cube, without raised sticker plates.
  const geometry = new RoundedBoxGeometry(0.99, 0.99, 0.99, 5, 0.075);
  const material = new THREE.MeshMatcapMaterial({ matcap: faces.materials[4].matcap, color: 0x777777, toneMapped: false });
  const surfaces = [...faces.materials, material];
  const inkMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  // A clean cage traces each cubie; the bevel tessellation stays out of the ink drawing.
  const edgeBox = new THREE.BoxGeometry(.997, .997, .997);
  const edgeGeometry = new THREE.EdgesGeometry(edgeBox);
  edgeBox.dispose();
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, toneMapped: false, transparent: true, opacity: .85 });
  const meshMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const outlines: THREE.LineSegments[] = [];
  surfaces.forEach((surface) => { surface.transparent = true; });
  const view = new THREE.Group();
  view.rotation.set(0.03, -0.17, -0.12);
  const pitch = new THREE.Group();
  const arrival = new THREE.Group();
  const group = new THREE.Group();
  // Separate pitch/yaw axes preserve direct drag tracking and the view tilt.
  scene.add(view);
  view.add(arrival);
  arrival.add(pitch);
  pitch.add(group);
  const particles = createCubeParticles(window.innerWidth < 760, renderer.getPixelRatio());
  group.add(particles.object);
  const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const cubies = createCubies();
  const nextTurn = createTurnSequence();
  // Start with a legal scramble, including for reduced-motion visitors.
  for (let i = 0; i < 22; i++) applyTurn(cubies, nextTurn());
  const objects = new Map<Cubie, THREE.Group>();
  const rotationMatrix = new THREE.Matrix4();
  const basis = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

  function syncTransform(cubie: Cubie) {
    const object = objects.get(cubie)!;
    object.position.fromArray(cubie.position);
    object.scale.setScalar(1);
    basis.forEach((vector, i) => vector.fromArray(cubie.basis[i]));
    rotationMatrix.makeBasis(basis[0], basis[1], basis[2]);
    object.quaternion.setFromRotationMatrix(rotationMatrix);
  }

  for (const cubie of cubies) {
    const object = new THREE.Group();
    const faceMaterials = FACE_NORMALS.map((normal, index) => hasSticker(cubie, normal) ? faces.materials[index] : material);
    const mesh = new THREE.Mesh(geometry, faceMaterials);
    const outline = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    outline.renderOrder = 2;
    outline.visible = false;
    mesh.add(outline);
    outlines.push(outline);
    meshMaterials.set(mesh, faceMaterials);
    object.add(mesh);
    objects.set(cubie, object);
    syncTransform(cubie);
    group.add(object);
  }

  const pivot = new THREE.Group();
  const nextScramble = createScrambleSequence();
  let pendingTurns: ScrambleMove[] = [];
  let active: { turn: ScrambleMove; cubies: Cubie[]; elapsed: number } | null = null;
  let rest = 0.85;
  let visible = true;
  let disposed = false;
  let frame = 0;
  let previousTime: number | null = null;
  const orbit = new CubeOrbit();
  let dirty = true;
  let previousScroll = -1;
  let animationTime = 0;
  let wasEntering = false;
  let previousBeat = -1;
  const entranceRotation = new THREE.Quaternion();
  const entranceEuler = new THREE.Euler();

  function updateScroll(progress: number) {
    const compact = canvas.clientWidth < 760;
    const spread = 1 + Math.sin(progress * Math.PI) * 0.4;
    const opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.12, 0.7);
    surfaces.forEach((surface) => { surface.opacity = opacity; });
    cubies.forEach((cubie) => {
      const object = objects.get(cubie)!;
      object.position.fromArray(cubie.position).multiplyScalar(spread);
      object.visible = opacity > 0.005;
    });
    view.position.copy(cameraRight).multiplyScalar(compact ? 0 : 0.4 * (1 - progress));
    view.position.addScaledVector(cameraUp, -0.5 + progress * 0.65);
    view.scale.setScalar((compact ? 0.83 : 0.78) - progress * 0.14);
    particles.update(progress, animationTime);
    previousScroll = progress;
    dirty = true;
  }

  function startTurn() {
    if (pendingTurns.length === 0) pendingTurns = nextScramble();
    const turn = pendingTurns.shift()!;
    const selected = cubies.filter((cubie) => cubie.position[turn.axis] === turn.layer);
    pivot.rotation.set(0, 0, 0);
    group.add(pivot);
    selected.forEach((cubie) => pivot.add(objects.get(cubie)!));
    active = { turn, cubies: selected, elapsed: 0 };
  }

  function finishTurn() {
    if (!active) return;
    for (let i = 0; i < active.turn.quarterTurns; i++) applyTurn(cubies, active.turn);
    active.cubies.forEach((cubie) => {
      group.add(objects.get(cubie)!);
      syncTransform(cubie);
    });
    group.remove(pivot);
    active = null;
    rest = pendingTurns.length > 0 ? 0 : 0.9;
  }

  function paint() {
    renderer.render(scene, camera);
  }

  function resize() {
    // Entrance transforms must not reduce the renderer's eventual pixel resolution.
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.zoom = Math.min(1.06, width / height * 1.06);
    camera.updateProjectionMatrix();
    updateScroll(input.reduced ? 0 : input.scroll);
    const center = view.position.clone().project(camera);
    const box = canvas.getBoundingClientRect();
    document.documentElement.style.setProperty("--impact-x", `${box.left + (center.x + 1) * box.width / 2}px`);
    document.documentElement.style.setProperty("--impact-y", `${box.top + (1 - center.y) * box.height / 2}px`);
    paint();
  }

  function tick(now: number) {
    if (disposed) return;
    const delta = previousTime === null ? 0 : Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    if (visible && !document.hidden) {
      const automatic = !input.paused && !input.reduced;
      const entranceElapsed = input.entranceStartedAt === null ? CUBE_ENTRANCE_DURATION : now - input.entranceStartedAt;
      const entering = !input.reduced && input.scroll === 0 && entranceElapsed < CUBE_ENTRANCE_DURATION;
      const beat = entering ? entranceBeat(entranceElapsed) : -1;
      if (beat !== previousBeat) {
        const paper = beat >= 0 && IMPACT_BEATS[beat].paper;
        meshMaterials.forEach((original, mesh) => { mesh.material = paper ? inkMaterial : original; });
        outlines.forEach((outline) => { outline.visible = beat >= 0; });
        edgeMaterial.color.set(paper ? 0x000000 : 0xffffff);
        previousBeat = beat;
        dirty = true;
      }
      if (automatic) animationTime += delta;
      if (input.reduced && active) { finishTurn(); dirty = true; }
      if (automatic && !entering) {
        if (active) {
          active.elapsed += delta;
          const duration = active.turn.quarterTurns === 2 ? 1.7 : 1.15;
          const progress = Math.min(active.elapsed / duration, 1);
          const angle = active.turn.direction * Math.PI / 2 * active.turn.quarterTurns * easeLayerTurn(progress);
          pivot.rotation.set(active.turn.axis === 0 ? angle : 0, active.turn.axis === 1 ? angle : 0, active.turn.axis === 2 ? angle : 0);
          if (progress === 1) finishTurn();
        } else {
          rest -= delta;
          if (rest <= 0) startTurn();
        }
        dirty = true;
      }
      const orientation = orbit.update(input, delta, automatic && !entering);
      const scroll = input.reduced ? 0 : Math.max(0, Math.min(1, input.scroll));
      if (scroll !== previousScroll || wasEntering || entering || (automatic && scroll > 0)) updateScroll(scroll);
      if (entering) {
        const { compress, spread, recoil, settle } = entrancePose(entranceElapsed);
        arrival.rotation.set(-.12 * recoil, .25 * recoil, -.13 * recoil);
        // A hard squash at contact becomes a wide, low ink-like splat before rupture.
        arrival.scale.set(1 + compress * .48 + settle, 1 - compress * .77 + settle, 1 + compress * .22 + settle);
        arrival.position.copy(cameraRight).multiplyScalar(recoil * .42);
        arrival.position.addScaledVector(cameraUp, -compress * .24);
        cubies.forEach((cubie, index) => {
          syncTransform(cubie);
          const object = objects.get(cubie)!;
          const phase = index * 2.39996;
          const outward = .72 + (index % 5) * .12;
          object.position.multiplyScalar(1 + spread * .32);
          object.position.x += Math.cos(phase) * spread * outward + recoil * .25;
          object.position.y += Math.sin(phase) * spread * outward + spread * (index % 3 - 1) * .65;
          object.position.z += Math.sin(phase * 1.7) * spread * .65;
          entranceEuler.set(Math.sin(phase) * spread * 1.3, Math.cos(phase) * spread * 1.6, (index % 2 ? 1 : -1) * spread * .9);
          entranceRotation.setFromEuler(entranceEuler);
          object.quaternion.multiply(entranceRotation);
        });
        dirty = true;
      } else if (wasEntering) {
        arrival.rotation.set(0, 0, 0);
        arrival.position.set(0, 0, 0);
        arrival.scale.setScalar(1);
        // Restore exact logical orientations before handing control to regular turns.
        cubies.forEach(syncTransform);
        dirty = true;
      }
      wasEntering = entering;
      const targetX = orientation.y;
      const targetY = orientation.x;
      if (pitch.rotation.x !== targetX || group.rotation.y !== targetY) {
        // Direct tracking avoids inertial drift after the pointer is released.
        pitch.rotation.x = targetX;
        group.rotation.y = targetY;
        dirty = true;
      }
      if (dirty) { paint(); dirty = false; }
    }
    frame = requestAnimationFrame(tick);
  }

  // Prepare both impact and normal programs before the hit, avoiding a first-use
  // shader compilation hitch at contact. compile() also visits hidden edge cages.
  const warmup = new THREE.Mesh(geometry, inkMaterial);
  scene.add(warmup);
  renderer.compile(scene, camera);
  scene.remove(warmup);

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  intersection.observe(canvas);
  resize();
  frame = requestAnimationFrame(tick);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      geometry.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      inkMaterial.dispose();
      material.dispose();
      faces.dispose();
      particles.dispose();
      renderer.dispose();
      document.documentElement.style.removeProperty("--impact-x");
      document.documentElement.style.removeProperty("--impact-y");
    },
  };
}
