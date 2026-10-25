import * as T from 'three';
import { createCityKit, type CityKitCache } from './building-kit';
import { CityResources, type CityAssets } from './assets';
import type { DistrictId, LandmarkId } from './layout';
export type DistrictDetails = {
  signs: T.Group[];
  fixtures: Partial<Record<LandmarkId, T.Light>>;
};
/** Geometry is authored in the same metre-based map as the camera and pedestrian lanes. */
export async function buildDistrict(id: Exclude<DistrictId, 'a'>, root: T.Group, assets: CityAssets, r: CityResources, cache: CityKitCache, yieldFrame: () => Promise<void>) {
  const k = createCityKit(root, assets, r, cache), { box, plane, rod, label, shell, cloneProp, material, stone, iron, wood, snow, brass, amber } = k;
  const signs: T.Group[] = [], fixtures: DistrictDetails['fixtures'] = {};
  const street = new T.Group();
  root.add(street);
  function pavement(x: number, z: number, w: number, d: number) {
    box(street, w, .16, d, stone, x, .02, z, .025);
    const along = w > d, len = along ? w : d;
    for (let i = -len / 2 + .65; i < len / 2; i += 1.4) {
      const a = along ? x + i : x + (x > 60 ? -1 : 1) * d / 2, b = along ? z + (z < -30 ? 1 : -1) * d / 2 : z + i;
      box(street, along ? 1.36 : .18, .23, along ? .18 : 1.36, stone, a, .02, b, .016);
      box(street, along ? 1.2 : .11, .018, along ? .11 : 1.2, snow, along ? a : a + (x > 60 ? .13 : -.13), .15, along ? b - .13 : b, .007);
    }
  }
  function point(x: number, y: number, z: number, intensity = 10, color = '#ffd09a', range = 12) {
    const light = new T.PointLight(color, intensity, range, 1.8);
    light.position.set(x, y, z);
    root.add(light);
    return light;
  }
  function shopLight(g: T.Group, intensity = 2.3, color = '#ffd1a0') {
    g.updateMatrixWorld(true);
    const light = new T.RectAreaLight(color, intensity, 8, 2.2);
    light.position.copy(g.localToWorld(new T.Vector3(0, 2, -.65)));
    light.quaternion.copy(g.quaternion);
    light.rotateY(Math.PI);
    root.add(light);
    point(...g.localToWorld(new T.Vector3(0, 2.4, -1.9)).toArray() as [
      number,
      number,
      number
    ], 15, color, 10);
    return light;
  }
  function lantern(x: number, z: number, yaw = 0, intensity = 8) {
    cloneProp('lantern', root, 1.05, x, 2.7, z, yaw);
    point(x + Math.sin(yaw) * .35, 3.4, z + Math.cos(yaw) * .35, intensity);
  }
  function hanging(g: T.Group, text: string) {
    g.updateMatrixWorld(true);
    const sign = new T.Group();
    sign.position.copy(g.localToWorld(new T.Vector3(-3.8, 3.3, .9)));
    sign.rotation.y = g.rotation.y;
    sign.userData.dynamic = true;
    root.add(sign);
    box(sign, .76, .86, .07, wood, 0, -.52, 0, .025);
    plane(sign, .68, .77, label(text, 'AFTER HOURS', 512, 640), 0, -.52, .04);
    rod(sign, new T.Vector3(-.23, 0, 0), new T.Vector3(-.23, -.12, 0), .012, iron);
    rod(sign, new T.Vector3(.23, 0, 0), new T.Vector3(.23, -.12, 0), .012, iron);
    sign.userData.baseYaw = g.rotation.y;
    signs.push(sign);
  }
  function tables(g: T.Group, us: number[]) {
    for (const u of us) {
      cloneProp('cafe', g, .88, u, .08, -1.65);
      rod(g, new T.Vector3(u, 3.35, -1.1), new T.Vector3(u, 2.5, -1.1), .014, brass);
      box(g, .32, .04, .32, amber, u, 2.49, -1.1, .015);
    }
  }
  function awning(g: T.Group, width: number, color: string) {
    box(g, width, .08, .9, material(color, .9), 0, 3.3, .55, .025);
    box(g, width, .12, .06, material(color, .9), 0, 3.19, 1, .02);
    box(g, width, .035, .8, snow, 0, 3.36, .52, .012);
  }
  function board(g: T.Group, text: string, sub: string, u: number, y = 1.7) {
    box(g, 1.12, 1.55, .1, brass, u, y, -.1, .016);
    plane(g, 1.03, 1.46, label(text, sub, 512, 768, '#26333a', '#d4c2a0'), u, y, -.042);
  }
  function hoop(parent: T.Group, x: number, z: number) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.rotation.y = Math.PI / 2;
    parent.add(g);
    box(g, 1.8, 1.05, .11, material('#b9b9aa'), 0, 3.52, 0, .025);
    box(g, .61, .43, .012, iron, 0, 3.34, .063, .01);
    box(g, .55, .37, .016, material('#b9b9aa'), 0, 3.34, .074);
    const rim = new T.Mesh(r.geometry(new T.TorusGeometry(.23, .018, 6, 28)), material('#9d553b', .65, .2));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.06, .34);
    g.add(rim);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, b = (i + 1) / 12 * Math.PI * 2;
      rod(g, new T.Vector3(Math.sin(a) * .22, 3.04, .34 + Math.cos(a) * .22), new T.Vector3(Math.sin(b) * .15, 2.65, .34 + Math.cos(b) * .15), .008, material('#c3b9a5'));
    }
    box(g, .1, 2.4, .1, iron, 0, 1.55, -.15);
  }
  if (id === 'b') {
    pavement(49.2, -35.8, 13.4, 2.3);
    pavement(46.2, -26, 19.4, 2.3);
    const hotel = shell(22, -36.8, 4, 5, 0, '#b5a995', 'small', 'HÔTEL MINUIT', { open: true });
    board(hotel, 'MINUIT', 'ROOMS  /  RECEPTION', -3);
    shopLight(hotel, 1.4);
    await yieldFrame();
    const restaurant = shell(23, -25.3, 4, 3, Math.PI, '#b6a38f', 'large', 'CAFÉ DU COIN', { open: true });
    tables(restaurant, [-3, 1]);
    awning(restaurant, 11.8, '#5b3931');
    shopLight(restaurant);
    hanging(restaurant, 'CAFÉ');
    await yieldFrame();
    const noodle = shell(34, -36.8, 3, 3, 0, '#b9b4a2', 'double', 'NIGHT KITCHEN', { open: true });
    tables(noodle, [-2, 1.8]);
    board(noodle, 'SUPPER', 'UNTIL LATE', 0);
    shopLight(noodle, 2.4);
    await yieldFrame();
    const arcade = shell(43.5, -36.8, 3, 4, 0, '#93a2aa', 'large', 'THE ARCADE', { open: true, openBay: 0 });
    // Bay zero is x40.5; a clear 2.73m portal leads to a real floor and furnished room.
    // Route entry is centred on x40.5, no glass/plinth across this bay.
    for (const u of [-1, 1.25, 3]) {
      box(arcade, .75, 1.8, .8, wood, u, .98, -2.4, .06);
      box(arcade, .65, .55, .06, material('#688c8c', .3), u, 1.45, -1.96, .02);
      plane(arcade, .55, .43, label('PLAY', 'INSERT COIN', 256, 256, '#19373d', '#b9d9ca'), u, 1.45, -1.92);
      box(arcade, .68, .09, .35, iron, u, 1.05, -1.8, .02);
    }
    shopLight(arcade, 2.2, '#b9d5cc');
    hanging(arcade, 'PLAY');
    await yieldFrame();
    const supper = shell(35, -25.3, 3, 3, Math.PI, '#a7ada3', 'small', 'TABLE FOR TWO', { open: true });
    tables(supper, [-2, 1.5]);
    shopLight(supper, 1.8);
    await yieldFrame();
    const bar = shell(47, -25.3, 4, 4, Math.PI, '#b1a7a5', 'double', 'THE BLUE NOTE', { open: true });
    box(bar, 8.7, 1.03, .65, wood, 0, .6, -2.5, .03);
    box(bar, 8.9, .08, .8, stone, 0, 1.16, -2.5, .02);
    for (let i = 0; i < 16; i++) {
      box(bar, .08, .27 + (i % 3) * .04, .08, material(i % 2 ? '#74623d' : '#37534b', .2), -3.8 + i * .5, 1.36, -2.45, .012);
    }
    tables(bar, [-3, 2.7]);
    board(bar, 'LIVE', 'TONIGHT  /  23:00', 0);
    fixtures['blue-note'] = shopLight(bar, 2.5, '#f3c49b');
    hanging(bar, 'LIVE');
    await yieldFrame();
    shell(53, -36.8, 2, 3, 0, '#a7a99a', 'small', 'LE PASSAGE', { residential: true });
    shell(71, -31, 3, 4, -Math.PI / 2, '#9eaca9', 'double', 'THE NIGHT SERVICE', { residential: true });
    await yieldFrame();
    for (const x of [19, 30, 38, 50, 55])
      lantern(x, -36.3, 0, 7);
    for (const x of [19, 35, 51])
      lantern(x, -25.8, Math.PI, 8);
    cloneProp('bench', root, .86, 29.7, .13, -35.6);
    cloneProp('planter', root, .55, 44, .13, -26);
    cloneProp('cafe', root, .9, 23, .13, -26.1, Math.PI / 2);
    // Thin festoon spans at safe 6m height; restrained warm bulbs are emissive, not extra lights.
    for (const x of [28, 48])
      for (let i = 0; i < 12; i++) {
        const z = -35.8 + i * .88, y = 6.1 - Math.sin(i / 11 * Math.PI) * .55;
        rod(street, new T.Vector3(x, y, z), new T.Vector3(x, 6.1 - Math.sin((i + 1) / 11 * Math.PI) * .55, z + .88), .012, iron);
        box(street, .055, .09, .055, amber, x, y - .07, z, .012);
      }
  }
  else if (id === 'c') {
    // Sidewalks stop at the alley and at the D intersection; the cross street stays open.
    pavement(64.85, -58, 2.2, 48.5);
    pavement(55.15, -50.5, 2.2, 31);
    pavement(55.15, -77.2, 2.2, 10.1);
    shell(65.95, -41, 3, 4, -Math.PI / 2, '#aeb2a5', 'small', 'RUE DES ARCHIVES', { residential: true });
    await yieldFrame();
    shell(54.05, -43, 3, 3, Math.PI / 2, '#b4ac9c', 'double', 'MAISON 18', { residential: true });
    await yieldFrame();
    const gym = shell(65.95, -55.5, 4, 3, -Math.PI / 2, '#a7aca5', 'large', 'SECOND ROUND', { open: true });
    box(gym, 4.4, .35, 3, material('#414c52'), -.5, .3, -1.9, .04);
    box(gym, 4.25, .055, 2.9, material('#a59c85', .95), -.5, .51, -1.9, .015);
    for (const x of [-2.55, 1.55])
      for (const z of [-.5, -3.3]) {
        box(gym, .1, 1.4, .1, iron, x, 1.15, z, .02);
        for (const y of [1, 1.35, 1.7])
          rod(gym, new T.Vector3(x, y, z), new T.Vector3(x === -2.55 ? 1.55 : -2.55, y, z), .025, material('#9e7161'));
      }
    for (const z of [-.5, -3.3])
      for (const y of [1, 1.35, 1.7])
        rod(gym, new T.Vector3(-2.55, y, z), new T.Vector3(-2.55, y, z === -.5 ? -3.3 : -.5), .023, material('#b1a38b'));
    for (const u of [3.7, 4.8]) {
      rod(gym, new T.Vector3(u, 3.3, -2), new T.Vector3(u, 2.4, -2), .018, iron);
      box(gym, .47, 1.1, .47, material('#492f2a', .95), u, 1.85, -2, .17);
    }
    const tex = r.texture(await new T.TextureLoader().loadAsync('/city/art/ippo-print.webp'));
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    const print = r.material(new T.MeshStandardMaterial({ map: tex, roughness: .85, emissiveMap: tex, emissive: '#b7a58c', emissiveIntensity: .1 }));
    box(gym, 1.35, 1.98, .07, wood, -4.3, 1.58, -.35, .02);
    plane(gym, 1.24, 1.86, print, -4.3, 1.58, -.31);
    shopLight(gym, 2.2);
    await yieldFrame();
    const repair = shell(54.05, -58, 3, 4, Math.PI / 2, '#9badae', 'small', 'NIGHT SERVICE', { open: true });
    board(repair, 'REPAIR', 'RADIOS  /  SMALL THINGS', 0);
    shopLight(repair, 1.3);
    await yieldFrame();
    shell(65.95, -70, 4, 3, -Math.PI / 2, '#b6aa98', 'double', 'RUE DES ARCHIVES', { residential: true });
    await yieldFrame();
    // An actual side alley with brick return walls, utility details and an understated hoop.
    const alley = new T.Group();
    root.add(alley);
    const alleyBrick = r.material(new T.MeshStandardMaterial({ color: '#797d70', map: assets.maps['brick-diff'], normalMap: assets.maps['brick-nor_gl'], roughnessMap: assets.maps['brick-rough'], aoMap: assets.maps['brick-ao'], normalScale: new T.Vector2(.4, .4), roughness: .93 }));
    box(alley, .3, 4.7, 6, alleyBrick, 47.6, 2.35, -68.5);
    box(alley, 6.4, 4.6, .3, alleyBrick, 50.8, 2.3, -71.5);
    box(alley, 6.4, 4.6, .3, alleyBrick, 50.8, 2.3, -65.5);
    hoop(alley, 47.85, -68.5);
    rod(alley, new T.Vector3(48, 0, -71.2), new T.Vector3(48, 4.4, -71.2), .045, iron);
    rod(alley, new T.Vector3(48, 4.4, -71.2), new T.Vector3(53.9, 4.4, -71.2), .045, iron);
    box(alley, 1.1, .8, .7, wood, 49, .4, -70.7, .025);
    point(51, 3.5, -68.5, 8, '#e2c99f', 10);
    k.batch(alley);
    const printshop = shell(54.05, -80, 3, 3, Math.PI / 2, '#b4a28f', 'large', 'CORNER PRINT', { open: true });
    cloneProp('shelf', printshop, 2.2, -2, .08, -1.6);
    cloneProp('books', printshop, .4, 1.5, .65, -.7);
    board(printshop, 'PRINT', 'SMALL EDITIONS / EST. 1999', 1.6);
    awning(printshop, 8.8, '#384a43');
    fixtures['corner-print'] = shopLight(printshop, 1.9);
    hanging(printshop, 'PRINT');
    await yieldFrame();
    for (const z of [-42, -57, -76])
      lantern(65.5, z, -Math.PI / 2, 7);
    for (const z of [-47, -62, -79])
      lantern(54.5, z, Math.PI / 2, 6);
    cloneProp('bench', root, .86, 64.9, .13, -82, Math.PI / 2);
    cloneProp('planter', root, .55, 64.7, .13, -63);
  }
  else {
    pavement(44, -91, 22, 2.2);
    pavement(44, -81.1, 22, 2.2);
    pavement(25.85, -109, 2.2, 38);
    pavement(34.15, -109, 2.2, 38);
    shell(19, -86, 3, 2, Math.PI / 2, '#b2ada0', 'double', 'LE PASSAGE', { residential: true });
    await yieldFrame();
    shell(19, -98, 3, 2, Math.PI / 2, '#a4ada7', 'small', 'MAISON 18', { residential: true });
    await yieldFrame();
    shell(19, -74, 3, 2, Math.PI / 2, '#b8b1a0', 'double', 'LE PASSAGE', { residential: true });
    await yieldFrame();
    shell(44, -91.9, 3, 2, 0, '#aba797', 'small', 'MAISON 18', { residential: true });
    await yieldFrame();
    shell(44, -80.05, 3, 2, Math.PI, '#aeb6ad', 'double', 'LE PASSAGE', { residential: true });
    await yieldFrame();
    shell(35.25, -101, 3, 2, -Math.PI / 2, '#aba999', 'small', 'MAISON 18', { residential: true });
    await yieldFrame();
    const studio = shell(24.75, -108, 3, 2, Math.PI / 2, '#abb2ab', 'large', 'NORTH STUDIO', { open: true, residential: true });
    // Work surfaces occupy both visible bays rather than an empty glass shell.
    for (const u of [-2.8, 2.8]) {
      box(studio, 2.35, .08, .9, stone, u, .94, -.9, .02);
      for (const side of [-1, 1])
        box(studio, .06, .78, .65, wood, u + side * 1.0, .51, -.9, .012);
      cloneProp('books', studio, .24, u - .5, .98, -.95);
      plane(studio, .7, .45, material('#c4bda9', .95), u + .45, .989, -.75, new T.Euler(-Math.PI / 2, 0, 0));
      rod(studio, new T.Vector3(u + .8, .99, -1.25), new T.Vector3(u + .8, 1.5, -1.25), .025, brass);
      box(studio, .28, .035, .2, amber, u + .8, 1.5, -1.25, .015);
    }
    cloneProp('shelf', studio, 2.1, 0, .08, -2.8);
    box(studio, 7.8, .05, .3, wood, 0, 2.2, -3.42, .012);
    for (let i = 0; i < 9; i++)
      plane(studio, .45, .62, label('STUDY ' + (i + 1), 'INK / PAPER', 256, 384, '#a9a18d', '#34423c'), -3.2 + i * .8, 1.65, -3.45);
    fixtures['north-studio'] = shopLight(studio, .9, '#ebd5b4');
    await yieldFrame();
    shell(35.25, -117, 2, 2, -Math.PI / 2, '#a5b4b7', 'double', 'LE PASSAGE', { residential: true });
    await yieldFrame();
    shell(24.75, -122, 2, 1, Math.PI / 2, '#b3aea0', 'small', 'MAISON 18', { residential: true });
    await yieldFrame();
    // Low walls, pocket gardens and a park gateway open up the skyline. The court is deliberately deferred.
    for (const side of [24.1, 35.9])
      for (const z of [-95, -115, -130]) {
        box(street, 1.6, .45, 2.8, stone, side, .24, z, .04);
        box(street, 1.64, .06, 2.85, snow, side, .5, z, .025);
        for (let i = 0; i < 6; i++)
          rod(street, new T.Vector3(side, .5, z), new T.Vector3(side + Math.sin(i * 2.4) * .6, 1.4 + (i % 3) * .3, z + Math.cos(i * 2.4) * .9), .035, wood);
      }
    for (const z of [-97, -112, -126]) {
      lantern(24.9, z, Math.PI / 2, 4);
      lantern(35.1, z + 3, -Math.PI / 2, 3);
    }
    for (const side of [-1, 1]) {
      const x = 30 + side * 3.9;
      box(street, .55, 2.3, .55, stone, x, 1.15, -131.5, .03);
      box(street, .64, .12, .64, snow, x, 2.35, -131.5, .02);
      for (let i = 0; i < 12; i++)
        box(street, .035, 1.35, .04, iron, x + side * (.4 + i * .28), 1.2, -131.5, .006);
      box(street, 3.7, .04, .05, iron, x + side * 1.8, 1.85, -131.5);
    }
    // Park-edge depth beyond the gateway, leaving the eventual court footprint untouched.
    for (const [x, z] of [[17, -139], [44, -142]] as const) {
      shell(x, z, 3, 2, 0, '#9fa8a5', 'small', 'MAISON 18', { residential: true });
      await yieldFrame();
    }
    const bark = material('#38443e', .97);
    for (const [x, z, h] of [[18, -129, 7], [41, -129, 8], [23, -140, 8], [37, -143, 9], [11, -135, 9], [49, -137, 8]] as const) {
      rod(street, new T.Vector3(x, 0, z), new T.Vector3(x + .1, h, z), .14, bark);
      for (let j = 0; j < 9; j++) {
        const a = j * 2.4, y = h * (.37 + j * .058), dx = Math.sin(a) * (1.5 + j * .06), dz = Math.cos(a) * (1.5 + j * .06);
        rod(street, new T.Vector3(x, y, z), new T.Vector3(x + dx, y + 1.4, z + dz), .045, bark);
        rod(street, new T.Vector3(x + dx * .7, y + 1, z + dz * .7), new T.Vector3(x + dx * 1.3, y + 2.1, z + dz * 1.2), .018, bark);
      }
    }
    plane(street, 1.4, .3, label('NORTH GARDENS', 'PLEASE WALK QUIETLY', 768, 192, '#24332f', '#c8c1a7'), 25.2, 1.9, -131.2);
  }
  k.batch(street);
  await k.finishAsync(yieldFrame);
  return { signs, fixtures };
}
