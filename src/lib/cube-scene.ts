import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { cubicBezier } from "motion";
import { createFaceMaterials } from "./cube-textures";
import { CubeOrbit, type OrbitInput } from "./cube-orbit";
import { createCubeParticles } from "./cube-particles";
import { CUBE_ENTRANCE_DURATION, SLICE_STARTS, entrancePose, entranceOffset } from "./entrance-timeline";
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
    object.add(mesh);
    objects.set(cubie, object);
    syncTransform(cubie);
    group.add(object);
  }

  // Both boundaries on each axis are sliced, releasing every visible cubelet.
  const sliceCorners = [
    [[-1.505, -.5, 1.505], [1.505, -.5, 1.505], [1.505, -.5, -1.505], [-1.505, -.5, -1.505]],
    [[-1.505, .5, 1.505], [1.505, .5, 1.505], [1.505, .5, -1.505], [-1.505, .5, -1.505]],
    [[.5, -1.505, 1.505], [.5, 1.505, 1.505], [.5, 1.505, -1.505], [.5, -1.505, -1.505]],
    [[-.5, -1.505, 1.505], [-.5, 1.505, 1.505], [-.5, 1.505, -1.505], [-.5, -1.505, -1.505]],
    [[-1.505, 1.505, -.5], [1.505, 1.505, -.5], [1.505, -1.505, -.5], [-1.505, -1.505, -.5]],
    [[-1.505, 1.505, .5], [1.505, 1.505, .5], [1.505, -1.505, .5], [-1.505, -1.505, .5]],
  ];
  const sliceLines = sliceCorners.map((corners) => {
    const positions = new Float32Array(81 * 3);
    for (let i = 0; i <= 80; i++) {
      const edge = Math.floor(i / 20) % 4, progress = (i % 20) / 20;
      for (let axis = 0; axis < 3; axis++) positions[i * 3 + axis] = THREE.MathUtils.lerp(corners[edge][axis], corners[(edge + 1) % 4][axis], progress);
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xdce8ee, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.visible = false;
    group.add(line);
    return line;
  });

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
    camera.updateMatrixWorld();
    updateScroll(input.reduced ? 0 : input.scroll);
    // Project the real cut edges so the viewport strokes meet the same seams
    // on wide, tablet, and mobile canvases, rather than guessing screen angles.
    group.updateWorldMatrix(true, false);
    const box = canvas.getBoundingClientRect();
    sliceCorners.forEach((corners, index) => {
      const points = corners.slice(0, 2).map((point) => {
        const projected = new THREE.Vector3(...point).applyMatrix4(group.matrixWorld).project(camera);
        return { x: box.left + (projected.x + 1) * box.width / 2, y: box.top + (1 - projected.y) * box.height / 2 };
      });
      const style = document.documentElement.style;
      style.setProperty(`--slice-${index}-x`, `${(points[0].x + points[1].x) / 2}px`);
      style.setProperty(`--slice-${index}-y`, `${(points[0].y + points[1].y) / 2}px`);
      style.setProperty(`--slice-${index}-angle`, `${Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x)}rad`);
    });
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
        const cuts = entrancePose(entranceElapsed);
        const spread = cuts.reduce((sum, cut) => sum + cut, 0) / cuts.length;
        // A small physical recoil supplies impact while text and background stay still.
        const recoil = SLICE_STARTS.reduce((sum, start) => {
          const t = (entranceElapsed - start) / 170;
          return sum + (t > 0 && t < 1 ? Math.sin(t * Math.PI) * Math.exp(-3 * t) * .018 : 0);
        }, 0);
        arrival.rotation.set(.035 * spread, -.065 * spread, .025 * spread);
        arrival.scale.setScalar(1 - .25 * spread + recoil);
        arrival.position.set(0, 0, 0);
        cubies.forEach((cubie, index) => {
          syncTransform(cubie);
          const object = objects.get(cubie)!;
          const offset = entranceOffset(cubie.position, cuts);
          object.position.x += offset[0];
          object.position.y += offset[1];
          object.position.z += offset[2];
          // Each piece has its own slight orientation; gaps remain clear and orderly.
          const phase = index * 2.39996;
          entranceEuler.set(Math.sin(phase) * spread * .06, Math.cos(phase) * spread * .07, Math.sin(phase * .7) * spread * .045);
          entranceRotation.setFromEuler(entranceEuler);
          object.quaternion.premultiply(entranceRotation);
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
      sliceLines.forEach((line, index) => {
        const elapsed = entranceElapsed - SLICE_STARTS[index];
        const lit = entering && elapsed >= -20 && elapsed < 260;
        if (lit || line.visible) dirty = true;
        line.visible = lit;
        if (lit) {
          line.geometry.setDrawRange(0, Math.floor(81 * THREE.MathUtils.clamp((elapsed + 20) / 95, 0, 1)));
          line.material.opacity = .75 * (1 - THREE.MathUtils.clamp(elapsed / 260, 0, 1));
        }
      });
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

  // Prepare normal, seam, and particle programs before the first slice.
  renderer.compile(scene, camera);

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
      sliceLines.forEach((line) => { line.geometry.dispose(); line.material.dispose(); });
      material.dispose();
      faces.dispose();
      particles.dispose();
      renderer.dispose();
      sliceLines.forEach((_, index) => {
        for (const property of ["x", "y", "angle"]) document.documentElement.style.removeProperty(`--slice-${index}-${property}`);
      });
    },
  };
}
