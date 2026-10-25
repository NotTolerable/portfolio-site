'use client';
import Link from 'next/link';
import { useState } from 'react';
import { projects } from '@/lib/projects';
import { professionalExperience } from '@/lib/experience';
import { projectTechnologies, stations } from '@/lib/observatory-route';
import { AboutRecord, ExperienceRecord, ProjectRecord, SkillsRecord } from './portfolio-records';
import { DestinationLink, useWorld } from './world-provider';
const orderedProjects=[projects[2],projects[0],projects[1]];
const domains=[
  {name:'Systems',heading:'Closer to the machine.',copy:'C++20, Java and Python. In-memory order books, lock-free queues, concurrent backends and the Linux execution path.',tags:'MEMORY / CONCURRENCY / LATENCY'},
  {name:'Platforms',heading:'The whole thing, running.',copy:'AWS, Kubernetes, Docker, Helm, OpenShift and Terraform. Delivery pipelines, Linux operations, networking, DNS and TLS.',tags:'INFRASTRUCTURE / AUTOMATION / OPERATIONS'},
  {name:'Exploration',heading:'Following the next thread.',copy:'GPU programming and CUDA are learning interests. I want to understand how workloads map to hardware, and what changes when you think in thousands of threads.',tags:'GPU COMPUTING / STILL LEARNING'},
];
export function PortfolioJourney(){
  const {active,mode,enhanced,project,setProject,skill,setSkill,inspect}=useWorld();
  const [role,setRole]=useState(0);
  const selected=orderedProjects[project],experience=professionalExperience[role];
  const immersive=enhanced&&mode==='world';
  return <main id="content" className="journey" aria-label="Babisan’s portfolio">
    {stations.map((station,index)=><section id={station.id} key={station.id} className={'journey-station station-'+station.id} data-active={active===index} aria-labelledby={station.id+'-title'} inert={immersive&&active!==index?true:undefined}>
      <div className="station-content" aria-hidden={immersive&&active!==index?true:undefined}>
        <div className="station-kicker mono"><span>{station.number}</span>{station.place}<i aria-hidden="true"/></div>
        {index===0?<div className="arrival-copy">
          <p className="arrival-role">SOFTWARE ENGINEER <span>/</span> WATERLOO</p>
          <h1 id="main-title">Babisan<br/><em>Pirapakaran</em><span className="name-period">.</span></h1>
          <p className="arrival-tagline">A little code.<br/>A lot of curiosity.</p>
          <p className="station-description">Platforms, infrastructure, and the systems underneath. Welcome to my corner of the city.</p>
          <div className="station-actions"><DestinationLink id="projects" className="primary-action">Explore my work <span aria-hidden="true">↗</span></DestinationLink><a className="quiet-action" href="/resume" target="_blank" rel="noopener">Resume <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a></div>
          <p className="arrival-postscript mono">CURRENTLY / PLATFORMS & INFRA AT 407 ETR</p>
        </div>:index===1?<div className="work-copy">
          <p className="eyebrow">SELECTED WORK / PERSONAL PROJECTS</p>
          <h2 id="projects-title">Things<br/>I <em>build.</em></h2>
          <div className="project-switcher" role="group" aria-label="Select a project">{orderedProjects.map((p,i)=><button key={p.id} type="button" aria-pressed={project===i} onClick={()=>setProject(i)}><span className="mono">0{i+1}</span><span>{p.shortName}</span><span aria-hidden="true">{project===i?'↗':'+'}</span></button>)}</div>
          <div className="selected-project" key={selected.id}><p className="eyebrow">{selected.focus}</p><p className="station-description">{selected.description}</p><p className="mini-stack mono">{projectTechnologies[selected.id].slice(0,4).join(' / ')}</p><button className="inline-link" type="button" onClick={()=>inspect({kind:'project',id:selected.id})}>Inside {selected.shortName} <span aria-hidden="true">↗</span></button></div>
          <p className="scene-caption mono">THE DISPLAY SHOWS A CONCEPTUAL SYSTEM DIAGRAM.</p>
          <div className="reading-records">{orderedProjects.map(p=><ProjectRecord id={p.id} key={p.id}/>)}</div>
        </div>:index===2?<div className="archive-copy">
          <p className="eyebrow">EXPERIENCE / BUILT, SHIPPED, OPERATED</p><h2 id="experience-title">Behind<br/>the <em>systems.</em></h2>
          <div className="role-selector" role="group" aria-label="Select experience">{professionalExperience.map((e,i)=><button type="button" key={e.id} aria-pressed={role===i} onClick={()=>setRole(i)}>{e.organization}</button>)}</div>
          <div className="role-preview" key={experience.id}><h3>{experience.role}</h3><p className="role-preview-meta">{experience.kind}{experience.period&&<><br/>{experience.period}</>}</p><p className="station-description">{experience.responsibilities[0]}</p></div>
          <button type="button" className="inline-link" onClick={()=>inspect({kind:'experience'})}>Open the complete experience archive <span aria-hidden="true">↗</span></button><p className="scene-caption mono">PROFESSIONAL / MULTIPLAYER SYSTEMS / CLIENT WORK</p>
          <div className="reading-records"><ExperienceRecord/></div>
        </div>:index===3?<div className="personal-copy"><p className="eyebrow">OFF THE CLOCK / STILL CURIOUS</p><h2 id="about-title">One layer<br/><em>deeper.</em></h2><p className="personal-greeting">Hey, I’m Babisan.</p><p className="station-description">I study Computational Mathematics at Waterloo, with a Computer Science minor. I like finding out how things work. Then going one layer deeper.</p><p className="station-description muted">Outside the code, I like anime. This rooftop is a small nod to the worlds that make you want to stay a little longer.</p><button type="button" className="inline-link" onClick={()=>inspect({kind:'about'})}>A little more about me <span aria-hidden="true">↗</span></button><div className="reading-records"><AboutRecord/></div></div>:index===4?<div className="toolkit-copy"><p className="eyebrow">THE TOOLBENCH / TOOLS WITH A PURPOSE</p><h2 id="skills-title">Built from<br/><em>curiosity.</em></h2><div className="domain-selector" role="group" aria-label="Engineering domains">{domains.map((d,i)=><button type="button" key={d.name} aria-pressed={skill===i} onClick={()=>setSkill(i)}>{d.name}</button>)}</div><div className="domain-preview" key={skill}><h3>{domains[skill].heading}</h3><p className="station-description">{domains[skill].copy}</p><p className="mini-stack mono">{domains[skill].tags}</p></div><div className="station-actions"><button type="button" className="inline-link" onClick={()=>inspect({kind:'skills'})}>Explore the toolkit <span aria-hidden="true">↗</span></button><Link href="/infrastructure" className="quiet-action">Cloud lab <span aria-hidden="true">↗</span></Link></div><div className="reading-records"><SkillsRecord/></div></div>:<div className="contact-copy"><p className="eyebrow">OPEN CHANNEL / LET’S KEEP IN TOUCH</p><h2 id="contact-title">Good work<br/>starts with<br/><em>a hello.</em></h2><p className="station-description">Interested in working together, talking systems, or sharing something worth exploring?</p><a className="contact-email" href="mailto:babisanp@gmail.com">babisanp@gmail.com <span aria-hidden="true">↗</span></a><div className="contact-links"><a href="https://github.com/NotTolerable" target="_blank" rel="noopener noreferrer">GitHub ↗<span className="visually-hidden"> (opens in a new tab)</span></a><a href="https://linkedin.com/in/babisan-p" target="_blank" rel="noopener noreferrer">LinkedIn ↗<span className="visually-hidden"> (opens in a new tab)</span></a><a href="/resume" target="_blank" rel="noopener">Resume ↗<span className="visually-hidden"> (opens in a new tab)</span></a></div><p className="contact-colophon mono">© 2026 BABISAN PIRAPAKARAN<br/>AFTER HOURS / NEXT.JS + THREE.JS / VERCEL</p><Link href="/infrastructure" className="inline-link">How this site runs & the AWS plan ↗</Link></div>}
      </div>
    </section>)}
  </main>;
}
