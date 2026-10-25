import * as T from "three";
import {dressStreet,stockMarket} from "./street-details";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {createCityKit,type CityKitCache} from "./building-kit";
import {CityResources,type CityAssets} from "./assets";
/** Arrival district, retained and refined from Phase 2. */
export function buildCityEnvironment(scene:T.Group,assets:CityAssets,r:CityResources,cache?:CityKitCache){
const kit=createCityKit(scene,assets,r,cache);
const {box,plane,rod,label,cloneProp,module,shell,batch,material,brass,iron,stone,snow,wood,amber,glass}=kit;
  const contactPoints: [number,number,number,number][]=[];
  const pavements = new T.Group();
  scene.add(pavements);
  for (const side of [-1, 1]) {
    box(pavements, 2.3, 0.16, 39, stone, side * 4.85, 0.02, -7.5, 0.04);
    for (let z = 12; z > -26.8; z -= 1.4)
      box(pavements, 0.22, 0.23, 1.36, stone, side * 3.78, 0.02, z, 0.025);
    const snowVertices: number[] = [];
    for (let i = 0; i < 77; i++) {
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
    for (let z = 11; z > -26; z -= 2.4)
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
  const market=shell(5.95,5.5,4,3,-Math.PI/2,"#c3b8aa","double","CORNER MARKET",{open:true});stockMarket(market,kit);
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
  shell(-4, -36.8, 4, 4, 0, "#b9b8ac", "small", "THE OLD QUARTER");
  shell(9, -36.8, 4, 3, 0, "#cbb597", "double", "LE PETIT CINÉMA");
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
  sign.userData.dynamic=true;
  dressStreet('a',scene,assets,r,kit.cache);
  kit.finish();
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
