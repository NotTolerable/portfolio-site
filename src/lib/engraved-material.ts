import * as THREE from "three";

/** A real-time ink pass on lit geometry. Fine, antialiased engraving follows
 * local surfaces, with crossing strokes appearing only in deeper shadows. */
export function engravedMaterial(tint: THREE.ColorRepresentation, density = 11) {
  const material = new THREE.MeshStandardMaterial({ color: tint, roughness: .88, metalness: .05 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uInkDensity = { value: density };
    shader.vertexShader = `varying vec3 vInkPosition;varying vec3 vInkNormal;\n${shader.vertexShader}`
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvInkPosition=position;vInkNormal=normal;`);
    shader.fragmentShader = `uniform float uInkDensity;varying vec3 vInkPosition;varying vec3 vInkNormal;
      float inkLine(float phase,float weight){float d=abs(fract(phase)-.5);float aa=max(fwidth(phase)*.65,.012);return 1.-smoothstep(weight-aa,weight+aa,d);}
      ${shader.fragmentShader}`.replace("#include <opaque_fragment>", `
      vec3 n=abs(normalize(vInkNormal));vec3 weights=pow(n,vec3(8.));weights/=max(dot(weights,vec3(1.)),.001);
      vec3 p=vInkPosition;float wave=sin(p.y*3.1+p.z*.8)*.065+sin(p.y*11.7)*.008;
      float lightValue=dot(outgoingLight,vec3(.2126,.7152,.0722));float shade=1.-smoothstep(.04,.6,lightValue);
      float weight=mix(.018,.18,shade);
      float x=inkLine((p.z+wave)*uInkDensity,weight),y=inkLine((p.x+wave)*uInkDensity,weight),z=inkLine((p.x+wave)*uInkDensity,weight);
      float hatch=dot(vec3(x,y,z),weights);
      float crossPass=inkLine((p.x+p.y*.7+p.z*.55)*uInkDensity*.8,.05)*smoothstep(.5,.9,shade);
      float ink=max(hatch,crossPass);
      outgoingLight=mix(outgoingLight,vec3(.004,.008,.015),ink*.55);
      #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "night-city-engraving-v2";
  return material;
}

export function outlineMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `void main(){vec4 v=modelViewMatrix*vec4(position,1.);float width=.008+min(length(v.xyz)*.0003,.015);gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*width,1.);}`,
    fragmentShader: `void main(){gl_FragColor=vec4(.003,.005,.009,1.);}`,
    side: THREE.BackSide,
  });
}
