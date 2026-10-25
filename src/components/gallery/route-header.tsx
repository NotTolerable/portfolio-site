"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
export function RouteHeader() {
  const path = usePathname();
  if (path === "/") return null;
  return (
    <header className="gallery-header route-header">
      <Link className="wordmark" href="/">
        Babisan
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/">Work</Link>
        <Link href="/#experience">Experience</Link>
        <a href="/resume" target="_blank" rel="noopener">
          Resume<span className="visually-hidden"> (opens in a new tab)</span>{" "}
          ↗
        </a>
      </nav>
    </header>
  );
}
