import Link from "next/link";
import { Mark } from "./icons";

export function Header() {
  return (
    <header className="site-header shell">
      <Link href="/" className="brand" aria-label="Babisan Pirapakaran, home"><span className="brand-symbol"><Mark /></span><span className="brand-initials" aria-hidden="true">BP</span></Link>
      <nav aria-label="Main navigation"><Link href="/#projects"><span>01</span> Work</Link><Link href="/#about"><span>02</span> About</Link><Link href="/infrastructure"><span>03</span> Cloud lab</Link></nav>
      <span className="header-note">SOFTWARE / SYSTEMS / CURIOSITY</span>
    </header>
  );
}
