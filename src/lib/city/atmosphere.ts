import * as T from 'three';
import { CityResources } from './assets';
/** Small vent plumes make cold air visible beside identifiable in-world vents. */
export function createCitySteam(scene: T.Scene, r: CityResources, mobile: boolean) {
  const n = mobile ? 24 : 54, positions = new Float32Array(n * 3), seeds = new Float32Array(n), districts = new Float32Array(n);
  const emitters = [[-5.65, 1.7, -15.8], [37.9,1.6,-36.4], [54.4, .3, -64]];
  for (let i = 0; i < n; i++) {
    positions.set(emitters[i % 3], i * 3);
    seeds[i] = (i * .61803398875) % 1;
    districts[i] = i % 3;
  }
  const geometry = r.geometry(new T.BufferGeometry());
  geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new T.BufferAttribute(seeds, 1));
  geometry.setAttribute('aDistrict', new T.BufferAttribute(districts, 1));
  const uniforms = { uTime: { value: 0 }, uLoaded: { value: 0 }, uScale: { value: 900 } };
  const material = r.material(new T.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, vertexShader: `attribute float aSeed;attribute float aDistrict;uniform float uTime;uniform float uLoaded;uniform float uScale;varying float vAlpha;varying float vSeed;
 void main(){float age=fract(aSeed+uTime*.11);vec3 p=position;p.y+=age*2.6;p.x+=sin(age*5.+aSeed*9.)*age*.3;p.z+=age*.35;vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;
 gl_PointSize=clamp(uScale*(.2+age*.65)/max(2.,-view.z),1.,95.);vAlpha=(1.-age)*smoothstep(0.,.16,age)*.065*step(aDistrict,uLoaded)*exp(-max(0.,-view.z)*.025);vSeed=aSeed;
 }`, fragmentShader: `varying float vAlpha;varying float vSeed;void main(){vec2 q=gl_PointCoord-.5;float a=pow(max(0.,1.-length(q)*2.),2.);float wisps=.7+.3*sin(q.x*15.+q.y*10.+vSeed*20.);gl_FragColor=vec4(.56,.65,.71,a*wisps*vAlpha);}` }));
  const steam = new T.Points(geometry, material);
  steam.frustumCulled = false;
  scene.add(steam);
  return uniforms;
}
