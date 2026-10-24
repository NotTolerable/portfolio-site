import * as THREE from "three";

export type WorldInput = { x: number; y: number; pressed: boolean; paused: boolean; reduced: boolean; scroll: number; rainy: boolean; night: boolean };

/** Image-based, 2.5D art direction: a depth-deformed city landscape, layered
 * mist, and GPU-animated rain. It is not a fully modelled game level. */
export async function createInkWorld(canvas: HTMLCanvasElement, input: WorldInput) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.25 : 1.5));
  renderer.setClearColor(0x0b1119, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 80);
  camera.position.z = 20;
  let artTexture: THREE.Texture;
  try { artTexture = await new THREE.TextureLoader().loadAsync("/illustrations/night-city.webp"); }
  catch (error) { renderer.dispose(); throw error; }
  artTexture.colorSpace = THREE.SRGBColorSpace;
  artTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  const artGeometry = new THREE.PlaneGeometry(24, 16, 80, 48);
  const position = artGeometry.attributes.position;
  const uv = artGeometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    // Keep the skyline shallow and bring the near rooftops forward.
    const foreground = THREE.MathUtils.smoothstep(u, .3, .8) * (1 - THREE.MathUtils.smoothstep(v, .55, 1));
    position.setZ(i, foreground * .85);
  }
  artGeometry.computeVertexNormals();
  const artMaterial = new THREE.ShaderMaterial({
    uniforms: { map: { value: artTexture }, dusk: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform sampler2D map;uniform float dusk;varying vec2 vUv;
      void main(){vec3 c=texture2D(map,vUv).rgb;vec3 neon=smoothstep(vec3(.12),vec3(.7),c)*vec3(.13,.07,.045);
      c+=neon*dusk;gl_FragColor=vec4(c,1.0);
      #include <colorspace_fragment>
      }`,
  });
  const art = new THREE.Mesh(artGeometry, artMaterial); scene.add(art);

  const cloudCanvas = document.createElement("canvas"); cloudCanvas.width = cloudCanvas.height = 128;
  const context = cloudCanvas.getContext("2d");
  if (!context) { artGeometry.dispose(); artMaterial.dispose(); artTexture.dispose(); renderer.dispose(); throw new Error("Cloud texture unavailable"); }
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,.7)"); gradient.addColorStop(.35, "rgba(255,255,255,.3)"); gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  const clouds: THREE.Sprite[] = [];
  for (let i = 0; i < 7; i++) {
    const material = new THREE.SpriteMaterial({ map: cloudTexture, color: 0x849bb7, transparent: true, opacity: .045, depthWrite: false });
    const cloud = new THREE.Sprite(material); cloud.scale.set(9 + i % 3 * 2, 3 + i % 2, 1);
    cloud.position.set(-13 + i * 4.1, -4.8 + i % 3 * 1.1, 2 + i % 3 * 1.6); scene.add(cloud); clouds.push(cloud);
  }
  const count = innerWidth < 760 ? 180 : 420;
  const rainGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 6), tails = new Float32Array(count * 2);
  let seed = 9181;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < count; i++) {
    const x = random() * 36 - 18, y = random() * 24 - 12, z = 1 + random() * 8;
    positions.set([x, y, z, x, y, z], i * 6); tails[i * 2 + 1] = 1;
  }
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  rainGeometry.setAttribute("tail", new THREE.BufferAttribute(tails, 1));
  const rainMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, strength: { value: 1 } },
    vertexShader: `uniform float time;attribute float tail;varying float depth;
      void main(){vec3 p=position;float speed=3.2+position.z*.25;
      p.y=mod(p.y-time*speed+120.,24.)-12.+tail*.19;p.x+=tail*.035;
      depth=.1+position.z*.012;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `uniform float strength;varying float depth;void main(){gl_FragColor=vec4(.61,.76,.91,depth*strength);}`,
    transparent: true, depthWrite: false,
  });
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial); rain.frustumCulled = false; scene.add(rain);
  let disposed = false, frame = 0, previous = 0, time = 0, visible = true;
  let yaw = 0, pitch = 0, progress = 0, dusk = 0, rainStrength = 1;
  let width = 1, height = 1, compact = false, dirty = true, lastState = "";
  let samples = 0, totalFrameTime = 0;
  const dayCloud = new THREE.Color(0x667e98), duskCloud = new THREE.Color(0x8e7180);
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    if (!width || !height) return;
    compact = width < 760;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    dirty = true;
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); intersection.observe(canvas);
  function render(now: number) {
    if (disposed) return;
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 0; previous = now;
    if (visible && !document.hidden) {
      const smoothing = input.reduced ? 1 : 1 - Math.exp(-delta * 6);
      const ease = (current: number, target: number) => Math.abs(current - target) < .00001 ? target : current + (target - current) * smoothing;
      if (!input.paused && !input.reduced) time += delta;
      yaw = ease(yaw, Math.max(-1, Math.min(1, input.x))); pitch = ease(pitch, Math.max(-1, Math.min(1, input.y)));
      progress = ease(progress, input.reduced ? 0 : input.scroll); dusk = ease(dusk, input.night ? 1 : 0); rainStrength = ease(rainStrength, input.rainy && !input.reduced ? 1 : 0);
      // Adapt resolution after sustained slow frames; never increase the budget.
      if (delta > 0 && !input.paused && !input.reduced && samples < 90) {
        samples++; totalFrameTime += delta;
        if (samples === 90 && totalFrameTime / samples > .027 && renderer.getPixelRatio() > 1) {
          renderer.setPixelRatio(1); renderer.setSize(width, height, false); dirty = true;
        }
      }
      const state = [time, yaw, pitch, progress, dusk, rainStrength].join(",");
      if (!dirty && state === lastState) { frame = requestAnimationFrame(render); return; }
      lastState = state; dirty = false;
      const viewHeight = Math.tan(Math.PI / 9) * 40;
      const scale = Math.max(viewHeight / 16, viewHeight * camera.aspect / 24) * (compact ? 1.06 : 1.08) * (1 + progress * .12);
      art.scale.setScalar(scale);
      art.position.set(compact ? -6.7 * scale : 0, compact ? -.7 : .15, -1);
      camera.position.set(yaw * .6 + Math.sin(time * .14) * .06, pitch * .35, 20 - progress * .6);
      camera.lookAt(-progress * .4, progress * .15, 0);
      artMaterial.uniforms.dusk.value = dusk;
      clouds.forEach((cloud, i) => {
        cloud.position.x = -14 + ((i * 4.1 + time * .13) % 29);
        cloud.material.color.copy(dayCloud).lerp(duskCloud, dusk); cloud.material.opacity = .035 + progress * .04;
      });
      rainMaterial.uniforms.time.value = time;
      rainMaterial.uniforms.strength.value = rainStrength;
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
  }
  await renderer.compileAsync(scene, camera);
  render(performance.now());
  return { dispose() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); artGeometry.dispose(); artMaterial.dispose(); artTexture.dispose(); cloudTexture.dispose(); clouds.forEach((cloud) => cloud.material.dispose()); rainGeometry.dispose(); rainMaterial.dispose(); renderer.dispose(); } };
}
