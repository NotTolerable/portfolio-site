import {
  AboutRecord,
  ExperienceRecord,
  ProjectRecord,
  SkillsRecord,
} from "@/components/portfolio-records";
import { ResumeFinale } from "./resume-finale";
export function ReadingPortfolio() {
  return (
    <div className="reading-portfolio" id="portfolio-record">
      <header>
        <p className="eyebrow">SOFTWARE ENGINEER / WATERLOO STUDENT</p>
        <h1>
          Babisan
          <br />
          Pirapakaran
        </h1>
        <p>
          I study Computational Mathematics at the University of Waterloo.
          Here are my projects, work experience, and a little about me.
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
        <h2 className="section-heading">Projects</h2>
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
        <a href="/infrastructure">How this site is hosted ↗</a>
      </section>
      <footer>
        <ResumeFinale />
      </footer>
    </div>
  );
}
