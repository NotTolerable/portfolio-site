"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WorldInput } from "@/lib/ink-world";

export function WorldHero() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLElement>(null);
  const input = useRef<WorldInput>({ x: 0, y: 0, pressed: false, paused: false, reduced: false, scroll: 0, rainy: true, night: false });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [mode, setMode] = useState("loading");
  const [rainy, setRainy] = useState(true), [night, setNight] = useState(false), [paused, setPaused] = useState(false);
  useEffect(() => {
    let active = true;
    let requested = false;
    let graphicsLost = false;
    let dispose: (() => void) | undefined;
    const element = canvas.current;
    const lost = (event: Event) => {
      event.preventDefault(); graphicsLost = true;
      dispose?.(); dispose = undefined;
      if (active) setMode("fallback");
    };
    element?.addEventListener("webglcontextlost", lost);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => { input.current.reduced = media.matches; void initialize(); };
    const scroll = () => {
      const element = root.current;
      if (element) input.current.scroll = Math.min(1, Math.max(0, -element.getBoundingClientRect().top / innerHeight));
    };
    preference(); scroll(); media.addEventListener("change", preference); window.addEventListener("scroll", scroll, { passive: true });
    async function initialize() {
      if (media.matches && !requested) { setMode("still"); return; }
      if (requested) return;
      requested = true;
      try {
        const { createInkWorld } = await import("@/lib/ink-world");
        if (!active || !canvas.current) return;
        const scene = await createInkWorld(canvas.current, input.current);
        if (!active || graphicsLost) { scene.dispose(); return; }
        dispose = scene.dispose; setMode("webgl");
      } catch { if (active) setMode("fallback"); }
    }
    return () => { active = false; dispose?.(); element?.removeEventListener("webglcontextlost", lost); media.removeEventListener("change", preference); window.removeEventListener("scroll", scroll); };
  }, []);
  function pause() { input.current.paused = !input.current.paused; setPaused(input.current.paused); }
  function endDrag() { drag.current = null; input.current.pressed = false; }
  return <section ref={root} className="world-hero" aria-labelledby="intro-title" data-world={mode}>
    <div className="world-sticky">
      <div className="hero-grid" aria-hidden="true" />
      <div className="world-stage" role={mode === "webgl" ? "group" : "img"} aria-label={mode === "webgl" ? "Interactive night city. Drag or use arrow keys to look around. Space pauses motion." : "Illustrated anime city at night."} tabIndex={mode === "webgl" ? 0 : -1}
        onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault(); if (event.key === "ArrowLeft") input.current.x = Math.max(-1, input.current.x - .14); if (event.key === "ArrowRight") input.current.x = Math.min(1, input.current.x + .14); if (event.key === "ArrowUp") input.current.y = Math.max(-1, input.current.y - .12); if (event.key === "ArrowDown") input.current.y = Math.min(1, input.current.y + .12); if (event.key === " " && !event.repeat) pause(); }}
        onPointerDown={(event) => { if (mode !== "webgl" || event.button !== 0 || !event.isPrimary) return; drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; input.current.pressed = true; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => { const previous = drag.current; if (!previous || previous.id !== event.pointerId) return; if (event.pointerType === "mouse" && (event.buttons & 1) === 0) { endDrag(); return; } input.current.x = Math.max(-1, Math.min(1, input.current.x + (event.clientX - previous.x) * .005)); input.current.y = Math.max(-1, Math.min(1, input.current.y + (event.clientY - previous.y) * .005)); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
        <div className="world-poster"><Image src="/illustrations/night-city.webp" alt="" fill sizes="100vw" preload unoptimized /></div>
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <div className="hero-copy shell">
        <p className="eyebrow hero-eyebrow"><span className="red-dot" /> SOFTWARE ENGINEER <span className="hero-edition">/ PERSONAL FIELD NOTES</span></p>
        <h1 id="intro-title" aria-label="Babisan Pirapakaran"><span className="name-row"><span>BABISAN</span></span><span className="name-row surname-row"><span>PIRAPAKARAN<span className="name-period">.</span></span></span></h1>
        <div className="hero-introduction"><p>Hey, I’m Babisan.<br />I build things with code.<br /><span>And I like knowing what’s underneath.</span></p><Link href="#projects" className="ink-button">Explore my work <span aria-hidden="true">↗</span></Link></div>
      </div>
      <span className="world-caption mono" aria-hidden="true">CHAPTER 01 — AFTER HOURS<br /><span>A CITY OF POSSIBILITIES.</span></span>
      {mode === "webgl" && <div className="world-tools" aria-label="Scene controls">
        <span className="scene-hint mono">DRAG TO EXPLORE</span>
        <button type="button" disabled={mode !== "webgl"} aria-pressed={rainy} onClick={() => { input.current.rainy = !rainy; setRainy(!rainy); }}>{rainy ? "Rain on" : "Rain off"}<span aria-hidden="true">{rainy ? "−" : "+"}</span></button>
        <button type="button" disabled={mode !== "webgl"} aria-pressed={night} onClick={() => { input.current.night = !night; setNight(!night); }} aria-label="Neon glow">✧</button>
        <button type="button" disabled={mode !== "webgl"} aria-pressed={paused} onClick={pause} aria-label={paused ? "Resume scene motion" : "Pause scene motion"}>{paused ? "▶" : "Ⅱ"}</button>
      </div>}
      <div className="hero-bottom shell mono"><span>IN CODE, THERE’S ALWAYS ANOTHER LAYER.</span><a href="#projects">SCROLL FOR THE NEXT CHAPTER <span aria-hidden="true">↓</span></a><span>01 — 04</span></div>
    </div>
  </section>;
}
