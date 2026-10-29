"use client";

import { useState } from "react";
import { Arrow, LineIcon } from "./icons";

const steps = [
  { name: "Browser", label: "01 / REQUEST", icon: "code", description: "Your browser opens babisanp.com over HTTPS. Cloudflare handles DNS and proxies the request to the Vercel deployment." },
  { name: "Vercel CDN", label: "02 / DELIVERY", icon: "layers", description: "Vercel’s CDN serves the deployed pages and assets. The pages are built ahead of time, so a visit doesn’t need to generate fresh HTML on an application server." },
  { name: "Site files", label: "03 / ASSETS", icon: "cloud", description: "The deployment contains the HTML, CSS, JavaScript, models and resume PDF. Once loaded, Three.js renders the gallery in your browser, alongside the page’s navigation and other interactions." },
] as const;

export function InfrastructureFlow() {
  const [selected, setSelected] = useState(0);
  return <div className="flow-window"><div className="window-toolbar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span className="mono">current-setup</span><span className="mono window-language">VERCEL</span></div><div className="flow-steps">{steps.map((step, index) => <div className="flow-step" key={step.name}><button type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}><LineIcon kind={step.icon} /><span className="mono">{step.label}</span><strong>{step.name}</strong></button>{index < steps.length - 1 && <Arrow />}</div>)}</div><div className="flow-description" aria-live="polite"><span className="mono code-accent">{steps[selected].name}</span><p>{steps[selected].description}</p></div><div className="window-bottom"><span className="mono">LIVE ON VERCEL · PREBUILT PAGES / BROWSER-SIDE GRAPHICS</span></div></div>;
}
