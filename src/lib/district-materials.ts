import * as THREE from "three";

/** Diffuse architectural surfaces: vertex lighting, restrained ink, no PBR light loops. */
export function architectureMaterial(color: number) {
  const material = new THREE.MeshLambertMaterial({ color });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = `varying vec3 vDistrict;\n${shader.vertexShader}`.replace("#include <begin_vertex>", "#include <begin_vertex>\nvDistrict=position;");
    shader.fragmentShader = `varying vec3 vDistrict;\n${shader.fragmentShader}`.replace("#include <opaque_fragment>", `
      float hatch=abs(fract((vDistrict.x+vDistrict.z)*9.+sin(vDistrict.y*2.)*.08)-.5);
      float line=1.-smoothstep(.025,.025+max(fwidth(hatch),.015),hatch);
      float base=smoothstep(0.,1.8,vDistrict.y);
      outgoingLight*=mix(.55,1.,base)*(1.-line*.12);
      #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "district-diffuse-ink-v1";
  return material;
}

export function wetRoadMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, rainy: { value: 1 }, glow: { value: 0 } },
    vertexShader: `varying vec3 world;varying float depth;void main(){vec4 w=modelMatrix*vec4(position,1.);world=w.xyz;vec4 v=viewMatrix*w;depth=-v.z;gl_Position=projectionMatrix*v;}`,
    fragmentShader: `varying vec3 world;varying float depth;uniform float time;uniform float rainy;uniform float glow;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 p=world.xz;float grain=hash(floor(p*80.));
        float wetness=.5+.5*sin(p.y*.8+sin(p.x*2.3));
        vec3 color=vec3(.013,.025,.035)*(1.+grain*.22);
        float streak=.95+.05*sin(p.y*40.+sin(p.x*80.)*.8);
        for(int i=0;i<7;i++){
          float fi=float(i);float z=5.-fi*8.;float side=mod(fi,2.)*2.-1.;
          float pool=exp(-pow((p.x-side*2.9)*1.5,2.)) * exp(-abs(p.y-z)*.2);
          vec3 tint=mod(fi,3.)<1.?vec3(.62,.28,.09):vec3(.08,.35,.43);
          color+=tint*pool*streak*(.23+glow*.12)*(.45+wetness*.55);
        }
        vec2 cell=floor(p*2.4);vec2 center=vec2(hash(cell),hash(cell+8.));
        float radius=length(fract(p*2.4)-center);float age=fract(time*.58+hash(cell+2.));
        float ripple=(1.-smoothstep(.007,.024,abs(radius-age*.55)))*(1.-age)*.016*rainy;
        color+=vec3(.2,.35,.4)*ripple;
        float edge=(1.-smoothstep(3.2,4.3,abs(p.x)));color*=mix(.35,1.,edge);
        float fog=1.-exp(-pow(depth*.026,2.));color=mix(color,vec3(.033,.067,.09),fog);
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
