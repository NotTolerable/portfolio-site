"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [section, setSection] = useState("main");
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = ["main", "projects", "experience", "about"].map((id) => document.getElementById(id)).filter((node): node is HTMLElement => !!node);
    const observer = new IntersectionObserver(() => {
      const next = sections.filter((node) => node.id !== "main" && node.getBoundingClientRect().top < innerHeight * .42).at(-1)?.id ?? "main";
      setSection((old) => old === next ? old : next);
    }, { rootMargin: "-15% 0px -45% 0px", threshold: 0 });
    sections.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);
  return <header className="site-header shell">
    <Link href="/#main" className="brand" aria-label="Babisan Pirapakaran, home"><span className="brand-symbol" aria-hidden="true">bp<span>✳</span></span><span className="brand-caption">BABISAN<br />PIRAPAKARAN</span></Link>
    <nav aria-label="Main navigation">
      <Link href="/#projects" aria-current={pathname === "/" && section === "projects" ? "location" : undefined}><span>02</span> Work</Link>
      <Link href="/#experience" aria-current={pathname === "/" && section === "experience" ? "location" : undefined}><span>03</span> Experience</Link>
      <Link href="/#about" aria-current={pathname === "/" && section === "about" ? "location" : undefined}><span>04</span> About</Link>
      <Link href="/infrastructure" aria-current={pathname === "/infrastructure" ? "page" : undefined}><span>05</span> Cloud lab <span aria-hidden="true">↗</span></Link>
    </nav>
    <a href="/resume" target="_blank" rel="noopener" className="header-resume" aria-label="Resume (opens in a new tab)" aria-current={pathname === "/resume" ? "page" : undefined}>Resume <span aria-hidden="true">↗</span></a>
  </header>;
}
