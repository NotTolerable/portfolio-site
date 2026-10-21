"use client";

import { useEffect, useState, type CSSProperties } from "react";

const letters = [
  { letter: "B", x: "-24vw", y: "-16vh", turn: "-38deg" },
  { letter: "A", x: "-12vw", y: "19vh", turn: "24deg" },
  { letter: "B", x: "-4vw", y: "-22vh", turn: "-18deg" },
  { letter: "I", x: "3vw", y: "24vh", turn: "34deg" },
  { letter: "S", x: "8vw", y: "-18vh", turn: "-28deg" },
  { letter: "A", x: "17vw", y: "17vh", turn: "22deg" },
  { letter: "N", x: "26vw", y: "-12vh", turn: "38deg" },
];

export function SiteIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timeout = window.setTimeout(() => setVisible(false), media.matches ? 0 : 3200);
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") setVisible(false);
    };
    const preferenceChanged = () => { if (media.matches) setVisible(false); };
    const skipOnScroll = () => setVisible(false);
    window.addEventListener("keydown", dismiss);
    window.addEventListener("wheel", skipOnScroll, { passive: true, once: true });
    window.addEventListener("touchmove", skipOnScroll, { passive: true, once: true });
    media.addEventListener("change", preferenceChanged);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("wheel", skipOnScroll);
      window.removeEventListener("touchmove", skipOnScroll);
      media.removeEventListener("change", preferenceChanged);
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="site-intro">
      <div className="opening-visual" aria-hidden="true">
        <span className="opening-signal" />
        <div className="opening-signature">
          <div className="opening-letters">{letters.map(({ letter, x, y, turn }, index) => <span key={index} style={{ "--letter-x": x, "--letter-y": y, "--letter-turn": turn, "--letter-delay": `${360 + index * 65}ms` } as CSSProperties}>{letter}</span>)}</div>
          <span className="opening-surname">PIRAPAKARAN</span>
        </div>
        <div className="opening-title"><span>PORTFOLIO</span></div>
        <span className="opening-caption">SOFTWARE ENGINEERING / SELECTED WORK</span>
      </div>
      <button type="button" className="opening-skip" onClick={() => setVisible(false)}>Skip intro <span aria-hidden="true">↗</span></button>
    </div>
  );
}
