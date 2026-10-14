"use client";

import { useEffect, useState } from "react";

export function SiteIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setVisible(false), reduced ? 0 : 1050);
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") setVisible(false);
    };
    window.addEventListener("keydown", dismiss);
    return () => { window.clearTimeout(timeout); window.removeEventListener("keydown", dismiss); };
  }, []);

  if (!visible) return null;
  return <div className="site-intro" aria-hidden="true"><div className="intro-content"><span className="intro-name">Babisan</span><span className="intro-greeting mono">hey, welcome.</span><div className="intro-track"><span /></div></div></div>;
}
