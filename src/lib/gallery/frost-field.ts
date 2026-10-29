import * as T from "three";

const STEP = 1 / 60;
const MAX_STEPS = 4;
const HIGH_SIZE = 256;
const SIMPLE_SIZE = 128;

/**
 * A surface contact history with a moving, advected frontier. R is the polish
 * mask; G is the signed change at the advancing/receding edge. The gallery owns
 * its clock: this helper has no RAF, events, timers or reference-site assets.
 */
export function createFrostField(renderer: T.WebGLRenderer, seed: number) {
  const options: T.RenderTargetOptions = {
    type: T.HalfFloatType,
    format: T.RGBAFormat,
    minFilter: T.LinearFilter,
    magFilter: T.LinearFilter,
    wrapS: T.RepeatWrapping,
    wrapT: T.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  };
  let resolution = HIGH_SIZE;
  let read = new T.WebGLRenderTarget(resolution, resolution, options);
  let write = new T.WebGLRenderTarget(resolution, resolution, options);
  read.texture.name = "Artifact frost history A";
  write.texture.name = "Artifact frost history B";

  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const from = new T.Vector2();
  const to = new T.Vector2();
  const uniforms = {
    history: { value: read.texture },
    strokeFrom: { value: from },
    strokeTo: { value: to },
    brushRadius: { value: 0 },
    clock: { value: 0 },
    variation: { value: seed * 0.173 },
    copying: { value: 0 },
  };
  const material = new T.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    vertexShader: `
      varying vec2 fieldUv;
      void main() {
        fieldUv = uv;
        gl_Position = vec4(position.xy, 0., 1.);
      }`,
    fragmentShader: `
      uniform sampler2D history;
      uniform vec2 strokeFrom;
      uniform vec2 strokeTo;
      uniform float brushRadius;
      uniform float clock;
      uniform float variation;
      uniform float copying;
      varying vec2 fieldUv;

      float fieldHash(vec2 p) {
        p = fract(p * vec2(.1031, .11369));
        p += dot(p, p.yx + 19.19 + variation);
        return fract((p.x + p.y) * p.x);
      }
      float fieldNoise(vec2 p) {
        vec2 cell = floor(p), f = fract(p);
        f = f * f * (3. - 2. * f);
        return mix(
          mix(fieldHash(cell), fieldHash(cell + vec2(1., 0.)), f.x),
          mix(fieldHash(cell + vec2(0., 1.)), fieldHash(cell + vec2(1.)), f.x), f.y);
      }
      float strokeDistance(vec2 p) {
        // The U seam is periodic. V ends at the surface poles/UV boundary.
        vec2 startDelta = p - strokeFrom;
        startDelta.x -= floor(startDelta.x + .5);
        vec2 segment = strokeTo - strokeFrom;
        segment.x -= floor(segment.x + .5);
        float projection = clamp(dot(startDelta, segment) / max(dot(segment, segment), 1.e-8), 0., 1.);
        return length(startDelta - segment * projection);
      }
      void main() {
        if (copying > .5) {
          gl_FragColor = texture2D(history, fieldUv);
          return;
        }
        // A world-UV distance, rather than a resolution-sized texel, keeps the
        // front travelling at the same speed in high and reduced quality.
        const float frontStep = 1. / 512.;
        vec2 flowUv = fieldUv * 3.2 + vec2(clock * .013, -clock * .009);
        vec2 flow = vec2(fieldNoise(flowUv), fieldNoise(flowUv + vec2(13.7, 9.2))) * 2. - 1.;
        vec2 sampleUv = fieldUv + flow * frontStep * .9;
        float previous = texture2D(history, sampleUv).r;
        float outward = max(previous, max(
          max(texture2D(history, sampleUv + vec2(frontStep, 0.)).r,
              texture2D(history, sampleUv - vec2(frontStep, 0.)).r),
          max(texture2D(history, sampleUv + vec2(0., frontStep)).r,
              texture2D(history, sampleUv - vec2(0., frontStep)).r)));
        float contact = 0.;
        if (brushRadius > .00001) {
          float falloff = clamp(1. - strokeDistance(fieldUv) / brushRadius, 0., 1.);
          contact = falloff * falloff * falloff;
        }
        float next = min(1., (outward + contact) * .985);
        float frontier = next - previous;
        gl_FragColor = vec4(next, frontier, 0., 1.);
      }`,
  });
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  scene.add(quad);

  const viewport = new T.Vector4();
  const scissor = new T.Vector4();
  const clearColor = new T.Color();
  function restoreAround(work: () => void) {
    const target = renderer.getRenderTarget();
    const face = renderer.getActiveCubeFace();
    const mip = renderer.getActiveMipmapLevel();
    const alpha = renderer.getClearAlpha();
    const scissoring = renderer.getScissorTest();
    renderer.getViewport(viewport);
    renderer.getScissor(scissor);
    renderer.getClearColor(clearColor);
    try {
      renderer.setScissorTest(false);
      work();
    } finally {
      renderer.setRenderTarget(target, face, mip);
      renderer.setViewport(viewport);
      renderer.setScissor(scissor);
      renderer.setScissorTest(scissoring);
      renderer.setClearColor(clearColor, alpha);
    }
  }
  function clearTargets() {
    restoreAround(() => {
      renderer.setClearColor(0x000000, 0);
      renderer.setRenderTarget(read);
      renderer.clear();
      renderer.setRenderTarget(write);
      renderer.clear();
    });
  }

  const previousInput = new T.Vector2();
  const pendingStart = new T.Vector2();
  const pendingEnd = new T.Vector2();
  const segmentDelta = new T.Vector2();
  const stepStart = new T.Vector2();
  let hasInput = false;
  let pending = false;
  let lastMotion = -Infinity;
  let accumulator = 0;
  let velocity = 0;
  let smoothVelocity = 0;
  let activity = 0;
  let disposed = false;
  function resetState() {
    hasInput = false;
    pending = false;
    lastMotion = -Infinity;
    accumulator = 0;
    velocity = 0;
    smoothVelocity = 0;
    activity = 0;
    uniforms.brushRadius.value = 0;
  }
  clearTargets();

  return {
    get texture() { return read.texture; },
    /** A trailing field can keep evolving after the pointer leaves the rock. */
    get active() { return activity > .001 || pending; },
    /**
     * Pass real pointer-motion energy in [0,1] as speed. A zero prevents a
     * rotating rock from painting itself under an otherwise stationary cursor.
     * Without speed, movement is derived from the supplied surface UVs.
     */
    update(dt: number, time: number, uv?: T.Vector2, speed?: number) {
      if (disposed || !Number.isFinite(dt) || dt <= 0 || !Number.isFinite(time)) return;
      const elapsed = Math.min(dt, STEP * MAX_STEPS);
      if (uv && Number.isFinite(uv.x) && Number.isFinite(uv.y)) {
        const u = T.MathUtils.euclideanModulo(uv.x, 1);
        const v = T.MathUtils.clamp(uv.y, 0, 1);
        const dx = u - previousInput.x;
        const du = dx - Math.floor(dx + .5);
        const dv = v - previousInput.y;
        const distance = Math.hypot(du, dv);
        const moving = speed === undefined ? distance > .00001 : speed > .0001 && distance > .00001;
        if (hasInput && moving && distance < .3 && time - lastMotion < .15) {
          if (!pending) pendingStart.copy(previousInput);
          pendingEnd.set(u, v);
          pending = true;
          lastMotion = time;
        } else if (moving || !hasInput) {
          // First/stale/jumping contacts establish a new stroke origin only.
          lastMotion = time;
        }
        previousInput.set(u, v);
        hasInput = true;
      } else {
        hasInput = false;
      }
      if (!pending && activity < .001) {
        accumulator = 0;
        return;
      }
      accumulator = Math.min(STEP * MAX_STEPS, accumulator + elapsed);
      const steps = Math.min(MAX_STEPS, Math.floor((accumulator + 1.e-7) / STEP));
      if (!steps) return;
      accumulator -= steps * STEP;

      segmentDelta.subVectors(pendingEnd, pendingStart);
      segmentDelta.x -= Math.floor(segmentDelta.x + .5);
      const distance = pending ? segmentDelta.length() / steps : 0;
      stepStart.copy(pendingStart);
      restoreAround(() => {
        for (let index = 0; index < steps; index++) {
          velocity = Math.min(1, velocity + distance * 6) * .88;
          const eased = 1 - Math.pow(1 - velocity, 4);
          smoothVelocity += (eased - smoothVelocity) * .1;
          const radius = pending ? .05 * T.MathUtils.smoothstep(smoothVelocity, .1, 1) : 0;
          from.copy(stepStart);
          to.copy(pendingStart).addScaledVector(segmentDelta, (index + 1) / steps);
          stepStart.copy(to);
          uniforms.brushRadius.value = radius;
          uniforms.clock.value = time - (steps - index - 1) * STEP;
          uniforms.history.value = read.texture;
          renderer.setRenderTarget(write);
          renderer.render(scene, camera);
          [read, write] = [write, read];
          activity = radius > .00001 ? 1 : activity * .985;
        }
      });
      pending = false;
    },
    setQuality(simple: boolean) {
      if (disposed) return;
      const nextSize = simple ? SIMPLE_SIZE : HIGH_SIZE;
      if (nextSize === resolution) return;
      const previousRead = read, previousWrite = write;
      const nextRead = new T.WebGLRenderTarget(nextSize, nextSize, options);
      const nextWrite = new T.WebGLRenderTarget(nextSize, nextSize, options);
      nextRead.texture.name = "Artifact frost history A";
      nextWrite.texture.name = "Artifact frost history B";
      try {
        restoreAround(() => {
          uniforms.history.value = previousRead.texture;
          uniforms.copying.value = 1;
          renderer.setRenderTarget(nextRead);
          renderer.render(scene, camera);
          uniforms.copying.value = 0;
          renderer.setClearColor(0x000000, 0);
          renderer.setRenderTarget(nextWrite);
          renderer.clear();
        });
      } catch (error) {
        nextRead.dispose();
        nextWrite.dispose();
        throw error;
      } finally {
        uniforms.copying.value = 0;
      }
      read = nextRead;
      write = nextWrite;
      resolution = nextSize;
      uniforms.history.value = read.texture;
      previousRead.dispose();
      previousWrite.dispose();
    },
    reset() {
      if (disposed) return;
      resetState();
      clearTargets();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      resetState();
      read.dispose();
      write.dispose();
      quad.geometry.dispose();
      material.dispose();
    },
  };
}

export type FrostField = ReturnType<typeof createFrostField>;
