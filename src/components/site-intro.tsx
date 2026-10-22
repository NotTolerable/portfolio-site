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

      // The blade occupies the actual headline's bounds and resolves into its letters.
      const box = identity.getBoundingClientRect();
      const nameBox = name.getBoundingClientRect(), surnameBox = surname.getBoundingClientRect();
      const bladeAxis = box.top + box.height * .47;
      const nameOffset = bladeAxis - nameBox.top - nameBox.height / 2;
      const surnameOffset = bladeAxis - surnameBox.top - surnameBox.height / 2;
      const scale = Math.min(.94, (window.innerWidth - 48) / box.width);
      const mobileScale = window.innerWidth < 761 ? Math.min(1.45, (window.innerWidth - 48) / box.width) : scale;
      const x = (window.innerWidth - box.width * mobileScale) / 2 - box.left;
      const y = window.innerHeight * .45 - box.height * mobileScale / 2 - box.top;
      animate(identity, [
        { transform: `translate(${x}px, ${y}px) rotate(-16deg) scale(${mobileScale})`, offset: 0 },
        { transform: `translate(${x}px, ${y}px) rotate(-10deg) scale(${mobileScale})`, offset: .35 },
        { transform: "none", offset: 1 },
      ], 1700, 0);
      const blade = document.querySelector(".name-blade");
      if (blade) animate(blade, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], 260);
      document.querySelectorAll("[data-blade-fragment]").forEach((fragment, index) => {
        animate(fragment, [
          { opacity: 1, transform: "none", offset: 0 },
          { opacity: 1, transform: "none", offset: .52 },
          { opacity: 0, transform: `translate(${(index - 6) * 4}px, ${index % 2 === 0 ? -70 : 70}px)`, offset: 1 },
        ], 1250, index * 12, "cubic-bezier(.3,0,.2,1)");
      });
      const spine = document.querySelector("[data-blade-spine]");
      if (spine) animate(spine, [{ opacity: 0 }, { opacity: .8, offset: .2 }, { opacity: 0 }], 1250);
      name.querySelectorAll("span").forEach((letter, index) => {
        animate(letter, [
          { opacity: 0, transform: `translateY(${nameOffset}px) scaleY(.025)` },
          { opacity: 1, transform: "translateY(-2px) scaleY(1.02)", offset: .75 },
          { opacity: 1, transform: "none" },
        ], 900, 640 + index * 38);
      });
      animate(surname, [
        { opacity: 0, transform: `translateY(${surnameOffset}px) scaleY(.035)`, clipPath: "inset(40% 100% 40% 0)" },
        { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" },
      ], 1050, 850);
      animate(signal, [{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "none" }], 700, 600);

      // Change the whole composition's palette on the same held beats as the cube.
      const palette: Keyframe[] = [{ offset: 0, filter: "grayscale(1)" }];
      const camera: Keyframe[] = [{ offset: 0, translate: "0px 0px" }];
      IMPACT_BEATS.forEach((beat) => {
        if (beat.paper) palette.push(
          { offset: (beat.start - 1) / ENTRANCE_DURATION, filter: "grayscale(1)" },
          { offset: beat.start / ENTRANCE_DURATION, filter: "grayscale(1) invert(1)" },
          { offset: (beat.end - 1) / ENTRANCE_DURATION, filter: "grayscale(1) invert(1)" },
          { offset: beat.end / ENTRANCE_DURATION, filter: "grayscale(1)" },
        );
        camera.push(
          { offset: (beat.start - 1) / ENTRANCE_DURATION, translate: "0px 0px" },
          { offset: beat.start / ENTRANCE_DURATION, translate: `${beat.direction * 4}px -2px` },
          { offset: (beat.end - 1) / ENTRANCE_DURATION, translate: `${beat.direction * 4}px -2px` },
          { offset: (beat.end + 80) / ENTRANCE_DURATION, translate: "0px 0px" },
        );
      });
      palette.push({ offset: .92, filter: "grayscale(1)" }, { offset: 1, filter: "none" });
      camera.push({ offset: 1, translate: "0px 0px" });
      document.querySelectorAll(".intro-sticky, .site-header").forEach((element) => {
        animate(element, palette, ENTRANCE_DURATION, 0, "linear");
      });
      document.querySelectorAll(".intro-inner, .site-header").forEach((element) => {
        animate(element, camera, ENTRANCE_DURATION, 0, "linear");
      });
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
        ], 900, element.dataset.entranceReveal === "navigation" ? 280 : 500);
      });
      document.querySelectorAll("[data-entrance-effect]").forEach((element) => {
        const effect = element.getAttribute("data-entrance-effect")!;
        if (effect.startsWith("panel-")) {
          const beat = IMPACT_BEATS[Number(effect.slice(-1))];
          animate(element, [
            { opacity: 0, transform: `translateX(${beat.direction * -18}px)`, offset: 0 },
            { opacity: .85, transform: `translateX(${beat.direction * -18}px)`, offset: .001 },
            { opacity: .85, transform: `translateX(${beat.direction * 18}px)`, offset: .999 },
            { opacity: 0, transform: `translateX(${beat.direction * 18}px)`, offset: 1 },
          ], beat.end - beat.start, beat.start, "linear");
        } else {
          animate(element, [
            { opacity: 0, transform: "translate(36px, -12px)" },
            { opacity: effect === "field" ? .3 : .55, transform: "none", offset: .28 },
            { opacity: .16, transform: "translate(-18px, 6px)", offset: .72 },
            { opacity: 0, transform: "translate(-35px, 12px)" },
          ], 2350, 0);
        }
      });
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
