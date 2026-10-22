"use client";

import { useEffect, useRef, useState } from "react";
import { ENTRANCE_DURATION, IMPACT_BEATS, SLICE_STARTS, setEntranceStart } from "@/lib/entrance-timeline";

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
      const identity = document.querySelector<HTMLElement>('[data-entrance-part="identity"]');
      const name = document.querySelector<HTMLElement>('[data-entrance-part="name"]');
      const surname = document.querySelector<HTMLElement>('[data-entrance-part="surname"]');
      const signal = document.querySelector<HTMLElement>('[data-entrance-part="signal"]');
      if (root.dataset.entrance === "ready" || document.fonts.status !== "loaded" || window.scrollY > 10 || !identity || !name || !surname || !signal) { finish(); return; }
      const animate = (element: Element, frames: Keyframe[], duration: number, delay = 0, easing = easeOut) => {
        animations.push(element.animate(frames, { duration, delay, easing, fill: "both" }));
      };

      // The real text arrives early, takes the hit with the page, then settles.
      name.querySelectorAll("span").forEach((letter, index) => {
        animate(letter, [
          { opacity: 0, transform: "translateY(36px)" },
          { opacity: 1, transform: "none" },
        ], 680, 100 + index * 22);
      });
      animate(surname, [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], 750, 200);
      animate(signal, [{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "none" }], 500, 120);

      const palette: Keyframe[] = [{ offset: 0, filter: "none" }];
      const camera: Keyframe[] = [{ offset: 0, translate: "0px 0px" }];
      IMPACT_BEATS.forEach((beat) => {
        palette.push(
          { offset: (beat.start - 1) / ENTRANCE_DURATION, filter: "none" },
          { offset: beat.start / ENTRANCE_DURATION, filter: beat.paper ? "grayscale(1) invert(1)" : "grayscale(1) contrast(1.15)" },
          { offset: (beat.end - 1) / ENTRANCE_DURATION, filter: beat.paper ? "grayscale(1) invert(1)" : "grayscale(1) contrast(1.15)" },
          { offset: beat.end / ENTRANCE_DURATION, filter: "none" },
        );
        camera.push(
          { offset: (beat.start - 1) / ENTRANCE_DURATION, translate: "0px 0px" },
          { offset: beat.start / ENTRANCE_DURATION, translate: `${beat.direction * 3}px ${beat.direction * -1}px` },
          { offset: (beat.end - 1) / ENTRANCE_DURATION, translate: `${beat.direction * 2}px ${beat.direction * -1}px` },
          { offset: beat.end / ENTRANCE_DURATION, translate: "0px 0px" },
        );
      });
      palette.push({ offset: 1, filter: "none" });
      camera.push({ offset: .38, translate: "1px 0px" }, { offset: .5, translate: "0px 0px" }, { offset: 1, translate: "0px 0px" });
      document.querySelectorAll(".intro-sticky, .site-header").forEach((element) => animate(element, palette, ENTRANCE_DURATION, 0, "linear"));
      document.querySelectorAll(".intro-inner, .site-header").forEach((element) => animate(element, camera, ENTRANCE_DURATION, 0, "linear"));
      document.querySelectorAll<HTMLElement>("[data-entrance-reveal]").forEach((element) => {
        if (element.dataset.entranceReveal === "cube") {
          animate(element, [{ opacity: 0 }, { opacity: 1 }], 180);
          return;
        }
        animate(element, [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: getComputedStyle(element).opacity, transform: "none" },
        ], 700, element.dataset.entranceReveal === "navigation" ? 60 : element.dataset.entranceReveal === "copy" ? 800 : 240);
      });
      const effect = (selector: string, frames: Keyframe[], duration: number, delay = 0, easing = "linear") => {
        document.querySelectorAll(selector).forEach((element) => animate(element, frames, duration, delay, easing));
      };
      SLICE_STARTS.forEach((start, index) => {
        const reverse = index === 1;
        const closed = reverse ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
        // Fast leading edge, a short contact hold, then a fine receding trace.
        effect(`[data-slice-stroke="${index}"]`, [
          { opacity: 0, clipPath: closed, offset: 0 },
          { opacity: 1, clipPath: closed, offset: .04, easing: "cubic-bezier(.55,0,.85,1)" },
          { opacity: 1, clipPath: reverse ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)", offset: 90 / 430 },
          { opacity: 1, clipPath: "inset(0 0 0 0)", offset: .35 },
          { opacity: .75, clipPath: "inset(0 0 0 0)", offset: .5 },
          { opacity: 0, clipPath: reverse ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
        ], 430, start - 90, "linear");
        effect(`[data-slice-seam="${index}"]`, [
          { opacity: 0, transform: "scaleY(.1)", offset: 0 },
          { opacity: .6, transform: "scaleY(1)", offset: .12 },
          { opacity: .2, transform: "scaleY(2)", offset: .4 },
          { opacity: 0, transform: "scaleY(.2)" },
        ], 1150 + index * 70, start, easeOut);
      });
      document.querySelectorAll("[data-slice-peripheral]").forEach((element, index) => {
        animate(element, [
          { opacity: 0, strokeDashoffset: 1, offset: 0 },
          { opacity: .45, strokeDashoffset: 0, offset: .32 },
          { opacity: .18, strokeDashoffset: 0, offset: .55 },
          { opacity: 0, strokeDashoffset: -1 },
        ], 430, 450 + index * 85, "cubic-bezier(.3,0,.2,1)");
      });
      // A single dark diagonal wipe makes the last cut feel spatial without a
      // bright full-screen overlay or extra image copies of the real page.
      effect("[data-entrance-shutter]", [
        { opacity: 0, clipPath: "polygon(0 100%, 0 100%, 0 100%, 0 100%)", offset: 0 },
        { opacity: .35, clipPath: "polygon(0 0, 2% 0, 100% 100%, 98% 100%)", offset: .4 },
        { opacity: 0, clipPath: "polygon(100% 0, 100% 0, 100% 0, 100% 0)" },
      ], 340, 700);
      // A single clock makes sharp palette changes coincide with the held scene poses.
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
