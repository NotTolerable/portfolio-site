import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createFaceMaterials } from "./cube-textures";
import { createCubeLight } from "./cube-light";
import { CubeOrbit, type OrbitInput } from "./cube-orbit";
import { applyTurn, createCubies, createTurnSequence, FACE_NORMALS, hasSticker, type Cubie, type Turn } from "./rubik-state";

export type CubeInput = OrbitInput & {
  paused: boolean;
  reduced: boolean;
};

function createStickerGeometry() {
  const shape = new THREE.Shape();
  const h = 0.414;
  const r = 0.045;
  shape.moveTo(-h + r, -h);
  shape.lineTo(h - r, -h); shape.quadraticCurveTo(h, -h, h, -h + r);
  shape.lineTo(h, h - r); shape.quadraticCurveTo(h, h, h - r, h);
  shape.lineTo(-h + r, h); shape.quadraticCurveTo(-h, h, -h, h - r);
  shape.lineTo(-h, -h + r); shape.quadraticCurveTo(-h, -h, -h + r, -h);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.035,
    steps: 1,
    curveSegments: 4,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
  const uv = geometry.getAttribute("uv");
  const position = geometry.getAttribute("position");
  for (let i = 0; i < uv.count; i++) uv.setXY(i, position.getX(i) / (2 * h) + 0.5, position.getY(i) / (2 * h) + 0.5);
  return geometry;
}

export function createCubeScene(canvas: HTMLCanvasElement, input: CubeInput) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(4.8, 3.4, 5.8);
  camera.lookAt(0, 0, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.28;
  room.dispose();
  pmrem.dispose();

  const geometry = new RoundedBoxGeometry(0.955, 0.955, 0.955, 3, 0.045);
  const material = new THREE.MeshStandardMaterial({ color: 0x090909, metalness: 0.65, roughness: 0.28, envMapIntensity: 1.1 });
  const tileEdgeMaterial = new THREE.MeshStandardMaterial({ color: 0x101010, metalness: 0.5, roughness: 0.22, envMapIntensity: 1.3 });
  const stickerGeometry = createStickerGeometry();
  const faces = createFaceMaterials(renderer.capabilities.getMaxAnisotropy());
  const group = new THREE.Group();
  group.rotation.set(0.03, -0.17, -0.12);
  scene.add(group);
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
    basis.forEach((vector, i) => vector.fromArray(cubie.basis[i]));
    rotationMatrix.makeBasis(basis[0], basis[1], basis[2]);
    object.quaternion.setFromRotationMatrix(rotationMatrix);
  }

  for (const cubie of cubies) {
    const object = new THREE.Group();
    object.add(new THREE.Mesh(geometry, material));
    FACE_NORMALS.forEach((normal, index) => {
      if (!hasSticker(cubie, normal)) return;
      const sticker = new THREE.Mesh(stickerGeometry, [faces.materials[index], tileEdgeMaterial]);
      const direction = new THREE.Vector3(...normal);
      sticker.position.copy(direction).multiplyScalar(0.481);
      sticker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
      object.add(sticker);
    });
    objects.set(cubie, object);
    syncTransform(cubie);
    group.add(object);
  }

  const lighting = createCubeLight(scene);

  const pivot = new THREE.Group();
  let active: { turn: Turn; cubies: Cubie[]; elapsed: number } | null = null;
  let rest = 0.85;
  let visible = true;
  let disposed = false;
  let frame = 0;
  let previousTime: number | null = null;
  const orbit = new CubeOrbit();
  let dirty = true;

  function startTurn() {
    const turn = nextTurn();
    const selected = cubies.filter((cubie) => cubie.position[turn.axis] === turn.layer);
    pivot.rotation.set(0, 0, 0);
    group.add(pivot);
    selected.forEach((cubie) => pivot.add(objects.get(cubie)!));
    active = { turn, cubies: selected, elapsed: 0 };
  }

  function finishTurn() {
    if (!active) return;
    applyTurn(cubies, active.turn);
    active.cubies.forEach((cubie) => {
      group.add(objects.get(cubie)!);
      syncTransform(cubie);
    });
    group.remove(pivot);
    active = null;
    rest = 0.9;
  }

  function paint() {
    renderer.render(scene, camera);
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.zoom = Math.min(1.06, width / height * 1.06);
    camera.updateProjectionMatrix();
    paint();
  }

  function tick(now: number) {
    if (disposed) return;
    const delta = previousTime === null ? 0 : Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    if (visible && !document.hidden) {
      // Render at the display's requestAnimationFrame rate, without a 30 fps gate.
      const automatic = !input.paused && !input.reduced;
      if (input.reduced && active) { finishTurn(); dirty = true; }
      if (automatic) {
        if (active) {
          active.elapsed += delta;
          const progress = Math.min(active.elapsed / 1.15, 1);
          const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
          const angle = active.turn.direction * Math.PI / 2 * eased;
          pivot.rotation.set(active.turn.axis === 0 ? angle : 0, active.turn.axis === 1 ? angle : 0, active.turn.axis === 2 ? angle : 0);
          if (progress === 1) finishTurn();
        } else {
          rest -= delta;
          if (rest <= 0) startTurn();
        }
        dirty = true;
      }
      const orientation = orbit.update(input, delta, automatic);
      const targetX = 0.03 + orientation.y;
      const targetY = -0.17 + orientation.x;
      if (group.rotation.x !== targetX || group.rotation.y !== targetY) {
        // Direct tracking avoids inertial drift after the pointer is released.
        group.rotation.x = targetX;
        group.rotation.y = targetY;
        dirty = true;
      }
      if (dirty) { paint(); dirty = false; }
    }
    frame = requestAnimationFrame(tick);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  intersection.observe(canvas);
  resize();
  frame = requestAnimationFrame(tick);

  return {
    reset() { orbit.reset(); input.x = 0; input.y = 0; dirty = true; },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      geometry.dispose();
      material.dispose();
      tileEdgeMaterial.dispose();
      stickerGeometry.dispose();
      faces.dispose();
      lighting.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
