import * as THREE from "three";

/** A reversible, GPU-interpolated cube-to-processor point cloud. */
export function createCubeParticles(compact: boolean, pixelRatio: number) {
  const count = compact ? 3400 : 6800;
  const start = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  let seed = 8291;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < count; i++) {
    const axis = i % 3;
    const point = [random() * 3 - 1.5, random() * 3 - 1.5, random() * 3 - 1.5];
    point[axis] = i % 2 ? 1.5 : -1.5;
    start.set(point, i * 3);
    if (i % 5 === 0) {
      const side = Math.floor(random() * 4);
      const pin = (Math.floor(random() * 18) - 8.5) * 0.23;
      const extent = 2.1 + random() * 0.85;
      target.set(side < 2 ? [side ? extent : -extent, pin, (random() - 0.5) * 0.14] : [pin, side === 2 ? extent : -extent, (random() - 0.5) * 0.14], i * 3);
    } else {
      const extent = i % 4 === 0 ? 1.08 : 2.05;
      target.set([(random() * 2 - 1) * extent, (random() * 2 - 1) * extent, (i % 2 ? 0.16 : -0.16) + (i % 4 === 0 ? 0.15 : 0)], i * 3);
    }
    scatter.set([(random() - 0.5) * 5, (random() - 0.5) * 5, (random() - 0.5) * 3], i * 3);
    sizes[i] = 0.45 + random() * 1.05;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(start, 3));
  geometry.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  const uniforms = { uMorph: { value: 0 }, uAlpha: { value: 0 }, uTime: { value: 0 }, uDpr: { value: pixelRatio } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aTarget;
      attribute vec3 aScatter;
      attribute float aSize;
      uniform float uMorph;
      uniform float uTime;
      uniform float uDpr;
      varying float vLight;
      void main() {
        float morph = smoothstep(0.0, 1.0, uMorph);
        vec3 p = mix(position, aTarget, morph);
        p += aScatter * sin(morph * 3.14159265) * 0.65;
        p += sin(p * 2.0 + uTime * 0.35) * 0.035 * morph;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(5.0 * uDpr, aSize * uDpr * 18.0 / max(3.0, -mv.z));
        vLight = 0.55 + aSize * 0.3;
      }
    `,
    fragmentShader: `
      uniform float uAlpha;
      varying float vLight;
      void main() {
        float edge = 1.0 - smoothstep(0.06, 0.5, length(gl_PointCoord - 0.5));
        float alpha = edge * uAlpha * vLight;
        if (alpha < 0.008) discard;
        gl_FragColor = vec4(vec3(0.42, 0.59, 0.68), alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  const traces: number[] = [];
  const square = (size: number, z: number) => {
    const corners = [[-size, -size, z], [size, -size, z], [size, size, z], [-size, size, z]];
    corners.forEach((point, i) => traces.push(...point, ...corners[(i + 1) % 4]));
  };
  square(2.08, 0.2); square(1.1, 0.35);
  for (let pin = 0; pin < 18; pin++) {
    const position = (pin - 8.5) * 0.23;
    for (const sign of [-1, 1]) {
      traces.push(sign * 2.1, position, 0.05, sign * 2.95, position, 0.05);
      traces.push(position, sign * 2.1, 0.05, position, sign * 2.95, 0.05);
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(traces, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8eafbf, transparent: true, opacity: 0, depthWrite: false });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  const object = new THREE.Group();
  object.add(points, lines);
  return {
    object,
    update(progress: number, time: number) {
      const morph = THREE.MathUtils.smoothstep(progress, 0.08, 0.9);
      uniforms.uMorph.value = morph;
      uniforms.uTime.value = time;
      uniforms.uAlpha.value = THREE.MathUtils.smoothstep(progress, 0.035, 0.35) * 0.7;
      lineMaterial.opacity = THREE.MathUtils.smoothstep(progress, 0.55, 0.95) * 0.22;
      object.visible = progress > 0.01;
    },
    dispose() { geometry.dispose(); material.dispose(); lineGeometry.dispose(); lineMaterial.dispose(); },
  };
}
