import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Observatory, WorldView } from './observatory-route';

// Art-directed camera rail on the same rooftop; distance and perspective stay continuous.
const shots = [
  { eye: [12, 5.3, 12], aim: [-1, 2.7, -4] },
  { eye: [8.5, 3.2, 6.8], aim: [1.0, 1.7, -.4] },
  { eye: [2.5, 3.4, 7.7], aim: [-5.7, 1.8, -3.7] },
  { eye: [-2.3, 3.0, 10.0], aim: [-7.2, 1.2, 3.3] },
  { eye: [-1.0, 3.3, 1.1], aim: [-8.1, 1.9, -6.8] },
  { eye: [9.5, 5.4, -0.5], aim: [-0.8, 2.4, -9.5] },
];
const landmarkPositions = [[3,4.5,-4], [3,2.0,1], [-4.8,1.8,-4], [-5.1,1.5,4], [-7.8,2.2,-7], [1,2,-10]];
const c1 = new T.Color('#83ced6'), c2 = new T.Color('#efbb83');

/** Owns every GPU resource and the only RAF. No React state is changed per frame. */
export async function createObservatory(
  canvas: HTMLCanvasElement,
  hotspot: HTMLElement | null,
  signal: AbortSignal,
  onLost: () => void,
): Promise<Observatory> {
  const compact = innerWidth < 760;
  const renderer = new T.WebGLRenderer({ canvas, antialias: !compact, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.25 : 1.75));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new T.Scene();
  scene.background = new T.Color('#07121d');
  scene.fog = new T.FogExp2('#102330', .019);
  const camera = new T.PerspectiveCamera(43, 1, .15, 300);
  const geometry = new Set<T.BufferGeometry>(), materials = new Set<T.Material>(), textures = new Set<T.Texture>();
  const bitmaps = new Set<ImageBitmap>();
  const resources: { environment?: T.WebGLRenderTarget } = {};
  let disposed = false, frame = 0, dirty = true, time = 0, previous = 0;
  let view: WorldView = { progress: 0, project: 0, skill: 0, focused: false, paused: false, rain: true, reduced: false };
  let progress = 0, focus = 0, hover = 0, hoverTarget = 0, px = 0, py = 0, mx = 0, my = 0;
  const vector = new T.Vector3(), cameraAim = new T.Vector3(), cameraEye = new T.Vector3();
  const positionRail = new T.CatmullRomCurve3(shots.map(s => new T.Vector3(...s.eye)), false, 'catmullrom', .12);
  const targetRail = new T.CatmullRomCurve3(shots.map(s => new T.Vector3(...s.aim)), false, 'catmullrom', .12);
  const trackGeometry = <G extends T.BufferGeometry>(g: G) => { geometry.add(g); return g; };
  const material = <M extends T.Material>(m: M) => { materials.add(m); return m; };
  const add = (g: T.BufferGeometry, m: T.Material, p: number[], r: number[] = [0,0,0], parent: T.Object3D = scene) => {
    const mesh = new T.Mesh(trackGeometry(g), m); mesh.position.set(...p as [number,number,number]); mesh.rotation.set(...r as [number,number,number]); parent.add(mesh); return mesh;
  };
  const metal = material(new T.MeshStandardMaterial({ color: '#445969', metalness: .88, roughness: .29 }));
  const dark = material(new T.MeshStandardMaterial({ color: '#172730', metalness: .65, roughness: .42 }));
  const pale = material(new T.MeshStandardMaterial({ color: '#67858c', metalness: .45, roughness: .43 }));
  const amber = material(new T.MeshBasicMaterial({ color: '#efbc85', toneMapped: false }));
  const cyan = material(new T.MeshBasicMaterial({ color: '#93d8df', toneMapped: false }));
  const glass = material(new T.MeshPhysicalMaterial({ color: '#70a7ac', metalness: .7, roughness: .12, clearcoat: 1, clearcoatRoughness: .08 }));
  const box = (w:number,h:number,d:number,m:T.Material,p:number[],r?:number[],parent?:T.Object3D) => add(new T.BoxGeometry(w,h,d),m,p,r,parent);
  const cylinder = (r:number,h:number,m:T.Material,p:number[],parent?:T.Object3D) => add(new T.CylinderGeometry(r,r,h,32),m,p,undefined,parent);
  const tube = (points: number[][], radius: number, m: T.Material, parent: T.Object3D = scene) => add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p as [number,number,number]))), 40, radius, 6, false),m,[0,0,0],undefined,parent);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const texLoader = new T.TextureLoader();
  function register(root: T.Object3D) {
    root.traverse(o => { if(o instanceof T.Mesh) {
      geometry.add(o.geometry);
      for(const m of Array.isArray(o.material) ? o.material : [o.material]) {
        materials.add(m);
        for(const v of Object.values(m)) if(v instanceof T.Texture) { textures.add(v); if(typeof ImageBitmap !== 'undefined' && v.source.data instanceof ImageBitmap) bitmaps.add(v.source.data); }
      }
    }});
  }
  function cleanup() {
    if(disposed) return; disposed = true; cancelAnimationFrame(frame);
    removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
    canvas.removeEventListener('webglcontextlost', lost);
    geometry.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose()); bitmaps.forEach(b=>b.close());
    resources.environment?.dispose(); renderer.dispose(); scene.clear();
  }
  const onAbort = () => cleanup();
  signal.addEventListener('abort', onAbort, {once:true});
  // All assets are local, compressed derivatives of licensed CC0 source material.
  const modelNames=['optics','radio','relay','lamp','facade','desk','searchlight'];
  const loaded = await Promise.allSettled([
    ...modelNames.map(name=>loader.loadAsync('/world/'+name+'.glb')),
    new HDRLoader().loadAsync('/world/city-light.hdr'),
    ...['diffuse','nor_gl','rough'].map(name=>texLoader.loadAsync('/world/concrete-'+name+'.webp')),
  ]);
  for(const result of loaded) if(result.status==='fulfilled') {
    const asset = result.value;
    if('scene' in asset) register(asset.scene);
    else if(asset instanceof T.Texture) textures.add(asset);
  }
  if(signal.aborted || loaded.some(r=>r.status==='rejected')) {
    // Loaders cannot all abort, so collect and release late results too.
    disposed = false; cleanup(); signal.removeEventListener('abort', onAbort);
    throw Error('The observatory assets could not be prepared.');
  }
  const models = loaded.slice(0,modelNames.length).map(r=>(r as PromiseFulfilledResult<Awaited<ReturnType<GLTFLoader['loadAsync']>>>).value.scene);
  const hdr = (loaded[modelNames.length] as PromiseFulfilledResult<T.DataTexture>).value;
  const pmrem = new T.PMREMGenerator(renderer); pmrem.compileEquirectangularShader(); resources.environment = pmrem.fromEquirectangular(hdr); scene.environment = resources.environment.texture; scene.environmentIntensity = .12; pmrem.dispose();
  const concreteMaps = loaded.slice(modelNames.length+1).map(r=>(r as PromiseFulfilledResult<T.Texture>).value);
  concreteMaps.forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(7,6); t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());});
  concreteMaps[0].colorSpace=T.SRGBColorSpace;
  const concrete = material(new T.MeshStandardMaterial({ map:concreteMaps[0], normalMap:concreteMaps[1], roughnessMap:concreteMaps[2], normalScale:new T.Vector2(.65,.65), color:'#263d4a', roughness:.48, metalness:.18 }));
  // Dense close detail and broad silhouettes share one continuous ground plane.
  const floor = add(new T.PlaneGeometry(48,38),concrete,[0,-.04,-2],[-Math.PI/2,0,0]); floor.receiveShadow=true;
  box(48,.7,38,dark,[0,-.42,-2]);
  // Rainwater is a physical material over scattered, irregularly outlined puddles.
  const water = material(new T.MeshPhysicalMaterial({ color:'#283e4c', metalness:.72, roughness:.12, clearcoat:1, transparent:true, opacity:.65 }));
  for(let i=0;i<10;i++) {
    const shape = new T.Shape();
    for(let j=0;j<=24;j++){const a=j/24*Math.PI*2,r=1.5+.25*Math.sin(a*5+i);const x=Math.cos(a)*r,y=Math.sin(a)*r*.35;if(j)shape.lineTo(x,y);else shape.moveTo(x,y);}
    const puddle=add(new T.ShapeGeometry(shape),water,[-10+(i*7.17)%23,-.025,-11+(i*4.13)%21],[-Math.PI/2,0,i*.8]);puddle.scale.setScalar(.8+(i%3)*.4);
  }
  // Parapets, slender illuminated routes, drains and a recessed cable raceway.
  for(const z of [-16,14]) { box(46,.55,.38,concrete,[0,.2,z]);box(46,.07,.5,metal,[0,.51,z]); }
  for(const x of [-23,23]) {box(.4,.55,30,concrete,[x,.2,-1]);box(.12,.12,30,metal,[x,.58,-1]);}
  for(let i=0;i<25;i++) {box(.018,.008,30,dark,[-22+i*1.8,0,-1]);}
  for(const z of [-12,-5,2,9]) box(44,.008,.018,dark,[0,0,z]);
  for(let i=0;i<12;i++) {const x=-16+i*3;box(1.2,.025,.15,dark,[x,.01,9]);for(let j=0;j<7;j++)box(.04,.03,.17,metal,[x-.45+j*.15,.02,9]);}
  tube([[7,.05,7],[8,.05,4],[7,.05,1],[5,.05,-1],[4,.05,-5]],.045,dark);
  tube([[-6,.05,4],[-4,.05,4],[-3,.05,1],[-5,.05,-3],[-8,.05,-7]],.035,metal);
  // Architectural receiver: engineered rings, ribs, braces and an optical core.
  const receiver = new T.Group(); receiver.position.set(3,0,-5); scene.add(receiver);
  cylinder(2.4,.25,dark,[0,.12,0],receiver); cylinder(1.5,.15,metal,[0,.32,0],receiver); cylinder(.65,1.5,pale,[0,1.12,0],receiver);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;box(.06,1.4,.22,metal,[Math.cos(a)*.8,1.2,Math.sin(a)*.8],[0,-a,0],receiver);}
  const gimbal = new T.Group();gimbal.position.y=3.5;gimbal.rotation.set(.2,.1,.28);receiver.add(gimbal);
  const arcs:T.Mesh[]=[];
  for(let i=0;i<3;i++) {
    const ring = add(new T.TorusGeometry(2.2-i*.22,.07,12,128),metal,[0,0,0],[i===1?Math.PI/2:.15,i===2?Math.PI/2:0,i*.38],gimbal);arcs.push(ring);
    const line = new T.Mesh(trackGeometry(new T.TorusGeometry(2.2-i*.22,.014,6,128,Math.PI*1.4)),i===1?amber:cyan);line.rotation.x=Math.PI/2;ring.add(line);
    for(let j=0;j<12;j++){const a=j/12*Math.PI*2;box(.13,.3,.1,pale,[Math.cos(a)*(2.2-i*.22),Math.sin(a)*(2.2-i*.22),0],[0,0,a],ring);}
  }
  const core = add(new T.IcosahedronGeometry(.67,1),glass,[0,0,0],[.2,.4,.1],gimbal);
  const armPoints = [[-1.7,.4,0],[-1.8,1.7,0],[-1.4,2.7,0],[0,3.5,0],[1.4,2.7,0],[1.8,1.7,0],[1.7,.4,0]];
  tube(armPoints,.1,pale,receiver);
  // Bench exhibits are the projects' physical anchors, rather than separate scenes.
  const prepareProp = (model:T.Group, height:number, p:number[], rotation=0) => {
    const root=new T.Group(); const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    model.position.sub(new T.Vector3(center.x,bounds.min.y,center.z));root.add(model);root.scale.setScalar(height/size.y);root.position.set(...p as [number,number,number]);root.rotation.y=rotation;
    model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(root);return root;
  };
  prepareProp(models[5].clone(true),1.23,[3,0,1.2]);prepareProp(models[5].clone(true),1.23,[-5.8,0,3.4]);prepareProp(models[5],1.23,[-5,0,-4.8]);
  prepareProp(models[6],.6,[11,5.7,-3],.5);cylinder(.05,5.7,metal,[11,2.85,-3]);
  const optics=prepareProp(models[0],1.75,[4.05,1.25,1.0],-.3);
  const radio=prepareProp(models[1],1.1,[-4.6,1.25,-4.8],.12);
  const relay=prepareProp(models[2],2.8,[-8.1,0,-7.4],.1);
  prepareProp(models[3],1.45,[-6.6,1.25,3.4],.6);
  // Repeated, photographed architectural modules form a close city edge.
  const facade=models[4], wallBatch = new Map<T.Material,T.BufferGeometry[]>();
  const scratch=new T.Object3D();
  for(let row=0;row<6;row++)for(let col=0;col<12;col++) {
    for(const n of facade.children) {
      const copy=n.clone(true); copy.position.x+=-21+col*3;copy.position.y+=-9+row*3;copy.position.z+=-24;
      if(n.name.startsWith('window'))copy.position.y+=.3;
      if(n.name.startsWith('cornice'))copy.position.y+=2.8;
      if(n.name.startsWith('window')&&(row*7+col*3)%11<3){const glow=add(new T.PlaneGeometry(1.8,1.85),((row+col)%3?amber:cyan),[-21+col*3,-8.7+row*3+.93,-24.19]);glow.material=((row+col)%3?amber:cyan);}
      copy.updateMatrixWorld(true);
      copy.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)){
        const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const key of Object.keys(g.attributes)){if(!['position','normal','uv'].includes(key)){g.deleteAttribute(key);continue;}const a=g.getAttribute(key);const data=new Float32Array(a.count*a.itemSize);for(let k=0;k<a.count;k++){data[k*a.itemSize]=a.getX(k);data[k*a.itemSize+1]=a.getY(k);if(a.itemSize>2)data[k*a.itemSize+2]=a.getZ(k);}g.setAttribute(key,new T.BufferAttribute(data,a.itemSize));}g.applyMatrix4(o.matrixWorld);
        if(!wallBatch.has(o.material))wallBatch.set(o.material,[]);wallBatch.get(o.material)!.push(g);
      }});
    }
  }
  for(const [m,gs] of wallBatch){const merged=mergeGeometries(gs);if(merged)scene.add(new T.Mesh(trackGeometry(merged),m));gs.forEach(g=>g.dispose());}
  // A distant, layered city uses instancing. Only close buildings need asset detail.
  let seed=23091;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  const buildings=compact?56:92;
  const cityMat=material(new T.MeshStandardMaterial({color:'#243f51',roughness:.85,metalness:.12}));
  const blocks=new T.InstancedMesh(trackGeometry(new T.BoxGeometry(1,1,1)),cityMat,buildings);scene.add(blocks);
  const windows:T.Matrix4[]=[],windowColors:T.Color[]=[];
  for(let i=0;i<buildings;i++){
    const angle=(i/buildings)*Math.PI*2,dist=48+random()*50,w=3+random()*6,h=8+random()*23;
    const x=Math.cos(angle)*dist,z=Math.sin(angle)*dist-8,y=h/2-17;
    scratch.position.set(x,y,z);scratch.scale.set(w,h,w);scratch.rotation.set(0,0,0);scratch.updateMatrix();blocks.setMatrixAt(i,scratch.matrix);
    for(let floor=0;floor<h/2;floor++)for(let col=0;col<3;col++)if(random()>.42){
      scratch.position.set(x+(col-1)*w*.25,y-h/2+1+floor*2,z+w/2+.01);scratch.scale.set(.25+random()*.65,.5+random()*.7,1);scratch.updateMatrix();windows.push(scratch.matrix.clone());windowColors.push((random()>.32?c2:c1).clone().multiplyScalar(.35+random()*.7));
    }
  }
  const panes=new T.InstancedMesh(trackGeometry(new T.PlaneGeometry(1,1)),material(new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide})),windows.length);windows.forEach((m,i)=>{panes.setMatrixAt(i,m);panes.setColorAt(i,windowColors[i]);});scene.add(panes);
  // Recessed displays, prints, books, labels, vents, cable insulators and rail lights.
  const makeDisplay = (kind:number) => {
    const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const ctx=cv.getContext('2d')!;
    ctx.fillStyle='#07141e';ctx.fillRect(0,0,1024,512);ctx.strokeStyle='#315464';ctx.lineWidth=1;
    for(let x=32;x<1024;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();}for(let y=32;y<512;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1024,y);ctx.stroke();}
    ctx.fillStyle='#a7c8cc';ctx.font='24px monospace';ctx.fillText(['AXIOM / EVENT → ORDER','VERILLY / EVIDENCE → CONTROL','BEHAVIOURLY / SIGNAL → FEEDBACK'][kind],48,58);
    const labels=[['INGEST','BOOK','RISK','ROUTE'],['FACTS','GRAPH','VERIFY','CITE'],['VIDEO','AUDIO','CONTEXT','REVIEW']][kind];
    for(let i=0;i<4;i++){const x=55+i*245;ctx.fillStyle='#102c36';ctx.fillRect(x,170,184,145);ctx.strokeStyle=i===2?'#e6ad75':'#8ecbd3';ctx.strokeRect(x,170,184,145);ctx.fillStyle='#e2eee7';ctx.font='22px monospace';ctx.fillText(labels[i],x+22,250);if(i<3){ctx.beginPath();ctx.moveTo(x+184,240);ctx.lineTo(x+245,240);ctx.stroke();}}
    ctx.fillStyle='#81a8af';ctx.font='19px monospace';ctx.fillText('CONCEPTUAL ARCHITECTURE / NOT A LIVE PRODUCT SCREEN',48,461);
    const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;textures.add(t);return t;
  };
  const displayMaps=[0,1,2].map(makeDisplay);
  const displayMaterial=material(new T.MeshBasicMaterial({map:displayMaps[0],toneMapped:false}));
  const display=new T.Group();display.position.set(1.8,1.45,1.15);display.rotation.x=-.12;scene.add(display);
  box(2.35,1.32,.12,dark,[0,.65,0],undefined,display);add(new T.PlaneGeometry(2.2,1.1),displayMaterial,[0,.67,.066],undefined,display);box(.25,.28,.3,metal,[0,-.03,0],undefined,display);
  for(let i=0;i<3;i++) {box(.28,.05,.3,metal,[2.3+i*.52,1.26,1.8]);box(.18,.008,.16,i===0?cyan:amber,[2.3+i*.52,1.29,1.8]);}
  for(let i=0;i<8;i++){box(.5,.055,.72,i%2?pale:dark,[-5.1,1.28+i*.055,3.7],[0,.1*i,0]);}
  for(let i=0;i<12;i++){box(.04,.2,.6,metal,[-8.75+i*.11,.25,-7.25]);}
  // Peripheral rail and beacon keep each camera angle spatially legible.
  for(let i=0;i<13;i++){
    const x=-21+i*3.5;cylinder(.035,1.5,metal,[x,.85,-14.5]);box(.16,.08,.16,i%3?cyan:amber,[x,1.65,-14.5]);
  }
  tube([[-21,1.48,-14.5],[-7,1.48,-14.5],[7,1.48,-14.5],[21,1.48,-14.5]],.026,metal);
  // Contact antenna and taut guy lines at the far end of the same rooftop.
  cylinder(.08,5,metal,[1,2.5,-10]);
  for(let i=0;i<6;i++)box(2.1-i*.18,.035,.04,pale,[1,3+i*.32,-10]);
  for(const dx of [-1.6,1.6])tube([[1,4.6,-10],[1+dx,2,-10+dx],[1+dx*2,.05,-10+dx*2]],.012,metal);
  const beacon=add(new T.SphereGeometry(.10,12,8),amber,[1,5.05,-10]);
  // Light is motivated by fixtures. One frozen shadow map, no full-screen bloom chain.
  scene.add(new T.HemisphereLight('#aac9e7','#182b32',.25));
  const moon=new T.DirectionalLight('#a8cce2',.35);moon.position.set(-8,16,7);scene.add(moon);
  const key=new T.SpotLight('#9be1e9',110,35,Math.PI*.23,.75,1.4);key.position.set(11,5.9,-3);key.target.position.set(3,1,-3);scene.add(key,key.target);
  key.castShadow=!compact;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0007;key.shadow.normalBias=.035;
  const fill=new T.PointLight('#eab180',24,16,1.5);fill.position.set(-5,3,-3);scene.add(fill);
  const deskLight=new T.PointLight('#f3c899',20,5,1.6);deskLight.position.set(-5.7,2.6,3.4);scene.add(deskLight);
  const receiverLight=new T.PointLight('#79c5d9',22,10,1.5);receiverLight.position.set(3,3.5,-5);scene.add(receiverLight);
  // Soft local halos are world-space sprites; depth testing prevents wall bleed-through.
  const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;const hc=haloCanvas.getContext('2d')!;const gradient=hc.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(175,224,240,.42)');gradient.addColorStop(.17,'rgba(110,199,230,.12)');gradient.addColorStop(1,'rgba(60,150,210,0)');hc.fillStyle=gradient;hc.fillRect(0,0,128,128);const haloMap=new T.CanvasTexture(haloCanvas);textures.add(haloMap);
  for(const p of [[3,3.5,-5],[1,5.05,-10],[-5.7,2.6,3.4]]){const sprite=new T.Sprite(material(new T.SpriteMaterial({map:haloMap,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.65})));sprite.position.set(...p as [number,number,number]);sprite.scale.setScalar(4);scene.add(sprite);}
  // GPU rain: positions are immutable; one time uniform moves the entire field.
  const rainCount=compact?500:1100;const rainPositions=new Float32Array(rainCount*6),rainSeeds=new Float32Array(rainCount*2);
  for(let i=0;i<rainCount;i++){const x=(random()-.5)*52,z=(random()-.5)*42-3,y=random()*18;for(let j=0;j<2;j++){const k=i*6+j*3;rainPositions[k]=x;rainPositions[k+1]=y+j*.20;rainPositions[k+2]=z;rainSeeds[i*2+j]=random();}}
  const rainGeo=trackGeometry(new T.BufferGeometry());rainGeo.setAttribute('position',new T.BufferAttribute(rainPositions,3));rainGeo.setAttribute('aSeed',new T.BufferAttribute(rainSeeds,1));
  const rainMat=material(new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0}},vertexShader:'uniform float uTime; varying float vFade; void main(){vec3 p=position; p.y=mod(p.y-uTime*7.5,18.0);p.x+=p.y*.07;vFade=clamp(p.y*.2,0.,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying float vFade;void main(){gl_FragColor=vec4(.49,.7,.8,.18*vFade);}' }));
  const rain=new T.LineSegments(rainGeo,rainMat);rain.frustumCulled=false;scene.add(rain);
  function batchStaticChildren(parent:T.Object3D){
  const staticBatches=new Map<string,{ material:T.Material; receive:boolean; cast:boolean; items:T.BufferGeometry[]; }>();
  parent.updateMatrixWorld(true);
  for(const object of [...parent.children]) {
    if(!(object instanceof T.Mesh)||object instanceof T.InstancedMesh||object===beacon||Array.isArray(object.material)||object.material.transparent)continue;
    const m=object.material,key=m.uuid+String(object.receiveShadow)+String(object.castShadow);
    const g=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
    for(const name of Object.keys(g.attributes)){
      if(!['position','normal','uv'].includes(name)){g.deleteAttribute(name);continue;}
      const a=g.getAttribute(name),data=new Float32Array(a.count*a.itemSize);
      for(let i=0;i<a.count;i++){data[i*a.itemSize]=a.getX(i);data[i*a.itemSize+1]=a.getY(i);if(a.itemSize>2)data[i*a.itemSize+2]=a.getZ(i);}
      g.setAttribute(name,new T.BufferAttribute(data,a.itemSize));
    }
    g.applyMatrix4(object.matrix);
    if(!g.hasAttribute('uv'))g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));
    if(!staticBatches.has(key))staticBatches.set(key,{material:m,receive:object.receiveShadow,cast:object.castShadow,items:[]});
    staticBatches.get(key)!.items.push(g);parent.remove(object);
  }
  for(const batch of staticBatches.values()){
    const merged=mergeGeometries(batch.items);if(merged){const mesh=new T.Mesh(trackGeometry(merged),batch.material);mesh.receiveShadow=batch.receive;mesh.castShadow=batch.cast;parent.add(mesh);}batch.items.forEach(g=>g.dispose());
  }
  }
  arcs.forEach(batchStaticChildren);batchStaticChildren(receiver);batchStaticChildren(scene);
  renderer.shadowMap.needsUpdate=true;
  cameraEye.copy(positionRail.getPoint(0));cameraAim.copy(targetRail.getPoint(0));
  let width=1,height=1,slowSeconds=0,qualityReduced=false,lastProject=-1;
  const projectColors=[new T.Color('#8ed3dd'),new T.Color('#e9b789'),new T.Color('#c0bfdc')];
  function resize(){width=canvas.clientWidth||innerWidth;height=canvas.clientHeight||innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width/height<.85?59:43;camera.setViewOffset(width,height,-width*(width/height<.85?.025:.12),0,width,height);camera.updateProjectionMatrix();dirty=true;wake();}
  function lost(e:Event){e.preventDefault();cleanup();signal.removeEventListener('abort',onAbort);onLost();}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;}else wake();}
  function wake(){if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);}
  function tick(stamp:number){
    frame=0;if(disposed||document.hidden)return;
    const dt=Math.min(previous?(stamp-previous)/1000:1/60,.15);previous=stamp;
    const ambient=!view.paused&&!view.reduced;
    const desired=Math.max(0,Math.min(5,view.progress));
    const moving=Math.abs(progress-desired)>.0001||Math.abs(focus-(view.focused?1:0))>.001||(!view.reduced&&(Math.abs(mx-px)>.001||Math.abs(my-py)>.001||Math.abs(hover-hoverTarget)>.001));
    progress=view.reduced?desired:T.MathUtils.damp(progress,desired,4.3,dt);focus=view.reduced?(view.focused?1:0):T.MathUtils.damp(focus,view.focused?1:0,4,dt);mx=view.reduced?0:T.MathUtils.damp(mx,px,3,dt);my=view.reduced?0:T.MathUtils.damp(my,py,3,dt);hover=view.reduced?hoverTarget:T.MathUtils.damp(hover,hoverTarget,6,dt);
    if(ambient)time+=dt;
    if(dirty||moving||ambient){
      positionRail.getPoint(progress/5,cameraEye);targetRail.getPoint(progress/5,cameraAim);
      if(width/height<.85){cameraEye.y+=2.3;cameraAim.y-=1;const offsets=[4,2,1.2,1.4,.2,1.8],i=Math.min(4,Math.floor(progress));cameraAim.x+=T.MathUtils.lerp(offsets[i],offsets[i+1],progress-i);}
      cameraEye.x+=mx*.32;cameraEye.y-=my*.16;cameraEye.addScaledVector(vector.copy(cameraAim).sub(cameraEye),focus*.08);
      // Hold the landmarks to the right; the left half is intentional reading space.
      camera.position.copy(cameraEye);camera.lookAt(cameraAim);
      gimbal.rotation.y=.1+Math.sin(time*.12)*.15;gimbal.rotation.z=.28+Math.sin(time*.18)*.055;arcs[0].rotation.z=time*.055;arcs[1].rotation.z=-time*.035;core.rotation.y=time*.12;
      receiverLight.intensity=22+hover*10;beacon.scale.setScalar(.95+Math.sin(time*1.5)*.06);optics.rotation.y=-.3+hover*.025;radio.rotation.y=.12;
      rain.visible=view.rain;rainMat.uniforms.uTime.value=time;
      if(lastProject!==view.project){displayMaterial.map=displayMaps[view.project];displayMaterial.needsUpdate=true;lastProject=view.project;}
      const color=projectColors[view.skill%3];relay.traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.MeshStandardMaterial)o.material.emissive.copy(color).multiplyScalar(.015+hover*.025);});
      renderer.render(scene,camera);dirty=false;
      canvas.dataset.calls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);canvas.dataset.draws=String(Number(canvas.dataset.draws||0)+1);canvas.dataset.camera=progress.toFixed(3);
      if(hotspot){const i=Math.max(0,Math.min(5,Math.round(progress)));vector.set(...landmarkPositions[i] as [number,number,number]).project(camera);const visible=vector.z<1&&Math.abs(vector.x)<.9&&Math.abs(vector.y)<.72;hotspot.style.transform=`translate3d(${(vector.x*.5+.5)*width}px,${(-vector.y*.5+.5)*height}px,0)`;hotspot.style.visibility=visible?'visible':'hidden';}
    }
    // Reduce fill rate only after sustained pressure; keep assets and material detail.
    if(ambient&&!qualityReduced){slowSeconds=dt>.032?slowSeconds+dt:Math.max(0,slowSeconds-dt*.5);if(slowSeconds>4){renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1:1.25));renderer.setSize(width,height,false);qualityReduced=true;canvas.dataset.quality='balanced';}}
    if(ambient||moving)wake();
  }
  addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',lost);resize();
  // Warm the real first view before the poster crossfade, not a separate loading film.
  await renderer.compileAsync(scene,camera);
  if(signal.aborted){cleanup();throw Error('Aborted');}
  wake();
  return {
    setView(next){view=next;dirty=true;wake();},
    setPointer(x,y){px=x;py=y;wake();},
    setHover(active){hoverTarget=active?1:0;wake();},
    dispose(){signal.removeEventListener('abort',onAbort);cleanup();},
  };
}
