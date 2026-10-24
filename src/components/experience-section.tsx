import { additionalBuilds, gameServerMetrics, gameServerWork, professionalExperience, type Experience } from "@/lib/experience";
import { Reveal } from "./reveal";

function ExperienceEntry({ entry, index }: { entry: Experience; index: number }) {
  return <article className="experience-entry" aria-labelledby={`experience-${entry.id}`}>
    <div className="experience-meta"><span className="experience-index mono" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{entry.period && <p className="experience-period mono">{entry.period}</p>}<p className="experience-kind">{entry.kind}</p></div>
    <div className="experience-content"><h3 id={`experience-${entry.id}`}>{entry.organization}</h3><p className="experience-role">{entry.role}</p><ul>{entry.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}</ul><p className="experience-tools mono">{entry.tools}</p></div>
  </article>;
}

export function ExperienceSection() {
  return <section id="experience" className="experience-section" aria-labelledby="experience-title">
    <div className="shell">
      <Reveal className="experience-heading"><div><p className="eyebrow"><span className="chapter-box">03</span> EXPERIENCE</p><h2 id="experience-title">BUILT. SHIPPED.<br /><em>OPERATED.</em></h2></div><div className="experience-introduction"><p>From community game servers<br />to platforms and infrastructure.</p><a href="/resume" target="_blank" rel="noopener" className="experience-resume">View resume <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a></div></Reveal>
      <div className="experience-group"><p className="experience-group-label mono">01 / PROFESSIONAL & CONTRACT WORK</p>{professionalExperience.map((entry, index) => <ExperienceEntry key={entry.id} entry={entry} index={index} />)}</div>
      <div className="game-server-work" aria-labelledby="game-server-title">
        <p className="experience-group-label mono">02 / MULTIPLAYER SYSTEMS</p>
        <div className="game-server-heading"><h3 id="game-server-title">GAME SERVER INFRASTRUCTURE<br />& DEVELOPMENT</h3><p>Hands-on work on the services, runtime behavior and tooling behind multiplayer communities.</p></div>
        <dl className="server-metrics">{gameServerMetrics.map((metric) => <div key={metric.label}><dt>{metric.label}<span>{metric.context}</span></dt><dd>{metric.value}</dd></div>)}</dl>
        <div className="server-work-grid">{gameServerWork.map((work) => <article key={work.title}><h4>{work.title}</h4><p>{work.description}</p><span className="experience-tools mono">{work.tools}</span></article>)}</div>
      </div>
      <div className="additional-builds"><p className="experience-group-label mono">03 / OTHER THINGS I’VE BUILT</p><div className="additional-builds-grid">{additionalBuilds.map((build) => <article key={build.name}><p className="eyebrow">{build.label}</p><h3>{build.name}</h3><p>{build.description}</p></article>)}</div></div>
      <div className="education-note"><span className="mono">EDUCATION</span><div><h3>University of Waterloo</h3><p>BMath, Computational Mathematics · Computer Science Minor · Expected 2029</p><p>Coursework includes data structures and algorithms, Linux and shell scripting, computer architecture, low-level systems, assembly, and memory hierarchy and caching.</p></div></div>
    </div>
  </section>;
}
