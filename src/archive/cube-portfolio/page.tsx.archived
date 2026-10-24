import Link from "next/link";
import { Header } from "@/components/header";
import { Arrow } from "@/components/icons";
import { PortfolioIntro } from "@/components/portfolio-intro";
import { ProjectVisual } from "@/components/project-visual";
import { Reveal } from "@/components/reveal";
import { projects } from "@/lib/projects";

export default function Home() {
  return <>
    <Header />
    <main id="main">
      <PortfolioIntro />
      <section id="projects" className="work-section shell" aria-labelledby="work-title">
        <Reveal className="work-heading"><div><p className="section-index">0x01 <span>/</span> SELECTED WORK</p><h2 id="work-title">Things I’ve built<span className="accent">.</span></h2></div><p>Two projects. Different problems.<br />A little of how I think.</p></Reveal>
        <div className="project-list">
          {projects.map((project, index) => <Reveal key={project.id} className="project-entry">
            <article aria-labelledby={`${project.id}-title`}>
              <div className="project-topline"><span className="project-number">0{index + 1}</span><span>{project.focus}</span><span className="project-kind">PERSONAL PROJECT</span></div>
              <ProjectVisual kind={project.id} />
              <div className="project-body"><div><p className="project-category">{index === 0 ? "AI GOVERNANCE / COMPLIANCE" : "AI / COMPUTER VISION"}</p><h3 id={`${project.id}-title`}>{project.name}</h3></div><div className="project-summary"><p>{project.description}</p><details><summary>Project note <span aria-hidden="true">+</span></summary><div className="project-note"><p>{project.context}</p><span>DETAILED WRITE-UP IN PROGRESS</span></div></details></div></div>
            </article>
          </Reveal>)}
        </div>
      </section>
      <section id="about" className="about-section shell" aria-labelledby="about-title">
        <Reveal className="about-label"><p className="section-index">0x02 <span>/</span> THE PERSON</p><span className="about-bracket" aria-hidden="true">&#123;</span></Reveal>
        <Reveal className="about-content"><h2 id="about-title">Curious about<br />what’s underneath.</h2><p className="about-lead">I’m Babisan, a software engineer drawn to the parts of computing that you don’t usually see.</p><p>My current projects explore AI governance and computer vision. I want to go deeper into low-level systems, GPU programming, and the infrastructure behind the software we use.</p><p>I like figuring out how the pieces fit together, then making something with that understanding.</p><div className="current-interests"><span className="section-index">CURRENT CURIOSITIES</span><ul><li><span>01</span> Systems & performance</li><li><span>02</span> GPU computing / CUDA</li><li><span>03</span> Cloud & infrastructure</li></ul></div></Reveal>
      </section>
      <section className="cloud-section shell" aria-labelledby="cloud-title">
        <Reveal className="cloud-note"><div className="cloud-note-top"><p className="section-index">0x03 <span>/</span> ON THE BENCH</p><span className="plan-status"><i aria-hidden="true" /> PLANNED</span></div><div className="cloud-note-body"><div><h2 id="cloud-title">My next cloud experiment.</h2><p>A separate static site on AWS, with the hosting, infrastructure, and decisions explained along the way.</p></div><Link href="/infrastructure" className="text-link">Explore the plan <Arrow diagonal /></Link></div><div className="cloud-path" aria-label="Proposed request path"><span>browser</span><i aria-hidden="true">→</i><span>cloudfront</span><i aria-hidden="true">→</i><span>private s3</span><span className="cloud-path-label">PROPOSED ARCHITECTURE</span></div></Reveal>
      </section>
    </main>
    <footer className="site-footer shell"><div><a className="footer-name" href="#main">Babisan Pirapakaran</a><p>Software engineering, one layer at a time.</p></div><div className="footer-index"><span>© 2026</span><a href="#main">Back to top ↑</a></div></footer>
  </>;
}
