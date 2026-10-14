import Link from "next/link";
import { Header } from "@/components/header";
import { Arrow, Chevron, LineIcon } from "@/components/icons";
import { HeroCube } from "@/components/hero-cube";
import { ProjectExplorer } from "@/components/project-explorer";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return <>
    <Header />
    <main id="main">
      <section className="hero shell" aria-labelledby="hero-title">
        <Reveal className="hero-copy">
          <p className="hero-note mono">software engineer. curious about the details.</p>
          <h1 id="hero-title">Hey, I’m<br />Babisan.</h1>
          <p>I’m into low-level systems, GPU computing, and the stuff that keeps software running. Here’s what I’ve been working on and what I’m learning next.</p>
          <div className="hero-actions"><a className="button" href="#projects">My projects <Arrow /></a><a className="text-link" href="#about">A bit about me <Chevron /></a></div>
        </Reveal>
        <Reveal className="hero-visual" delay={0.1}><HeroCube /></Reveal>
      </section>

      <section className="interests-bar shell" aria-label="Engineering interests"><p className="mono">THINGS I’M INTO</p><div><span><LineIcon kind="code" />Low-level systems</span><span><LineIcon kind="layers" />Low latency</span><span><LineIcon kind="chip" />GPU computing</span><span><LineIcon kind="cloud" />Cloud infrastructure</span></div></section>

      <section id="projects" className="work-section shell" aria-labelledby="work-title">
        <Reveal className="section-heading"><p className="eyebrow mono">SOME THINGS I’VE BUILT</p><h2 id="work-title">A couple of projects.</h2><p>AI governance, computer vision, and a few interesting problems to work through.</p></Reveal>
        <Reveal><ProjectExplorer /></Reveal>
      </section>

      <section className="infra-section shell" aria-labelledby="infra-title">
        <Reveal className="infra-copy"><p className="eyebrow mono">ON MY TO-BUILD LIST</p><h2 id="infra-title">Some cloud<br />experiments, too.</h2><p>I’m planning a separate AWS site to learn more about hosting, deployment, and what happens after you type a URL. I’ll share the setup and the decisions there.</p><Link className="button" href="/infrastructure">Cloud & infrastructure <Arrow diagonal /></Link></Reveal>
        <Reveal className="infra-terminal" delay={0.1}><div className="terminal-window"><div className="window-toolbar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span className="mono">infrastructure / roadmap</span></div><div className="terminal-body mono"><p><span className="terminal-prompt">~</span> cat infrastructure.plan</p><br /><p className="code-comment"># A separate static showcase</p><p><span className="code-key">origin</span><span className="code-string">private S3 bucket</span></p><p><span className="code-key">delivery</span><span className="code-string">CloudFront</span></p><p><span className="code-key">dns</span><span className="code-string">Route 53</span></p><p><span className="code-key">tls</span><span className="code-string">ACM</span></p><br /><p><span className="code-comment">status</span><span className="terminal-status">planned, not deployed</span></p><p className="terminal-last"><span className="terminal-prompt">~</span><span className="terminal-cursor" /></p></div><div className="window-bottom"><span className="mono">NOT LIVE YET — WORKING OUT THE DETAILS</span></div></div></Reveal>
      </section>

      <section id="about" className="about-section shell" aria-labelledby="about-title">
        <Reveal className="section-heading"><p className="eyebrow mono">A BIT ABOUT ME</p><h2 id="about-title">I like knowing<br />how things work.</h2><p>Especially the parts you don’t see: memory, performance, GPUs, and the infrastructure behind an application.</p></Reveal>
        <Reveal className="about-grid"><article className="about-card"><div className="card-icon"><LineIcon kind="code" /></div><h3>What I’ve been up to</h3><p>So far, I’ve built projects around AI governance and computer vision. This is where I’m sharing the work and writing down what I learned.</p><span className="mono code-accent">AI / GOVERNANCE / VISION</span></article><article className="about-card"><div className="card-icon"><LineIcon kind="chip" /></div><h3>What I want to try next</h3><p>I’m keen to spend more time with low-latency systems, CUDA, and cloud infrastructure. One project at a time.</p><span className="mono code-accent">SYSTEMS / CUDA / INFRASTRUCTURE</span></article></Reveal>
        <Reveal className="closing"><span className="mono">BABISAN PIRAPAKARAN</span><p>Thanks for<br />having a look.</p><a className="button" href="#projects">Back to my projects <Chevron /></a></Reveal>
      </section>
    </main>
    <footer className="site-footer shell"><span>© {new Date().getFullYear()} Babisan Pirapakaran</span><div><Link href="/infrastructure">Infrastructure</Link><a href="#main">Back to top ↑</a></div></footer>
  </>;
}
