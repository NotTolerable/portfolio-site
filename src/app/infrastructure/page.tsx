import type { Metadata } from "next";
import Link from "next/link";
import { InfrastructureFlow } from "@/components/infrastructure-flow";
import { Arrow } from "@/components/icons";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = { title: "Cloud & Infrastructure — Babisan Pirapakaran", description: "The plan for a separate static cloud infrastructure showcase. Explore its proposed AWS architecture." };

export default function Infrastructure() {
  return <><main id="content" className="infra-page route-page shell"><Link href="/" className="text-link back-link">← Back to the portfolio</Link><Reveal><span className="announcement mono">CLOUD / INFRASTRUCTURE</span><h1>My cloud<br />to-do list.</h1><p className="page-lead">A small AWS site, with the setup explained.</p><p className="page-description">I want to build a separate static site on AWS and document how it runs. Here’s the plan so far — pick a component to see where it fits.</p></Reveal><Reveal className="architecture-section"><InfrastructureFlow /></Reveal><Reveal className="infra-notes"><div><p className="eyebrow mono">PLANNED, NOT DEPLOYED</p><h2>Still on<br />the drawing board.</h2></div><div><p>Once it’s built, I’ll share the infrastructure code, a walkthrough, and why I chose this setup.</p><p>I’ll link the separate site here when it’s ready. This portfolio is a Next.js app hosted on Vercel.</p><Link href="/#projects" className="button">Back to current projects <Arrow /></Link></div></Reveal></main><footer className="site-footer shell"><span>Babisan Pirapakaran</span><Link href="/">Back to portfolio ↗</Link></footer></>;
}
