"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { HeroCube } from "./hero-cube";
import { CubeRay } from "./cube-ray";

export function PortfolioIntro() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const nameOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5], [1, 1, 0]);
  const nameY = useTransform(scrollYProgress, [0, 0.6], [0, -70]);
  const nextOpacity = useTransform(scrollYProgress, [0.42, 0.8], [0, 1]);
  const nextY = useTransform(scrollYProgress, [0.42, 1], [45, 0]);
  return (
    <section ref={section} className="intro-scroll" aria-labelledby="intro-title">
      <div className="intro-sticky">
        <CubeRay />
        <div className="intro-grid" aria-hidden="true" />
        <svg className="intro-dust" viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 110 }, (_, i) => <circle key={i} cx={(i * 977 + 43) % 1440} cy={(i * 613 + 127) % 1000} r={0.5 + (i % 4) * 0.2} fill="currentColor" opacity={0.15 + (i % 3) * 0.12} />)}</svg>
        <div className="intro-inner shell">
          <motion.div className="intro-identity" style={{ opacity: reduced ? 1 : nameOpacity, y: reduced ? 0 : nameY }}>
            <p className="section-index">0x00 <span>/</span> BABISAN PIRAPAKARAN · SOFTWARE ENGINEERING</p>
            <h1 id="intro-title" aria-label="Babisan Pirapakaran">Babisan{" "}<br className="intro-name-break" /><span>Pirapakaran</span></h1>
          </motion.div>
          <motion.div className="intro-copy" style={{ opacity: reduced ? 1 : nameOpacity }}>
            <p className="intro-greeting">Hey. I’m Babisan.</p>
            <p>I build things with code. Lately, I’m curious about the layers underneath: systems, GPUs, and the infrastructure that keeps software running.</p>
            <a className="intro-work-link" href="#projects">Explore my work <span aria-hidden="true">↘</span></a>
          </motion.div>
          <div className="intro-object">
            <HeroCube scrollProgress={scrollYProgress} />
          </div>
          <motion.div className="intro-next" aria-hidden="true" style={{ opacity: reduced ? 0 : nextOpacity, y: reduced ? 0 : nextY }}>
            <span className="section-index">DECONSTRUCT / UNDERSTAND / REBUILD</span>
            <p>I like taking<br />things apart<span>.</span></p>
          </motion.div>
          <div className="intro-footer"><span>SOFTWARE ENGINEERING / 2026</span><span className="scroll-instruction">SCROLL TO DECONSTRUCT <span aria-hidden="true">↓</span></span><span>01 — 03</span></div>
        </div>
      </div>
    </section>
  );
}
