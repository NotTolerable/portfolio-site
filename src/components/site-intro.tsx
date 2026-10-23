"use client";

import { useEffect, useRef, useState } from "react";
import { ENTRANCE_DURATION, setEntranceStart } from "@/lib/entrance-timeline";
import { prepareNameInk } from "@/lib/name-ink";

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
    const inkCleanup: (() => void)[] = [];
    let finished = false;
    const finish = () => {
      finished = true;
      timers.forEach(window.clearTimeout);
      animations.forEach((animation) => animation.cancel());
      animations.length = 0;
      inkCleanup.forEach((cleanup) => cleanup());
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
      // Let text appear as soon as its fonts are ready; never wait for WebGL.
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => { timers.push(window.setTimeout(resolve, 500)); }),
      ]);
      if (finished) return;
      const identity = document.querySelector<HTMLElement>('[data-entrance-part="identity"]');
      const name = document.querySelector<HTMLElement>('[data-entrance-part="name"]');
      const surname = document.querySelector<HTMLElement>('[data-entrance-part="surname"]');
      const signal = document.querySelector<HTMLElement>('[data-entrance-part="signal"]');
      if (root.dataset.entrance === "ready" || document.fonts.status !== "loaded" || window.scrollY > 10 || !identity || !name || !surname || !signal) { finish(); return; }
      const animate = (element: Element, frames: Keyframe[], duration: number, delay = 0, easing = easeOut) => {
        animations.push(element.animate(frames, { duration, delay, easing, fill: "both" }));
      };

      inkCleanup.push(prepareNameInk(name, "name-first", 70, animate));
      inkCleanup.push(prepareNameInk(surname, "name-last", 880, animate));
      animate(signal, [{ opacity: 0 }, { opacity: 1 }], 320, 80);
      document.querySelectorAll<HTMLElement>("[data-entrance-reveal]").forEach((element) => {
        const part = element.dataset.entranceReveal;
        if (part === "cube" || part === "ambient") {
          animate(element, [{ opacity: 0 }, { opacity: getComputedStyle(element).opacity }], 650, part === "cube" ? 100 : 0);
          return;
        }
        animate(element, [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: getComputedStyle(element).opacity, transform: "none" },
        ], 550, part === "navigation" ? 0 : part === "copy" ? 250 : 300);
      });
      const startTime = performance.now();
      animations.forEach((animation) => { animation.startTime = startTime; });
      setEntranceStart(startTime);
      root.dataset.entrance = "running";
      setPlaying(true);
      timers.push(window.setTimeout(finish, ENTRANCE_DURATION));
    }
    void start().catch(finish);
    return () => {
      finished = true;
      timers.forEach(window.clearTimeout);
      animations.forEach((animation) => animation.cancel());
      inkCleanup.forEach((cleanup) => cleanup());
      setEntranceStart(null);
      delete root.dataset.entrance;
      listeners.abort();
    };
  }, []);

  if (!playing) return null;
  return <div className="site-intro"><button type="button" className="opening-skip" onClick={() => skip.current()}>Skip intro <span aria-hidden="true">↗</span></button></div>;
}
