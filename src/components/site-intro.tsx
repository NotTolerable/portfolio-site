"use client";

import { useEffect, useRef, useState } from "react";

const settle = "cubic-bezier(.76,0,.24,1)";
const scatter = [[-24, -16, -38], [-12, 19, 24], [-4, -22, -18], [3, 24, 34], [8, -18, -28], [17, 17, 22], [26, -12, 38]];

export function SiteIntro() {
  const [playing, setPlaying] = useState(false);
  const skip = useRef(() => {});

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listeners = new AbortController();
    const animations: Animation[] = [];
    let finished = false;
    let timeout: number | undefined;
    const finish = () => {
      finished = true;
      window.clearTimeout(timeout);
      animations.forEach((animation) => animation.cancel());
      animations.length = 0;
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
      // Measure the real, font-loaded landing elements. No duplicate title or overlay.
      await Promise.race([document.fonts.ready, new Promise((resolve) => { timeout = window.setTimeout(resolve, 500); })]);
      window.clearTimeout(timeout);
      if (finished) return;
      const part = (name: string) => document.querySelector<HTMLElement>(`[data-entrance-part="${name}"]`);
      const name = part("name"), surname = part("surname"), word = part("word"), signal = part("signal");
      if (root.dataset.entrance === "ready" || media.matches || document.fonts.status !== "loaded" || window.location.pathname !== "/" || window.location.hash || window.scrollY > 10 || !name || !surname || !word || !signal) {
        finish();
        return;
      }

      const width = window.innerWidth, height = window.innerHeight;
      const nameBox = name.getBoundingClientRect(), surnameBox = surname.getBoundingClientRect();
      const wordBox = word.getBoundingClientRect(), signalBox = signal.getBoundingClientRect();
      const scale = Math.min(1.5, (width - 48) / nameBox.width);
      const nameX = (width - nameBox.width * scale) / 2 - nameBox.left;
      const nameY = height * .38 - nameBox.height * scale / 2 - nameBox.top;
      const surnameScale = width < 761 ? .75 : .52;
      const surnameX = (width - surnameBox.width * surnameScale) / 2 - surnameBox.left;
      const surnameY = height * .38 + nameBox.height * scale * .65 - surnameBox.top;
      const wordSize = parseFloat(getComputedStyle(word).fontSize);
      const largeSize = Math.min(180, height * .2, width * .146, wordSize * width * .9 / wordBox.width);
      const wordX = (width - wordBox.width * largeSize / wordSize) / 2 - wordBox.left;
      const wordY = height * .12 - wordBox.height * largeSize / wordSize / 2 - wordBox.top;
      const animate = (element: Element, frames: Keyframe[], duration: number, delay = 0, easing = settle) => {
        animations.push(element.animate(frames, { duration, delay, easing, fill: "both" }));
      };

      animate(name, [{ transform: `translate(${nameX}px, ${nameY}px) scale(${scale})` }, { transform: "none" }], 1250, 1350);
      name.querySelectorAll("span").forEach((letter, index) => {
        const [x, y, turn] = scatter[index];
        animate(letter, [{ opacity: 0, transform: `translate(${x}vw, ${y}vh) rotate(${turn}deg)` }, { opacity: 1, transform: "none" }], 700, 240 + index * 60, "cubic-bezier(.16,1,.3,1)");
      });
      animate(surname, [{ opacity: 0 }, { opacity: 1 }], 400, 700, "ease");
      // Travel beneath the first name before rising into the desktop baseline.
      animate(surname, [
        { transform: `translate(${surnameX}px, ${surnameY}px) scale(${surnameScale})`, offset: 0, easing: settle },
        { transform: `translate(0px, ${surnameY}px) scale(1)`, offset: .58, easing: settle },
        { transform: "none", offset: 1 },
      ], 1500, 1350, "linear");
      animate(word, [
        { opacity: 0, fontSize: `${largeSize}px`, transform: `translate(${wordX}px, ${wordY + 40}px)`, offset: 0 },
        { opacity: 1, fontSize: `${largeSize}px`, transform: `translate(${wordX}px, ${wordY}px)`, offset: .24, easing: settle },
        { opacity: 1, fontSize: `${wordSize}px`, transform: "none", offset: 1 },
      ], 1600, 1450, "linear");
      const signalTransform = `translate(${width / 2 - signalBox.left - signalBox.width / 2}px, ${height * .38 - signalBox.top - signalBox.height / 2}px) scale(3.5)`;
      animate(signal, [
        { opacity: 0, transform: signalTransform, offset: 0 },
        { opacity: 1, transform: signalTransform, offset: .12 },
        { opacity: 1, transform: signalTransform, offset: .35, easing: settle },
        { opacity: 1, transform: "none", offset: 1 },
      ], 1900, 0, "linear");
      document.querySelectorAll<HTMLElement>("[data-entrance-reveal]").forEach((element) => {
        const opacity = getComputedStyle(element).opacity;
        animate(element, [
          { opacity: 0, transform: element.dataset.entranceReveal === "cube" ? "translateY(40px) scale(.86)" : "translateY(12px)" },
          { opacity, transform: "none" },
        ], 900, element.dataset.entranceReveal === "cube" ? 2050 : 2250);
      });
      // All fill styles are installed before releasing the pre-paint guard.
      root.dataset.entrance = "running";
      setPlaying(true);
      timeout = window.setTimeout(finish, 3200);
    }
    void start().catch(finish);
    return () => {
      finished = true;
      window.clearTimeout(timeout);
      animations.forEach((animation) => animation.cancel());
      delete root.dataset.entrance;
      listeners.abort();
    };
  }, []);

  if (!playing) return null;
  return <div className="site-intro"><button type="button" className="opening-skip" onClick={() => skip.current()}>Skip intro <span aria-hidden="true">↗</span></button></div>;
}
