import type { Metadata } from "next";
import Link from "next/link";
import { InfrastructureFlow } from "@/components/infrastructure-flow";
import { Arrow } from "@/components/icons";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "How this site is hosted — Babisan Pirapakaran",
  description: "How this portfolio runs on Vercel, with prebuilt pages, CDN delivery and browser-side 3D graphics.",
};

export default function Infrastructure() {
  return <>
    <main id="content" className="infra-page route-page shell">
      <Link href="/" className="text-link back-link">← Back to the portfolio</Link>
      <Reveal>
        <span className="announcement mono">CLOUD & INFRASTRUCTURE</span>
        <h1>How this site<br />is hosted.</h1>
        <p className="page-lead">This website is serverless.</p>
        <p className="page-description">I built it with Next.js and host it on Vercel. The pages are prepared during the build and delivered over HTTPS. The gallery and its interactions run in your browser. Pick a component below for a closer look.</p>
      </Reveal>
      <Reveal className="architecture-section"><InfrastructureFlow /></Reveal>
      <Reveal className="infra-notes">
        <div>
          <p className="eyebrow mono">THE SETUP</p>
          <h2>What does<br />serverless mean?</h2>
        </div>
        <div>
          <p>There’s no web server for me to provision, patch or keep running. Vercel hosts the deployment and delivers the site’s files through its CDN. Cloudflare handles the domain’s DNS and proxies traffic to Vercel.</p>
          <p>These pages are prebuilt, so reading my experience or opening the resume doesn’t need an application server or database. Your browser handles the 3D rendering, animations and optional audio.</p>
          <p>That keeps the hosting simple while leaving room for an interactive portfolio.</p>
          <Link href="/" className="button">Back to portfolio <Arrow /></Link>
        </div>
      </Reveal>
    </main>
    <footer className="site-footer shell"><span>Babisan Pirapakaran</span><Link href="/">Back to portfolio ↗</Link></footer>
  </>;
}
