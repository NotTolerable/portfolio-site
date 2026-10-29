import * as T from "three";

const POINTS = 18;
const SIMPLE_POINTS = 12;
const EDGES = (POINTS * 3) / 2;
const TRANSITION = 0.35;

/**
 * An independently authored, drifting three-dimensional network around an exhibit.
 * Time and gallery proximity drive it; surface contact belongs to the ice shader.
 */
export function createExhibitSignals(size: number, seed: number) {
  const group = new T.Group();
  group.name = "Drifting exhibit network";
  group.visible = false;

  let randomState = (seed | 0) || 1;
  function random() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) | 0;
    return (randomState >>> 0) / 4294967296;
  }

  const origin = new T.Vector3();
  const angles = new Float32Array(POINTS);
  const radii = new Float32Array(POINTS);
  const angularSpeeds = new Float32Array(POINTS);
  const heights = new Float32Array(POINTS);
  const riseSpeeds = new Float32Array(POINTS);
  const phases = new Float32Array(POINTS * 2);
  const positions = new Float32Array(POINTS * 3);
  const previousPositions = new Float32Array(POINTS * 3);
  const cycles = new Int32Array(POINTS);
  const wrapped = new Uint8Array(POINTS);
  const eligible = new Uint8Array(POINTS);
  const degree = new Uint8Array(POINTS);
  const linked = new Uint8Array(POINTS);
  const nodePositions = new Float32Array(POINTS * 3);
  const nodeWeights = new Float32Array(POINTS);

  for (let point = 0; point < POINTS; point++) {
    angles[point] = random() * Math.PI * 2;
    radii[point] = 0.72 + random() * 0.18;
    angularSpeeds[point] = (random() - 0.5) * 0.5;
    heights[point] = random() * size;
    riseSpeeds[point] = random() * (size / 12);
    phases[point * 2] = random() * Math.PI * 2;
    phases[point * 2 + 1] = random() * Math.PI * 2;
  }

  // Stable shuffled pair priorities produce long links, rather than a nearest web.
  const pairCount = (POINTS * (POINTS - 1)) / 2;
  const pairs = new Uint16Array(pairCount);
  let pair = 0;
  for (let a = 0; a < POINTS; a++) for (let b = a + 1; b < POINTS; b++) {
    pairs[pair++] = a * POINTS + b;
  }
  for (let index = pairCount - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    const value = pairs[index];
    pairs[index] = pairs[other];
    pairs[other] = value;
  }

  const edgeA = new Int16Array(EDGES).fill(-1);
  const edgeB = new Int16Array(EDGES).fill(-1);
  const edgeProgress = new Float32Array(EDGES);
  const retiring = new Uint8Array(EDGES);
  const frozenEnds = new Float32Array(EDGES * 6);
  const pairSlots = new Int16Array(POINTS * POINTS).fill(-1);
  const linePositions = new Float32Array(EDGES * 6);
  const lineWeights = new Float32Array(EDGES * 2);

  function geometry(vertices: Float32Array, weights: Float32Array) {
    const result = new T.BufferGeometry();
    result.setAttribute("position", new T.BufferAttribute(vertices, 3).setUsage(T.DynamicDrawUsage));
    result.setAttribute("weight", new T.BufferAttribute(weights, 1).setUsage(T.DynamicDrawUsage));
    return result;
  }
  const lineGeometry = geometry(linePositions, lineWeights);
  const nodeGeometry = geometry(nodePositions, nodeWeights);
  const lineMaterial = new T.ShaderMaterial({
    uniforms: { origin: { value: origin }, scale: { value: size }, phase: { value: seed * 0.013 } },
    vertexShader: `attribute float weight;
      varying float vWeight; varying vec3 vPosition;
      void main() {
        vWeight = weight; vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }`,
    fragmentShader: `uniform vec3 origin; uniform float scale; uniform float phase;
      varying float vWeight; varying vec3 vPosition;
      float hash(vec3 cell) { return fract(sin(dot(cell, vec3(91.7, 173.3, 47.1))) * 31937.17); }
      float noise(vec3 p) {
        vec3 c = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
        return mix(mix(mix(hash(c), hash(c + vec3(1,0,0)), f.x),
                       mix(hash(c + vec3(0,1,0)), hash(c + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(c + vec3(0,0,1)), hash(c + vec3(1,0,1)), f.x),
                       mix(hash(c + vec3(0,1,1)), hash(c + vec3(1,1,1)), f.x), f.y), f.z);
      }
      void main() {
        vec3 p = (vPosition - origin) / scale;
        float outside = smoothstep(.25, .5, length(p));
        float fragments = smoothstep(.4, .53, noise(p * 30. + phase));
        float alpha = outside * fragments * vWeight * .62;
        if (alpha < .004) discard;
        gl_FragColor = vec4(vec3(.92, .97, 1.), alpha);
      }`,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    toneMapped: false,
  });
  const nodeMaterial = new T.ShaderMaterial({
    uniforms: { pixelRatio: { value: 1 }, scale: { value: size } },
    vertexShader: `uniform float pixelRatio; uniform float scale;
      attribute float weight; varying float vWeight;
      void main() {
        vWeight = weight;
        vec4 view = modelViewMatrix * vec4(position, 1.);
        float pixels = clamp(20. * scale / max(scale, -view.z), 4., 7.);
        gl_PointSize = max(1., pixels * pixelRatio * weight);
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `varying float vWeight;
      void main() {
        vec2 p = gl_PointCoord - .5;
        float angle = (1. - vWeight) * 1.3;
        p = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p;
        vec2 q = abs(p);
        float stroke = 1. - smoothstep(.055, .125, min(q.x, q.y));
        float ends = 1. - smoothstep(.34, .49, max(q.x, q.y));
        float alpha = stroke * ends * vWeight * .78;
        if (alpha < .004) discard;
        gl_FragColor = vec4(vec3(.94, .98, 1.), alpha);
      }`,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    toneMapped: false,
  });
  const lines = new T.LineSegments(lineGeometry, lineMaterial);
  const nodes = new T.Points(nodeGeometry, nodeMaterial);
  lines.frustumCulled = nodes.frustumCulled = false;
  group.add(lines, nodes);

  let boundingRadius = size * 0.58;
  let simple = false;
  let previousTime = -1;
  let motionTime = 0;
  let initialized = false;

  function updatePoints(time: number, count: number, active: boolean) {
    previousPositions.set(positions);
    const bob = size / 30;
    for (let point = 0; point < POINTS; point++) {
      const offset = point * 3;
      const angle = angles[point] + angularSpeeds[point] * time;
      const height = heights[point] + riseSpeeds[point] * time;
      const cycle = Math.floor(height / size);
      wrapped[point] = initialized && cycles[point] !== cycle ? 1 : 0;
      cycles[point] = cycle;
      positions[offset] = origin.x + Math.cos(angle) * radii[point] * boundingRadius + Math.sin(time * 0.5 + phases[point * 2]) * bob;
      positions[offset + 1] = origin.y + height - cycle * size - size * 0.5;
      positions[offset + 2] = origin.z + Math.sin(angle) * radii[point] * boundingRadius + Math.sin(time * 0.5 + phases[point * 2 + 1]) * bob;
      eligible[point] = active && point < count && !wrapped[point] && Math.abs(positions[offset + 1] - origin.y) < size * 0.375 ? 1 : 0;
    }
    if (!initialized) previousPositions.set(positions);
    initialized = true;
  }

  function retire(edge: number) {
    retiring[edge] = 1;
    const a = edgeA[edge], b = edgeB[edge];
    // A wrapped point's old location remains the endpoint until its edge retracts.
    const source = wrapped[a] || wrapped[b] ? previousPositions : positions;
    for (let axis = 0; axis < 3; axis++) {
      frozenEnds[edge * 6 + axis] = source[a * 3 + axis];
      frozenEnds[edge * 6 + 3 + axis] = source[b * 3 + axis];
    }
  }

  function release(edge: number) {
    const a = edgeA[edge], b = edgeB[edge];
    degree[a]--;
    degree[b]--;
    pairSlots[a * POINTS + b] = -1;
    edgeA[edge] = edgeB[edge] = -1;
    edgeProgress[edge] = 0;
    retiring[edge] = 0;
  }

  return {
    group,
    /** Use the bound shell's dimensions, never its triangles, to place the cloud. */
    setSurface(mesh: T.Mesh) {
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      if (!mesh.geometry.boundingSphere) return;
      mesh.updateMatrix();
      const bounds = mesh.geometry.boundingSphere.clone().applyMatrix4(mesh.matrix);
      origin.copy(bounds.center);
      boundingRadius = bounds.radius;
      initialized = false;
    },
    /** `time` freezes during pause; `still` presents a static reduced-motion graph. */
    update(time: number, dt: number, active: boolean, still = false) {
      const elapsed = previousTime < 0 ? Math.min(0.1, Math.max(0, dt)) : Math.max(0, Math.min(0.1, dt, time - previousTime));
      previousTime = time;
      if (!still) motionTime += elapsed;
      const count = simple ? SIMPLE_POINTS : POINTS;
      const maxDegree = simple ? 2 : 3;
      updatePoints(motionTime, count, active);
      linked.fill(0);

      // Existing links persist as points separate, until band exit or wrap.
      for (let edge = 0; edge < EDGES; edge++) {
        if (edgeA[edge] < 0) continue;
        const a = edgeA[edge], b = edgeB[edge];
        if (!retiring[edge] && (!eligible[a] || !eligible[b] || degree[a] > maxDegree || degree[b] > maxDegree)) retire(edge);
        if (retiring[edge]) {
          edgeProgress[edge] = still ? 0 : Math.max(0, edgeProgress[edge] - elapsed / TRANSITION);
          if (edgeProgress[edge] === 0) release(edge);
        }
      }

      if (active) for (let candidate = 0; candidate < pairCount; candidate++) {
        const code = pairs[candidate], a = Math.floor(code / POINTS), b = code % POINTS;
        if (!eligible[a] || !eligible[b] || degree[a] >= maxDegree || degree[b] >= maxDegree || pairSlots[code] >= 0) continue;
        const dx = positions[a * 3] - positions[b * 3];
        const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
        const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
        if (dx * dx + dy * dy + dz * dz > size * size) continue;
        let available = -1;
        for (let edge = 0; edge < EDGES; edge++) if (edgeA[edge] < 0) { available = edge; break; }
        if (available < 0) break;
        edgeA[available] = a;
        edgeB[available] = b;
        pairSlots[code] = available;
        degree[a]++;
        degree[b]++;
      }

      let visible = false;
      for (let edge = 0; edge < EDGES; edge++) {
        const a = edgeA[edge], b = edgeB[edge];
        if (a < 0) {
          lineWeights[edge * 2] = lineWeights[edge * 2 + 1] = 0;
          continue;
        }
        if (!retiring[edge]) {
          edgeProgress[edge] = still ? 1 : Math.min(1, edgeProgress[edge] + elapsed / TRANSITION);
          linked[a] = linked[b] = 1;
        }
        const progress = edgeProgress[edge];
        const offset = edge * 6;
        for (let axis = 0; axis < 3; axis++) {
          const start = retiring[edge] ? frozenEnds[offset + axis] : positions[a * 3 + axis];
          const end = retiring[edge] ? frozenEnds[offset + 3 + axis] : positions[b * 3 + axis];
          linePositions[offset + axis] = start;
          linePositions[offset + 3 + axis] = start + (end - start) * progress;
        }
        lineWeights[edge * 2] = lineWeights[edge * 2 + 1] = Math.min(1, progress * 4);
        visible ||= progress > 0;
      }

      for (let point = 0; point < POINTS; point++) {
        const target = linked[point];
        nodeWeights[point] = still ? target : T.MathUtils.clamp(nodeWeights[point] + (target ? 1 : -1) * elapsed / TRANSITION, 0, 1);
        if (target) for (let axis = 0; axis < 3; axis++) nodePositions[point * 3 + axis] = positions[point * 3 + axis];
        visible ||= nodeWeights[point] > 0;
      }
      group.visible = visible;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.weight.needsUpdate = true;
      nodeGeometry.attributes.position.needsUpdate = true;
      nodeGeometry.attributes.weight.needsUpdate = true;
    },
    setQuality(dpr: number, simplified: boolean) {
      nodeMaterial.uniforms.pixelRatio.value = dpr;
      simple = simplified;
    },
  };
}
