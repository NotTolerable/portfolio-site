"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StreetInput } from "@/lib/night-street";

const captions = [
  { title: "FOLLOW THE QUESTION.", text: <>There’s always another <em>layer</em> underneath.</> },
  { title: "MAKE SOMETHING REAL.", text: <>A little curiosity. A first line of <em>code</em>. Something to build.</> },
  { title: "TAKE A CLOSER LOOK.", text: <>Two personal projects. Different problems. A little of how I <em>think</em>.</> },
];

export function WorldHero() {
  const canvas = useRef<HTMLCanvasElement>(null), root = useRef<HTMLElement>(null);
  const input = useRef<StreetInput>({ progress: 0, x: 0, y: 0, pressed: false, paused: false, reduced: false, rainy: true, glow: false });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [mode, setMode] = useState("loading");
  const [rainy, setRainy] = useState(true), [glow, setGlow] = useState(false), [paused, setPaused] = useState(false), [chapter, setChapter] = useState(0);
  useEffect(() => {
    let active = true, requested = false, graphicsLost = false;
    let dispose: (() => void) | undefined, revertTimeline: (() => void) | undefined;
    const element = canvas.current;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const lost = (event: Event) => { event.preventDefault(); graphicsLost = true; dispose?.(); dispose = undefined; if (active) setMode("fallback"); };
    element?.addEventListener("webglcontextlost", lost);
    async function initialize() {
      if (media.matches && !requested) { setMode("still"); return; }
      if (requested) return; requested = true;
      try {
        const { createNightStreet } = await import("@/lib/night-street");
        if (!active || !canvas.current) return;
        const scene = await createNightStreet(canvas.current, input.current);
        if (!active || graphicsLost) { scene.dispose(); return; }
        dispose = scene.dispose; setMode("webgl");
      } catch { if (active) setMode("fallback"); }
    }
    async function initializeTimeline() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (!active || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          let previousChapter = 0;
          const timeline = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: .35, invalidateOnRefresh: true, onUpdate: (self) => {
            const next = self.progress < .16 ? 0 : self.progress < .4 ? 1 : self.progress < .68 ? 2 : 3;
            if (next !== previousChapter) { previousChapter = next; if (active) setChapter(next); }
          } } });
          timeline.to(input.current, { progress: 1, duration: 1, ease: "none" }, 0);
          timeline.to(".hero-copy", { opacity: 0, y: -45, duration: .12, ease: "power1.inOut", pointerEvents: "none" }, .015);
          timeline.to(".world-caption", { autoAlpha: 0, duration: .07 }, .02);
          const frames = [ [.16, .36], [.4, .62], [.68, .92] ];
          frames.forEach(([start, end], i) => {
            timeline.fromTo(`.journey-caption-${i}`, { autoAlpha: 0, y: 26, rotation: -.5 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .045, ease: "power2.out" }, start);
            timeline.to(`.journey-caption-${i}`, { autoAlpha: 0, y: -20, duration: .035 }, end);
          });
          timeline.to(".comic-exit-path", { attr: { d: "M0 1000L0 260Q100 305 220 270L340 295Q500 250 610 285L760 255Q900 290 1000 265L1000 1000Z" }, duration: .13, ease: "power2.in" }, .88);
          return () => { input.current.progress = 0; };
        });
        return () => mm.revert();
      }, root.current);
      revertTimeline = () => context.revert();
    }
    const preference = () => { input.current.reduced = media.matches; void initialize(); };
    preference(); media.addEventListener("change", preference);
    void initializeTimeline().catch(() => {});
    return () => { active = false; revertTimeline?.(); dispose?.(); element?.removeEventListener("webglcontextlost", lost); media.removeEventListener("change", preference); };
  }, []);
  useEffect(() => { void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.refresh()); }, [mode]);
  function pause() { input.current.paused = !input.current.paused; setPaused(input.current.paused); }
  function endDrag() { drag.current = null; input.current.pressed = false; }
  function goToChapter(index: number) {
    const element = root.current;
    if (!element) return;
    const start = element.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: start + (element.offsetHeight - innerHeight) * (index === 0 ? 0 : [.0, .22, .49, .76][index]), behavior: input.current.reduced ? "instant" : "smooth" });
  }
  return <section ref={root} className="world-hero street-journey" aria-labelledby="intro-title" data-world={mode} data-chapter={chapter}>
    <div className="world-sticky">
      <div className="world-stage" role={mode === "webgl" ? "group" : "img"} aria-label={mode === "webgl" ? "Interactive 3D night street with a walking character. Scroll to travel, drag or use left and right arrow keys to look around. Space pauses motion." : "Illustrated night street with a character."} tabIndex={mode === "webgl" ? 0 : -1}
        onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault(); if (event.key === "ArrowLeft") input.current.x = Math.max(-1, input.current.x - .14); if (event.key === "ArrowRight") input.current.x = Math.min(1, input.current.x + .14); if (event.key === " " && !event.repeat) pause(); }}
        onPointerDown={(event) => { if (mode !== "webgl" || event.button !== 0 || !event.isPrimary) return; drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; input.current.pressed = true; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => { const previous = drag.current; if (!previous || previous.id !== event.pointerId) return; if (event.pointerType === "mouse" && (event.buttons & 1) === 0) { endDrag(); return; } input.current.x = Math.max(-1, Math.min(1, input.current.x + (event.clientX - previous.x) * .005)); input.current.y = Math.max(-1, Math.min(1, input.current.y + (event.clientY - previous.y) * .005)); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
        <div className="world-poster"><Image src="/illustrations/street-poster.webp" alt="" fill sizes="100vw" preload unoptimized /></div>
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <div className="hero-copy shell">
        <p className="eyebrow hero-eyebrow"><span className="red-dot" /> SOFTWARE ENGINEER <span className="hero-edition">/ A STORY IN THE MAKING</span></p>
        <h1 id="intro-title" aria-label="Babisan Pirapakaran"><span className="name-row"><span>BABISAN</span></span><span className="name-row surname-row"><span>PIRAPAKARAN<span className="name-period">.</span></span></span></h1>
        <div className="hero-introduction"><p>Hey, I’m Babisan.<br />I build things with code.<br /><span>There’s always another layer to explore.</span></p></div>
      </div>
      <span className="world-caption mono" aria-hidden="true">CHAPTER 01 — AFTER HOURS<br /><span>THE STORY STARTS AT STREET LEVEL.</span></span>
      {captions.map((caption, i) => <div key={caption.title} className={`journey-caption journey-caption-${i}`} aria-hidden="true"><span className="mono">0{i + 2} / FIELD NOTES</span><strong>{caption.title}</strong><p>{caption.text}</p><svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M2 4Q90 0 200 3L397 2L399 116Q280 121 160 117L3 119Z" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg></div>)}
      <nav className="journey-chapters mono" aria-label="City chapters">{["Arrival", "The question", "The build", "A closer look"].map((name, i) => <button key={name} type="button" onClick={() => goToChapter(i)} aria-label={`Chapter ${i + 1}: ${name}`} aria-current={chapter === i ? "step" : undefined}><span>0{i + 1}</span><i aria-hidden="true" /></button>)}</nav>
      <div className="journey-toolbar">
        <Link href="#projects" className="journey-skip">Explore my work <span aria-hidden="true">↗</span></Link>
        {mode === "webgl" && <div className="world-tools" aria-label="Scene controls">
          <button type="button" aria-pressed={rainy} onClick={() => { input.current.rainy = !rainy; setRainy(!rainy); }}>{rainy ? "Rain on" : "Rain off"}<span aria-hidden="true">{rainy ? "−" : "+"}</span></button>
          <button type="button" aria-pressed={glow} onClick={() => { input.current.glow = !glow; setGlow(!glow); }} aria-label="Neon glow">✧</button>
          <button type="button" aria-pressed={paused} onClick={pause} aria-label={paused ? "Resume scene motion" : "Pause scene motion"}>{paused ? "▶" : "Ⅱ"}</button>
        </div>}
      </div>
      <svg className="comic-exit" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path className="comic-exit-path" d="M0 1000L0 1000Q100 1000 220 1000L340 1000Q500 1000 610 1000L760 1000Q900 1000 1000 1000L1000 1000Z" fill="#101821" /></svg>
      <div className="hero-bottom shell mono"><span>IN CODE, THERE’S ALWAYS ANOTHER LAYER.</span><span>SCROLL TO WALK THE CITY <span aria-hidden="true">↓</span></span><span>01 — 04</span></div>
    </div>
  </section>;
}
