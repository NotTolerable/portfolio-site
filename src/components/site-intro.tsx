"use client";

import { useEffect, useRef, useState } from "react";
import { ENTRANCE_DURATION, IMPACT_BEATS, setEntranceStart } from "@/lib/entrance-timeline";

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
          { offset: beat.start / ENTRANCE_DURATION, filter: beat.paper ? "grayscale(1) invert(1)" : "grayscale(1) contrast(1.6)" },
          { offset: (beat.end - 1) / ENTRANCE_DURATION, filter: beat.paper ? "grayscale(1) invert(1)" : "grayscale(1) contrast(1.6)" },
          { offset: beat.end / ENTRANCE_DURATION, filter: "none" },
        );
        camera.push(
          { offset: (beat.start - 1) / ENTRANCE_DURATION, translate: "0px 0px" },
          { offset: beat.start / ENTRANCE_DURATION, translate: `${beat.direction * 9}px ${beat.direction * -4}px` },
          { offset: (beat.end - 1) / ENTRANCE_DURATION, translate: `${beat.direction * 6}px ${beat.direction * -2}px` },
          { offset: beat.end / ENTRANCE_DURATION, translate: "0px 0px" },
        );
      });
      palette.push({ offset: 1, filter: "none" });
      camera.push({ offset: .37, translate: "3px 1px" }, { offset: .42, translate: "-2px 0px" }, { offset: .5, translate: "0px 0px" }, { offset: 1, translate: "0px 0px" });
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
        ], 700, element.dataset.entranceReveal === "navigation" ? 60 : 240);
      });
      const effect = (selector: string, frames: Keyframe[], duration: number, delay = 0, easing = "linear") => {
        document.querySelectorAll(selector).forEach((element) => animate(element, frames, duration, delay, easing));
      };
      const windowed = (start: number, end: number, opacity = 1) => [
        { opacity: 0, offset: 0 }, { opacity, offset: start / ENTRANCE_DURATION },
        { opacity, offset: end / ENTRANCE_DURATION }, { opacity: 0, offset: Math.min(1, (end + 60) / ENTRANCE_DURATION) },
        { opacity: 0, offset: 1 },
      ];
      // Each impact uses a different hand-drawn silhouette, not one repeated flash.
      IMPACT_BEATS.forEach((beat, index) => {
        effect(`[data-entrance-effect="cut-${index}"]`, [
          { opacity: 0, offset: 0 }, { opacity: 1, offset: .001 },
          { opacity: 1, offset: .999 }, { opacity: 0, offset: 1 },
        ], beat.end - beat.start, beat.start);
      });
      effect('[data-entrance-effect="charge"]', [
        { opacity: 0, transform: "translate(-270px, -160px) scale(.65)" },
        { opacity: .5, offset: .58 }, { opacity: 1, transform: "none", offset: .99 }, { opacity: 0 },
      ], 310, 230, "cubic-bezier(.7,0,1,1)");
      [0, 1, 2].forEach((index) => effect(`[data-entrance-effect="lightning-${index}"]`, [
        { opacity: 0, transform: `scale(.82) rotate(${-7 + index * 3}deg)`, offset: 0 },
        { opacity: 1, transform: "scale(.96) rotate(-2deg)", offset: .08 },
        { opacity: .85, transform: "scale(1.03) rotate(1deg)", offset: .4 },
        { opacity: .32, transform: "scale(1.1) rotate(3deg)", offset: .75 },
        { opacity: 0, transform: "scale(1.16) rotate(5deg)" },
      ], 330 + index * 80, 540 + index * 110, "cubic-bezier(.2,.8,.3,1)"));
      effect('[data-entrance-effect="ink"]', [
        { opacity: 0, transform: "scale(.1) rotate(-12deg)" },
        { opacity: .96, transform: "scale(1) rotate(0deg)", offset: .14 },
        { opacity: .6, transform: "scale(1.2) rotate(2deg)", offset: .45 },
        { opacity: 0, transform: "scale(1.35) rotate(3deg)" },
      ], 650, 660, "cubic-bezier(.1,.8,.2,1)");
      effect('[data-entrance-effect="debris"]', [
        { opacity: 0, transform: "scale(.3)" }, { opacity: .85, transform: "scale(.8)", offset: .15 },
        { opacity: .4, transform: "scale(1.5)", offset: .5 }, { opacity: 0, transform: "scale(1.9)" },
      ], 1050, 760, "cubic-bezier(.1,.8,.3,1)");
      effect('[data-entrance-effect="wake"]', [
        { opacity: 0, transform: "scale(.3) rotate(-15deg)" }, { opacity: .8, offset: .1 },
        { opacity: 0, transform: "scale(1.7) rotate(6deg)" },
      ], 530, 740, "cubic-bezier(.1,.8,.2,1)");
      effect('[data-entrance-effect="speed"]', windowed(440, 810, .65), ENTRANCE_DURATION);
      effect('[data-entrance-effect="afterimage"]', [
        { opacity: 0, transform: "scale(1.3)" }, { opacity: .3, offset: .3 },
        { opacity: 0, transform: "scale(.45)" },
      ], 650, 1260);
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
