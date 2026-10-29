"use client";

import { useId, useRef, useState } from "react";

const interests = [
  { title: "Systems", index: "01", heading: "Systems programming", copy: "While building Axiom, I’ve worked with in-memory order books, lock-free queues and Linux. I’d like to keep learning about memory, concurrency and performance.", tags: "LOW-LEVEL SYSTEMS / PERFORMANCE" },
  { title: "GPUs", index: "02", heading: "GPU programming", copy: "I’m learning about GPU programming and CUDA, including parallel workloads and how they use the hardware.", tags: "GPU COMPUTING / CUDA" },
  { title: "Cloud", index: "03", heading: "Cloud & infrastructure", copy: "At 407 ETR, I’ve worked with AWS, Kubernetes, Helm, OpenShift, Terraform and delivery pipelines. I’ve also worked with Linux, networking and hosting through game server projects. This site’s hosting setup is explained on the infrastructure page.", tags: "CONTAINERS / CLOUD / INFRASTRUCTURE" },
];

export function InterestTabs() {
  const uid = useId();
  const [selected, setSelected] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="interest-file">
    <div role="tablist" aria-label="Engineering interests" className="interest-tabs">
      {interests.map((interest, i) => <button key={interest.title} ref={(node) => { refs.current[i] = node; }} type="button" role="tab" id={`${uid}-interest-${i}`} aria-controls={`${uid}-interest-panel-${i}`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (i + 1) % 3 : event.key === "ArrowLeft" ? (i + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
        if (next !== null) { event.preventDefault(); setSelected(next); refs.current[next]?.focus(); }
      }}><span aria-hidden="true">{interest.index}</span>{interest.title}</button>)}
    </div>
    {interests.map((interest, i) => <div key={interest.title} role="tabpanel" id={`${uid}-interest-panel-${i}`} aria-labelledby={`${uid}-interest-${i}`} hidden={selected !== i} tabIndex={0} className="interest-panel"><span className="eyebrow">INTERESTS</span><h3>{interest.heading}</h3><p>{interest.copy}</p><span className="interest-tags mono">{interest.tags}</span></div>)}
  </div>;
}
