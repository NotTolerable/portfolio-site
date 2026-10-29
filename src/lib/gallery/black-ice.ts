import * as T from "three";

/**
 * Original dark glacier ice: rough chipped skin around a clear refractive core.
 * Physical HDR lighting stays intact; the custom frost field controls roughness,
 * relief and transmission separately instead of tinting the entire volume black.
 * No reference shader or texture is used.
 */
export function createBlackIceMaterial(
  normal: T.Texture,
  index: number,
  size: number,
  pattern: T.Texture,
  frost: T.Texture,
) {
  const uniforms = {
    iceTime: { value: 0 },
    iceSeed: { value: 17.3 + index * 23.7 },
    iceScale: { value: size },
    iceDetail: { value: 1 },
    iceReveal: { value: 1 },
    iceFrostMap: { value: frost },
    iceTriangleMap: { value: pattern },
    icePatternRepeat: { value: 3.74 },
  };
  const material = new T.MeshPhysicalMaterial({
    color: 0x1e252b,
    metalness: 0,
    roughness: 0.65,
    transmission: 0.96,
    thickness: size * 0.3,
    ior: 1.18,
    attenuationColor: 0xe2e9ed,
    attenuationDistance: Infinity,
    envMapIntensity: 0.72,
    normalMap: normal,
    normalScale: new T.Vector2(0.34, 0.34),
    clearcoat: 0.08,
    clearcoatRoughness: 0.36,
    specularIntensity: 0.85,
    dispersion: 0,
    side: T.FrontSide,
  });
  material.name = `Black ice / ${index + 1}`;
  material.customProgramCacheKey = () => "bp-black-ice-v7";
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vIcePosition;
         varying vec3 vIceObjectNormal;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vIcePosition = position;
         vIceObjectNormal = normal;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vIcePosition;
         varying vec3 vIceObjectNormal;
         uniform float iceTime;
         uniform float iceSeed;
         uniform float iceScale;
         uniform float iceDetail;
         uniform float iceReveal;
         uniform sampler2D iceFrostMap;
         uniform sampler2D iceTriangleMap;
         uniform float icePatternRepeat;
         float iceHash(vec3 p) {
           p = fract(p * .1031);
           p += dot(p, p.yzx + 33.33);
           return fract((p.x + p.y) * p.z);
         }
         float iceNoise(vec3 p) {
           vec3 cell = floor(p), f = fract(p);
           f = f * f * (3. - 2. * f);
           return mix(
             mix(mix(iceHash(cell), iceHash(cell + vec3(1,0,0)), f.x),
                 mix(iceHash(cell + vec3(0,1,0)), iceHash(cell + vec3(1,1,0)), f.x), f.y),
             mix(mix(iceHash(cell + vec3(0,0,1)), iceHash(cell + vec3(1,0,1)), f.x),
                 mix(iceHash(cell + vec3(0,1,1)), iceHash(cell + vec3(1,1,1)), f.x), f.y), f.z);
         }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         vec3 iceP = vIcePosition / iceScale;
         vec3 iceDomain = iceP * 3.8 + vec3(iceSeed, 0., iceSeed * .31);
         // Stable object-space erosion reverses exactly with scroll.
         if (iceReveal < .999 && iceHash(floor(iceDomain * 17.)) > iceReveal) discard;
         float iceCloud = iceNoise(iceP * 12. + iceSeed) * .64 + iceNoise(iceP * 29. - iceSeed) * .36;
         float iceGrain = iceDetail > .5 ? iceNoise(iceP * 220. + iceSeed) : .5;
         // Irregular wet seams and granular pits, rather than striped mineral bands.
         float iceSeam = abs(iceNoise(iceP * 24. + vec3(iceCloud * 2.)) - .53);
         float iceCrack = (1. - smoothstep(.008, .035, iceSeam)) * smoothstep(.59, .8, iceCloud);
         float iceFacing = abs(dot(normalize(vNormal), normalize(vViewPosition)));
         float iceEdge = smoothstep(.28, .48, length(iceP.xy * vec2(1.15, .83)));
         float iceFrost = clamp(.17 + iceEdge * .7 + (iceCloud - .5) * .55 + (1. - iceFacing) * .2, .06, .97);
         // Surface coordinates stay attached to the volume on all sides.
         vec3 iceDirection = normalize(iceP / vec3(.36, .5, .3));
         vec2 iceUv = vec2(atan(iceDirection.z, iceDirection.x) / 6.28318530718 + .5,
                           asin(clamp(iceDirection.y, -1., 1.)) / 3.14159265359 + .5);
         vec2 iceWave = texture2D(iceFrostMap, iceUv).rg;
         float iceTrail = clamp(iceWave.r, 0., 1.);
         float iceRime = max(0., iceWave.g);
         float iceTouch = iceTrail;
         // Independently generated irregular triangulation, exposed by the wave.
         float iceFacet = texture2D(iceTriangleMap, iceUv * vec2(2., 1.) * icePatternRepeat).r;
         float iceSurface = iceCloud * .2 + iceGrain * .055 - iceCrack * .018;
         iceFrost *= 1. - iceTouch;
         float iceClarity = 1. - iceFrost;
         // Charcoal belongs to the outer skin, not the transmitted interior.
         diffuseColor.rgb *= .7 + iceCloud * .45;
         diffuseColor.rgb += vec3(.012, .014, .016) * iceFrost * (.5 + iceGrain * .5);
         #ifndef USE_TRANSMISSION
           // Cheap tiers retain the clear central window without a refraction target.
           diffuseColor.a *= mix(.32, .96, iceFrost);
         #endif`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
         roughnessFactor = clamp((mix(.12, .66, iceFrost) + (iceGrain - .5) * .09 - iceCrack * .04) * (1. - iceTrail * .9), .015, .72);`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `// Object-space triplanar frost has no stretched side-face UVs.
         vec3 iceWeights = pow(abs(normalize(vIceObjectNormal)), vec3(4.));
         iceWeights /= max(.001, iceWeights.x + iceWeights.y + iceWeights.z);
         float iceFine = texture2D(normalMap, iceP.xy * 5.5).a;
         if (iceDetail > .5) iceFine =
           texture2D(normalMap, iceP.yz * 5.5).a * iceWeights.x +
           texture2D(normalMap, iceP.xz * 5.5).a * iceWeights.y + iceFine * iceWeights.z;
         float iceHeight = iceSurface + (iceFine - .5) * .11;
         vec3 iceDpdx = dFdx(-vViewPosition);
         vec3 iceDpdy = dFdy(-vViewPosition);
         vec3 iceR1 = cross(iceDpdy, normal);
         vec3 iceR2 = cross(normal, iceDpdx);
         float iceDet = dot(iceDpdx, iceR1);
         vec3 iceGradient = sign(iceDet) *
           (dFdx(iceHeight) * iceR1 + dFdy(iceHeight) * iceR2);
         normal = normalize(abs(iceDet) * normal - iceGradient * iceScale * .008 * (.15 + iceFrost * .85));`,
      )
      .replace(
        "#include <transmission_fragment>",
        T.ShaderChunk.transmission_fragment
          .replace("material.transmission = transmission;", "material.transmission = mix(.97, .58, iceFrost);")
          .replace("material.thickness = thickness;", "material.thickness = thickness * (.55 + iceFrost * .9);")
          // The rough exterior still catches the studio light. The clearer
          // interior uses less microfacet blur so individual points survive.
          .replace("vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );",
            "vec3 n = transformNormalByInverseViewMatrix( normalize(mix(normal, nonPerturbedNormal, iceClarity * .85)), viewMatrix );")
          .replace("n, v, material.roughness,",
            "n, v, mix(.025, material.roughness, smoothstep(.12, .68, iceFrost)),")
          .replace("material.diffuseContribution, material.specularColorBlended", "mix(material.diffuseContribution, vec3(.88, .93, .96), .48 + iceClarity * .5), material.specularColorBlended"),
      )
      .replace(
        "#include <opaque_fragment>",
        `// The advancing frontier is bright; its retained clearing is faint.
         float iceLattice = iceFacet * min(1.4, iceRime * 10. + iceTrail * iceTrail * .11);
         outgoingLight += vec3(.9, .95, 1.) * iceLattice;
         #include <opaque_fragment>`,
      );
  };
  return {
    material,
    update(time: number, reveal = 1, field?: T.Texture) {
      uniforms.iceTime.value = time;
      uniforms.iceReveal.value = Math.max(0, Math.min(1, reveal));
      if (field) uniforms.iceFrostMap.value = field;
    },
    setField(field: T.Texture) { uniforms.iceFrostMap.value = field; },
    setViewport(height: number) {
      // Our volume UVs cover more area than authored model UVs; calibrate the
      // visible cell size rather than carrying over a foreign texture repeat.
      uniforms.icePatternRepeat.value = 5.4 * Math.min(1, height / 1300);
    },
    setQuality(transmission: boolean) {
      const changed = material.transmission > 0 !== transmission;
      material.transmission = transmission ? 0.96 : 0;
      material.transparent = !transmission;
      // Cheap profiles keep the same dark mineral body while allowing a dim
      // object silhouette; they avoid the physical transmission render target.
      material.opacity = 1;
      material.depthWrite = transmission;
      material.roughness = transmission ? 0.65 : 0.58;
      material.clearcoat = transmission ? 0.08 : 0;
      material.dispersion = 0;
      uniforms.iceDetail.value = transmission ? 1 : 0;
      if (changed) material.needsUpdate = true;
    },
  };
}

/** Matches the shader's volume-attached coordinates without geometry UV seams. */
export function iceContactUv(point: T.Vector3, size: number, target: T.Vector2) {
  const x = point.x / (size * .36), y = point.y / (size * .5), z = point.z / (size * .3);
  const length = Math.max(.00001, Math.hypot(x, y, z));
  return target.set(Math.atan2(z, x) / (Math.PI * 2) + .5, Math.asin(T.MathUtils.clamp(y / length, -1, 1)) / Math.PI + .5);
}
