import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { randomSource } from "./art";
import { gpuVertex, gpuFragment } from "./shaders";

const fanCenter = 4.72;
const fanDepth = 1.12;

function roundedRectangle(width: number, height: number, radius: number) {
  const shape = new T.Shape(), x = -width / 2, y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function extrude(shape: T.Shape, depth: number, bevel = .055) {
  const geometry = new T.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel,
    bevelSegments: 2, steps: 1, curveSegments: 8,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** Unbranded contemporary card: a sculpted X frame, blank panel and one large fan. */
function cardGeometry() {
  const body: T.BufferGeometry[] = [], traces: T.BufferGeometry[] = [];
  function add(geometry: T.BufferGeometry, x = 0, y = 0, z = 0, part = 0, trace = false) {
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    flat.deleteAttribute("uv");
    flat.setAttribute("holoPart", new T.BufferAttribute(new Float32Array(flat.getAttribute("position").count).fill(part), 1));
    flat.translate(x, y, z);
    (trace ? traces : body).push(flat);
  }
  function box(w: number, h: number, d: number, x: number, y: number, z: number, part = 0, trace = false) {
    add(new T.BoxGeometry(w, h, d), x, y, z, part, trace);
  }
  function strut(ax: number, ay: number, bx: number, by: number) {
    const geometry = new RoundedBoxGeometry(Math.hypot(bx - ax, by - ay), .37, 1.97, 2, .105);
    geometry.rotateZ(Math.atan2(by - ay, bx - ax));
    add(geometry, (ax + bx) / 2, (ay + by) / 2, .04, 1);
  }
  // A continuous rounded perimeter keeps the physical depth visible from every angle.
  const rim = roundedRectangle(18, 7.55, .84);
  rim.holes.push(new T.Path(roundedRectangle(17.3, 6.85, .62).getPoints(8)));
  add(extrude(rim, 1.9, .045), 0, 0, 0, 1);
  for (const y of [-3.48, 3.48]) {
    strut(-3.2, y, .18, 0);
    strut(.18, 0, 3.22, y);
  }
  // The broad left plate is deliberately blank: no vendor marks or model number.
  const panel = new T.Shape();
  panel.moveTo(-7.78, -3.15);
  panel.lineTo(-3.34, -3.15);
  panel.quadraticCurveTo(-3.12, -3.15, -2.94, -2.96);
  panel.lineTo(-.68, -.38);
  panel.quadraticCurveTo(-.31, 0, -.68, .38);
  panel.lineTo(-2.94, 2.96);
  panel.quadraticCurveTo(-3.12, 3.15, -3.34, 3.15);
  panel.lineTo(-7.78, 3.15);
  panel.quadraticCurveTo(-8.34, 3.15, -8.34, 2.58);
  panel.lineTo(-8.34, -2.58);
  panel.quadraticCurveTo(-8.34, -3.15, -7.78, -3.15);
  add(extrude(panel, .2), 0, 0, 1.01);
  add(extrude(panel, .14), 0, 0, -1.02, .18);
  // Recessed triangular panels leave the bright X support legible, not a generic box.
  for (const sign of [-1, 1]) {
    const triangle = new T.Shape();
    triangle.moveTo(-2.7, sign * 3.32);
    triangle.lineTo(2.7, sign * 3.32);
    triangle.lineTo(.18, sign * .53);
    triangle.closePath();
    add(extrude(triangle, .18), 0, 0, .88, .08);
  }
  add(new T.TorusGeometry(3.18, .105, 6, 72), fanCenter, 0, 1.03, 1);
  add(new T.TorusGeometry(2.96, .026, 4, 72), fanCenter, 0, 1.15, .55, true);
  const hub = new T.CylinderGeometry(.91, .91, .31, 40);
  hub.rotateX(Math.PI / 2);
  add(hub, fanCenter, 0, 1.27, .72);
  add(new T.TorusGeometry(.91, .035, 5, 48), fanCenter, 0, 1.44, 1);
  // Diagonal fin ends are clipped to the fan aperture. They remain behind the blades.
  const finAngle = Math.PI * .24, dx = Math.cos(finAngle), dy = Math.sin(finAngle);
  for (let i = -18; i <= 18; i++) {
    const offset = i * .165, halfLength = Math.sqrt(3.09 ** 2 - offset ** 2);
    const fin = new T.BoxGeometry(halfLength * 2, .043, 1.42);
    fin.rotateZ(finAngle);
    add(fin, fanCenter - dy * offset, dx * offset, -.04, .2, true);
  }
  // The visible top connector and left expansion bracket reinforce the GPU silhouette.
  box(9.2, .55, .13, -2.18, 3.91, -.68, .15);
  for (let i = 0; i < 38; i++) {
    if (i === 8 || i === 9) continue;
    box(.15, .39, .045, -6.4 + i * .218, 4.11, -.57, .85, true);
  }
  box(.22, 8.15, 2.75, -9.28, -.18, -.22, .86);
  box(.7, .18, 2.75, -9.03, -4.2, -.22, .86);
  for (const y of [-1.68, .15, 1.74]) box(.28, .69, 1.22, -9.43, y, -.21, .35, true);
  box(1.68, .45, .94, 1.55, 3.63, -.1, .25);
  // A backplate, memory packages and sparse traces add depth without a second front fan.
  add(new RoundedBoxGeometry(7.7, 5.7, .13, 2, .16), -3.9, 0, -1.1, .16);
  for (let i = 0; i < 6; i++) {
    box(.73, .56, .13, -6.6 + (i % 3) * 2.3, i < 3 ? 2.1 : -2.1, -1.24, .3, true);
    box(.032, 1.2, .025, -6.35 + i * 1.03, 0, -1.22, .4, true);
  }
  const bodyGeometry = mergeGeometries(body)!, traceGeometry = mergeGeometries(traces)!;
  [...body, ...traces].forEach(g => g.dispose());
  return { bodyGeometry, traceGeometry };
}

function rotorGeometry() {
  const blades: T.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const shape = new T.Shape();
    shape.moveTo(.76, -.2);
    shape.quadraticCurveTo(1.68, -1.04, 2.75, -1.03);
    shape.quadraticCurveTo(3.06, -.63, 3.02, .24);
    shape.quadraticCurveTo(1.66, -.03, .76, .38);
    shape.closePath();
    const blade = extrude(shape, .085, .025);
    blade.deleteAttribute("uv");
    blade.setAttribute("holoPart", new T.BufferAttribute(new Float32Array(blade.getAttribute("position").count).fill(.38), 1));
    blade.rotateZ(i / 7 * Math.PI * 2);
    blades.push(blade);
  }
  const geometry = mergeGeometries(blades)!;
  blades.forEach(g => g.dispose());
  return geometry;
}

/** Samples the actual model surfaces so assembly resolves into the visible GPU. */
function sampleCard(count: number, body: T.BufferGeometry, traces: T.BufferGeometry, rotor: T.BufferGeometry) {
  const geometry = mergeGeometries([body, traces])!;
  const mesh = new T.Mesh(geometry);
  const random = randomSource(1459);
  // The installed r186 sampler has this public method; its DefinitelyTyped declaration lags it.
  type SeededSampler = MeshSurfaceSampler & { setRandomGenerator(random: () => number): MeshSurfaceSampler };
  const sampler = (new MeshSurfaceSampler(mesh) as SeededSampler).setRandomGenerator(random).build();
  const fanMesh = new T.Mesh(rotor);
  const fanSampler = (new MeshSurfaceSampler(fanMesh) as SeededSampler).setRandomGenerator(random).build();
  const positions = new Float32Array(count * 3), seeds = new Float32Array(count), point = new T.Vector3();
  for (let i = 0; i < count; i++) {
    if (random() < .22) {
      fanSampler.sample(point);
      point.x += fanCenter;
      point.z += fanDepth;
    } else sampler.sample(point);
    positions.set([point.x, point.y, point.z], i * 3);
    seeds[i] = random();
  }
  geometry.dispose();
  (mesh.material as T.Material).dispose();
  (fanMesh.material as T.Material).dispose();
  const result = new T.BufferGeometry();
  result.setAttribute("position", new T.BufferAttribute(positions, 3));
  result.setAttribute("seed", new T.BufferAttribute(seeds, 1));
  return result;
}

export function gpuParticleGeometry(count: number) {
  const { bodyGeometry, traceGeometry } = cardGeometry(), rotor = rotorGeometry();
  const result = sampleCard(count, bodyGeometry, traceGeometry, rotor);
  bodyGeometry.dispose(); traceGeometry.dispose(); rotor.dispose();
  return result;
}

export function createGpuHologram() {
  const group = new T.Group(), { bodyGeometry, traceGeometry } = cardGeometry(), rotor = rotorGeometry();
  const uniforms = {
    time: { value: 0 }, still: { value: 0 }, pixelRatio: { value: 1 },
    cursor: { value: new T.Vector3(100,100,100) }, presence: { value: 0 },
    assembly: { value: 0 }, departure: { value: 0 }, surfacePresence: { value: 0 },
  };
  const surface = new T.ShaderMaterial({
    uniforms, side: T.DoubleSide, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `attribute float holoPart;varying float vPart;varying vec3 vLocal;varying vec3 vNormal;varying vec3 vView;void main(){vPart=holoPart;vLocal=position;vec4 v=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=-v.xyz;gl_Position=projectionMatrix*v;}`,
    fragmentShader: `
      uniform float time;uniform float still;uniform float surfacePresence;varying float vPart;varying vec3 vLocal;varying vec3 vNormal;varying vec3 vView;
      void main(){
        float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),2.2);
        float scan=.68+.32*smoothstep(.1,.25,fract(vLocal.y*17.));
        float band=exp(-pow((vLocal.y-mod(time*.65,12.)+6.)*2.8,2.))*(1.-still);
        vec2 g=abs(fract(vLocal.xy*1.6)-.5);float grid=1.-smoothstep(.025,.06,min(g.x,g.y));
        vec3 color=mix(vec3(.07,.27,.31),vec3(.68,.9,.93),clamp(vPart*.65+rim*.35+band*.25,0.,1.));
        float alpha=(.045+vPart*.055+rim*(.12+vPart*.16)+grid*.012+band*.085)*scan*surfacePresence;
        gl_FragColor=vec4(color,alpha);
      }`,
  });
  group.add(new T.Mesh(bodyGeometry, surface));
  group.add(new T.Mesh(traceGeometry, surface));
  const edgeMaterial = new T.LineBasicMaterial({ color: 0x9ee8e7, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });
  const outline = new T.LineSegments(new T.EdgesGeometry(bodyGeometry, 28), edgeMaterial);
  group.add(outline);
  const fan = new T.Mesh(rotor, surface);
  fan.position.set(fanCenter, 0, fanDepth);
  group.add(fan);
  const bladeOutline = new T.LineSegments(new T.EdgesGeometry(rotor, 35), edgeMaterial);
  fan.add(bladeOutline);
  const particleMaterial = new T.ShaderMaterial({uniforms, vertexShader:gpuVertex, fragmentShader:gpuFragment, transparent:true, depthWrite:false, blending:T.AdditiveBlending});
  const points = new T.Points(sampleCard(48000, bodyGeometry, traceGeometry, rotor),particleMaterial);
  points.frustumCulled=false;
  group.add(points);
  return {
    group, uniforms,
    update(time: number, assembly: number, departure: number, presence: number) {
      uniforms.time.value=time;uniforms.assembly.value=assembly;uniforms.departure.value=departure;uniforms.presence.value=presence;
      uniforms.surfacePresence.value=presence*T.MathUtils.smoothstep(assembly,.5,.96)*(1-T.MathUtils.smoothstep(departure,0,.3));
      edgeMaterial.opacity=uniforms.surfacePresence.value*.47;
      group.visible=presence>.001;
      fan.rotation.z=time*.22;
    },
    setQuality(pointsCount: number, pixelRatio: number, simple: boolean) {
      points.geometry.setDrawRange(0,Math.min(48000,Math.round(pointsCount*.46)));
      uniforms.pixelRatio.value=pixelRatio;
      outline.visible=!simple;
    },
  };
}
