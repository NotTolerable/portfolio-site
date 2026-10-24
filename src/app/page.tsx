import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { WorldHero } from "@/components/world-hero";
import { InterestTabs } from "@/components/interest-tabs";
import { ProjectVisual } from "@/components/project-visual";
import { Reveal } from "@/components/reveal";
import { projects } from "@/lib/projects";

export default function Home() {
  return <>
    <Header />
    <main id="main">
      <WorldHero />
      <section id="projects" className="work-section" aria-labelledby="work-title">
        <div className="shell">
          <Reveal className="chapter-heading"><div><p className="eyebrow"><span className="chapter-box">02</span> THE THINGS I MAKE</p><h2 id="work-title">SELECTED<br /><em>STORIES.</em></h2></div><p>Some code. A few experiments.<br />Here’s what I’ve been working on.</p><span className="chapter-asterisk" aria-hidden="true">✳</span></Reveal>
          <div className="project-list">
            {projects.map((project, index) => <Reveal key={project.id} className={`project-entry project-entry-${index}`}>
              <article aria-labelledby={`${project.id}-title`}>
                <div className="project-picture"><ProjectVisual kind={project.id} /><span className="project-number mono">FILE / 00{index + 1}</span></div>
                <div className="project-body"><p className="project-category mono">{index === 0 ? "AI GOVERNANCE / COMPLIANCE" : "AI / COMPUTER VISION"}</p><h3 id={`${project.id}-title`}>{index === 0 ? <>AI GOVERNANCE<br />COMPLIANCE CHECKER</> : <>AI MOCK<br />INTERVIEW</>}</h3><p>{project.description}</p><div className="project-summary"><details><summary>Behind the build <span aria-hidden="true">↗</span></summary><div className="project-note"><p>{project.context}</p><span className="mono">DETAILED WRITE-UP IN PROGRESS</span></div></details></div><span className="project-kind mono">PERSONAL PROJECT <span aria-hidden="true">/</span> {index === 0 ? "RULES & REASONING" : "VISION & INTERACTION"}</span></div>
              </article>
            </Reveal>)}
          </div>
          <p className="work-footnote mono"><span aria-hidden="true">↳</span> ALWAYS A WORK IN PROGRESS. THAT’S KIND OF THE POINT.</p>
        </div>
      </section>
      <section id="about" className="about-section shell" aria-labelledby="about-title">
        <Reveal className="about-heading"><p className="eyebrow"><span className="chapter-box">03</span> THE PERSON BEHIND THE PIXELS</p><h2 id="about-title">A LITTLE CODE.<br />A LOT OF <em>CURIOSITY.</em></h2></Reveal>
        <div className="about-grid"><Reveal className="about-portrait"><div className="about-art"><Image src="/illustrations/night-city.webp" alt="" fill sizes="(max-width: 760px) 100vw, 45vw" unoptimized loading="eager" /><span className="art-note mono">SOMEWHERE BETWEEN CODE AND CURIOSITY.</span></div><span className="concept-caption mono">ORIGINAL CONCEPT ART / NOT A PROJECT SCREENSHOT</span></Reveal><Reveal className="about-copy"><span className="hello-note">Hey, I’m Babisan. <span aria-hidden="true">↙</span></span><p className="about-lead">A software engineer who likes finding out how things work. Then going one layer deeper.</p><p>My projects so far explore AI governance and computer vision. Lately, I’ve been drawn to systems, GPU programming, and the infrastructure that keeps software running.</p><p>Outside the code, I like anime. So I wanted this little corner of the internet to feel like somewhere you could step into.</p><div className="about-signature" aria-hidden="true">Babisan<span>✳</span></div></Reveal></div>
        <Reveal className="curiosity-section"><div><p className="eyebrow">WHAT’S NEXT?</p><h3>FOLLOWING<br />THE THREAD.</h3><p>Areas I want to explore.<br />There’s a lot left to learn.</p></div><InterestTabs /></Reveal>
      </section>
      <section className="cloud-section shell" aria-labelledby="cloud-title">
        <Reveal className="cloud-ticket"><div className="ticket-side mono">NEXT CHAPTER <span aria-hidden="true">↗</span></div><div className="cloud-ticket-body"><div className="cloud-ticket-top"><p className="eyebrow">04 / ON THE DRAWING BOARD</p><span className="plan-status mono">PLANNED</span></div><h2 id="cloud-title">FROM CODE<br /><em>TO CLOUD.</em></h2><div className="cloud-ticket-bottom"><p>A separate static site on AWS.<br />The setup, the decisions, and how it all runs.</p><Link href="/infrastructure" className="ink-button light-button">Explore the plan <span aria-hidden="true">↗</span></Link></div></div></Reveal>
      </section>
    </main>
    <footer className="site-footer shell"><a href="#main" className="footer-name">KEEP EXPLORING<span aria-hidden="true">↗</span></a><div className="footer-bottom mono"><span>© 2026 BABISAN PIRAPAKARAN</span><span>BUILT WITH NEXT.JS / HOSTED ON VERCEL</span><a href="#main">BACK TO THE BEGINNING ↑</a></div></footer>
  </>;
}
