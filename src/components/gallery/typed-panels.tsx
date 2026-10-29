"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AboutRecord,
  EducationRecord,
  ExperienceRecord,
  ProjectRecord,
  SkillsRecord,
} from "@/components/portfolio-records";
import { professionalExperience, gameServerWork } from "@/lib/experience";
import { projects } from "@/lib/projects";
import { PublicContact } from "@/components/public-contact";
export type Panel =
  | "project"
  | "experience"
  | "about"
  | "education"
  | "skills"
  | "contact"
  | "credits"
  | "menu";
export const TypingSoundContext = createContext<() => void>(() => {});
export function TypedParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onType = useContext(TypingSoundContext);
  useEffect(() => {
    const span = ref.current;
    if (!span) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    span.textContent = reduced ? text : "";
    span.dataset.typing = reduced ? "false" : "true";
    if (reduced) return;
    const characters = Array.from(text),
      duration = Math.min(3200, 800 + characters.length * 7);
    let frame = 0,
      start = 0,
      lastCount = 0;
    function draw(now: number) {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const count = Math.floor(progress * characters.length);
      span!.textContent = characters.slice(0, count).join("");
      if (count > lastCount && /\S/.test(characters[count - 1] ?? "")) onType();
      lastCount = count;
      if (progress < 1) frame = requestAnimationFrame(draw);
      else span!.dataset.typing = "false";
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [text, onType]);
  return (
    <p className="typed-copy">
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true" ref={ref}>
        {text}
      </span>
      <i className="type-caret" aria-hidden="true" />
    </p>
  );
}
function Record({
  eyebrow,
  title,
  text,
  children,
  complete,
  navigation,
  className = "",
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
  complete?: ReactNode;
  navigation?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`hud-record ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {navigation}
      <TypedParagraph text={text} />
      {children}
      {complete && (
        <details className="full-record">
          <summary>
            Full technical record <span aria-hidden="true">↗</span>
          </summary>
          <div>{complete}</div>
        </details>
      )}
    </div>
  );
}
export function ProjectPanel({ initial = 0 }: { initial?: number }) {
  const ordered = [projects[2], projects[0], projects[1]],
    [selected, setSelected] = useState(initial),
    project = ordered[selected];
  return (
    <Record
      eyebrow="SELECTED WORK"
      title={project.shortName}
      text={project.description + " " + project.context}
      complete={<ProjectRecord id={project.id} />}
    >
      <div className="hud-selector" role="group" aria-label="Select project">
        {ordered.map((p, i) => (
          <button
            key={p.id}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            {p.shortName}
          </button>
        ))}
      </div>
    </Record>
  );
}
export function ExperiencePanel({ initial = 0 }: { initial?: number }) {
  const [selected, setSelected] = useState(initial),
    role = professionalExperience[selected];
  const intro = role
    ? `${role.role}${role.period ? " · " + role.period : ""}. ${role.summary}`
    : "I worked on the infrastructure, performance, anti-cheat systems and Java tooling behind multiplayer game servers.";
  return (
    <Record
      className="experience-panel"
      eyebrow="EXPERIENCE"
      title={role?.organization ?? "Game server engineering"}
      text={intro}
      complete={<ExperienceRecord />}
      navigation={
        <div className="hud-selector" role="group" aria-label="Select experience">
          {[...professionalExperience.map((entry) => entry.organization), "Game servers"].map((name, index) => (
            <button key={name} aria-pressed={index === selected} onClick={() => setSelected(index)}>
              {name}
            </button>
          ))}
        </div>
      }
    >
      {role ? (
        <ul className="experience-contributions">
          {role.responsibilities.map((contribution) => <li key={contribution}>{contribution}</li>)}
        </ul>
      ) : (
        gameServerWork.map((work) => (
          <section className="experience-category" key={work.title}>
            <h3>{work.title}</h3>
            <p>{work.summary}</p>
            <ul className="experience-contributions">
              {work.contributions.map((contribution) => <li key={contribution}>{contribution}</li>)}
            </ul>
          </section>
        ))
      )}
    </Record>
  );
}
export function SimplePanel({
  panel,
  subject,
}: {
  panel: Panel;
  subject: number;
}) {
  if (panel === "project") return <ProjectPanel initial={subject} />;
  if (panel === "experience") return <ExperiencePanel initial={subject} />;
  if (panel === "about")
    return (
      <Record
        eyebrow="INTRODUCTION"
        title="Babisan Pirapakaran"
        text="I’m a software engineer studying Computational Mathematics at the University of Waterloo, with a Computer Science minor. I work on platforms and infrastructure at 407 ETR, and I’m drawn to low-latency systems, backend engineering, and the details beneath the abstractions. Outside the code: basketball, boxing, lifting, and anime."
        complete={<AboutRecord />}
      />
    );
  if (panel === "education")
    return (
      <Record
        eyebrow="EDUCATION"
        title="University of Waterloo"
        text="BMath, Computational Mathematics · Computer Science Minor · Expected 2029. Coursework includes algorithms, Linux, computer architecture, assembly, memory hierarchy and caching."
        complete={<EducationRecord />}
      />
    );
  if (panel === "skills")
    return (
      <Record
        eyebrow="TOOLS & INTERESTS"
        title="One layer deeper."
        text="C++20, Java, Python and Linux. AWS, Kubernetes, Helm, OpenShift, Terraform and delivery pipelines. I’m interested in memory, concurrency and latency; GPU programming and CUDA are areas I’m exploring."
        complete={<SkillsRecord />}
      >
        <a className="hud-link" href="/infrastructure">
          Cloud & infrastructure lab ↗
        </a>
      </Record>
    );
  if (panel === "contact")
    return (
      <Record
        eyebrow="OPEN CHANNEL"
        title="Let’s talk."
        text="Opportunities, engineering, or something worth exploring. I’d love to hear from you."
      >
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
      </Record>
    );
  if (panel === "credits")
    return (
      <Record
        eyebrow="CREDITS"
        title="Under the surface."
        text="A personal portfolio combining a suspended black-ice gallery with an original night-sky descent. Visual and interaction studies: Samana Studio and Igloo Inc. Independently built with Three.js, GSAP, Lenis and Next.js. Geometry, shaders and the layered soundscape are original."
      >
        <p className="hud-credit">
          Studio Small 08: Sergej Majboroda / Poly Haven, CC0. Geist
          and JetBrains Mono: SIL Open Font License.
        </p>
        <div className="reading-links">
          <a
            href="https://samanastudio.es/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reference ↗
          </a>
          <a href="/gallery/ATTRIBUTION.txt">Asset credits ↗</a>
        </div>
      </Record>
    );
  return null;
}
