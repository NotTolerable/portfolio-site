import * as THREE from "three";

export function createCubeLight(scene: THREE.Scene) {
  // Fixed in world space: rotating the cube moves its surfaces through the light.
  const source = new THREE.Vector3(3.8, 7, 2.2);
  const target = new THREE.Vector3(-0.15, -0.3, 0);
  const key = new THREE.SpotLight(0xffffff, 135, 22, 0.4, 0.85, 2);
  key.position.copy(source);
  key.target.position.copy(target);
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0xffffff, 0.65);
  rim.position.set(-3, 2, -4);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-2, 0, 5);
  scene.add(rim, fill);

  // The visible ray is an SVG behind the transparent canvas, keeping its edges soft.
  return { dispose() { scene.remove(key, key.target, rim, fill); } };
}
