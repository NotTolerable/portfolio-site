import * as T from "three";
import { CityResources } from "./assets";

export function createCitySnow(scene: T.Scene, r: CityResources) {
  const skyMaterial = r.material(
    new T.ShaderMaterial({
      side: T.BackSide,
      depthWrite: false,
      uniforms: {
        uHorizon: { value: new T.Color("#152b3e") },
        uZenith: { value: new T.Color("#030a15") },
      },
      vertexShader:
        "varying vec3 vDirection;void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec3 vDirection;uniform vec3 uHorizon;uniform vec3 uZenith;void main(){float h=smoothstep(0.,.6,max(0.,vDirection.y));gl_FragColor=vec4(mix(uHorizon,uZenith,h),1.);}",
    }),
  );
  const sky = new T.Mesh(
    r.geometry(new T.SphereGeometry(125, 24, 12)),
    skyMaterial,
  );
  sky.position.set(5, 0, -15);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);
  const count = 950,
    positions = new Float32Array(count * 3),
    seeds = new Float32Array(count),
    streets = new Float32Array(count);
  let seed = 731;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const corner = i % 5 >= 3;
    streets[i] = corner ? 1 : 0;
    positions[i * 3] = corner ? -10 + random() * 62 : -4.7 + random() * 9.4;
    positions[i * 3 + 1] = random() * 18;
    positions[i * 3 + 2] = corner ? -34.5 + random() * 7 : 15 - random() * 43;
    seeds[i] = random();
  }
  const geometry = r.geometry(new T.BufferGeometry());
  geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new T.BufferAttribute(seeds, 1));
  geometry.setAttribute("aStreet", new T.BufferAttribute(streets, 1));
  const uniforms = {
    uTime: { value: 0 },
    uCursor: { value: new T.Vector3() },
    uWind: { value: new T.Vector2() },
    uPixelRatio: { value: 1 },
  };
  const material = r.material(
    new T.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
    attribute float aSeed;attribute float aStreet;
    uniform float uTime;uniform vec3 uCursor;uniform vec2 uWind;uniform float uPixelRatio;
    varying float vAlpha;
    void main(){
      vec3 p=position;float speed=.38+aSeed*.32;
      p.y=mod(position.y-uTime*speed,18.);
      p.x+=sin(uTime*.24+aSeed*24.)*.6;
      p.z+=cos(uTime*.18+aSeed*32.)*.35;
      float influence=exp(-distance(p,uCursor)*.42);
      p.xz+=uWind*influence*1.4;
      // Keep flakes in the open street rather than falling through shop interiors.
      if(aStreet<.5){p.x=clamp(p.x,-5.45,5.45);}else{p.z=clamp(p.z,-35.,-26.8);}
      vec4 mv=modelViewMatrix*vec4(p,1.);
      vAlpha=(.18+aSeed*.32)*exp(-max(0.,-mv.z)*.018);
      gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp((21.+aSeed*15.)*uPixelRatio/max(2.,-mv.z),.8,4.5*uPixelRatio);
    }`,
      fragmentShader: `
    varying float vAlpha;
    void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.1,.5,d))*vAlpha;
      gl_FragColor=vec4(.78,.86,.92,a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
    }),
  );
  const snow = new T.Points(geometry, material);
  snow.frustumCulled = false;
  scene.add(snow);
  return uniforms;
}
