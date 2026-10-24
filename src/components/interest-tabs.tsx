"use client";

import { useRef, useState } from "react";

const interests = [
  { title: "Systems", index: "01", heading: "Closer to the machine.", copy: "Axiom has taken me into in-memory order books, lock-free queues and the Linux execution path. Memory, concurrency, latency and the trade-offs that make software fast are where I want to go deeper next.", tags: "LOW-LEVEL SYSTEMS / PERFORMANCE" },
  { title: "GPUs", index: "02", heading: "A different kind of parallel.", copy: "GPU programming and CUDA are areas I’m exploring. I’m interested in how workloads map to hardware, and what changes when you think in thousands of threads.", tags: "GPU COMPUTING / CUDA" },
  { title: "Cloud", index: "03", heading: "The whole thing, running.", copy: "At 407 ETR, I’ve worked with AWS, Kubernetes, Helm, OpenShift, Terraform and delivery pipelines. Earlier game server operations taught me about Linux, networking and keeping services running. My separate AWS showcase is the next experiment on the drawing board.", tags: "CONTAINERS / CLOUD / INFRASTRUCTURE" },
];

export function InterestTabs() {
  const [selected, setSelected] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="interest-file">
    <div role="tablist" aria-label="Engineering interests" className="interest-tabs">
      {interests.map((interest, i) => <button key={interest.title} ref={(node) => { refs.current[i] = node; }} type="button" role="tab" id={`interest-${i}`} aria-controls={`interest-panel-${i}`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (i + 1) % 3 : event.key === "ArrowLeft" ? (i + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
        if (next !== null) { event.preventDefault(); setSelected(next); refs.current[next]?.focus(); }
      }}><span aria-hidden="true">{interest.index}</span>{interest.title}</button>)}
    </div>
    {interests.map((interest, i) => <div key={interest.title} role="tabpanel" id={`interest-panel-${i}`} aria-labelledby={`interest-${i}`} hidden={selected !== i} tabIndex={0} className="interest-panel"><span className="eyebrow">EXPERIENCE & WHAT’S NEXT</span><h3>{interest.heading}</h3><p>{interest.copy}</p><span className="interest-tags mono">{interest.tags}</span></div>)}
  </div>;
}
