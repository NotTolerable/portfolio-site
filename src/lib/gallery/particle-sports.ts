import * as T from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { fitSportsArt } from "./sports";
import { randomSource } from "./art";

const MAX_POINTS = 18000;
const COUNTS = [MAX_POINTS, 12500, 7600, 5000];

/** Dispose the temporary source artwork after its surfaces have been sampled. */
function releaseArtwork(art: T.Group) {
  const geometry = new Set<T.BufferGeometry>();
  const materials = new Set<T.Material>();
  const textures = new Set<T.Texture>();
  art.traverse((object) => {
    if (!(object instanceof T.Mesh)) return;
    geometry.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof T.Texture) textures.add(value);
    }
  });
  geometry.forEach((value) => value.dispose());
  materials.forEach((value) => value.dispose());
  textures.forEach((value) => value.dispose());
  art.clear();
}

/** Consume the original sports meshes once, retaining only white 3D point data. */
export function createParticleSport(art: T.Group, exhibitSize: number, seed: number) {
  fitSportsArt(art, exhibitSize);
  art.updateWorldMatrix(true, true);
  const body: T.BufferGeometry[] = [], details: T.BufferGeometry[] = [];
  const instance = new T.Matrix4(), transform = new T.Matrix4();
  function collect(mesh: T.Mesh, matrix: T.Matrix4) {
    const source = mesh.geometry;
    const geometry = source.index ? source.toNonIndexed() : source.clone();
    for (const key of Object.keys(geometry.attributes)) if (key !== "position" && key !== "normal") geometry.deleteAttribute(key);
    // GLTF quantization may store normalized Int16 positions/normals. Decode
    // before baking world transforms: transformed values can exceed [-1, 1].
    for (const key of ["position", "normal"]) {
      const attribute = geometry.getAttribute(key);
      if (!attribute) continue;
      const values = new Float32Array(attribute.count * 3);
      for (let i = 0; i < attribute.count; i++) {
        values.set([attribute.getX(i), attribute.getY(i), attribute.getZ(i)], i * 3);
      }
      geometry.setAttribute(key, new T.BufferAttribute(values, 3));
    }
    geometry.applyMatrix4(matrix);
    // Seams, stitches, plate rims and grip grooves stay recognizable in white.
    const feature = source.type === "TorusGeometry" || source.type === "TubeGeometry";
    (feature ? details : body).push(geometry);
  }
  art.traverse((object) => {
    if (!(object instanceof T.Mesh)) return;
    if (object instanceof T.InstancedMesh) {
      for (let i = 0; i < object.count; i++) {
        object.getMatrixAt(i, instance);
        transform.multiplyMatrices(object.matrixWorld, instance);
        collect(object, transform);
      }
    } else collect(object, object.matrixWorld);
  });
  const bodyGeometry = mergeGeometries(body)!;
  const detailGeometry = details.length ? mergeGeometries(details)! : undefined;
  [...body, ...details].forEach((geometry) => geometry.dispose());
  releaseArtwork(art);

  const random = randomSource(seed);
  // r186 exposes this method; the current DefinitelyTyped signature lags it.
  type SeededSampler = MeshSurfaceSampler & { setRandomGenerator(random: () => number): MeshSurfaceSampler };
  const temporaryMaterial = new T.MeshBasicMaterial();
  function sampler(geometry: T.BufferGeometry) {
    return (new MeshSurfaceSampler(new T.Mesh(geometry, temporaryMaterial)) as SeededSampler).setRandomGenerator(random).build();
  }
  const bodySampler = sampler(bodyGeometry);
  const detailSampler = detailGeometry ? sampler(detailGeometry) : undefined;
  const positions = new Float32Array(MAX_POINTS * 3);
  const normals = new Float32Array(MAX_POINTS * 3);
  const seeds = new Float32Array(MAX_POINTS);
  const features = new Float32Array(MAX_POINTS);
  const position = new T.Vector3(), normal = new T.Vector3();
  for (let i = 0; i < MAX_POINTS; i++) {
    // Randomly interleave details throughout the buffer so each quality prefix
    // retains the entire shape, including the basketball's curved seam paths.
    const feature = !!detailSampler && random() < .23;
    (feature ? detailSampler! : bodySampler).sample(position, normal);
    normal.normalize();
    if (feature) position.addScaledVector(normal, exhibitSize * .00012);
    positions.set([position.x, position.y, position.z], i * 3);
    normals.set([normal.x, normal.y, normal.z], i * 3);
    seeds[i] = random();
    features[i] = feature ? 1 : 0;
  }
  bodyGeometry.dispose();
  detailGeometry?.dispose();
  temporaryMaterial.dispose();

  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
  geometry.setAttribute("surfaceNormal", new T.BufferAttribute(normals, 3));
  geometry.setAttribute("seed", new T.BufferAttribute(seeds, 1));
  geometry.setAttribute("feature", new T.BufferAttribute(features, 1));
  geometry.computeBoundingSphere();
  const uniforms = {
    time: { value: 0 },
    reveal: { value: 1 },
    pixelRatio: { value: 1 },
    objectScale: { value: exhibitSize },
    densityScale: { value: 1 },
  };
  const material = new T.ShaderMaterial({
    uniforms,
    vertexShader: `
      uniform float time; uniform float reveal; uniform float pixelRatio;
      uniform float objectScale; uniform float densityScale;
      attribute vec3 surfaceNormal; attribute float seed; attribute float feature;
      varying float vLight;
      void main() {
        vec4 view = modelViewMatrix * vec4(position, 1.);
        vec3 direction = normalize(-view.xyz);
        float facing = dot(normalize(normalMatrix * surfaceNormal), direction);
        float depth = .34 + .66 * smoothstep(-.35, .9, facing);
        float variation = .83 + seed * .17;
        float breath = .97 + .03 * sin(time * .65 + seed * 6.2831853);
        vLight = mix(depth * variation * breath, .96, feature * .9);
        float pixels = objectScale * 3.25 * densityScale / max(.1, -view.z);
        gl_PointSize = clamp(pixels, .85, 2.2) * pixelRatio * mix(.85, 1.12, feature);
        gl_Position = projectionMatrix * view;
        if (seed > reveal) gl_Position = vec4(2., 2., 2., 1.);
      }`,
    fragmentShader: `
      varying float vLight;
      void main() {
        float radius = length(gl_PointCoord - .5);
        if (radius > .46) discard;
        float core = 1. - smoothstep(.2, .46, radius);
        // Achromatic brightness gives the form depth; no colored solid surface
        // is left beneath these opaque, depth-tested particle sprites.
        gl_FragColor = vec4(vec3(vLight * (.72 + .28 * core)), 1.);
      }`,
    transparent: false,
    depthTest: true,
    depthWrite: true,
    blending: T.NoBlending,
    toneMapped: false,
  });
  material.name = "White sports particles / transmission-visible";
  const points = new T.Points(geometry, material);
  points.name = "White particle sports sculpture";
  const group = new T.Group();
  group.name = "Particle sports exhibit";
  group.add(points);
  return {
    group,
    update(time: number, reveal = 1) {
      uniforms.time.value = time;
      uniforms.reveal.value = T.MathUtils.clamp(reveal, 0, 1);
      group.visible = reveal > .0001;
    },
    setQuality(pixelRatio: number, tier: number) {
      const index = T.MathUtils.clamp(Math.round(tier), 0, COUNTS.length - 1);
      geometry.setDrawRange(0, COUNTS[index]);
      uniforms.pixelRatio.value = pixelRatio;
      uniforms.densityScale.value = Math.sqrt(MAX_POINTS / COUNTS[index]);
    },
  };
}

export type ParticleSport = ReturnType<typeof createParticleSport>;
