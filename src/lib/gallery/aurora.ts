import * as T from "three";
/** Low-resolution advected cursor field: a fading ribbon trail, not a mouse-following disc. */
export function createCursorField(renderer: T.WebGLRenderer, mobile: boolean) {
  const size = mobile ? 128 : 256,
    options = {
      depthBuffer: false,
      stencilBuffer: false,
      type: T.HalfFloatType,
      minFilter: T.LinearFilter,
      magFilter: T.LinearFilter,
    };
  let read = new T.WebGLRenderTarget(size, size, options),
    write = new T.WebGLRenderTarget(size, size, options);
  const scene = new T.Scene(),
    camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new T.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      previous: { value: read.texture },
      pointer: { value: new T.Vector2(0.5, 0.5) },
      energy: { value: 0 },
      dt: { value: 0.016 },
      time: { value: 0 },
    },
    vertexShader:
      "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: `varying vec2 vUv;uniform sampler2D previous;uniform vec2 pointer;uniform float energy;uniform float dt;uniform float time;
 void main(){vec2 drift=vec2(sin(vUv.y*14.+time*.2)*.006,.07)*dt;float old=texture2D(previous,vUv-drift).r*exp(-2.1*dt);vec2 delta=vUv-pointer;float stamp=exp(-dot(delta,delta)/.0045)*energy*dt*48.;gl_FragColor=vec4(min(1.5,old+stamp),0.,0.,1.);}`,
  });
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  scene.add(quad);
  const oldTarget = renderer.getRenderTarget(),
    color = renderer.getClearColor(new T.Color()),
    alpha = renderer.getClearAlpha();
  renderer.setClearColor(0x000000, 0);
  for (const target of [read, write]) {
    renderer.setRenderTarget(target);
    renderer.clear();
  }
  renderer.setRenderTarget(oldTarget);
  renderer.setClearColor(color, alpha);
  return {
    get texture() {
      return read.texture;
    },
    update(dt: number, time: number, pointer: T.Vector2, energy: number) {
      material.uniforms.previous.value = read.texture;
      material.uniforms.pointer.value
        .copy(pointer)
        .multiplyScalar(0.5)
        .addScalar(0.5);
      material.uniforms.energy.value = energy;
      material.uniforms.dt.value = dt;
      material.uniforms.time.value = time;
      const previousTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(write);
      renderer.render(scene, camera);
      renderer.setRenderTarget(previousTarget);
      [read, write] = [write, read];
    },
    dispose() {
      quad.geometry.dispose();
      material.dispose();
      read.dispose();
      write.dispose();
    },
  };
}
