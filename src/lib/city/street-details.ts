import * as T from 'three';
import { createCityKit, type CityKitCache } from './building-kit';
import { CityResources, type CityAssets } from './assets';
import type { DistrictId } from './layout';
/** Authored street dressing stays outside the shared travel lanes and reinforces specific venues. */
export function dressStreet(id: DistrictId, root: T.Group, assets: CityAssets, r: CityResources, cache: CityKitCache) {
  const k = createCityKit(root, assets, r, cache), { box, plane, rod, cloneProp, label, material, iron, wood, brass, snow } = k, g = new T.Group();
  root.add(g);
  const bicycle = (x: number, z: number, yaw: number) => cloneProp('bicycle', g, 1.076, x, .105, z, yaw);
  const bin = (x: number, z: number, yaw = 0) => cloneProp('trash-can', g, .906, x, .105, z, yaw);
  function streetSign(x: number, z: number, text: string, yaw = 0) {
    const s = new T.Group();
    s.position.set(x, 0, z);
    s.rotation.y = yaw;
    g.add(s);
    rod(s, new T.Vector3(0, .1, 0), new T.Vector3(0, 2.65, 0), .026, iron);
    box(s, 1.2, .38, .05, iron, 0, 2.5, 0, .025);
    plane(s, 1.12, .3, label(text, '', 512, 128, '#203e45', '#d5d5bf'), 0, 2.5, .028);
  }
  function rack(x: number, z: number, yaw: number) {
    const group = new T.Group();
    group.position.set(x, 0, z);
    group.rotation.y = yaw;
    g.add(group);
    for (const u of [-.7, .7]) {
      rod(group, new T.Vector3(u, .1, -.35), new T.Vector3(u, .8, -.35), .03, iron);
      rod(group, new T.Vector3(u, .8, -.35), new T.Vector3(u, .8, .35), .03, iron);
      rod(group, new T.Vector3(u, .8, .35), new T.Vector3(u, .1, .35), .03, iron);
    }
  }
  function notice(x: number, z: number, yaw: number, title: string) {
    const group = new T.Group();
    group.position.set(x, .11, z);
    group.rotation.y = yaw;
    g.add(group);
    box(group, .55, .8, .05, wood, 0, .6, 0, .02);
    plane(group, .48, .7, label(title, 'TONIGHT / WALK IN', 384, 512, '#20302b', '#e5cf9c'), 0, .6, .031);
    for (const side of [-1, 1])
      rod(group, new T.Vector3(side * .24, 0, -.22), new T.Vector3(side * .24, 1, .0), .022, wood);
  }
  function vent(x: number, y: number, z: number, yaw: number) {
    const v = new T.Group();
    v.position.set(x, y, z);
    v.rotation.y = yaw;
    g.add(v);
    box(v, .48, .38, .14, iron, 0, 0, 0, .025);
    for (let i = 0; i < 6; i++)
      box(v, .4, .018, .025, brass, 0, -.14 + i * .055, .08, .006);
  }
  if (id === 'a') {
    vent(-5.87, 1.7, -15.8, Math.PI / 2);
    bicycle(-5.08, 0, Math.PI);
    rack(-5.05, .2, Math.PI);
    bin(5.14, -21);
    streetSign(-4.85, -25.7, 'RUE DES ARCHIVES', Math.PI / 2);
    notice(-5.1, -12, Math.PI / 2, 'NEW PRINTS');
    // Bundled delivery newspapers and a subtle drain/utility cover suggest an ordinary working street.
    for (let i = 0; i < 4; i++)
      box(g, .45, .06, .32, material('#9f9e90', .95), -5.1, .15 + i * .06, -11.8, .012);
  }
  else if (id === 'b') {
    vent(37.9, 1.6, -36.65, 0);
    bicycle(31, -25.9, Math.PI / 2);
    bicycle(33.1, -25.9, -Math.PI / 2);
    rack(32, -25.9, Math.PI / 2);
    bin(37.5, -36.2);
    bin(54, -25.85);
    streetSign(55.6, -35.7, 'LANTERN STREET', 0);
    notice(46, -25.85, Math.PI, 'LIVE / 23:00');
    // Parked vehicle occupies a curb bay beyond the main pedestrian route, outside the camera rail.
    cloneProp('covered-car', g, 1.411, 67.2, -.075, -28.2, Math.PI / 2);
    for (const x of [47, 49]) {
      box(g, .8, .08, .32, snow, x, .15, -35.9, .025);
    }
  }
  else if (id === 'c') {
    bicycle(65.2, -64, 0);
    bin(54.65, -72.8);
    notice(65.2, -58, -Math.PI / 2, 'SECOND ROUND');
    streetSign(64.8, -79.8, 'PASSAGE NORTH', -Math.PI / 2);
    // Scuffed alley basketball, a taped fixture schedule and everyday utility details.
    const ball = new T.Mesh(r.geometry(new T.SphereGeometry(.12, 16, 10)), material('#70462d', .9));
    ball.position.set(49.4, .045, -70.7);
    g.add(ball);
    box(g, .46, .62, .03, iron, 54.35, 1.65, -62, .01);
    plane(g, .39, .55, label('OPEN MAT', 'MON / WED / FRI', 256, 384, '#c0b69b', '#343d37'), 54.38, 1.65, -62, new T.Euler(0, Math.PI / 2, 0));
    box(g, .6, .3, .32, iron, 54.25, .25, -64, .025);
  }
  else {
    bicycle(35.1, -122, 0);
    bin(25.4, -126.8);
    streetSign(34.6, -94, 'NORTH GARDENS', -Math.PI / 2);
    for (const z of [-102, -116]) {
      box(g, .28, .4, .22, iron, 35.15, 1.3, z, .03);
      box(g, .18, .015, .14, brass, 35.0, 1.35, z);
    }
  }
  k.batch(g);
}
/** Detailed ordinary groceries make the arrival shop clearly different from another cafe. */
export function stockMarket(shop: T.Group, k: ReturnType<typeof createCityKit>) {
  const { box, plane, label, material, iron, wood } = k;
  const cold = material('#d8e0d7', .28);
  cold.emissive.set('#bedad3');
  cold.emissiveIntensity = .7;
  for (const u of [-3, 0, 3]) {
    box(shop, 2.2, 2.25, .65, iron, u, 1.25, -1.5, .04);
    box(shop, 2.05, 2.0, .055, cold, u, 1.26, -1.15, .015);
    for (let row = 0; row < 4; row++) {
      box(shop, 2.0, .045, .42, wood, u, .45 + row * .44, -.94, .015);
      for (let i = 0; i < 9; i++) {
        box(shop, .13, .28, .17, material(['#a69c69', '#618185', '#866d54'][row % 3], .65), u - .8 + i * .2, .61 + row * .44, -.98, .016);
        plane(shop, .105, .21, label(['TEA', 'OATS', 'RICE', 'SOAP'][row], String(i % 3 + 1), 128, 192, ['#9b9064', '#496265', '#715443', '#8a8f7a'][row], '#e8e0bc'), u - .8 + i * .2, .61 + row * .44, -.886);
      }
    }
    plane(shop, 1.8, .23, label(u < 0 ? 'PANTRY' : u === 0 ? 'EVERYDAY' : 'FRESH', '', 512, 128, '#243932', '#e3d9b9'), u, 2.52, -1.06);
  }
  box(shop, 2.1, .85, .65, wood, 4, .55, -3.3, .03);
  plane(shop, .5, .32, label('OPEN', 'UNTIL MIDNIGHT', 256, 192, '#183d36', '#e7d1a9'), 4, 1.7, -.2);
}
