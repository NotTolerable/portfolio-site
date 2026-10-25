'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, useCallback } from 'react';
import { stations, type Observatory, type StationId, type WorldView } from '@/lib/observatory-route';
import { AboutRecord, ExperienceRecord, ProjectRecord, SkillsRecord } from './portfolio-records';

type RecordSelection = { kind:'project'; id:string } | { kind:'experience'|'about'|'skills' };
type WorldContextValue={active:number; enhanced:boolean; mode:'world'|'reading'; ready:boolean; project:number; setProject:(n:number)=>void; skill:number; setSkill:(n:number)=>void; goTo:(id:StationId)=>void; inspect:(selection:RecordSelection)=>void; toggleMode:()=>void;};
const WorldContext=createContext<WorldContextValue|null>(null);
export function useWorld(){const v=useContext(WorldContext);if(!v)throw Error('WorldProvider is missing');return v;}
const subscribeHydration=()=>()=>{};
const subscribeMotion=(listener:()=>void)=>{const m=matchMedia('(prefers-reduced-motion: reduce)');m.addEventListener('change',listener);return()=>m.removeEventListener('change',listener);};
const motionSnapshot=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function WorldProvider({children}:{children:React.ReactNode}) {
  const pathname=usePathname();
  const cameraStudy=pathname==='/camera-study';
  const enhanced=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
  const reduced=useSyncExternalStore(subscribeMotion,motionSnapshot,()=>false);
  const [choice,setChoice]=useState<'auto'|'world'|'reading'>('auto');
  const [status,setStatus]=useState<'loading'|'ready'|'unavailable'>('loading');
  const [active,setActive]=useState(0),[project,setProject]=useState(0),[skill,setSkill]=useState(0);
  const [paused,setPaused]=useState(false),[rain,setRain]=useState(true),[settings,setSettings]=useState(false);
  const [selection,setSelection]=useState<RecordSelection|null>(null);
  const canvas=useRef<HTMLCanvasElement>(null),hotspot=useRef<HTMLButtonElement>(null),engine=useRef<Observatory|null>(null);
  const progress=useRef(0),root=useRef<HTMLDivElement>(null);
  const mode=enhanced&&choice!=='reading'&&status!=='unavailable'&&(!reduced||choice==='world')?'world':'reading';
  const state=useRef<WorldView>({progress:0,project:0,skill:0,focused:false,paused:false,rain:true,reduced:false});
  const shouldLoad=!cameraStudy&&enhanced&&status!=='unavailable'&&(!reduced||choice==='world');
  const goTo=useCallback((id:StationId)=>{
    const element=document.getElementById(id);if(!element)return;
    window.scrollTo({top:element.getBoundingClientRect().top+scrollY,behavior:reduced?'instant':'smooth'});
    history.replaceState(null,'',id==='main'?'/':'/#'+id);
  },[reduced]);
  const toggleMode=()=>{
    const next=mode==='world'?'reading':'world';setChoice(next);
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(stations[active].id)?.scrollIntoView({behavior:'instant',block:'start'})));
  };
  useEffect(()=>{
    if(!shouldLoad||!canvas.current)return;
    const abort=new AbortController();let scene:Observatory|undefined;
    queueMicrotask(()=>{if(!abort.signal.aborted)setStatus('loading');});
    import('@/lib/observatory-scene').then(m=>m.createObservatory(canvas.current!,hotspot.current,abort.signal,()=>setStatus('unavailable'))).then(s=>{
      if(abort.signal.aborted){s.dispose();return;}scene=s;engine.current=s;s.setView(state.current);setStatus('ready');
    }).catch(()=>{if(!abort.signal.aborted)setStatus('unavailable');});
    return()=>{abort.abort();scene?.dispose();engine.current=null;};
  },[shouldLoad]);
  useEffect(()=>{
    state.current={progress:pathname==='/resume'?2:pathname==='/infrastructure'?4:progress.current,project,skill,focused:!!selection||pathname!=='/',paused:paused||mode==='reading',rain,reduced};
    engine.current?.setView(state.current);
  },[pathname,project,skill,selection,paused,rain,reduced,mode]);
  useEffect(()=>{
    if(pathname!=='/'||mode!=='world')return;
    let frame=0;
    const update=()=>{
      frame=0;
      const nodes=stations.map(s=>document.getElementById(s.id));
      const y=scrollY,step=nodes[1]?.offsetTop??innerHeight*1.15;
      const start=nodes[0]?.offsetTop??0;
      const p=Math.max(0,Math.min(5,(y-start)/Math.max(1,step-start)));
      progress.current=p;state.current={...state.current,progress:p};engine.current?.setView(state.current);
      setActive(previous=>{const next=Math.round(p);return previous===next?previous:next;});
      root.current?.style.setProperty('--journey-progress',String(p/5));
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const hash=location.hash.slice(1);
    if(stations.some(s=>s.id===hash)){const node=document.getElementById(hash);if(node)window.scrollTo({top:node.getBoundingClientRect().top+scrollY,behavior:'instant'});}
    addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);scroll();
    return()=>{removeEventListener('scroll',scroll);removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
  },[pathname,mode]);
  const inspect=useCallback((s:RecordSelection)=>setSelection(s),[]);
  const hotspotAction=()=>{
    if(active===0)goTo('projects');
    else if(active===1)inspect({kind:'project',id:['axiom','governance','interview'][project]});
    else if(active===2)inspect({kind:'experience'});
    else if(active===3)inspect({kind:'about'});
    else if(active===4)inspect({kind:'skills'});
    else location.href='mailto:babisanp@gmail.com';
  };
  return <WorldContext.Provider value={{active,enhanced,mode,ready:status==='ready',project,setProject,skill,setSkill,goTo,inspect,toggleMode}}>
    <div ref={root} className="world-shell" data-mode={mode} data-enhanced={enhanced} data-scene={status} data-camera-study={cameraStudy} onPointerMove={e=>{if(e.pointerType==='mouse')engine.current?.setPointer((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2);}} onPointerLeave={()=>engine.current?.setPointer(0,0)}>
      {!cameraStudy&&<div className="world-backdrop" aria-hidden="true"><Image src="/illustrations/observatory-poster.webp" alt="" fill priority sizes="100vw" unoptimized className="world-poster" /><canvas ref={canvas} className="observatory-canvas" /><div className="world-vignette" /><div className="world-grain" /></div>}
      {children}
      <button ref={hotspot} className="world-hotspot" type="button" hidden={mode!=='world'||pathname!=='/'||status!=='ready'||!!selection} onPointerEnter={()=>engine.current?.setHover(true)} onPointerLeave={()=>engine.current?.setHover(false)} onFocus={()=>engine.current?.setHover(true)} onBlur={()=>engine.current?.setHover(false)} onClick={hotspotAction}><span className="hotspot-reticle" aria-hidden="true">+</span><span>{['Enter the workshop','Inspect the build','Open the archive','A personal note','Explore the toolkit','Open a channel'][active]} <span aria-hidden="true">↗</span></span></button>
      {enhanced&&!cameraStudy&&<div className="world-utility">
        <button type="button" onClick={toggleMode} aria-pressed={mode==='reading'}>{mode==='world'?'Read portfolio':'Explore in 3D'} <span aria-hidden="true">{mode==='world'?'↗':'◈'}</span></button>
        <button type="button" className="atmosphere-button" aria-expanded={settings} aria-controls="atmosphere-settings" onClick={()=>setSettings(!settings)}>Atmosphere <span aria-hidden="true">{settings?'−':'+'}</span></button>
        {settings&&<div id="atmosphere-settings" className="atmosphere-settings"><button type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'Resume atmosphere':'Pause atmosphere'}</button><button type="button" onClick={()=>setRain(!rain)} aria-pressed={rain}>Rain {rain?'on':'off'}</button><p>{reduced?'Reduced motion is respected.':'Ambient motion only. Navigation stays available.'}</p></div>}
      </div>}
      {!cameraStudy&&status==='unavailable'&&<p className="graphics-notice" role="status">The 3D view is unavailable. Your full portfolio is here in reading mode.</p>}
      {enhanced&&mode==='world'&&pathname==='/'&&<footer className="world-navigation">
        <p className="place-label"><span className="status-dot" />{stations[active].place}<span className="mono">{stations[active].number} / 06</span></p>
        <nav aria-label="World destinations">{stations.map((s,i)=><a key={s.id} href={'/#'+s.id} aria-label={`${s.number} ${s.label}`} aria-current={active===i?'location':undefined} onClick={e=>{e.preventDefault();goTo(s.id);}}><span className="destination-number">{s.number}</span><span>{s.label}</span></a>)}</nav>
        <p className="journey-instruction mono">{active===5?'END OF THE ROOFTOP / KEEP IN TOUCH':'SCROLL TO EXPLORE'} <span aria-hidden="true">{active===5?'↗':'↓'}</span></p>
        <div className="journey-progress" aria-hidden="true"><span /></div>
      </footer>}
      {enhanced&&<RecordDialog selection={selection} close={()=>setSelection(null)} />}
    </div>
  </WorldContext.Provider>;
}
function RecordDialog({selection,close}:{selection:RecordSelection|null;close:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const dialog=ref.current;if(!selection||!dialog)return;
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();
    return()=>{dialog.close();document.body.style.overflow=overflow;};
  },[selection]);
  const title=selection?.kind==='project'?'Project dossier':selection?.kind==='experience'?'Experience archive':selection?.kind==='about'?'A personal note':'Engineering toolkit';
  return <dialog ref={ref} className="record-dialog" aria-labelledby="record-dialog-title" onCancel={close} onKeyDown={event=>{if(event.key!=='Tab')return;const nodes=[...event.currentTarget.querySelectorAll<HTMLElement>('a[href],button,[tabindex]:not([tabindex="-1"])')].filter(n=>n.getClientRects().length&&!n.closest('[hidden]'));const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
    <div className="record-toolbar"><span id="record-dialog-title" className="mono">{title}</span><button type="button" onClick={close} autoFocus aria-label="Close record">Close <span aria-hidden="true">×</span></button></div>
    <div className="record-scroll">{selection?.kind==='project'?<ProjectRecord id={selection.id}/>:selection?.kind==='experience'?<ExperienceRecord/>:selection?.kind==='about'?<AboutRecord/>:selection?.kind==='skills'?<SkillsRecord/>:null}<div className="record-end mono">BABISAN PIRAPAKARAN <span>AFTER HOURS / PORTFOLIO</span></div></div>
  </dialog>;
}
export function DestinationLink({id,children,className=''}:{id:StationId;children:React.ReactNode;className?:string}){
  const {goTo}=useWorld();const path=usePathname();return <Link href={'/#'+id} className={className} onClick={e=>{if(path==='/'){e.preventDefault();goTo(id);}}}>{children}</Link>;
}
