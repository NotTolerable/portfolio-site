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
        <svg className="intro-energy intro-impact" viewBox="-400 -400 800 800" aria-hidden="true" focusable="false">
          <g data-entrance-effect="impact">
            <polygon fill="#efefef" points={Array.from({ length: 48 }, (_, index) => {
              const angle = index / 48 * Math.PI * 2;
              const radius = index % 2 === 0 ? 178 + index % 7 * 8 : 118 + index % 3 * 8;
              return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
            }).join(" ")} />
            <path d="M-220 90 210-90M-190 135 230-50M-230 45 180-125" stroke="#090909" strokeWidth="3" />
          </g>
        </svg>
        <svg className="intro-energy" viewBox="-400 -400 800 800" fill="none" aria-hidden="true" focusable="false">
          <defs><radialGradient id="entrance-glow"><stop stopColor="white" stopOpacity=".25" /><stop offset="1" stopColor="white" stopOpacity="0" /></radialGradient><linearGradient id="entrance-cut"><stop stopColor="white" stopOpacity="0" /><stop offset=".5" stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient></defs>
          <circle data-entrance-effect="halo" r="300" fill="url(#entrance-glow)" />
          <g data-entrance-effect="rays" stroke="#f2f2f2" strokeWidth=".7">{Array.from({ length: 34 }, (_, index) => {
            const angle = (index * 137.508) * Math.PI / 180;
            const start = 130 + index % 4 * 18, end = start + 30 + index % 5 * 17;
            return <path key={index} d={`M ${(Math.cos(angle) * start).toFixed(2)} ${(Math.sin(angle) * start).toFixed(2)} L ${(Math.cos(angle) * end).toFixed(2)} ${(Math.sin(angle) * end).toFixed(2)}`} strokeWidth={.5 + index % 4 * .55} opacity={.4 + index % 3 * .25} />;
          })}<ellipse rx="255" ry="190" strokeDasharray="100 80 160 500" transform="rotate(-25)" /></g>
          <path data-entrance-effect="cut" d="M-390 190 390-190" pathLength="1" stroke="url(#entrance-cut)" strokeWidth="2.25" strokeDasharray="1 1" />
          <path data-entrance-effect="cut" d="M-320 200 350-110" pathLength="1" stroke="url(#entrance-cut)" strokeWidth=".5" strokeDasharray="1 1" />
        </svg>
        <div className="intro-grid" data-entrance-reveal="ambient" aria-hidden="true" />
        <svg className="intro-dust" data-entrance-reveal="ambient" viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 110 }, (_, i) => <circle key={i} cx={(i * 977 + 43) % 1440} cy={(i * 613 + 127) % 1000} r={0.5 + (i % 4) * 0.2} fill="currentColor" opacity={0.15 + (i % 3) * 0.12} />)}</svg>
        <div className="intro-inner shell">
          <motion.div className="intro-identity" style={{ opacity: reduced ? 1 : nameOpacity, y: reduced ? 0 : nameY }}>
            <div className="intro-overline">
              <span className="intro-signal" data-entrance-part="signal" aria-hidden="true" />
              <span className="section-index" data-entrance-reveal="detail">0x00 / SOFTWARE ENGINEERING</span>
            </div>
            <h1 id="intro-title" aria-label="Babisan Pirapakaran"><span className="intro-firstname" data-entrance-part="name">{Array.from("Babisan").map((letter, index) => <span key={index}>{letter}</span>)}</span>{" "}<br className="intro-name-break" /><span className="intro-surname" data-entrance-part="surname">Pirapakaran</span></h1>
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
