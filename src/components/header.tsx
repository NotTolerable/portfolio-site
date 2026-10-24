import Link from "next/link";

export function Header() {
  return (
    <header className="site-header shell">
      <Link href="/" className="brand" aria-label="Babisan Pirapakaran, home"><span className="brand-symbol" aria-hidden="true">bp<span>✳</span></span><span className="brand-caption">BABISAN<br />PIRAPAKARAN</span></Link>
      <nav aria-label="Main navigation"><Link href="/#projects"><span>01</span> Work</Link><Link href="/#about"><span>02</span> The human</Link><Link href="/infrastructure"><span>03</span> Cloud lab <span aria-hidden="true">↗</span></Link></nav>
      <span className="header-note mono">A LITTLE CODE.<br />A LOT OF CURIOSITY.</span>
    </header>
  );
}
