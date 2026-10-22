"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { HeroCube } from "./hero-cube";
import { CubeRay } from "./cube-ray";
import { EntranceField } from "./entrance-field";

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
      <EntranceField />
      <div className="intro-sticky">
        <CubeRay />
        <div className="intro-grid" data-entrance-reveal="ambient" aria-hidden="true" />
        <svg className="intro-dust" data-entrance-reveal="ambient" viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 110 }, (_, i) => <circle key={i} cx={(i * 977 + 43) % 1440} cy={(i * 613 + 127) % 1000} r={0.5 + (i % 4) * 0.2} fill="currentColor" opacity={0.15 + (i % 3) * 0.12} />)}</svg>
        <div className="intro-inner shell">
          <motion.div className="intro-identity" style={{ opacity: reduced ? 1 : nameOpacity, y: reduced ? 0 : nameY }}>
            <div className="intro-overline">
              <span className="intro-signal" data-entrance-part="signal" aria-hidden="true" />
              <span className="section-index" data-entrance-reveal="detail">0x00 / SOFTWARE ENGINEERING</span>
            </div>
            <h1 id="intro-title" data-entrance-part="identity" aria-label="Babisan Pirapakaran">
              <span className="intro-firstname" data-entrance-part="name">{Array.from("Babisan").map((letter, index) => <span key={index}>{letter}</span>)}</span>{" "}<br className="intro-name-break" /><span className="intro-surname" data-entrance-part="surname">Pirapakaran</span>
            </h1>
          </motion.div>
          <motion.div className="intro-copy" style={{ opacity: reduced ? 1 : nameOpacity }}>
            <div data-entrance-reveal="copy">
              <p className="intro-greeting">Hey. I’m Babisan.</p>
              <p>I build things with code. Lately, I’m curious about the layers underneath: systems, GPUs, and the infrastructure that keeps software running.</p>
              <a className="intro-work-link" href="#projects">Explore my work <span aria-hidden="true">↘</span></a>
            </div>
          </motion.div>
          <div className="intro-object" data-entrance-reveal="cube">
            <HeroCube scrollProgress={scrollYProgress} />
          </div>
          <motion.div className="intro-next" aria-hidden="true" style={{ opacity: reduced ? 0 : nextOpacity, y: reduced ? 0 : nextY }}>
            <span className="section-index">DECONSTRUCT / UNDERSTAND / REBUILD</span>
            <p>I like taking<br />things apart<span>.</span></p>
          </motion.div>
          <div className="intro-footer" data-entrance-reveal="detail"><span>SOFTWARE ENGINEERING / 2026</span><span className="scroll-instruction">SCROLL TO DECONSTRUCT <span aria-hidden="true">↓</span></span><span>01 — 03</span></div>
        </div>
      </div>
    </section>
  );
}
