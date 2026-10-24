"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StreetInput } from "@/lib/night-street";

const notes = [
  { title: "WORK, IN LAYERS.", text: "Market data, AI governance, and computer vision. Three different problems to build around.", href: "#projects", action: "Open project journal" },
  { title: "THINGS I’VE OPERATED.", text: "From multiplayer infrastructure to platforms and deployment pipelines at 407 ETR.", href: "#experience", action: "Read my experience" },
  { title: "A LITTLE BACKGROUND.", text: "Waterloo Mathematics. A curiosity for systems. And a soft spot for worlds you can step into.", href: "#about", action: "Meet Babisan" },
];

export function WorldHero() {
  const canvas = useRef<HTMLCanvasElement>(null), root = useRef<HTMLElement>(null);
  const input = useRef<StreetInput>({ progress: 0, x: 0, y: 0, pressed: false, paused: false, reduced: false, rainy: true, glow: false, walk: false, travel: 0 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [mode, setMode] = useState("loading");
  const [rainy, setRainy] = useState(true), [glow, setGlow] = useState(false), [paused, setPaused] = useState(false), [walking, setWalking] = useState(false), [chapter, setChapter] = useState(0);
  useEffect(() => {
    let active = true, requested = false, graphicsLost = false;
    let dispose: (() => void) | undefined;
    const controller = new AbortController(), element = canvas.current, media = matchMedia("(prefers-reduced-motion: reduce)");
    const lost = (event: Event) => { event.preventDefault(); graphicsLost = true; dispose?.(); dispose = undefined; if (active) setMode("fallback"); };
    element?.addEventListener("webglcontextlost", lost);
    async function initialize() {
      if (media.matches && !requested) { setMode("still"); return; }
      if (requested) return; requested = true;
      try {
        const { createNightStreet } = await import("@/lib/night-street");
        if (!active || !canvas.current) return;
        const scene = await createNightStreet(canvas.current, input.current, controller.signal);
        if (!active || graphicsLost) { scene.dispose(); return; }
        dispose = scene.dispose; setMode("webgl");
      } catch { if (active) setMode("fallback"); }
    }
    const preference = () => { input.current.reduced = media.matches; if (media.matches) { input.current.walk = false; input.current.travel = 0; setWalking(false); } void initialize(); };
    preference(); media.addEventListener("change", preference);
    return () => { active = false; controller.abort(); dispose?.(); element?.removeEventListener("webglcontextlost", lost); media.removeEventListener("change", preference); };
  }, []);
  useEffect(() => {
    if (mode !== "webgl") return;
    let active = true, revert: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (!active || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          let previous = 0;
          const timeline = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: .35, invalidateOnRefresh: true, onUpdate: (self) => {
            const next = self.progress < .16 ? 0 : self.progress < .4 ? 1 : self.progress < .68 ? 2 : 3;
            if (next !== previous) { previous = next; if (active) setChapter(next); }
          } } });
          timeline.to(input.current, { progress: 1, duration: 1, ease: "none" }, 0);
          timeline.to(".hero-copy", { autoAlpha: 0, y: -24, duration: .13, ease: "sine.inOut" }, .01);
          timeline.to(".world-caption", { autoAlpha: 0, duration: .08 }, .02);
          [[.16, .36], [.4, .62], [.68, .92]].forEach(([start, end], i) => {
            timeline.fromTo(`.journey-caption-${i}`, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .045, ease: "sine.out" }, start);
            timeline.to(`.journey-caption-${i}`, { autoAlpha: 0, y: -8, duration: .035 }, end);
          });
          return () => { input.current.progress = 0; };
        });
        return () => mm.revert();
      }, root.current);
      ScrollTrigger.refresh(); revert = () => context.revert();
    });
    return () => { active = false; revert?.(); };
  }, [mode]);
  function pause() { input.current.paused = !input.current.paused; setPaused(input.current.paused); }
  function endDrag() { drag.current = null; input.current.pressed = false; }
  function goToChapter(index: number) {
    const element = root.current; if (!element) return;
    const start = element.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: start + (element.offsetHeight - innerHeight) * [0, .22, .49, .76][index], behavior: input.current.reduced ? "instant" : "smooth" });
  }
  return <section ref={root} className="world-hero street-journey" aria-labelledby="intro-title" data-world={mode} data-chapter={chapter}>
    <div className="world-sticky">
      <div className="world-stage" role={mode === "webgl" ? "group" : "img"} aria-label={mode === "webgl" ? "Interactive 3D night street with a walking character. Scroll or use W and S to walk. Drag or use left and right arrows to look. Space pauses motion." : "Illustrated night street with a character."} tabIndex={mode === "webgl" ? 0 : -1}
        onKeyDown={(event) => { const key = event.key.toLowerCase(); if (["arrowleft", "arrowright", " ", "w", "s"].includes(key)) event.preventDefault(); if (key === "arrowleft") input.current.x = Math.max(-1, input.current.x - .14); if (key === "arrowright") input.current.x = Math.min(1, input.current.x + .14); if (key === "w") input.current.travel = 1; if (key === "s") input.current.travel = -1; if (key === " " && !event.repeat) pause(); }}
        onKeyUp={(event) => { if (["w", "s"].includes(event.key.toLowerCase())) input.current.travel = 0; }} onBlur={() => { input.current.travel = 0; endDrag(); }}
        onPointerDown={(event) => { if (mode !== "webgl" || event.button !== 0 || !event.isPrimary) return; drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; input.current.pressed = true; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => { const previous = drag.current; if (!previous || previous.id !== event.pointerId) return; if (event.pointerType === "mouse" && !(event.buttons & 1)) { endDrag(); return; } input.current.x = Math.max(-1, Math.min(1, input.current.x + (event.clientX - previous.x) * .004)); input.current.y = Math.max(-1, Math.min(1, input.current.y + (event.clientY - previous.y) * .004)); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
        <div className="world-poster"><Image src="/illustrations/street-poster.webp" alt="" fill sizes="100vw" preload unoptimized /></div>
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <div className="district-frame" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="hero-copy shell">
        <p className="eyebrow hero-eyebrow"><span className="red-dot" /> SOFTWARE ENGINEER <span className="hero-edition">/ WATERLOO MATHEMATICS</span></p>
        <h1 id="intro-title" aria-label="Babisan Pirapakaran"><span className="name-row">BABISAN</span><span className="name-row surname-row">PIRAPAKARAN<span className="name-period">.</span></span></h1>
        <div className="hero-introduction"><p>Systems, software, and the layers underneath.<br /><span>Welcome to my little corner of the city.</span></p><a href="/resume" target="_blank" rel="noopener" className="hero-resume">Read my resume <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a></div>
      </div>
      <div className="world-caption mono"><span className="district-dot" /> AFTER HOURS<span>A PERSONAL FIELD JOURNAL</span></div>
      <p className="scene-status mono" role="status">{mode === "loading" ? "PREPARING THE DISTRICT" : mode === "webgl" ? "EXPLORE AT YOUR OWN PACE" : "A QUIET VIEW OF THE DISTRICT"}</p>
      {notes.map((note, i) => <aside key={note.title} className={`journey-caption journey-caption-${i}`} aria-label={`Field note ${i + 1}`}><span className="mono">0{i + 2} / FIELD NOTES</span><h2>{note.title}</h2><p>{note.text}</p><a href={note.href}>{note.action} <span aria-hidden="true">↗</span></a></aside>)}
      <nav className="journey-chapters mono" aria-label="City chapters">{["Arrival", "Work", "Experience", "About"].map((name, i) => <button key={name} type="button" onClick={() => goToChapter(i)} title={name} aria-label={`Chapter ${i + 1}: ${name}`} aria-current={chapter === i ? "step" : undefined}><span>0{i + 1}</span><i aria-hidden="true" /></button>)}</nav>
      <div className="journey-toolbar shell">
        <Link href="#projects" className="journey-skip">Explore my work <span aria-hidden="true">↗</span></Link>
        {mode === "webgl" && <div className="world-tools" aria-label="Scene controls">
          <button type="button" aria-pressed={walking} onClick={() => { input.current.walk = !walking; setWalking(!walking); }} title="Take a measured walk through the district">Auto walk <span aria-hidden="true">{walking ? "−" : "+"}</span></button>
          <button type="button" aria-pressed={rainy} onClick={() => { input.current.rainy = !rainy; setRainy(!rainy); }}>{rainy ? "Rain on" : "Rain off"}</button>
          <button type="button" aria-pressed={glow} onClick={() => { input.current.glow = !glow; setGlow(!glow); }} aria-label="Neon glow" title="Change the light atmosphere">✧</button>
          <button type="button" aria-pressed={paused} onClick={pause} aria-label={paused ? "Resume scene motion" : "Pause scene motion"}>{paused ? "▶" : "Ⅱ"}</button>
        </div>}
      </div>
      <div className="hero-bottom shell mono"><span>01 / THE DISTRICT</span><span>{mode === "webgl" ? "SCROLL TO WALK · DRAG TO LOOK · W / S ON FOCUS" : "CONTINUE TO THE JOURNAL"}</span><span>↓</span></div>
    </div>
  </section>;
}
