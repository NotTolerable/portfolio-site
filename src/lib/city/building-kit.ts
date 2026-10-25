import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { collectCafeSeats, makeSpillMaterial } from "./staging";
import type { CityAssets } from "./assets";
import { CityResources } from "./assets";
export type CityKitCache = {
  shapes: Map<string, T.BufferGeometry>;
  materials: Map<string, T.MeshStandardMaterial>;
  labels: Map<string, T.MeshStandardMaterial>;
  maps: Map<string, Record<string, T.Texture>>;
  tints: Map<string, T.Material>;
};
export const createCityKitCache = (): CityKitCache => ({ shapes: new Map(), materials: new Map(), labels: new Map(), maps: new Map(), tints: new Map() });
/** Reusable detailed architecture; chunk roots remain in world coordinates at identity. */
export function createCityKit(scene: T.Group, assets: CityAssets, r: CityResources, cache = createCityKitCache()) {
  // The addon rebuilds its global lookup textures on each init; retain one shared set.
  if (!("LTC_FLOAT_1" in T.UniformsLib))
    RectAreaLightUniformsLib.init();
  const materialCache = cache.materials;
  const material = (color: string, roughness = 0.7, metalness = 0) => {
    const key = `${color}/${roughness}/${metalness}`;
    let m = materialCache.get(key);
    if (!m) {
      m = r.material(new T.MeshStandardMaterial({ color, roughness, metalness }));
      materialCache.set(key, m);
    }
    return m;
  };
  const brass = material("#9f8459", 0.35, 0.75), iron = material("#17262b", 0.48, 0.65), stone = material("#7f817a", 0.86), snow = material("#bac4c7", 0.96), wood = material("#162c2b", 0.51), dark = material("#141c21", 0.9);
  const amber = cache.materials.get("city-amber") ?? r.material(new T.MeshStandardMaterial({
    color: "#ffce91",
    emissive: "#ffba6d",
    emissiveIntensity: 2.6,
    roughness: 0.8,
  }));
  cache.materials.set("city-amber", amber);
  const glass = cache.materials.get("city-glass") ?? r.material(new T.MeshStandardMaterial({
    color: "#8aa0b1",
    metalness: 0,
    roughness: 0.24,
    envMapIntensity: 0.12,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  }));
  cache.materials.set("city-glass", glass);
  if (!stone.map) {
    const stoneMap = r.texture(assets.maps['concrete-diff'].clone()), stoneNormal = r.texture(assets.maps['concrete-nor_gl'].clone()), stoneRough = r.texture(assets.maps['concrete-rough'].clone());
    for (const map of [stoneMap, stoneNormal, stoneRough])
      map.repeat.set(2, 2);
    stone.map = stoneMap;
    stone.normalMap = stoneNormal;
    stone.roughnessMap = stoneRough;
    stone.normalScale.set(.22, .22);
  }
  function shape(key: string, create: () => T.BufferGeometry) {
    let g = cache.shapes.get(key);
    if (!g) {
      g = r.geometry(create());
      cache.shapes.set(key, g);
    }
    return g;
  }
  function mineralTint(m: T.MeshStandardMaterial, tint: string) {
    m.color.set("#ffffff");
    m.onBeforeCompile = (shader) => {
      shader.vertexShader = 'varying vec3 vCityWall;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvCityWall=(modelMatrix*vec4(transformed,1.)).xyz;');
      shader.uniforms.cityTint = { value: new T.Color(tint) };
      shader.fragmentShader =
        "uniform vec3 cityTint;varying vec3 vCityWall;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\nfloat cityLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(vec3(cityLuma),diffuseColor.rgb,.12)*cityTint;");
    };
    m.customProgramCacheKey = () => "city-mineral-weather-v2";
    return m;
  }
  const buildingRoots: T.Group[] = [];
  function box(parent: T.Object3D, w: number, h: number, d: number, m: T.Material, x: number, y: number, z: number, bevel = 0) {
    const g = shape(`box/${w}/${h}/${d}/${bevel}`, () => bevel ? new RoundedBoxGeometry(w, h, d, 2, Math.min(bevel, w / 3, h / 3, d / 3)) : new T.BoxGeometry(w, h, d));
    const mesh = new T.Mesh(g, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function plane(parent: T.Object3D, w: number, h: number, m: T.Material, x: number, y: number, z: number, rotation: T.Euler = new T.Euler()) {
    const mesh = new T.Mesh(shape(`plane/${w}/${h}`, () => new T.PlaneGeometry(w, h)), m);
    mesh.position.set(x, y, z);
    mesh.rotation.copy(rotation);
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function rod(parent: T.Object3D, a: T.Vector3, b: T.Vector3, width: number, m: T.Material) {
    const o = new T.Mesh(shape(`rod/${width}/${a.distanceTo(b)}`, () => new T.CylinderGeometry(width, width, a.distanceTo(b), 7)), m);
    o.position.copy(a).add(b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    o.castShadow = true;
    o.traverse(part => {
      if (part instanceof T.Mesh && !Array.isArray(part.material) && part.material.name.endsWith('_glass'))
        part.material = glass;
    });
    parent.add(o);
    return o;
  }
  const labelCache = cache.labels;
  function label(text: string, sub: string, w = 1024, h = 256, bg = "#122b2c", fg = "#e6d5b8") {
    const key = JSON.stringify([text, sub, w, h, bg, fg]), cached = labelCache.get(key);
    if (cached)
      return cached;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const c = cv.getContext("2d")!;
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = fg;
    c.lineWidth = 2;
    c.strokeRect(12, 12, w - 24, h - 24);
    c.textAlign = "center";
    c.fillStyle = fg;
    c.font = `400 ${h * 0.3}px Georgia,serif`;
    c.fillText(text, w / 2, h * 0.48, w * .88);
    c.font = `400 ${h * 0.075}px monospace`;
    c.fillText(sub, w / 2, h * 0.77);
    const t = r.texture(new T.CanvasTexture(cv));
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    const m = r.material(new T.MeshStandardMaterial({
      map: t,
      roughness: 0.6,
      emissive: "#ffe1ac",
      emissiveMap: t,
      emissiveIntensity: /BLUE|ARCADE|LIVE|KITCHEN/.test(text) ? .8 : .3,
    }));
    labelCache.set(key, m);
    return m;
  }
  function cloneProp(name: keyof CityAssets["models"], parent: T.Object3D, height: number, x: number, y: number, z: number, yaw = 0) {
    const source = assets.models[name];
    if(!source)throw Error("City model not prepared: "+name);
    const model = source.clone(true), bounds = new T.Box3().setFromObject(model), size = bounds.getSize(new T.Vector3()), center = bounds.getCenter(new T.Vector3());
    model.position.sub(new T.Vector3(center.x, bounds.min.y, center.z));
    const group = new T.Group();
    group.add(model);
    group.scale.setScalar(height / size.y);
    group.position.set(x, y, z);
    group.rotation.y = yaw;
    model.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    parent.add(group);
    if (name === "cafe")
      collectCafeSeats(group, scene, parent.name || "cafe");
    return group;
  }
  // Batched by building/material, preserving culling and original asset UVs/AO.
  function bakePart(o: T.Mesh, buckets: Map<T.Material, T.BufferGeometry[]>) {
    if (Array.isArray(o.material))
      return;
    const g = o.geometry.clone();
    if (!g.index) {
      const count = g.getAttribute('position').count;
      g.setIndex(new T.BufferAttribute(Uint32Array.from({ length: count }, (_, i) => i), 1));
    }
    for (const key of Object.keys(g.attributes))
      if (!['position', 'normal', 'uv'].includes(key))
        g.deleteAttribute(key);
    for (const key of ['position', 'normal', 'uv']) {
      const a = g.getAttribute(key);
      if (a instanceof T.BufferAttribute && a.array instanceof Float32Array && !a.normalized)
        continue;
      const count = g.getAttribute('position').count, n = key === 'uv' ? 2 : 3, data = new Float32Array(count * n);
      if (a)
        for (let i = 0; i < count; i++)
          for (let j = 0; j < n; j++)
            data[i * n + j] = a.getComponent(i, j);
      g.setAttribute(key, new T.BufferAttribute(data, n));
    }
    g.applyMatrix4(o.matrixWorld);
    if (!buckets.has(o.material))
      buckets.set(o.material, []);
    buckets.get(o.material)!.push(g);
  }
  function emitBatch(m: T.Material, parts: T.BufferGeometry[]) {
    const g = mergeGeometries(parts);
    if (g) {
      const mesh = new T.Mesh(r.geometry(g), m);
      mesh.castShadow = !m.transparent;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      scene.add(mesh);
    }
    parts.forEach(g => g.dispose());
  }
  function batch(root: T.Group) {
    root.updateMatrixWorld(true);
    const buckets = new Map<T.Material, T.BufferGeometry[]>();
    root.traverse(o => {
      if (o instanceof T.Mesh)
        bakePart(o, buckets);
    });
    for (const [m, parts] of buckets)
      emitBatch(m, parts);
    root.removeFromParent();
  }
  async function batchAsync(root: T.Group, yieldFrame: () => Promise<void>) {
    root.updateMatrixWorld(true);
    const buckets = new Map<T.Material, T.BufferGeometry[]>(), meshes: T.Mesh[] = [];
    root.traverse(o => {
      if (o instanceof T.Mesh)
        meshes.push(o);
    });
    let budget = performance.now();
    for (const mesh of meshes) {
      bakePart(mesh, buckets);
      if (performance.now() - budget > 4) {
        await yieldFrame();
        budget = performance.now();
      }
    }
    for (const [m, parts] of buckets) {
      emitBatch(m, parts);
      await yieldFrame();
    }
    root.removeFromParent();
  }
  const mapCache = cache.maps;
  const groundMaps = (id: string, repeat: T.Vector2) => {
    const key = `${id}/${repeat.x}/${repeat.y}`, cached = mapCache.get(key);
    if (cached)
      return cached;
    const maps = Object.fromEntries(["diff", "nor_gl", "rough", "ao"].map((type) => {
      const t = r.texture(assets.maps[id + "-" + type].clone());
      t.repeat.copy(repeat);
      t.anisotropy = 8;
      return [type, t];
    }));
    mapCache.set(key, maps);
    return maps;
  };
  const cobbles = groundMaps("cobbles", new T.Vector2(55, 65));
  const road = r.material(new T.MeshPhysicalMaterial({
    color: "#56616a",
    map: cobbles.diff,
    normalMap: cobbles.nor_gl,
    normalScale: new T.Vector2(0.42, 0.42),
    roughnessMap: cobbles.rough,
    aoMap: cobbles.ao,
    aoMapIntensity: 1.1,
    roughness: 0.82,
    metalness: 0.02,
    envMapIntensity: .5, clearcoat: .25, clearcoatRoughness: .24,
  }));
  road.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 vCityGround;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvCityGround=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader = 'varying vec3 vCityGround;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
   float pool=sin(vCityGround.x*.63+sin(vCityGround.z*.27))*sin(vCityGround.z*.44-vCityGround.x*.18);
   float wet=smoothstep(.0,.65,pool);roughnessFactor=mix(roughnessFactor,.29,wet*.48);`);
  };
  road.customProgramCacheKey = () => 'city-wet-paving-v1';
  const moduleMap = new Map(assets.models.architecture.children.map((o) => [o.name, o]));
  const tintCache = cache.tints;
  function module(parent: T.Group, name: string, x: number, y: number, z: number, tint: string, scaleX = 1) {
    const source = moduleMap.get(name);
    if (!source)
      throw Error("Missing city module " + name);
    const o = source.clone(true);
    o.position.add(new T.Vector3(x, y, z));
    o.scale.x *= scaleX;
    if (name.startsWith("wall") ||
      name.startsWith("crown") ||
      name.startsWith("cornice"))
      o.traverse((part) => {
        if (part instanceof T.Mesh &&
          !Array.isArray(part.material) &&
          part.material instanceof T.MeshStandardMaterial) {
          const key = part.material.uuid + tint;
          let m = tintCache.get(key);
          if (!m) {
            m = r.material(mineralTint(part.material.clone(), tint));
            tintCache.set(key, m);
          }
          part.material = m;
        }
      });
    parent.add(o);
    return o;
  }
  function balcony(parent: T.Group, x: number, y: number) {
    box(parent, 2.45, 0.14, 0.92, stone, x, y - 0.02, 0.4, 0.03);
    box(parent, 2.48, 0.045, 0.045, iron, x, y + 0.95, 0.83, 0.012);
    for (let i = 0; i < 15; i++)
      box(parent, 0.025, 0.96, 0.025, iron, x - 1.16 + i * 0.165, y + 0.46, 0.83, 0.006);
    for (const side of [-1, 1]) {
      box(parent, 0.035, 0.95, 0.035, iron, x + side * 1.2, y + 0.46, 0.1);
      box(parent, 0.035, 0.035, 0.85, iron, x + side * 1.2, y + 0.95, 0.42);
    }
    box(parent, 2.5, 0.025, 0.16, snow, x, y + 0.985, 0.82, 0.014);
  }
  function upperRoom(parent: T.Group, u: number, y: number, lit: boolean, index: number, paneWidth = 1.64) {
    const room = material(lit ? (index % 3 === 0 ? "#9fb4bc" : "#b99c78") : "#101c27", 0.94);
    if (lit) {
      room.emissive.set(index % 3 === 0 ? "#89b5c5" : "#e7b576");
      room.emissiveIntensity = index % 3 === 0 ? .8 : 1.1;
    }
    plane(parent, 2.0, 2.15, room, u, y + 1.12, -0.6);
    // Curtains and an inset ceiling, rather than flat emissive panels over the facade.
    for (const side of [-1, 1])
      for (let f = 0; f < 4; f++)
        box(parent, 0.075, 1.85, 0.06, lit ? stone : dark, u + side * (0.67 + f * 0.065), y + 1.1, -0.29 + (f % 2) * 0.04, 0.02);
    box(parent, 2.0, 0.06, 0.7, dark, u, y + 2.3, -0.32);
    if (index % 3 === 0)
      box(parent, 0.07, 1.95, 0.06, wood, u, y + 1.1, -0.22);
    const key = 'occupied-room-' + index % 4;
    let pane = glass;
    if (lit) {
      const cached = materialCache.get(key);
      if (cached)
        pane = cached;
      else {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 256;
        const c = cv.getContext('2d')!, cool = index % 3 === 0;
        const light = c.createRadialGradient(136, 72, 8, 128, 128, 190);
        light.addColorStop(0, cool ? '#9bb1b8' : '#dcc097');
        light.addColorStop(1, cool ? '#27383f' : '#534333');
        c.fillStyle = light;
        c.fillRect(0, 0, 256, 256);
        c.fillStyle = cool ? '#243239' : '#44392d';
        c.fillRect(0, 213, 256, 43);
        c.fillRect(20, 158, 79, 49);
        c.fillRect(26, 150, 67, 13);
        c.fillRect(210, 65, 8, 148);
        c.beginPath();
        c.moveTo(183, 92);
        c.lineTo(244, 92);
        c.lineTo(230, 62);
        c.lineTo(197, 62);
        c.closePath();
        c.fill();
        if (index % 2) {
          c.beginPath();
          c.ellipse(153, 143, 10, 13, 0, 0, Math.PI * 2);
          c.fill();
          c.fillRect(143, 155, 21, 45);
        }
        c.fillStyle = '#18262a66';
        for (let i = 0; i < 5; i++) {
          c.fillRect(i * 5, 0, 3, 225);
          c.fillRect(230 + i * 5, 0, 3, 225);
        }
        c.fillStyle = '#e8e0c812';
        for (let i = 0; i < 21; i++)
          c.fillRect(0, i * 10, 256, 1);
        const texture = r.texture(new T.CanvasTexture(cv));
        texture.colorSpace = T.SRGBColorSpace;
        pane = r.material(new T.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: '#ffffff', emissiveIntensity: .75, roughness: .6 }));
        materialCache.set(key, pane);
      }
    }
    plane(parent, paneWidth, 1.44, pane, u, y + 1.25, -.045);
  }
  function shell(x: number, z: number, bays: number, floors: number, yaw: number, tint: string, window: "large" | "small" | "double", name: string, options: {
    openBay?: number;
    open?: boolean;
    residential?: boolean;
  } = {}) {
    const domestic = options.residential || ['MAISON 18', 'RUE DES ARCHIVES', 'THE NIGHT SERVICE', 'LE PASSAGE', 'THE OLD QUARTER'].includes(name);
    const profile = name === 'LE PETIT CINÉMA' ? 'deco' : name === 'THE BLUE NOTE' || name === 'SECOND ROUND' ? 'industrial' : name === 'THE ARCADE' ? 'gallery' : domestic ? 'townhouse' : name === 'HÔTEL MINUIT' || name === 'LATE EDITION' ? 'mansard' : 'classic';
    const group = new T.Group();
    group.name = name;
    group.userData.profile = profile;
    group.position.set(x, 0.13, z);
    group.rotation.y = yaw;
    scene.add(group);
    buildingRoots.push(group);
    const width = bays * 3, height = 3.5 + floors * 3.15, brickMaps = groundMaps("brick", new T.Vector2(width / 3, height / 3));
    const masonry = r.material(mineralTint(new T.MeshStandardMaterial({
      map: brickMaps.diff,
      normalMap: brickMaps.nor_gl,
      normalScale: new T.Vector2(0.5, 0.5),
      roughnessMap: brickMaps.rough,
      aoMap: brickMaps.ao,
      roughness: 0.85,
    }), tint));
    box(group, 0.35, height, 6, masonry, -width / 2 - 0.05, height / 2, -2.9);
    box(group, 0.35, height, 6, masonry, width / 2 + 0.05, height / 2, -2.9);
    box(group, width, height, 0.25, masonry, 0, height / 2, -5.9);
    box(group, width + 0.5, 0.22, 6.5, stone, 0, height + 0.12, -2.9, 0.05);
    box(group, width + 0.55, 0.05, 0.45, snow, 0, height + 0.25, 0.12, 0.02);
    const roofHeight = 1.9 + (floors % 2) * 0.65, roofMaterial = material("#263846", 0.65, 0.08);
    const roofVertices: number[] = [];
    const roofBottom = [
      [-width / 2 - 0.15, height + 0.2, 0.2],
      [width / 2 + 0.15, height + 0.2, 0.2],
      [width / 2 + 0.15, height + 0.2, -6.2],
      [-width / 2 - 0.15, height + 0.2, -6.2],
    ];
    const roofTop = [
      [-width / 2 + 0.6, height + roofHeight, -1],
      [width / 2 - 0.6, height + roofHeight, -1],
      [width / 2 - 0.6, height + roofHeight, -5],
      [-width / 2 + 0.6, height + roofHeight, -5],
    ];
    for (let f = 0; f < 4; f++) {
      const n = (f + 1) % 4;
      for (const v of [
        roofBottom[f],
        roofBottom[n],
        roofTop[n],
        roofBottom[f],
        roofTop[n],
        roofTop[f],
      ])
        roofVertices.push(...v);
    }
    for (const v of [
      roofTop[0],
      roofTop[1],
      roofTop[2],
      roofTop[0],
      roofTop[2],
      roofTop[3],
    ])
      roofVertices.push(...v);
    const roofGeometry = r.geometry(new T.BufferGeometry());
    roofGeometry.setAttribute("position", new T.Float32BufferAttribute(roofVertices, 3));
    roofGeometry.computeVertexNormals();
    const roof = new T.Mesh(roofGeometry, roofMaterial);
    roof.castShadow = true;
    roof.receiveShadow = true;
    if (!['deco', 'industrial', 'gallery', 'townhouse'].includes(profile))
      group.add(roof);
    else if (profile === 'townhouse') {
      const ridge = height + 2.45, front = .2, back = -6.2;
      const points = [[-width / 2, height, front], [width / 2, height, front], [0, ridge, front], [-width / 2, height, back], [0, ridge, back], [width / 2, height, back]];
      const indices = [0, 1, 2, 3, 4, 5, 0, 2, 4, 0, 4, 3, 1, 5, 4, 1, 4, 2];
      const g = r.geometry(new T.BufferGeometry());
      g.setAttribute('position', new T.Float32BufferAttribute(points.flat(), 3));
      g.setIndex(indices);
      g.computeVertexNormals();
      const pitched = new T.Mesh(g, roofMaterial);
      pitched.castShadow = true;
      group.add(pitched);
      rod(group, new T.Vector3(-width / 2, height + .03, .24), new T.Vector3(0, ridge + .03, .24), .065, stone);
      rod(group, new T.Vector3(0, ridge + .03, .24), new T.Vector3(width / 2, height + .03, .24), .065, stone);
    }
    else {
      box(group, width + .4, .35, 6.4, stone, 0, height + .22, -2.9, .04);
      box(group, width + .1, .65, .32, masonry, 0, height + .52, .12, .025);
      for (const u of [-width / 2, width / 2])
        box(group, .35, .7, 6.3, masonry, u, height + .54, -2.9, .025);
      if (profile === 'deco')
        for (let i = 0; i < 3; i++)
          box(group, width * (.65 - i * .16), .45, .7, stone, 0, height + .8 + i * .43, .2, .025);
      if (profile === 'industrial')
        for (let u = -width / 2 + 1.5; u < width / 2; u += 3) {
          box(group, 1.6, .12, 2.8, glass, u, height + .6, -2.4);
          rod(group, new T.Vector3(u - .8, height + .68, -1), new T.Vector3(u + .8, height + .68, -1), .025, iron);
        }
    }
    if (profile === 'mansard')
      for (const u of [-width / 2 + 1.7, width / 2 - 1.7]) {
        box(group, 1.55, 1.48, .65, stone, u, height + .77, -.5, .04);
        const dormer = module(group, 'window_centered_small_01', u, height + .12, -.08, '#ffffff');
        dormer.scale.set(.48, .48, .48);
        box(group, 1.8, .18, .9, roofMaterial, u, height + 1.57, -.35, .03);
      }
    if (profile === 'deco')
      for (const u of [-width / 2 + .5, width / 2 - .5]) {
        box(group, .28, height - 1.1, .38, stone, u, height / 2 + 1, .3, .025);
        box(group, .045, height - 2, .055, amber, u, height / 2 + 1, .51, .01);
      }
    if (profile === 'industrial')
      for (const u of [-width / 2 + .3, width / 2 - .3])
        box(group, .18, height, .26, iron, u, height / 2, .25, .015);
    if (profile === 'mansard' && name === 'HÔTEL MINUIT') {
      box(group, 4.4, .16, 1.7, iron, 0, 3.3, .9, .06);
      box(group, 4.2, .055, 1.6, glass, 0, 3.4, .85, .03);
      for (const u of [-2.05, 2.05])
        rod(group, new T.Vector3(u, 3.3, 1.55), new T.Vector3(u, 4.15, .1), .035, brass);
    }
    if (profile === 'deco') {
      box(group, width * .76, .3, 1.65, wood, 0, 3.62, .85, .07);
      for (let i = 0; i < 26; i++)
        box(group, .055, .05, .055, amber, -width * .36 + i * width * .72 / 25, 3.47, 1.6, .012);
    }
    if (profile === 'gallery') {
      box(group, width + .2, .4, 1.2, iron, 0, 3.65, .6, .06);
      for (let i = 0; i < 17; i++)
        box(group, .085, .07, .085, amber, -width / 2 + .2 + i * (width - .4) / 16, 3.48, 1.1, .02);
    }
    for (const u of [-width / 2 + 1.5, width / 2 - 1.5]) {
      box(group, 0.6, 1.2, 0.6, masonry, u, height + 1, -3.3, 0.025);
      box(group, 0.72, 0.1, 0.72, stone, u, height + 1.63, -3.3, 0.025);
      box(group, 0.73, 0.04, 0.73, snow, u, height + 1.7, -3.3, 0.02);
    }
    for (let floor = 0; floor < floors; floor++) {
      const y = 3.65 + floor * 3.15;
      for (let bay = 0; bay < bays; bay++) {
        const u = (bay - (bays - 1) / 2) * 3;
        if (profile === 'industrial') {
          // Brick piers, deep steel-framed factory glazing and transoms form a different building type.
          module(group, 'wall_pier_standard_01', u - 1.38, y, 0, tint, .65);
          box(group, 2.8, .48, .2, masonry, u, y + .24, 0);
          box(group, 2.8, .3, .2, masonry, u, y + 2.85, 0);
          const pane = material((floor + bay) % 3 === 0 ? '#b59b7b' : '#364957', .35);
          pane.emissive.set((floor + bay) % 3 === 0 ? '#ba8b52' : '#172b39');
          pane.emissiveIntensity = (floor + bay) % 3 === 0 ? .8 : .12;
          plane(group, 2.3, 2.0, pane, u, y + 1.6, -.12);
          for (const x of [-1.17, -.58, 0, .58, 1.17])
            box(group, .035, 2.05, .08, iron, u + x, y + 1.6, -.04, .008);
          for (const v of [.58, 1.25, 1.92, 2.62])
            box(group, 2.4, .035, .08, iron, u, y + v, -.04, .008);
        }
        else {
          const wall = window === "double"
            ? "wall_door_window_small_01"
            : `wall_window_centered_${window}_01`;
          module(group, wall, u, y, 0, tint);
          module(group, `window_centered_${window}_01`, u, y, 0.025, "#ffffff");
          upperRoom(group, u, y, (floor * 3 + bay + Math.round(Math.abs(z))) % 5 < 2, bay, window === "small" ? .62 : window === "double" ? 2.05 : 1.64);
          module(group, "cornice_standard_standard_01", u, y + 3.01, 0.035, tint);
        }
        box(group, 2.35, 0.07, 0.29, stone, u, y + 0.02, 0.09, 0.018);
        box(group, 2.3, 0.025, 0.25, snow, u, y + 0.07, 0.11, 0.01);
        if (floor === 0 && bay % 2 === 1 && bays > 2 && profile !== 'industrial')
          balcony(group, u, y + 0.12);
        if (floor === floors - 1 && profile !== "industrial")
          module(group, "crown_standard_standard_01", u, y + 3.03, 0.01, tint);
      }
      box(group, width + 0.12, 0.16, 0.32, stone, 0, y + 3.02, 0.07, 0.02);
    }
    for (const u of [-width / 2, width / 2])
      for (let row = 0; row < height / 0.4; row++)
        box(group, 0.35, 0.34, 0.16, stone, u, row * 0.4 + 0.17, 0.04, 0.018);
    box(group, width, 0.2, 0.36, stone, 0, 3.44, 0.08, 0.02);
    box(group, width, 0.05, 0.3, snow, 0, 3.56, 0.13, 0.015);
    const fascia = label(name, name === "LATE EDITION"
      ? "BOOKS  /  PRINT  /  OPEN LATE"
      : name === "HÔTEL MINUIT"
        ? "CHAMBRES  /  DEPUIS 1924"
        : name === "LE PETIT CINÉMA"
          ? "LE DERNIER SÉANCE  /  23:00"
          : "THE NEIGHBOURHOOD  /  AFTER HOURS", 2048, 96, name === "LE PETIT CINÉMA"
      ? "#3e252d"
      : name === "HÔTEL MINUIT"
        ? "#172a3b"
        : "#122b2c");
    const residential = domestic || [
      "MAISON 18",
      "RUE DES ARCHIVES",
      "THE NIGHT SERVICE",
      "LE PASSAGE",
      "THE OLD QUARTER",
    ].includes(name);
    if (residential) {
      plane(group, 1.05, 0.22, fascia, width / 2 - 1.5, 2.96, 0.26);
      module(group, "door_centered_small_01", 0, 0.08, 0.28, "#ffffff");
    }
    else {
      box(group, width - 0.3, 0.65, 0.24, wood, 0, 2.94, 0.13, 0.025);
      plane(group, width - 0.7, 0.48, fascia, 0, 2.96, 0.256);
    }
    for (const u of [-width / 2 + 0.14, width / 2 - 0.14])
      box(group, 0.24, 3.15, 0.32, wood, u, 1.58, 0.18, 0.025);
    // Interior walls and a real inset floor remain visible through the glazing.
    const floorMat = material("#493a2c", 0.58);
    box(group, width - 0.3, 0.1, 5.4, floorMat, 0, 0.05, -2.6);
    box(group, width - 0.4, 3.1, 0.12, material(name === "LATE EDITION" ? "#756044" : "#34404a", 0.95), 0, 1.6, -5.5);
    box(group, width - 0.3, 0.15, 5.4, stone, 0, 3.4, -2.6);
    if (domestic && !options.open) {
      for (let bay = 0; bay < bays; bay++) {
        const u = (bay - (bays - 1) / 2) * 3;
        module(group, bay === Math.floor(bays / 2) ? 'wall_door_centered_small_01' : 'wall_window_centered_small_01', u, .12, 0, tint);
        if (bay !== Math.floor(bays / 2)) {
          module(group, 'window_centered_small_01', u, .12, .025, '#ffffff');
          upperRoom(group, u, .12, bay % 3 === 1, bay, .62);
        }
      }
    }
    else {
      for (let i = 0; i < bays; i++) {
        const u = (i - (bays - 1) / 2) * 3;
        box(group, 0.08, 2.6, 0.16, wood, u + 1.4, 1.5, 0.1, 0.014);
        if (options.openBay === i)
          continue;
        box(group, 2.78, 0.42, 0.24, wood, u, 0.3, 0.12, 0.02);
        plane(group, 2.73, 2.3, glass, u, 1.65, 0.205);
        box(group, 2.84, 0.08, 0.4, stone, u, 0.52, 0.18, 0.02);
      }
    }
    if (!domestic && !options.open && ![
      "LATE EDITION",
      "NIGHTJAR CAFÉ",
      "LE PETIT CINÉMA",
      "CAFÉ DU COIN",
    ].includes(name)) {
      const shutter = material(name === "THE ARCADE" ? "#263b44" : "#2c3c3d", 0.7, 0.15);
      for (let bay = 0; bay < bays; bay++) {
        if (options.openBay === bay || (name === "HÔTEL MINUIT" && bay === 2))
          continue;
        const u = (bay - (bays - 1) / 2) * 3;
        for (let row = 0; row < 21; row++)
          box(group, 2.73, 0.098, 0.065, shutter, u, 0.58 + row * 0.103, -0.14, 0.009);
        box(group, 2.8, 0.17, 0.17, wood, u, 2.75, -0.1, 0.012);
      }
    }
    if (name === "LE PETIT CINÉMA") {
      const posterA = label("MIDNIGHT", "A FILM IN THREE ACTS", 512, 768, "#253440", "#d7b17b"), posterB = label("STILL HERE", "THE LATE SHOW  /  23:00", 512, 768, "#5c423b", "#e6d3ac");
      for (const [u, m] of [
        [-3, posterA],
        [3, posterB],
      ] as const) {
        box(group, 1.45, 2.13, 0.14, brass, u, 1.6, -0.1, 0.02);
        plane(group, 1.32, 2, m, u, 1.6, -0.015);
      }
      box(group, 2.2, 2.65, 0.2, wood, 0, 1.39, -0.12, 0.025);
      plane(group, 1.9, 2.35, glass, 0, 1.5, 0.01);
      box(group, 0.045, 0.5, 0.08, brass, 0.6, 1.4, 0.15, 0.012);
    }
    if (!domestic || options.open) {
      const warm = name === 'THE ARCADE' ? '#a6d0c5' : name === 'THE BLUE NOTE' ? '#ffc791' : '#f3c58d';
      const strip = material(warm, .35);
      strip.emissive.set(warm);
      strip.emissiveIntensity = 1.8;
      box(group, width - .7, .045, .045, strip, 0, 2.58, .28, .012);
      const lamp = new T.RectAreaLight(warm, profile === 'industrial' ? 5.2 : 3.6, width - .6, 2.1);
      lamp.position.copy(group.localToWorld(new T.Vector3(0, 1.8, -1.1)));
      lamp.quaternion.copy(group.quaternion);
      lamp.rotateY(Math.PI);
      scene.add(lamp);
      const spill = new T.Mesh(r.geometry(new T.PlaneGeometry(width * .9, 5)), makeSpillMaterial(r, warm, name === 'THE BLUE NOTE' ? .22 : .13));
      spill.rotation.x = -Math.PI / 2;
      spill.position.copy(group.localToWorld(new T.Vector3(0, 0, 2)));
      spill.position.y = -.073;
      scene.add(spill);
    }
    return group;
  }
  function finishOne(g: T.Group) {
    const instances: T.InstancedMesh[] = [];
    g.traverse(o => {
      if (o instanceof T.InstancedMesh)
        instances.push(o);
    });
    g.updateMatrixWorld(true);
    for (const i of instances) {
      i.applyMatrix4(g.matrixWorld);
      g.remove(i);
      scene.add(i);
    }
    batch(g);
  }
  function finish() {
    for (const g of buildingRoots)
      finishOne(g);
    buildingRoots.length = 0;
  }
  async function finishAsync(yieldFrame: () => Promise<void>) {
    for (const g of buildingRoots) {
      const instances: T.InstancedMesh[] = [];
      g.traverse(o => {
        if (o instanceof T.InstancedMesh)
          instances.push(o);
      });
      g.updateMatrixWorld(true);
      for (const i of instances) {
        i.applyMatrix4(g.matrixWorld);
        g.remove(i);
        scene.add(i);
      }
      await batchAsync(g, yieldFrame);
    }
    buildingRoots.length = 0;
  }
  return { box, plane, rod, label, cloneProp, module, shell, balcony, batch, finish, finishAsync, buildingRoots, material, road, cache, brass, iron, stone, snow, wood, dark, amber, glass };
}
