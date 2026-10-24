import * as THREE from "three";
import { createStreetCharacter } from "./street-character";
import { createDistrictEnvironment } from "./district-environment";
import { createWalkerMotion, damp, routeX, ROUTE_LENGTH, WALK_SPEED } from "./walker-motion";

export type StreetInput = { progress: number; x: number; y: number; pressed: boolean; paused: boolean; reduced: boolean; rainy: boolean; glow: boolean; walk?: boolean; travel?: number };

/** One forward render. No reflection camera, shadow-map redraw or fullscreen chain. */
export async function createNightStreet(canvas: HTMLCanvasElement, input: StreetInput, signal?: AbortSignal) {
  const character = await createStreetCharacter();
  if (signal?.aborted) { character.dispose(); throw new DOMException("Scene cancelled", "AbortError"); }
  const compact = innerWidth < 760;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" }); }
  catch (error) { character.dispose(); throw error; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a1822); scene.fog = new THREE.FogExp2(0x213b49, .031);
  const environment = createDistrictEnvironment(compact); scene.add(environment.group, character.root);
  const camera = new THREE.PerspectiveCamera(compact ? 54 : 47, 1, .1, 110);
  const motion = createWalkerMotion();
  const look = new THREE.Vector3(), cameraGoal = new THREE.Vector3(), targetGoal = new THREE.Vector3();
  // Soft contact shadows establish weight without another scene render.
  const shadowCanvas = document.createElement("canvas"); shadowCanvas.width = shadowCanvas.height = 64;
  const ctx = shadowCanvas.getContext("2d")!, gradient = ctx.createRadialGradient(32,32,2,32,32,32);
  gradient.addColorStop(0,"rgba(255,255,255,.75)"); gradient.addColorStop(.45,"rgba(255,255,255,.3)"); gradient.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=gradient; ctx.fillRect(0,0,64,64);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas), shadowGeometry = new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
  const shadowMaterial = new THREE.MeshBasicMaterial({map:shadowTexture,color:0x01050a,transparent:true,depthWrite:false,opacity:.7});
  const shadows = new THREE.InstancedMesh(shadowGeometry,shadowMaterial,3), stamp = new THREE.Object3D(); shadows.frustumCulled=false; scene.add(shadows);
  let initialized=false,disposed=false,frame=0,previous=0,time=0,visible=true,dirty=true,first=true,yaw=0,pitch=0,rainy=1,manual=0;
  let lastX=0,lastY=0,lastProgress=0,lastPaused=false,lastReduced=false,lastRain=true,lastGlow=false,lastWalk=false;
  let sampled=0,totalFrame=0,qualityReduced=false;
  const snapDamp=(v:number,target:number,rate:number,dt:number)=>Math.abs(v-target)<.0001?target:damp(v,target,rate,dt);
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.7?54:47;camera.updateProjectionMatrix();dirty=true;wake();}
  function wake(){if(initialized&&!disposed&&!frame&&visible&&!document.hidden){previous=0;frame=requestAnimationFrame(tick);}}
  const observer=new ResizeObserver(resize);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}});
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
  function tick(now:number){
    frame=0;if(disposed||!visible||document.hidden)return;
    const dt=previous?Math.min((now-previous)/1000,.12):1/60;previous=now;
    const paused=input.paused||input.reduced;
    const changed=input.x!==lastX||input.y!==lastY||input.progress!==lastProgress||input.paused!==lastPaused||input.reduced!==lastReduced||input.rainy!==lastRain||input.glow!==lastGlow||!!input.walk!==lastWalk;
    lastX=input.x;lastY=input.y;lastProgress=input.progress;lastPaused=input.paused;lastReduced=input.reduced;lastRain=input.rainy;lastGlow=input.glow;lastWalk=!!input.walk;
    const oldYaw=yaw,oldPitch=pitch,oldRain=rainy;
    yaw=snapDamp(yaw,input.x,9,dt);pitch=snapDamp(pitch,input.y,9,dt);rainy=snapDamp(rainy,input.rainy?1:0,9,dt);
    if(!paused){time+=dt;if(input.walk||input.travel)manual=Math.max(-input.progress*ROUTE_LENGTH,Math.min(ROUTE_LENGTH-input.progress*ROUTE_LENGTH,manual+(input.travel||(input.walk?1:0))*WALK_SPEED*dt));}
    const state=motion.update(dt,input.progress*ROUTE_LENGTH+manual,paused);
    character.root.position.set(routeX(state.distance),0,5-state.distance);
    character.update(dt,state,paused);
    // Consistent shoulder framing; movement/turning never throws the camera across the street.
    const aspect=canvas.clientWidth/canvas.clientHeight;
    const side=aspect<.7?-1.1:-2.7;
    cameraGoal.set(character.root.position.x+side+yaw*.85,2.5+pitch*.45,character.root.position.z+6.6);
    targetGoal.set(character.root.position.x+(aspect<.7?-.05:.15),1.24+pitch*.16,character.root.position.z-1.65);
    if(first){camera.position.copy(cameraGoal);look.copy(targetGoal);}else{camera.position.lerp(cameraGoal,1-Math.exp(-dt*5.5));look.lerp(targetGoal,1-Math.exp(-dt*6));}
    const cameraMoving=camera.position.distanceToSquared(cameraGoal)>.000001||look.distanceToSquared(targetGoal)>.000001;
    if(!cameraMoving){camera.position.copy(cameraGoal);look.copy(targetGoal);}camera.lookAt(look);
    const needsRender=first||dirty||changed||!paused||oldYaw!==yaw||oldPitch!==pitch||oldRain!==rainy||cameraMoving;
    if(needsRender){
      for(let i=0;i<3;i++){
        const foot=character.feet[i%2]?.contact;
        stamp.position.set(i===2?character.root.position.x:foot.x,.012,i===2?character.root.position.z:foot.z);
        stamp.scale.set(i===2?.85:.27,1,i===2?.65:.38);stamp.rotation.y=state.heading;stamp.updateMatrix();shadows.setMatrixAt(i,stamp.matrix);
      }shadows.instanceMatrix.needsUpdate=true;
      environment.update(time,input.reduced?0:rainy,input.glow);renderer.render(scene,camera);first=false;dirty=false;
    }
    if(!paused&&sampled<100){sampled++;totalFrame+=dt;if(sampled===100&&totalFrame/sampled>.029){qualityReduced=true;renderer.setPixelRatio(.85);canvas.dataset.quality="economy";resize();}}
    // In still mode keep input responsive but do not redraw identical frames.
    if(!qualityReduced)canvas.dataset.quality="balanced";
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();document.removeEventListener("visibilitychange",visibility);character.dispose();environment.dispose();shadowTexture.dispose();shadowGeometry.dispose();shadowMaterial.dispose();renderer.dispose();}
  try{
    character.root.position.set(routeX(0),0,5);character.update(0,motion.state,false);
    observer.observe(canvas);intersection.observe(canvas);document.addEventListener("visibilitychange",visibility);resize();
    camera.position.set(routeX(0)-2.7,2.5,11.6);camera.lookAt(routeX(0)+.15,1.24,3.35);
    await renderer.compileAsync(scene,camera);
    if(signal?.aborted){dispose();throw new DOMException("Scene cancelled","AbortError");}
    initialized=true;wake();
  }catch(error){dispose();throw error;}
  return {dispose};
}
