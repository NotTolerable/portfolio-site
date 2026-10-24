import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { architectureMaterial, wetRoadMaterial } from "./district-materials";

/** Curated street set. Repeated detail shares material batches and light atlases. */
export function createDistrictEnvironment(compact: boolean) {
  const group = new THREE.Group();
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  const keep = <T extends THREE.Material>(m: T) => { materials.add(m); return m; };
  const stone = keep(architectureMaterial(0x42596a)), blue = keep(architectureMaterial(0x293c4b)), pale = keep(architectureMaterial(0x71808a));
  const trim = keep(architectureMaterial(0x192a37)), concrete = keep(architectureMaterial(0x405563)), brick = keep(architectureMaterial(0x594344));
  const warm = keep(new THREE.MeshBasicMaterial({ color: 0xe9b378 })), cool = keep(new THREE.MeshBasicMaterial({ color: 0x7fb6c9 }));
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const matrix = new THREE.Matrix4(); const temp = new THREE.Object3D();
  function add(g: THREE.BufferGeometry, m: THREE.Material, position: number[], rotation: number[] = [0, 0, 0]) {
    temp.position.set(...position as [number, number, number]); temp.rotation.set(...rotation as [number, number, number]); temp.updateMatrix(); matrix.copy(temp.matrix);
    const baked = g.index ? g.toNonIndexed() : g.clone(); baked.applyMatrix4(matrix); g.dispose();
    if (!buckets.has(m)) buckets.set(m, []); buckets.get(m)!.push(baked);
  }
  const box = (w: number, h: number, d: number, m: THREE.Material, p: number[], r?: number[]) => add(new THREE.BoxGeometry(w, h, d), m, p, r);
  const cylinder = (radius: number, height: number, m: THREE.Material, p: number[]) => add(new THREE.CylinderGeometry(radius, radius, height, 8), m, p);
  let seed = 43027;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const windows: { x: number; y: number; z: number; color: number }[] = [], lights: { x: number; y: number; z: number; color: number }[] = [];
  // Continuous ground, generous kerbs, seams and correctly spaced crossing marks.
  const road = keep(wetRoadMaterial()); box(9, .08, 105, road, [0, -.04, -25]);
  box(40, .2, 110, trim, [0, -.22, -25]);
  for (const side of [-1, 1]) {
    box(3.5, .18, 100, concrete, [side * 6.15, .025, -25]);
    box(.15, .26, 100, pale, [side * 4.47, .035, -25]);
    for (let i = 0; i < 33; i++) box(3.4, .008, .025, trim, [side * 6.2, .12, 22 - i * 3]);
  }
  for (let i = 0; i < 7; i++) box(.5, .008, 1.65, pale, [-3.1 + i * 1.03, .01, -8]);
  for (let i = 0; i < 15; i++) box(.07, .008, 1.2, pale, [0, .008, 14 - i * 5]);

  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const z = 16 - i * 7.2, height = 8 + random() * 10, width = 4 + random() * 2.8;
    const face = side * (7.7 + (i % 3 === 1 ? .4 : 0)), x = face + side * width / 2;
    const material = [stone, blue, brick, blue][(i + (side > 0 ? 1 : 0)) % 4];
    box(width, height, 6.65, material, [x, height / 2 + .1, z]);
    box(width + .2, .2, 6.85, pale, [x, height + .2, z]);
    box(.22, .42, 6.7, trim, [face - side * .08, .32, z]);
    for (let floor = 0; floor < Math.floor(height / 2.45); floor++) {
      const y = 1.8 + floor * 2.4;
      box(.24, .1, 6.8, pale, [face - side * .1, y - .95, z]);
      for (let col = 0; col < 3; col++) {
        const wz = z - 2.25 + col * 2.25;
        box(.15, 1.55, 1.4, trim, [face - side * .08, y, wz]);
        windows.push({ x: face - side * .17, y, z: wz, color: random() > .38 ? (random() > .3 ? 0xd9aa79 : 0x79a8ba) : 0x152937 });
        box(.2, 1.35, .04, trim, [face - side * .2, y, wz]);
        box(.2, .035, 1.3, trim, [face - side * .2, y - .15, wz]);
      }
    }
    // A defined shop level, distinct entry bays, ribs, canopies and fire escapes.
    box(.4, 2.3, 2.5, trim, [face - side * .16, 1.15, z + .5]);
    box(.08, 1.9, 2.05, i % 2 ? cool : warm, [face - side * .4, 1.25, z + .5]);
    box(.2, 2.0, .06, trim, [face - side * .45, 1.25, z + .5]);
    box(1.2, .13, 3.5, i % 3 ? blue : brick, [face - side * .55, 2.7, z + .5], [0, 0, side * .08]);
    box(.75, .12, 2.5, pale, [face - side * .3, .16, z + .5]);
    cylinder(.5, 1.4, trim, [x, height + .95, z - 1.2]);
    box(1.1, .5, 1.3, pale, [x, height + .55, z + 1.6]);
    cylinder(.022, 2.3, trim, [x + .6, height + 1.4, z]);
    if (i % 2 === 0) {
      box(.65, .6, .9, pale, [face - side * .35, 3.9, z + 2.6]);
      for (let j = 0; j < 6; j++) box(.02, .025, .72, trim, [face - side * .69, 3.7 + j * .07, z + 2.6]);
    } else {
      for (const rail of [-.32, .32]) box(.06, height - 1, .05, trim, [face - side * .3, height / 2 + .5, z - 2.5 + rail]);
      for (let j = 0; j < height / .5; j++) box(.08, .035, .7, pale, [face - side * .35, .65 + j * .5, z - 2.5]);
      box(.85, .1, 2.9, trim, [face - side * .4, 5.0, z]);
    }
  }
  const winGeo = new THREE.BoxGeometry(.025, 1.3, 1.23); geometries.add(winGeo);
  const winMaterial = keep(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const panes = new THREE.InstancedMesh(winGeo, winMaterial, windows.length);
  windows.forEach((w, i) => { temp.position.set(w.x, w.y, w.z); temp.rotation.set(0,0,0); temp.updateMatrix(); panes.setMatrixAt(i, temp.matrix); panes.setColorAt(i, new THREE.Color(w.color)); }); group.add(panes);

  // A single sign atlas and material instead of one texture/draw for every sign.
  const atlas = document.createElement("canvas"); atlas.width = 512; atlas.height = 512;
  const ctx = atlas.getContext("2d")!;
  const labels = ["WORK", "FIELD", "BP", "CLOUD", "AFTER", "HOURS", "CODE", "ARCHIVE"];
  labels.forEach((label, i) => {
    const x = i % 4 * 128, y = Math.floor(i / 4) * 256;
    ctx.fillStyle = "#0b1822"; ctx.fillRect(x, y, 128, 256);
    const color = i % 3 === 0 ? "#dfaa76" : "#8bbdce";
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(x + 9, y + 7, 110, 242);
    ctx.fillStyle = color; ctx.font = "600 34px sans-serif"; ctx.textAlign = "center";
    [...label].forEach((letter, j) => ctx.fillText(letter, x + 64, y + 43 + j * (label.length > 5 ? 31 : 38)));
  });
  const signTexture = new THREE.CanvasTexture(atlas); signTexture.colorSpace = THREE.SRGBColorSpace; textures.add(signTexture);
  const signMaterial = keep(new THREE.MeshBasicMaterial({ map: signTexture, side: THREE.DoubleSide }));
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1, z = 7 - i * 6.6;
    const g = new THREE.PlaneGeometry(.95, 2.6), uv = g.attributes.uv;
    for (let j = 0; j < uv.count; j++) uv.setXY(j, (uv.getX(j) + i % 4) / 4, (uv.getY(j) + 1 - Math.floor(i / 4)) / 2);
    add(g, signMaterial, [side * 6.5, 4.15, z]);
    box(1.05, 2.8, .14, trim, [side * 6.5, 4.15, z - .08]);
    box(1.4, .08, .08, pale, [side * 7.0, 5.4, z]);
  }
  // Ground-level light pools, benches, drains, planters and overhead lines.
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 1 : -1, z = 5 - i * 8;
    cylinder(.065, 5.2, trim, [side * 5.1, 2.6, z]);
    box(.85, .1, .4, trim, [side * 4.8, 5.15, z]);
    box(.65, .035, .29, warm, [side * 4.8, 5.08, z]);
    lights.push({ x: side * 4.8, y: 5.02, z, color: i % 3 ? 0x92bfd2 : 0xffbd7a });
    box(.8, .65, 1.5, trim, [side * 6.3, .45, z - 2.3]);
    for (let j = 0; j < 5; j++) box(.42, .35 + random() * .35, .27, blue, [side * 6.3 + (random() - .5) * .5, .95, z - 2.8 + j * .2]);
    if (i % 2 === 0) {
      for (const leg of [-.65,.65]) box(.06,.65,.06,trim,[side*6.0+leg,.43,z+2]);
      for(let j=0;j<4;j++) box(1.6,.07,.09,pale,[side*6,.7,z+1.8+j*.11]);
    }
    box(.18,.01,.8,trim,[side*4.2,.015,z-1]);
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-8,7,z),new THREE.Vector3(0,5.9,z+.6),new THREE.Vector3(8,6.8,z+1)]);
    add(new THREE.TubeGeometry(path,14,.018,4,false),trim,[0,0,0]);
  }
  // A warm arcade closes the vista; silhouettes continue beyond the playable set.
  for (const x of [-4.8, 4.8]) box(1.8, 9, 4.5, stone, [x,4.5,-33]);
  box(11.4, 3, 4.5, blue, [0,9.3,-33]);
  box(7.5,.12,.15,warm,[0,7.65,-30.7]);
  for (let i=0;i<11;i++) {
    const x=(i-5)*3.9,h=13+random()*12;
    box(2.8,h,4,blue,[x,h/2,-52-random()*12]);
    box(.08,h*.55,.06,cool,[x+.6,h*.6,-49-random()*3]);
  }
  for (const [m, parts] of buckets) { const g = mergeGeometries(parts); parts.forEach((item)=>item.dispose()); if(g){geometries.add(g);group.add(new THREE.Mesh(g,m));} }
  const hemisphere = new THREE.HemisphereLight(0x9bbdcc,0x192a35,2.1);
  const key = new THREE.DirectionalLight(0xb6d2df,1.7); key.position.set(-6,14,9); group.add(hemisphere,key);
  const moonGeo = new THREE.SphereGeometry(2,16,12); geometries.add(moonGeo);
  const moon = new THREE.Mesh(moonGeo,keep(new THREE.MeshBasicMaterial({color:0x87a8ba})));moon.position.set(-9,22,-65);group.add(moon);

  const haloCanvas=document.createElement("canvas");haloCanvas.width=64;haloCanvas.height=64;const haloCtx=haloCanvas.getContext("2d")!;
  const gradient=haloCtx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,"rgba(255,255,255,.7)");gradient.addColorStop(.15,"rgba(255,255,255,.16)");gradient.addColorStop(1,"rgba(255,255,255,0)");haloCtx.fillStyle=gradient;haloCtx.fillRect(0,0,64,64);
  const haloTexture=new THREE.CanvasTexture(haloCanvas);textures.add(haloTexture);
  const glowMaterial=keep(new THREE.PointsMaterial({map:haloTexture,size:3,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.5}));
  const glowGeo=new THREE.BufferGeometry();geometries.add(glowGeo);glowGeo.setAttribute("position",new THREE.Float32BufferAttribute(lights.flatMap(l=>[l.x,l.y,l.z]),3));glowGeo.setAttribute("color",new THREE.Float32BufferAttribute(lights.flatMap(l=>new THREE.Color(l.color).toArray()),3));group.add(new THREE.Points(glowGeo,glowMaterial));

  const count=compact?240:560,positions=new Float32Array(count*6),tails=new Float32Array(count*2);
  for(let i=0;i<count;i++){const p=[(random()-.5)*20,random()*18,12-random()*65];positions.set([...p,...p],i*6);tails[i*2+1]=1;}
  const rainGeo=new THREE.BufferGeometry();geometries.add(rainGeo);rainGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));rainGeo.setAttribute("tail",new THREE.BufferAttribute(tails,1));
  const rainMaterial=keep(new THREE.ShaderMaterial({uniforms:{time:{value:0},strength:{value:1}},vertexShader:`attribute float tail;uniform float time;varying float a;void main(){vec3 p=position;p.y=mod(p.y-time*7.4,18.)+tail*.24;p.x+=tail*.025;vec4 v=modelViewMatrix*vec4(p,1.);a=clamp(1.-length(v.xyz)/48.,0.,1.)*.19;gl_Position=projectionMatrix*v;}`,fragmentShader:`uniform float strength;varying float a;void main(){gl_FragColor=vec4(.6,.75,.83,a*strength);}`,transparent:true,depthWrite:false}));
  const rain=new THREE.LineSegments(rainGeo,rainMaterial);rain.frustumCulled=false;group.add(rain);
  return { group,update(time:number,rainy:number,glow:boolean){rainMaterial.uniforms.time.value=time;rainMaterial.uniforms.strength.value=rainy;road.uniforms.time.value=time;road.uniforms.rainy.value=rainy;road.uniforms.glow.value=glow?1:0;glowMaterial.opacity=glow ? .9 : .5;},
    dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());},
  };
}
