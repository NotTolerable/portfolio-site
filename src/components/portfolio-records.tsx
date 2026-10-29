import { additionalBuilds, gameServerMetrics, gameServerWork, professionalExperience } from '@/lib/experience';
import { projects } from '@/lib/projects';
import { projectTechnologies } from '@/lib/observatory-route';
import { ProjectVisual } from './project-visual';
import { InterestTabs } from './interest-tabs';

export function ProjectRecord({ id }: { id: string }) {
  const project=projects.find(p=>p.id===id)??projects[2];
  return <div className="project-record">
    <p className="eyebrow">PERSONAL PROJECT / {project.category}</p>
    <h2>{project.shortName}</h2>
    <p className="record-lead">{project.description}</p>
    <div className="record-visual"><ProjectVisual kind={project.id} /></div>
    <p className="caption">Conceptual illustration of the system. Not a product screenshot.</p>
    <h3>What I built</h3><p>{project.context}</p>
    <ul className="tech-list" aria-label="Technologies">{projectTechnologies[project.id].map(t=><li key={t}>{t}</li>)}</ul>
    <p className="record-note">Detailed write-up and public source links are in progress.{project.id==='axiom'?' Measured latency results are not published here yet.':''}</p>
  </div>;
}
export function ExperienceRecord() {
  return <div className="experience-record">
    <p className="eyebrow">EXPERIENCE</p><h2>Work experience</h2>
    <p className="record-lead">My internships, contract work and game server projects.</p>
    <a className="inline-link" href="/resume" target="_blank" rel="noopener">View resume ↗<span className="visually-hidden"> (opens in a new tab)</span></a>
    <h3 className="record-divider">Professional & contract work</h3>
    {professionalExperience.map(e=><article key={e.id} className="role-record"><div className="role-record-top"><h3>{e.organization}</h3>{e.period&&<span className="mono">{e.period}</span>}</div><p className="role-title">{e.role}</p><p className="caption">{e.kind}</p><p>{e.summary}</p><ul>{e.responsibilities.map(r=><li key={r}>{r}</li>)}</ul><p className="record-tools mono">{e.tools}</p></article>)}
    <h3 className="record-divider">Game server infrastructure & development</h3><p>I’ve worked on hosting, performance, anti-cheat features and Java plugins for multiplayer game servers.</p>
    <dl className="server-metrics">{gameServerMetrics.map(m=><div key={m.label}><dt>{m.label}<small>{m.context}</small></dt><dd>{m.value}</dd></div>)}</dl>
    {gameServerWork.map(w=><article className="role-record" key={w.title}><h4>{w.title}</h4><p>{w.summary}</p><ul>{w.contributions.map(contribution=><li key={contribution}>{contribution}</li>)}</ul><p className="record-tools mono">{w.tools}</p></article>)}
    <h3 className="record-divider">Other things I’ve built</h3>
    {additionalBuilds.map(b=><article className="role-record" key={b.name}><p className="eyebrow">{b.label}</p><h4>{b.name}</h4><p>{b.description}</p></article>)}
    <EducationRecord />
    <p className="record-note">Player and community figures refer to individual networks.</p>
  </div>;
}
export function EducationRecord(){return <div className="education-record"><p className="eyebrow">EDUCATION</p><h3>University of Waterloo</h3><p>BMath, Computational Mathematics · Computer Science Minor · Expected 2029</p><p>Coursework includes data structures and algorithms, Linux and shell scripting, computer architecture, low-level systems, assembly, and memory hierarchy and caching.</p></div>;}
export function AboutRecord(){return <div className="about-record"><p className="eyebrow">ABOUT ME</p><h2>About me</h2><p className="record-lead">Hi, I’m Babisan. I’m a software engineer and a student at the University of Waterloo.</p><p>I study Computational Mathematics at Waterloo, with a Computer Science minor. My work spans game server operations, backend development, and a platforms and infrastructure internship at 407 ETR. I’m interested in low-latency systems and learning more about GPU programming.</p><p>Outside of work and school, I like to watch sports, play video games and hangout with my friends.</p><EducationRecord /></div>;}
export function SkillsRecord(){return <div className="skills-record"><p className="eyebrow">SKILLS & INTERESTS</p><h2>Skills & interests</h2><p className="record-lead">Some of the tools I’ve used and topics I’m learning about.</p><dl className="skill-record-list"><div><dt>Systems & backend</dt><dd>C++20, Java, Python, Linux, concurrency, memory management, REST services, Spring Boot, FastAPI, SQL.</dd></div><div><dt>Platforms & delivery</dt><dd>AWS, Kubernetes, Docker, Helm, OpenShift, Terraform, Terragrunt, Jenkins, GitHub Actions, Maven, DNS and TLS.</dd></div><div><dt>AI & application work</dt><dd>LangGraph, Pydantic, React, Next.js, PostgreSQL, Supabase, video and speech analysis pipelines.</dd></div></dl><InterestTabs /></div>;}
