"use client";

import { useState } from "react";
import { Arrow, LineIcon } from "./icons";

const steps = [
  { name: "Browser", label: "01 / REQUEST", icon: "code", description: "A visitor requests the static showcase over HTTPS. DNS resolution happens first, with Route 53 planned to direct the domain to CloudFront." },
  { name: "CloudFront", label: "02 / DELIVERY", icon: "layers", description: "CloudFront would deliver cached assets and retrieve uncached files from S3. The proposed setup uses an ACM certificate for HTTPS and restricted access to the origin." },
  { name: "Private S3", label: "03 / ORIGIN", icon: "cloud", description: "The static HTML, CSS, and JavaScript would live in a private S3 bucket. CloudFront would access it through origin access control; visitors would use the CloudFront endpoint." },
] as const;

export function InfrastructureFlow() {
  const [selected, setSelected] = useState(0);
  return <div className="flow-window"><div className="window-toolbar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span className="mono">proposed-architecture</span><span className="mono window-language">AWS</span></div><div className="flow-steps">{steps.map((step, index) => <div className="flow-step" key={step.name}><button type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}><LineIcon kind={step.icon} /><span className="mono">{step.label}</span><strong>{step.name}</strong></button>{index < steps.length - 1 && <Arrow />}</div>)}</div><div className="flow-description" aria-live="polite"><span className="mono code-accent">{steps[selected].name}</span><p>{steps[selected].description}</p></div><div className="window-bottom"><span className="mono">PROPOSED / NOT YET DEPLOYED</span></div></div>;
}
