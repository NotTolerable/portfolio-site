import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import type { CityAssets } from "./assets";
import { CityResources } from "./assets";

/** Authored in metres. The street opens east at z=-31; every shot shares this set. */
export function buildCityEnvironment(
  scene: T.Scene,
  assets: CityAssets,
  r: CityResources,
) {
  RectAreaLightUniformsLib.init();
  const materialCache = new Map<string, T.MeshStandardMaterial>();
  const material = (color: string, roughness = 0.7, metalness = 0) => {
    const key = `${color}/${roughness}/${metalness}`;
    let m = materialCache.get(key);
    if (!m) {
      m = r.material(
        new T.MeshStandardMaterial({ color, roughness, metalness }),
      );
      materialCache.set(key, m);
    }
    return m;
  };
  const brass = material("#9f8459", 0.35, 0.75),
    iron = material("#17262b", 0.48, 0.65),
    stone = material("#7f817a", 0.86),
    snow = material("#bac4c7", 0.96),
    wood = material("#162c2b", 0.51),
    dark = material("#141c21", 0.9);
  const amber = r.material(
    new T.MeshStandardMaterial({
      color: "#ffce91",
      emissive: "#ffba6d",
      emissiveIntensity: 2.6,
      roughness: 0.8,
    }),
  );
  const glass = r.material(
    new T.MeshStandardMaterial({
      color: "#8aa0b1",
      metalness: 0,
      roughness: 0.24,
      envMapIntensity: 0.12,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  );
  const stoneMap = r.texture(assets.maps["concrete-diff"].clone()),
    stoneNormal = r.texture(assets.maps["concrete-nor_gl"].clone()),
    stoneRough = r.texture(assets.maps["concrete-rough"].clone());
  stoneMap.repeat.set(2, 2);
  stoneNormal.repeat.set(2, 2);
  stoneRough.repeat.set(2, 2);
  stone.map = stoneMap;
  stone.normalMap = stoneNormal;
  stone.roughnessMap = stoneRough;
  stone.normalScale.set(0.22, 0.22);
  function mineralTint(m: T.MeshStandardMaterial, tint: string) {
    m.color.set("#ffffff");
    m.onBeforeCompile = (shader) => {
      shader.uniforms.cityTint = { value: new T.Color(tint) };
      shader.fragmentShader =
        "uniform vec3 cityTint;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\nfloat cityLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(vec3(cityLuma),diffuseColor.rgb,.12)*cityTint;",
      );
    };
    m.customProgramCacheKey = () => "city-mineral-v1";
    return m;
  }
  const buildingRoots: T.Group[] = [],
    contactPoints: [number, number, number, number][] = [];
  function box(
    parent: T.Object3D,
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    bevel = 0,
  ) {
    const g = bevel
      ? new RoundedBoxGeometry(w, h, d, 2, Math.min(bevel, w / 3, h / 3, d / 3))
      : new T.BoxGeometry(w, h, d);
    const mesh = new T.Mesh(r.geometry(g), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function plane(
    parent: T.Object3D,
    w: number,
    h: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    rotation: T.Euler = new T.Euler(),
  ) {
    const mesh = new T.Mesh(r.geometry(new T.PlaneGeometry(w, h)), m);
    mesh.position.set(x, y, z);
    mesh.rotation.copy(rotation);
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function rod(
    parent: T.Object3D,
    a: T.Vector3,
    b: T.Vector3,
    width: number,
    m: T.Material,
  ) {
    const o = new T.Mesh(
      r.geometry(new T.CylinderGeometry(width, width, a.distanceTo(b), 7)),
      m,
    );
    o.position.copy(a).add(b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    o.castShadow = true;
    parent.add(o);
    return o;
  }
  const labelCache = new Map<string, T.MeshStandardMaterial>();
  function label(
    text: string,
    sub: string,
    w = 1024,
    h = 256,
    bg = "#122b2c",
    fg = "#e6d5b8",
  ) {
    const key = JSON.stringify([text, sub, w, h, bg, fg]),
      cached = labelCache.get(key);
    if (cached) return cached;
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
    c.fillText(text, w / 2, h * 0.48);
    c.font = `400 ${h * 0.075}px monospace`;
    c.fillText(sub, w / 2, h * 0.77);
    const t = r.texture(new T.CanvasTexture(cv));
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    const m = r.material(
      new T.MeshStandardMaterial({
        map: t,
        roughness: 0.6,
        emissive: "#b29c72",
        emissiveMap: t,
        emissiveIntensity: 0.16,
      }),
    );
    labelCache.set(key, m);
    return m;
  }
  function cloneProp(
    name: keyof CityAssets["models"],
    parent: T.Object3D,
    height: number,
    x: number,
    y: number,
    z: number,
    yaw = 0,
  ) {
    const source = assets.models[name],
      model = source.clone(true),
      bounds = new T.Box3().setFromObject(model),
      size = bounds.getSize(new T.Vector3()),
      center = bounds.getCenter(new T.Vector3());
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
    return group;
  }
  // Batched by building/material, preserving culling and original asset UVs/AO.
  function batch(root: T.Group) {
    root.updateMatrixWorld(true);
    const buckets = new Map<T.Material, T.BufferGeometry[]>();
    root.traverse((o) => {
      if (!(o instanceof T.Mesh) || Array.isArray(o.material)) return;
      const g = o.geometry.clone();
      // Preserve source index reuse; expand quantized attributes, not triangle vertices.
      if (!g.index) {
        const count = g.getAttribute("position").count;
        g.setIndex(
          new T.BufferAttribute(
            Uint32Array.from({ length: count }, (_, i) => i),
            1,
          ),
        );
      }
      for (const key of Object.keys(g.attributes))
        if (!["position", "normal", "uv"].includes(key)) g.deleteAttribute(key);
      for (const key of ["position", "normal", "uv"]) {
        const a = g.getAttribute(key),
          count = g.getAttribute("position").count,
          n = key === "uv" ? 2 : 3,
          data = new Float32Array(count * n);
        if (a)
          for (let i = 0; i < count; i++)
            for (let j = 0; j < n; j++) data[i * n + j] = a.getComponent(i, j);
        g.setAttribute(key, new T.BufferAttribute(data, n));
      }
      g.applyMatrix4(o.matrixWorld);
      if (!buckets.has(o.material)) buckets.set(o.material, []);
      buckets.get(o.material)!.push(g);
    });
    for (const [m, parts] of buckets) {
      const g = mergeGeometries(parts);
      if (g) {
        const mesh = new T.Mesh(r.geometry(g), m);
        mesh.castShadow = !m.transparent;
        mesh.receiveShadow = true;
        mesh.matrixAutoUpdate = false;
        scene.add(mesh);
      }
      parts.forEach((g) => g.dispose());
    }
    root.removeFromParent();
  }
  const mapCache = new Map<string, Record<string, T.Texture>>();
  const groundMaps = (id: string, repeat: T.Vector2) => {
    const key = `${id}/${repeat.x}/${repeat.y}`,
      cached = mapCache.get(key);
    if (cached) return cached;
    const maps = Object.fromEntries(
      ["diff", "nor_gl", "rough", "ao"].map((type) => {
        const t = r.texture(assets.maps[id + "-" + type].clone());
        t.repeat.copy(repeat);
        t.anisotropy = 8;
        return [type, t];
      }),
    );
    mapCache.set(key, maps);
    return maps;
  };
  const cobbles = groundMaps("cobbles", new T.Vector2(55, 65));
  const road = r.material(
    new T.MeshStandardMaterial({
      color: "#56616a",
      map: cobbles.diff,
      normalMap: cobbles.nor_gl,
      normalScale: new T.Vector2(0.42, 0.42),
      roughnessMap: cobbles.rough,
      aoMap: cobbles.ao,
      aoMapIntensity: 1.1,
      roughness: 0.82,
      metalness: 0.02,
      envMapIntensity: 0.35,
    }),
  );
  const ground = plane(
    scene,
    110,
    130,
    road,
    10,
    -0.02,
    -30,
    new T.Euler(-Math.PI / 2, 0, 0),
  );
  ground.receiveShadow = true;
  const pavements = new T.Group();
  scene.add(pavements);
  for (const side of [-1, 1]) {
    box(pavements, 2.3, 0.16, 43, stone, side * 4.85, 0.02, -9, 0.04);
    for (let z = 12; z > -30; z -= 1.4)
      box(pavements, 0.22, 0.23, 1.36, stone, side * 3.78, 0.02, z, 0.025);
    const snowVertices: number[] = [];
    for (let i = 0; i < 85; i++) {
      const z = 12 - i * 0.5,
        next = z - 0.5,
        w =
          0.12 +
          0.13 * (0.5 + 0.5 * Math.sin(i * 0.37)) * Math.sin(i * 0.53) ** 2,
        wn =
          0.12 +
          0.13 *
            (0.5 + 0.5 * Math.sin((i + 1) * 0.37)) *
            Math.sin((i + 1) * 0.53) ** 2;
      const a = [side * 3.87, 0.145, z],
        b = [side * (3.87 + w), 0.145, z],
        c = [side * (3.87 + wn), 0.145, next],
        d = [side * 3.87, 0.145, next];
      for (const v of side > 0 ? [a, b, c, a, c, d] : [a, c, b, a, d, c])
        snowVertices.push(...v);
    }
    const snowEdge = r.geometry(new T.BufferGeometry());
    snowEdge.setAttribute(
      "position",
      new T.Float32BufferAttribute(snowVertices, 3),
    );
    snowEdge.computeVertexNormals();
    pavements.add(new T.Mesh(snowEdge, snow));
    for (let z = 11; z > -28; z -= 2.4)
      box(pavements, 2.24, 0.01, 0.016, iron, side * 4.85, 0.106, z);
  }
  box(pavements, 53, 0.16, 2.3, stone, 16, 0.02, -35.8, 0.04);
  box(pavements, 29, 0.16, 2.3, stone, 22, 0.02, -26, 0.04);
  for (let x = -9; x < 42; x += 1.4) {
    box(pavements, 1.36, 0.23, 0.22, stone, x, 0.02, -34.65, 0.025);
    box(pavements, 1.2, 0.016, 0.12, snow, x, 0.15, -34.8, 0.01);
  }
  // Drain grates, curb cut, and pavement seams establish human scale and contact.
  for (const z of [3, -17, -26]) {
    box(pavements, 0.48, 0.025, 0.75, iron, -3.5, 0.008, z, 0.015);
    for (let k = 0; k < 8; k++)
      box(
        pavements,
        0.36,
        0.008,
        0.022,
        stone,
        -3.5,
        0.026,
        z - 0.3 + k * 0.085,
      );
  }
  batch(pavements);
  const moduleMap = new Map(
    assets.models.architecture.children.map((o) => [o.name, o]),
  );
  const tintCache = new Map<string, T.Material>();
  function module(
    parent: T.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    tint: string,
    scaleX = 1,
  ) {
    const source = moduleMap.get(name);
    if (!source) throw Error("Missing city module " + name);
    const o = source.clone(true);
    o.position.add(new T.Vector3(x, y, z));
    o.scale.x *= scaleX;
    if (
      name.startsWith("wall") ||
      name.startsWith("crown") ||
      name.startsWith("cornice")
    )
      o.traverse((part) => {
        if (
          part instanceof T.Mesh &&
          !Array.isArray(part.material) &&
          part.material instanceof T.MeshStandardMaterial
        ) {
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
      box(
        parent,
        0.025,
        0.96,
        0.025,
        iron,
        x - 1.16 + i * 0.165,
        y + 0.46,
        0.83,
        0.006,
      );
    for (const side of [-1, 1]) {
      box(parent, 0.035, 0.95, 0.035, iron, x + side * 1.2, y + 0.46, 0.1);
      box(parent, 0.035, 0.035, 0.85, iron, x + side * 1.2, y + 0.95, 0.42);
    }
    box(parent, 2.5, 0.025, 0.16, snow, x, y + 0.985, 0.82, 0.014);
  }
  function upperRoom(
    parent: T.Group,
    u: number,
    y: number,
    lit: boolean,
    index: number,
  ) {
    const room = material(lit ? "#a68152" : "#1a303d", 0.94);
    if (lit) {
      room.emissive.set("#b98648");
      room.emissiveIntensity = 0.38;
    }
    plane(parent, 2.0, 2.15, room, u, y + 1.12, -0.6);
    // Curtains and an inset ceiling, rather than flat emissive panels over the facade.
    for (const side of [-1, 1])
      for (let f = 0; f < 4; f++)
        box(
          parent,
          0.075,
          1.85,
          0.06,
          lit ? stone : dark,
          u + side * (0.67 + f * 0.065),
          y + 1.1,
          -0.29 + (f % 2) * 0.04,
          0.02,
        );
    box(parent, 2.0, 0.06, 0.7, dark, u, y + 2.3, -0.32);
    if (index % 3 === 0) box(parent, 0.07, 1.95, 0.06, wood, u, y + 1.1, -0.22);
    plane(parent, 2.0, 2.1, glass, u, y + 1.12, 0.02);
  }
  function shell(
    x: number,
    z: number,
    bays: number,
    floors: number,
    yaw: number,
    tint: string,
    window: "large" | "small" | "double",
    name: string,
  ) {
    const group = new T.Group();
    group.position.set(x, 0.13, z);
    group.rotation.y = yaw;
    scene.add(group);
    buildingRoots.push(group);
    const width = bays * 3,
      height = 3.5 + floors * 3.15,
      brickMaps = groundMaps("brick", new T.Vector2(width / 3, height / 3));
    const masonry = r.material(
      mineralTint(
        new T.MeshStandardMaterial({
          map: brickMaps.diff,
          normalMap: brickMaps.nor_gl,
          normalScale: new T.Vector2(0.5, 0.5),
          roughnessMap: brickMaps.rough,
          aoMap: brickMaps.ao,
          roughness: 0.85,
        }),
        tint,
      ),
    );
    box(group, 0.35, height, 6, masonry, -width / 2 - 0.05, height / 2, -2.9);
    box(group, 0.35, height, 6, masonry, width / 2 + 0.05, height / 2, -2.9);
    box(group, width, height, 0.25, masonry, 0, height / 2, -5.9);
    box(group, width + 0.5, 0.22, 6.5, stone, 0, height + 0.12, -2.9, 0.05);
    box(group, width + 0.55, 0.05, 0.45, snow, 0, height + 0.25, 0.12, 0.02);
    const roofHeight = 1.9 + (floors % 2) * 0.65,
      roofMaterial = material("#263846", 0.65, 0.08);
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
    roofGeometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(roofVertices, 3),
    );
    roofGeometry.computeVertexNormals();
    const roof = new T.Mesh(roofGeometry, roofMaterial);
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);
    for (const u of [-width / 2 + 1.5, width / 2 - 1.5]) {
      box(group, 0.6, 1.2, 0.6, masonry, u, height + 1, -3.3, 0.025);
      box(group, 0.72, 0.1, 0.72, stone, u, height + 1.63, -3.3, 0.025);
      box(group, 0.73, 0.04, 0.73, snow, u, height + 1.7, -3.3, 0.02);
    }
    for (let floor = 0; floor < floors; floor++) {
      const y = 3.65 + floor * 3.15;
      for (let bay = 0; bay < bays; bay++) {
        const u = (bay - (bays - 1) / 2) * 3;
        const wall =
          window === "double"
            ? "wall_door_window_small_01"
            : `wall_window_centered_${window}_01`;
        module(group, wall, u, y, 0, tint);
        module(group, `window_centered_${window}_01`, u, y, 0.025, "#ffffff");
        upperRoom(
          group,
          u,
          y,
          (floor * 3 + bay + Math.round(Math.abs(z))) % 5 < 2,
          bay,
        );
        module(group, "cornice_standard_standard_01", u, y + 3.01, 0.035, tint);
        box(group, 2.35, 0.07, 0.29, stone, u, y + 0.02, 0.09, 0.018);
        box(group, 2.3, 0.025, 0.25, snow, u, y + 0.07, 0.11, 0.01);
        if (floor === 0 && bay % 2 === 1 && bays > 2)
          balcony(group, u, y + 0.12);
        if (floor === floors - 1)
          module(group, "crown_standard_standard_01", u, y + 3.03, 0.01, tint);
      }
      box(group, width + 0.12, 0.16, 0.32, stone, 0, y + 3.02, 0.07, 0.02);
    }
    for (const u of [-width / 2, width / 2])
      for (let row = 0; row < height / 0.4; row++)
        box(group, 0.35, 0.34, 0.16, stone, u, row * 0.4 + 0.17, 0.04, 0.018);
    box(group, width, 0.2, 0.36, stone, 0, 3.44, 0.08, 0.02);
    box(group, width, 0.05, 0.3, snow, 0, 3.56, 0.13, 0.015);
    const fascia = label(
      name,
      name === "LATE EDITION"
        ? "BOOKS  /  PRINT  /  OPEN LATE"
        : name === "HÔTEL MINUIT"
          ? "CHAMBRES  /  DEPUIS 1924"
          : name === "LE PETIT CINÉMA"
            ? "LE DERNIER SÉANCE  /  23:00"
            : "THE NEIGHBOURHOOD  /  AFTER HOURS",
      1024,
      256,
      name === "LE PETIT CINÉMA"
        ? "#3e252d"
        : name === "HÔTEL MINUIT"
          ? "#172a3b"
          : "#122b2c",
    );
    const residential = [
      "MAISON 18",
      "RUE DES ARCHIVES",
      "THE NIGHT SERVICE",
      "LE PASSAGE",
      "THE OLD QUARTER",
    ].includes(name);
    if (residential) {
      plane(group, 1.05, 0.22, fascia, width / 2 - 1.5, 2.96, 0.26);
      module(group, "door_centered_small_01", 0, 0.08, 0.28, "#ffffff");
    } else {
      box(group, width - 0.3, 0.65, 0.24, wood, 0, 2.94, 0.13, 0.025);
      plane(group, width - 0.7, 0.48, fascia, 0, 2.96, 0.256);
    }
    for (const u of [-width / 2 + 0.14, width / 2 - 0.14])
      box(group, 0.24, 3.15, 0.32, wood, u, 1.58, 0.18, 0.025);
    // Interior walls and a real inset floor remain visible through the glazing.
    const floorMat = material("#493a2c", 0.58);
    box(group, width - 0.3, 0.1, 5.4, floorMat, 0, 0.05, -2.6);
    box(
      group,
      width - 0.4,
      3.1,
      0.12,
      material(name === "LATE EDITION" ? "#756044" : "#34404a", 0.95),
      0,
      1.6,
      -3.6,
    );
    box(group, width - 0.3, 0.15, 5.4, stone, 0, 3.4, -2.6);
    for (let i = 0; i < bays; i++) {
      const u = (i - (bays - 1) / 2) * 3;
      box(group, 0.08, 2.6, 0.16, wood, u + 1.4, 1.5, 0.1, 0.014);
      box(group, 2.78, 0.42, 0.24, wood, u, 0.3, 0.12, 0.02);
      plane(group, 2.73, 2.3, glass, u, 1.65, 0.205);
      box(group, 2.84, 0.08, 0.4, stone, u, 0.52, 0.18, 0.02);
    }
    if (
      ![
        "LATE EDITION",
        "NIGHTJAR CAFÉ",
        "LE PETIT CINÉMA",
        "CAFÉ DU COIN",
      ].includes(name)
    ) {
      const shutter = material(
        name === "THE ARCADE" ? "#263b44" : "#2c3c3d",
        0.7,
        0.15,
      );
      for (let bay = 0; bay < bays; bay++) {
        if (name === "HÔTEL MINUIT" && bay === 2) continue;
        const u = (bay - (bays - 1) / 2) * 3;
        for (let row = 0; row < 21; row++)
          box(
            group,
            2.73,
            0.098,
            0.065,
            shutter,
            u,
            0.58 + row * 0.103,
            -0.14,
            0.009,
          );
        box(group, 2.8, 0.17, 0.17, wood, u, 2.75, -0.1, 0.012);
      }
    }
    if (name === "LE PETIT CINÉMA") {
      const posterA = label(
          "MIDNIGHT",
          "A FILM IN THREE ACTS",
          512,
          768,
          "#253440",
          "#d7b17b",
        ),
        posterB = label(
          "STILL HERE",
          "THE LATE SHOW  /  23:00",
          512,
          768,
          "#5c423b",
          "#e6d3ac",
        );
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
    return group;
  }
  // Distinct massing, palette, bay widths and ground floors; no repeated row of identical buildings.
  const bookshop = shell(
    -5.95,
    -10,
    4,
    3,
    Math.PI / 2,
    "#d7bda0",
    "large",
    "LATE EDITION",
  );
  shell(-5.95, 6.5, 3, 4, Math.PI / 2, "#a5acaa", "small", "MAISON 18");
  shell(-5.95, -23, 4, 4, Math.PI / 2, "#aebbc0", "double", "RUE DES ARCHIVES");
  shell(5.95, 5.5, 4, 3, -Math.PI / 2, "#c3b8aa", "double", "ATELIER NO. 4");
  const cafe = shell(
    5.95,
    -10.5,
    4,
    4,
    -Math.PI / 2,
    "#b5a392",
    "large",
    "NIGHTJAR CAFÉ",
  );
  shell(5.95, -23, 3, 3, -Math.PI / 2, "#a2aaa2", "small", "FLEUR & FEUILLE");
  shell(-4, -36.8, 4, 4, 0, "#b9b8ac", "small", "THE ARCADE");
  shell(9, -36.8, 4, 3, 0, "#cbb597", "double", "LE PETIT CINÉMA");
  const northC = shell(22, -36.8, 4, 4, 0, "#aab7bb", "large", "HÔTEL MINUIT");
  const east = shell(
    23,
    -25.3,
    4,
    3,
    Math.PI,
    "#beb3a2",
    "small",
    "CAFÉ DU COIN",
  );
  // The second street has its own focal points: a hotel entrance and a late café.
  module(northC, "door_centered_small_01", 1.5, 0.08, 0.28, "#ffffff");
  for (const u of [0.45, 2.55])
    box(northC, 0.18, 2.7, 0.3, brass, u, 1.45, 0.28, 0.025);
  const archShape = new T.Shape();
  archShape.absarc(1.5, 2.45, 1.2, 0, Math.PI, false);
  archShape.lineTo(0.3, 2.3);
  archShape.absarc(1.5, 2.45, 1.05, Math.PI, 0, true);
  archShape.closePath();
  const arch = new T.Mesh(
    r.geometry(
      new T.ExtrudeGeometry(archShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
        steps: 1,
        curveSegments: 32,
      }),
    ),
    brass,
  );
  arch.position.z = 0.28;
  northC.add(arch);
  box(northC, 3.0, 0.05, 1.5, snow, 1.5, 3.65, 0.65, 0.02);
  for (const u of [-3, 1.5]) cloneProp("cafe", east, 0.9, u, 0.09, -1.6, 0.1);
  box(east, 5.5, 0.9, 0.85, wood, 0, 0.49, -3.05, 0.035);
  box(east, 5.65, 0.06, 0.93, stone, 0, 0.98, -3.05, 0.02);
  for (const u of [-3, 0, 3]) {
    rod(
      east,
      new T.Vector3(u, 3.35, -1.4),
      new T.Vector3(u, 2.65, -1.4),
      0.018,
      brass,
    );
    box(east, 0.3, 0.035, 0.3, amber, u, 2.63, -1.4, 0.015);
  }
  cloneProp("cafe", cafe, 0.9, -3, 0.09, -2.3, 0);
  cloneProp("cafe", cafe, 0.9, 1, 0.09, -2.3, 0.2);
  box(cafe, 3.3, 1.05, 0.8, wood, 0, 0.55, -4.1, 0.035);
  box(cafe, 3.45, 0.07, 0.95, stone, 0, 1.1, -4.1, 0.02);
  for (const u of [-3, 0, 3]) {
    rod(
      cafe,
      new T.Vector3(u, 3.35, -1.4),
      new T.Vector3(u, 2.65, -1.4),
      0.018,
      brass,
    );
    box(cafe, 0.32, 0.04, 0.32, amber, u, 2.64, -1.4, 0.018);
  }
  module(bookshop, "door_centered_small_01", 4.5, 0.08, 0.28, "#ffffff");
  box(bookshop, 0.045, 0.38, 0.07, brass, 4.06, 1.23, 0.53, 0.012);
  // Original window displays: the reference instrument/observatory props never load here.
  for (const [u, z] of [
    [-4.35, -2.4],
    [-1.45, -2.4],
    [1.45, -2.4],
  ] as const) {
    cloneProp("shelf", bookshop, 2.35, u, 0.08, z);
    const bookGeometry = r.geometry(
      new RoundedBoxGeometry(0.075, 0.34, 0.24, 1, 0.008),
    );
    const bookMat = r.material(new T.MeshStandardMaterial({ roughness: 0.78 })),
      count = 72,
      books = new T.InstancedMesh(bookGeometry, bookMat, count),
      dummy = new T.Object3D();
    const colors = [
      "#735744",
      "#9b8c6b",
      "#4e675f",
      "#b1a28c",
      "#714344",
      "#314e60",
    ];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 18),
        col = i % 18;
      dummy.position.set(u - 0.67 + col * 0.078, 0.4 + row * 0.48, z + 0.34);
      dummy.scale.set(1, 0.82 + ((i * 7) % 5) * 0.07, 1);
      dummy.rotation.z = col === 17 ? -0.09 : 0;
      dummy.updateMatrix();
      books.setMatrixAt(i, dummy.matrix);
      books.setColorAt(i, new T.Color(colors[(i * 7) % colors.length]));
    }
    books.castShadow = true;
    books.receiveShadow = true;
    bookshop.add(books);
    // Instanced books stay instanced when the rest of the shop is baked.
    books.name = "instanced-books";
  }
  cloneProp("books", bookshop, 0.34, 3.7, 0.78, -0.55, 0);
  const lining = material("#25352e", 0.62);
  box(bookshop, 11.5, 0.8, 0.08, lining, 0, 0.46, -3.48, 0.015);
  for (let u = -5.6; u < 5.7; u += 0.48) {
    box(bookshop, 0.035, 0.67, 0.03, wood, u, 0.47, -3.42, 0.007);
    box(bookshop, 0.035, 0.035, 0.03, brass, u, 0.87, -3.42, 0.005);
  }
  box(bookshop, 11.5, 0.055, 0.11, brass, 0, 0.9, -3.4, 0.012);
  box(bookshop, 2.3, 0.75, 0.95, wood, 3.5, 0.4, -0.7, 0.04);
  box(bookshop, 2.45, 0.08, 1.06, stone, 3.5, 0.82, -0.7, 0.025);
  for (const u of [-3, 0, 3]) {
    rod(
      bookshop,
      new T.Vector3(u, 3.35, -1),
      new T.Vector3(u, 2.6, -1),
      0.018,
      brass,
    );
    const shade = new T.Mesh(
      r.geometry(new T.ConeGeometry(0.25, 0.18, 20, 1, true)),
      brass,
    );
    shade.position.set(u, 2.59, -1);
    bookshop.add(shade);
    box(bookshop, 0.3, 0.025, 0.3, amber, u, 2.49, -1, 0.01);
  }
  // Small patterned tiled entrance and a brass threshold.
  box(bookshop, 1.2, 0.08, 1.15, stone, 4.4, 0.09, -0.3, 0.02);
  box(bookshop, 1.35, 0.025, 0.08, brass, 4.4, 0.145, 0.18, 0.008);
  for (const u of [-4.9, 4.9])
    box(bookshop, 0.12, 2.6, 0.2, brass, u, 1.5, 0.27, 0.012);
  // A scalloped cloth awning, modeled as a sloped sheet and individual valances.
  const cloth = material("#30423c", 0.92);
  const awning = box(bookshop, 11.9, 0.08, 1.05, cloth, 0, 3.42, 0.65, 0.035);
  awning.rotation.x = 0.12;
  for (let i = 0; i < 40; i++) {
    const valance = box(
      bookshop,
      0.295,
      0.17,
      0.06,
      cloth,
      -5.75 + i * 0.295,
      3.25,
      1.15,
      0.025,
    );
    valance.castShadow = true;
  }
  box(bookshop, 11.9, 0.025, 0.9, snow, 0, 3.49, 0.58, 0.018);
  // Café interiors, plants and chairs are composed around the route instead of scattered.
  cloneProp("cafe", scene, 0.9, 4.75, 0.13, -9.5, 0);
  cloneProp("cafe", scene, 0.9, 4.75, 0.13, -13, Math.PI * 0.15);
  cloneProp("bench", scene, 0.86, -4.85, 0.13, -2.8, Math.PI / 2);
  contactPoints.push([-4.85, -2.8, 1.5, 2.2]);
  for (const [x, z] of [
    [-4.8, -16.6],
    [4.85, -18.1],
    [4.85, 0],
    [11, -35.5],
  ] as const) {
    cloneProp("planter", scene, 0.5, x, 0.13, z, Math.PI / 2);
    contactPoints.push([x, z, 1.2, 1.1]);
    const shrub = new T.Group();
    scene.add(shrub);
    for (let j = 0; j < 8; j++) {
      const a = j * 2.4;
      rod(
        shrub,
        new T.Vector3(x, 0.6, z),
        new T.Vector3(
          x + Math.sin(a) * 0.3,
          1.12 + (j % 3) * 0.12,
          z + Math.cos(a) * 0.3,
        ),
        0.014,
        wood,
      );
    }
    box(shrub, 0.45, 0.05, 0.8, snow, x, 0.64, z, 0.02);
    batch(shrub);
  }
  // Window lighting stays local and motivated by interior fixtures.
  const bookLight = new T.RectAreaLight("#ffd3a0", 2.2, 10, 2.4);
  bookLight.position.set(-7.2, 2.3, -10);
  bookLight.lookAt(-2.5, 0.5, -10);
  scene.add(bookLight);
  const cafeLight = new T.RectAreaLight("#ffce91", 1.8, 9, 2.3);
  cafeLight.position.set(7.0, 2.2, -10.5);
  cafeLight.lookAt(1, 0, -10.5);
  scene.add(cafeLight);
  const interiorLight = new T.PointLight("#ffbf7d", 17, 10, 1.8);
  interiorLight.position.set(-8.4, 2.6, -10);
  scene.add(interiorLight);
  const cafeInterior = new T.PointLight("#ffc58b", 13, 10, 1.8);
  cafeInterior.position.set(8.4, 2.4, -10.5);
  scene.add(cafeInterior);
  const cornerLight = new T.PointLight("#f9ca8b", 18, 17, 1.6);
  cornerLight.position.set(9, 3.1, -35.8);
  scene.add(cornerLight);
  const eastLight = new T.RectAreaLight("#ffd0a0", 2.6, 9, 2.3);
  eastLight.position.set(23, 2.25, -23.7);
  eastLight.lookAt(23, 0.4, -31);
  scene.add(eastLight);
  const eastInterior = new T.PointLight("#f5bc82", 16, 10, 1.8);
  eastInterior.position.set(23, 2.5, -22.5);
  scene.add(eastInterior);
  const hotelLight = new T.PointLight("#ffd2a3", 24, 10, 1.7);
  hotelLight.position.set(23.5, 2.9, -36.0);
  scene.add(hotelLight);
  const doorLight = new T.SpotLight(
    "#ffd5a3",
    22,
    17,
    Math.PI * 0.38,
    0.7,
    1.5,
  );
  doorLight.position.set(-4.8, 3.7, -10);
  doorLight.target.position.set(-2, 0, -10);
  doorLight.castShadow = true;
  doorLight.shadow.mapSize.set(1024, 1024);
  doorLight.shadow.normalBias = 0.02;
  scene.add(doorLight, doorLight.target);
  // Lantern assets sit on masonry brackets. No additional shadow map per fixture.
  const practicals: [number, number, number][] = [
    [-5.6, 2.8, 2],
    [-5.6, 2.8, -16.2],
    [5.6, 2.8, -3.6],
    [5.6, 2.8, -23],
    [15, 2.8, -36.4],
  ];
  for (const [x, y, z] of practicals) {
    cloneProp(
      "lantern",
      scene,
      1.15,
      x,
      y,
      z,
      x < 0 ? Math.PI / 2 : x === 15 ? 0 : -Math.PI / 2,
    );
    const light = new T.PointLight("#ffcb8a", 7, 8, 1.8);
    light.position.set(x + (x < 0 ? 0.4 : -0.4), y + 0.75, z);
    scene.add(light);
  }
  // Swung sign is the only moving architectural prop; its hinge is at the actual bracket.
  const sign = new T.Group();
  sign.position.set(-4.9, 3.22, -5.9);
  scene.add(sign);
  box(scene, 1.15, 0.065, 0.065, iron, -5.35, 3.32, -5.9, 0.015);
  rod(
    scene,
    new T.Vector3(-5.85, 3.7, -5.9),
    new T.Vector3(-4.82, 3.32, -5.9),
    0.025,
    iron,
  );
  const signMat = label("LATE", "EDITION  /  BOOKS", 512, 640),
    signBack = signMat.clone();
  r.material(signBack);
  signBack.side = T.DoubleSide;
  box(sign, 0.85, 0.99, 0.075, wood, 0, -0.6, 0, 0.035);
  plane(sign, 0.78, 0.92, signBack, 0, -0.6, 0.041);
  plane(
    sign,
    0.78,
    0.92,
    signBack,
    0,
    -0.6,
    -0.041,
    new T.Euler(0, Math.PI, 0),
  );
  for (const x of [-0.27, 0.27])
    rod(sign, new T.Vector3(x, 0, 0), new T.Vector3(x, -0.16, 0), 0.012, iron);
  // Localized fake indirect bounce and contact AO; these are world-space surfaces.
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const ctx = cv.getContext("2d")!,
    gradient = ctx.createRadialGradient(64, 64, 3, 64, 64, 64);
  gradient.addColorStop(0, "#000a");
  gradient.addColorStop(1, "#0000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const aoTexture = r.texture(new T.CanvasTexture(cv));
  const contact = r.material(
    new T.MeshBasicMaterial({
      map: aoTexture,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
  for (const [x, z, w, d] of contactPoints)
    plane(scene, w, d, contact, x, 0.115, z, new T.Euler(-Math.PI / 2, 0, 0));
  // Distant street fronts remain real modules and roofs, with depth through the intersection.
  for (const [x, z, w, f, yaw, tint] of [
    [36, -36.8, 4, 3, 0, "#7c8b94"],
    [37, -25.3, 4, 4, Math.PI, "#968b7b"],
    [-19, -36.8, 5, 4, 0, "#8f9897"],
  ] as const)
    shell(x, z, w, f, yaw, tint, "small", "AFTER HOURS");
  shell(49, -36.8, 4, 4, 0, "#9aabb4", "large", "THE NIGHT SERVICE");
  shell(50, -25.3, 4, 3, Math.PI, "#b0a08d", "double", "LE PASSAGE");
  shell(64, -31, 6, 5, -Math.PI / 2, "#8e9ba6", "large", "THE OLD QUARTER");
  for (const g of buildingRoots) {
    // Preserve instance transforms by baking their world matrix into one retained mesh.
    const instances: T.InstancedMesh[] = [];
    g.traverse((o) => {
      if (o instanceof T.InstancedMesh) instances.push(o);
    });
    g.updateMatrixWorld(true);
    for (const i of instances) {
      i.applyMatrix4(g.matrixWorld);
      g.remove(i);
      scene.add(i);
    }
    batch(g);
  }
  return {
    sign,
    bookLight,
    doorLight,
    bookshopHit: new T.Box3(
      new T.Vector3(-6.1, 0.2, -16),
      new T.Vector3(-5.7, 3.5, -4),
    ),
    storefront: new T.Vector3(-5.9, 1.6, -10),
    glass,
  };
}
