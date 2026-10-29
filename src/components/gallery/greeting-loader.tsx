"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { loaderGreetingStepMs, loaderGreetings as greetings, loaderMinimumMs, loaderWordTransitionMs } from "@/lib/gallery/motion";

/** One introduction clock gates both the greeting sequence and scene arrival. */
export function GreetingName({ loading, onComplete }: { loading: number; onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);
  const counter = useRef<HTMLOutputElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const resourceProgress = useRef(loading);
  const paint = useRef<() => void>(() => {});

  useEffect(() => {
    resourceProgress.current = loading;
    paint.current();
  }, [loading]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const words = root.current!.querySelectorAll<HTMLElement>(".loader-word");
    const clock = { value: 0 };
    let completed = false;
    const renderProgress = () => {
      const value = Math.min(resourceProgress.current, clock.value * 100);
      if (fill.current) fill.current.style.transform = `scaleX(${value / 100})`;
      if (counter.current) counter.current.value = String(Math.floor(value)).padStart(3, "0");
      progress.current?.setAttribute("aria-valuenow", String(Math.floor(value)));
    };
    paint.current = renderProgress;
    const complete = () => {
      if (completed) return;
      completed = true;
      onComplete();
    };
    const timeline = gsap.timeline();
    gsap.set(words, { opacity: 0, y: 0, yPercent: 100, rotationX: -90 });
    gsap.set(words[0], { opacity: 1, yPercent: 0, rotationX: 0 });
    const duration = loaderWordTransitionMs / 1000;
    for (let i = 1; i < words.length; i++) {
      const at = i * loaderGreetingStepMs / 1000;
      timeline.to(words[i - 1], {
        opacity: 0, yPercent: -100, rotationX: 90, duration, ease: "power3.out",
      }, at);
      timeline.to(words[i], {
        opacity: 1, yPercent: 0, rotationX: 0, duration, ease: "power3.out",
        onStart: () => { root.current?.setAttribute("data-language", greetings[i].lang); },
      }, at);
    }
    timeline.to(clock, {
      value: 1, duration: loaderMinimumMs / 1000, ease: "none",
      onUpdate: renderProgress, onComplete: complete,
    }, 0);

    const simplify = () => {
      if (!media.matches) return;
      timeline.pause();
      gsap.set(words, { opacity: 0, y: 0, yPercent: 0, rotationX: 0 });
      gsap.set(words[words.length - 1], { opacity: 1 });
      root.current?.setAttribute("data-language", "en");
      clock.value = 1;
      renderProgress();
      complete();
    };
    simplify();
    media.addEventListener("change", simplify);
    return () => {
      timeline.kill();
      gsap.killTweensOf(words);
      media.removeEventListener("change", simplify);
      paint.current = () => {};
    };
  }, [onComplete]);

  return (
    <div className="loader-content" ref={root} data-language="en">
      <div className="loader-greetings" aria-hidden="true">
        {greetings.map(({ text, lang }, index) => (
          <span key={text} lang={lang} dir={lang === "ar" ? "rtl" : undefined} className={`loader-word ${index === greetings.length - 1 ? "loader-name" : ""}`}>
            {text}
          </span>
        ))}
      </div>
      <div className="loader-foot">
        <span className="loader-track" ref={progress} role="progressbar" aria-label="Preparing portfolio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
          <i ref={fill} />
        </span>
        <output ref={counter} aria-hidden="true">000</output>
      </div>
    </div>
  );
}
