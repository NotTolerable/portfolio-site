"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { projects } from "@/lib/projects";
import { Arrow, LineIcon } from "./icons";

export function ProjectExplorer() {
  const [active, setActive] = useState(0);
  const [view, setView] = useState<"overview" | "source">("overview");
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const projectButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const project = projects[active];
  const source = `const project = {\n  name: ${JSON.stringify(project.name)},\n  focus: ${JSON.stringify(project.focus)},\n  documentation: "In progress",\n};`;

  return (
    <div className="project-explorer">
      <div className="project-selectors" role="tablist" aria-label="Select a project" aria-orientation="vertical">
        {projects.map((item, index) => <button
          key={item.id}
          ref={(node) => { projectButtons.current[index] = node; }}
          type="button"
          className={`project-selector ${active === index ? "selected" : ""}`}
          role="tab"
          id={`project-tab-${item.id}`}
          aria-controls="project-panel"
          aria-selected={active === index}
          tabIndex={active === index ? 0 : -1}
          onClick={() => { setActive(index); setCopied("idle"); }}
          onKeyDown={(event) => {
            let next = index;
            if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (index + 1) % projects.length;
            else if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (index - 1 + projects.length) % projects.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = projects.length - 1;
            else return;
            event.preventDefault();
            setActive(next);
            setCopied("idle");
            projectButtons.current[next]?.focus();
          }}
        ><span className="project-selector-icon"><LineIcon kind={item.icon} /></span><span><span className="project-selector-title">{item.shortName}</span><span className="project-selector-meta">{item.focus}</span></span><Arrow diagonal /></button>)}
        <p className="project-footnote mono">Pick a project to take a look.</p>
      </div>

      <div id="project-panel" role="tabpanel" aria-labelledby={`project-tab-${project.id}`} tabIndex={0} className="project-window">
        <div className="window-toolbar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span className="mono">{project.id}.project.ts</span><span className="window-language mono">TS</span></div>
        <div className="project-view-switch" role="group" aria-label="Project content view"><button type="button" aria-pressed={view === "overview"} onClick={() => setView("overview")}>Overview</button><button type="button" aria-pressed={view === "source"} onClick={() => setView("source")}>Project file</button></div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${project.id}-${view}`} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.15 }} className="project-window-body">
            {view === "overview" ? <>
              <div className="icon-container"><LineIcon kind={project.icon} /></div>
              <p className="mono code-accent">{project.focus}</p>
              <h3>{project.name}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-context"><span className="mono">README</span><p>{project.context}</p></div>
            </> : <>
              <div className="source-heading"><span className="mono">Portfolio metadata</span><button type="button" className="copy-button" onClick={async () => {
                try { await navigator.clipboard.writeText(source); setCopied("copied"); } catch { setCopied("failed"); }
              }}><span aria-live="polite">{copied === "copied" ? "Copied" : copied === "failed" ? "Copy unavailable" : "Copy code"}</span><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" /><path d="M12 4V3H3v9h1" stroke="currentColor" /></svg></button></div>
              <pre className="project-code"><code>{source.split("\n").map((line, index) => <span className="code-line" key={index}><span className="line-number" aria-hidden="true">{index + 1}</span><span>{line.split(/("[^"]*")/g).map((part, i) => <span className={part.startsWith('"') ? "code-string" : ""} key={i}>{part}</span>)}</span></span>)}</code></pre>
              <p className="code-note">A little metadata for this portfolio. I’m still putting together the full technical write-up.</p>
            </>}
          </motion.div>
        </AnimatePresence>
        <div className="window-bottom"><span className="mono"><span className="documentation-dot" /> Documentation in progress</span><span className="mono">{String(active + 1).padStart(2, "0")} / 02</span></div>
      </div>
    </div>
  );
}
