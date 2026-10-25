import {
  AboutRecord,
  ExperienceRecord,
  ProjectRecord,
  SkillsRecord,
} from "@/components/portfolio-records";
import { PublicContact } from "@/components/public-contact";
export function ReadingPortfolio() {
  return (
    <div className="reading-portfolio" id="portfolio-record">
      <header>
        <p className="eyebrow">BABISAN PIRAPAKARAN / SOFTWARE ENGINEER</p>
        <h1>
          Software, one
          <br />
          layer deeper.
        </h1>
        <p>
          Computational Mathematics at the University of Waterloo. Platforms,
          infrastructure, and low-latency systems.
        </p>
        <nav aria-label="Portfolio content">
          <a href="#reading-projects">Projects</a>
          <a href="#reading-experience">Experience</a>
          <a href="/resume" target="_blank" rel="noopener">
            Resume ↗
          </a>
        </nav>
      </header>
      <section id="reading-projects">
        <h2 className="section-heading">Selected work</h2>
        {["axiom", "governance", "interview"].map((id) => (
          <article key={id}>
            <ProjectRecord id={id} />
          </article>
        ))}
      </section>
      <section id="reading-experience">
        <ExperienceRecord />
      </section>
      <section>
        <AboutRecord />
      </section>
      <section>
        <SkillsRecord />
        <a href="/infrastructure">Cloud & infrastructure lab ↗</a>
      </section>
      <footer>
        <h2>
          Let’s build something
          <br />
          worth understanding.
        </h2>
        <PublicContact />
        <div className="reading-links">
          <a
            href="https://github.com/NotTolerable"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://linkedin.com/in/babisan-p"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <a href="/resume" target="_blank" rel="noopener">
            Resume ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
