import * as T from 'three';
import { CityResources } from './assets';
export type SeatAnchor = {
  x: number;
  z: number;
  heading: number;
  floor: number;
  venue: string;
};
/** Read the actual chair geometry so seated people occupy chairs, rather than arbitrary room coordinates. */
export function collectCafeSeats(set: T.Group, owner: T.Group, venue: string) {
  set.updateWorldMatrix(true, true);
  const seats: SeatAnchor[] = owner.userData.seats ?? (owner.userData.seats = []);
  set.traverse(o => {
    if (!(o instanceof T.Mesh) || !o.name.includes('_chair_0'))
      return;
    const bounds = new T.Box3().setFromObject(o), size = bounds.getSize(new T.Vector3()), seat = new T.Box3(), back = new T.Box3(), p = new T.Vector3(), a = o.geometry.getAttribute('position');
    for (let i = 0; i < a.count; i++) {
      p.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld);
      const y = (p.y - bounds.min.y) / size.y;
      if (y > .38 && y < .58)
        seat.expandByPoint(p);
      if (y > .78)
        back.expandByPoint(p);
    }
    if (seat.isEmpty() || back.isEmpty())
      return;
    const center = seat.getCenter(new T.Vector3()), behind = back.getCenter(new T.Vector3()), forward = center.clone().sub(behind).setY(0).normalize();
    // The sitting clip's pelvis is ~34cm behind its root; align it over the real seat.
    seats.push({ x: center.x + forward.x * .34, z: center.z + forward.z * .34, heading: Math.atan2(forward.x, forward.z), floor: bounds.min.y, venue });
  });
}
const spillVertex = `varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
/** A motivated low-cost approximation of diffuse window bounce on wet paving, not a mirror reflection. */
export function makeSpillMaterial(r: CityResources, color: string, strength = .12) {
  return r.material(new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -1, uniforms: { uColor: { value: new T.Color(color) }, uStrength: { value: strength } }, vertexShader: spillVertex, fragmentShader: `varying vec2 vUv;varying vec3 vWorld;uniform vec3 uColor;uniform float uStrength;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){vec2 q=(vUv-.5)*2.;float d=dot(q,q);float feather=pow(max(0.,1.-d),2.2);float broken=.64+.36*hash(floor(vWorld.xz*12.));gl_FragColor=vec4(uColor*feather*broken,uStrength*feather);

 }` }));
}
