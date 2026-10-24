import Link from "next/link";

export function Header() {
  return (
    <header className="site-header shell">
      <Link href="/" className="brand" aria-label="Babisan Pirapakaran, home"><span className="brand-symbol" aria-hidden="true">bp<span>✳</span></span><span className="brand-caption">BABISAN<br />PIRAPAKARAN</span></Link>
      <nav aria-label="Main navigation"><Link href="/#projects"><span>01</span> Work</Link><Link href="/#experience"><span>02</span> Experience</Link><Link href="/#about"><span>03</span> About</Link><Link href="/infrastructure"><span>04</span> Cloud lab <span aria-hidden="true">↗</span></Link></nav>
      <a href="/resume" target="_blank" rel="noopener" className="header-resume" aria-label="Resume (opens in a new tab)">Resume <span aria-hidden="true">↗</span></a>
    </header>
  );
}
