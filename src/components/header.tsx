import Link from "next/link";
import { Mark } from "./icons";

export function Header() {
  return (
    <header className="site-header shell">
      <Link href="/" className="brand" aria-label="Babisan Pirapakaran, home">
        <Mark />
        <span>Babisan<span className="brand-surname"> Pirapakaran</span></span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#projects">Projects</Link>
        <Link href="/infrastructure">Cloud / Infra</Link>
        <Link href="/#about">About</Link>
      </nav>
      <Link href="/#projects" className="button header-action">My work <span aria-hidden="true">↗</span></Link>
    </header>
  );
}
