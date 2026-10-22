"use client";

import { useEffect, useRef, useState } from "react";
import { ENTRANCE_DURATION, IMPACT_START, IMPACT_END, setEntranceStart } from "@/lib/entrance-timeline";

const easeOut = "cubic-bezier(.16,1,.3,1)";

export function SiteIntro() {
  const [playing, setPlaying] = useState(false);
  const skip = useRef(() => {});

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listeners = new AbortController();
    const animations: Animation[] = [];
    const timers: number[] = [];
    let finished = false;
    let rendererObserver: MutationObserver | undefined;
    const finish = () => {
      finished = true;
      timers.forEach(window.clearTimeout);
      rendererObserver?.disconnect();
      rendererObserver = undefined;
      animations.forEach((animation) => animation.cancel());
      animations.length = 0;
      setEntranceStart(null);
      listeners.abort();
      delete root.dataset.entrance;
      setPlaying(false);
    };
    skip.current = finish;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") finish();
    };
    const preferenceChanged = () => { if (media.matches) finish(); };
    window.addEventListener("keydown", dismiss, { signal: listeners.signal });
    window.addEventListener("wheel", finish, { passive: true, signal: listeners.signal });
    window.addEventListener("touchmove", finish, { passive: true, signal: listeners.signal });
    window.addEventListener("resize", finish, { signal: listeners.signal });
    window.addEventListener("popstate", finish, { signal: listeners.signal });
    media.addEventListener("change", preferenceChanged, { signal: listeners.signal });

    async function start() {
      if (media.matches || window.location.pathname !== "/" || window.location.hash || window.scrollY > 10 || root.dataset.entrance === "ready") { finish(); return; }
      const cube = document.querySelector(".cube-figure");
      const rendererReady = new Promise<void>((resolve) => {
        if (!cube || cube.getAttribute("data-renderer") !== "loading") { resolve(); return; }
        rendererObserver = new MutationObserver(() => {
          if (cube.getAttribute("data-renderer") !== "loading") { rendererObserver?.disconnect(); resolve(); }
        });
        rendererObserver.observe(cube, { attributes: true, attributeFilter: ["data-renderer"] });
        // Slow or unavailable WebGL must not hold the homepage behind a loader.
        timers.push(window.setTimeout(resolve, 1200));
      });
      await Promise.all([
        rendererReady,
        Promise.race([document.fonts.ready, new Promise((resolve) => { timers.push(window.setTimeout(resolve, 500)); })]),
      ]);
      rendererObserver?.disconnect();
      rendererObserver = undefined;
      if (finished) return;
      const name = document.querySelector<HTMLElement>('[data-entrance-part="name"]');
      const surname = document.querySelector<HTMLElement>('[data-entrance-part="surname"]');
      const signal = document.querySelector<HTMLElement>('[data-entrance-part="signal"]');
      if (root.dataset.entrance === "ready" || document.fonts.status !== "loaded" || window.scrollY > 10 || !name || !surname || !signal) { finish(); return; }
      const animate = (element: Element, frames: Keyframe[], duration: number, delay = 0, easing = easeOut) => {
        animations.push(element.animate(frames, { duration, delay, easing, fill: "both" }));
      };

      // Reveal the permanent headline where it belongs, like a title cut settling into focus.
      name.querySelectorAll("span").forEach((letter, index) => {
        animate(letter, [
          { opacity: 0, transform: "translate(18px, 42px) skewY(8deg)" },
          { opacity: 1, transform: "translate(-1px, -2px)", offset: .7 },
          { opacity: 1, transform: "none" },
        ], 850, 420 + index * 35);
      });
      animate(surname, [
        { opacity: 0, transform: "translate(36px, 24px)", clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
        { opacity: 1, transform: "none", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
      ], 1100, 650);
      animate(signal, [
        { opacity: 0, transform: "scale(0)" },
        { opacity: 1, transform: "scale(2)", offset: .35 },
        { opacity: 1, transform: "none" },
      ], 1000, 350);
      document.querySelectorAll<HTMLElement>("[data-entrance-reveal]").forEach((element) => {
        const cube = element.dataset.entranceReveal === "cube";
        if (cube) {
          animate(element, [{ opacity: 0 }, { opacity: 1 }], 200, 100);
          animate(element, [{ transform: "translate(55px, 32px) scale(.88)" }, { transform: "none" }], 1700, 120);
          return;
        }
        animate(element, [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: getComputedStyle(element).opacity, transform: "none" },
        ], 1050, element.dataset.entranceReveal === "navigation" ? 850 : 1100);
      });
      document.querySelectorAll("[data-entrance-effect]").forEach((element) => {
        const effect = element.getAttribute("data-entrance-effect");
        if (effect === "impact") {
          animations.push(element.animate([{ opacity: 1 }, { opacity: 1 }], { duration: IMPACT_END - IMPACT_START, delay: IMPACT_START, fill: "none" }));
        } else if (effect === "cut") {
          animate(element, [
            { opacity: 0, strokeDashoffset: 1 },
            { opacity: .9, strokeDashoffset: 0, offset: .28 },
            { opacity: 0, strokeDashoffset: -1 },
          ], 950, 80, "cubic-bezier(.22,.68,0,1)");
        } else {
          animate(element, [
            { opacity: 0, transform: "scale(.42) rotate(-12deg)" },
            { opacity: effect === "halo" ? .28 : .65, transform: "scale(.8) rotate(-4deg)", offset: .25 },
            { opacity: 0, transform: "scale(1.16) rotate(0deg)" },
          ], effect === "halo" ? 1550 : 1200, effect === "halo" ? 160 : 260);
        }
      });
      setEntranceStart(performance.now());
      root.dataset.entrance = "running";
      setPlaying(true);
      timers.push(window.setTimeout(finish, ENTRANCE_DURATION));
    }
    void start().catch(finish);
    return () => {
      finished = true;
      timers.forEach(window.clearTimeout);
      rendererObserver?.disconnect();
      rendererObserver = undefined;
      animations.forEach((animation) => animation.cancel());
      setEntranceStart(null);
      delete root.dataset.entrance;
      listeners.abort();
    };
  }, []);

  if (!playing) return null;
  return <div className="site-intro"><button type="button" className="opening-skip" onClick={() => skip.current()}>Skip intro <span aria-hidden="true">↗</span></button></div>;
}
