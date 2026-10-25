'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mark } from './icons';
import { DestinationLink, useWorld } from './world-provider';
export function Header(){
  const pathname=usePathname(),{active}=useWorld();const [menu,setMenu]=useState(false);
  useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};addEventListener('keydown',close);return()=>removeEventListener('keydown',close);},[menu]);
  if(pathname==='/city-preview')return null;
  return <header className="site-header">
    <Link href="/" className="brand" aria-label="Babisan Pirapakaran, home"><Mark/><span className="brand-initials">bp</span><span className="brand-caption">BABISAN PIRAPAKARAN<br/><span>SOFTWARE ENGINEER</span></span></Link>
    <span className="header-world-label mono">AFTER HOURS <i aria-hidden="true"/> {pathname==='/camera-study'?'CAMERA DIRECTION STUDY':'A PERSONAL OBSERVATORY'}</span>
    <button type="button" className="mobile-menu-toggle" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="main-navigation" onClick={()=>setMenu(!menu)}>{menu?'Close −':'Index +'}</button>
    <nav id="main-navigation" aria-label="Main navigation" data-open={menu} onClick={()=>setMenu(false)}>
      <DestinationLink id="projects" className={pathname==='/'&&active===1?'is-current':''}>Work</DestinationLink>
      <DestinationLink id="experience" className={pathname==='/'&&active===2?'is-current':''}>Experience</DestinationLink>
      <DestinationLink id="about" className={pathname==='/'&&active===3?'is-current':''}>About</DestinationLink>
      <a href="/resume" target="_blank" rel="noopener" className="header-resume">Resume <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
    </nav>
  </header>;
}
