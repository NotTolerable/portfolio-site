'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cinematicShots, studyFocus, type CinematicShot, type FocusId, type JourneyFrame } from '@/lib/cinematic-journey';
import type { CameraStudyScene } from '@/lib/camera-study-scene';
import './camera-study.css';
const subscribeHydration = () => () => { };
const subscribeMotion = (listener: () => void) => { const m = matchMedia('(prefers-reduced-motion: reduce)'); m.addEventListener('change', listener); return () => m.removeEventListener('change', listener); };
export function CameraStudy() {
    const enhanced = useSyncExternalStore(subscribeHydration, () => true, () => false);
    const reduced = useSyncExternalStore(subscribeMotion, () => matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
    const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
    const [active, setActive] = useState<CinematicShot>(cinematicShots[0]);
    const [focus, setFocus] = useState<FocusId | null>(null), [paused, setPaused] = useState(false);
    const canvas = useRef<HTMLCanvasElement>(null), engine = useRef<CameraStudyScene | null>(null), track = useRef<HTMLDivElement>(null);
    const caption = useRef<HTMLDivElement>(null), range = useRef<HTMLInputElement>(null), root = useRef<HTMLElement>(null);
    const progress = useRef(0), lastShot = useRef('street');
    const markers = useRef(new Map<FocusId, HTMLElement>()), dialog = useRef<HTMLDialogElement>(null);
    const settings = useRef({ paused: false, reduced: false, focus: null as FocusId | null });
    const guided = enhanced && status !== 'unavailable';
    const showFocus = active.id === 'workshop' ? 'workshop' : active.id === 'service' ? 'service' : active.id === 'orbit' ? 'relay' : null;
    function seek(p: number, instant = false) {
        if (!track.current)
            return;
        const top = track.current.getBoundingClientRect().top + scrollY, span = Math.max(1, track.current.offsetHeight - innerHeight);
        window.scrollTo({ top: top + Math.max(0, Math.min(1, p)) * span, behavior: reduced || instant ? 'instant' : 'smooth' });
    }
    useEffect(() => {
        if (!guided)
            return;
        let pending = 0;
        const update = () => { pending = 0; if (!track.current)
            return; const top = track.current.getBoundingClientRect().top + scrollY; progress.current = Math.max(0, Math.min(1, (scrollY - top) / Math.max(1, track.current.offsetHeight - innerHeight))); engine.current?.setProgress(progress.current); };
        const scroll = () => { if (!pending)
            pending = requestAnimationFrame(update); };
        const hash = location.hash.slice(1), initial = cinematicShots.find(s => s.id === hash);
        if (initial && track.current) {
            const top = track.current.getBoundingClientRect().top + scrollY;
            window.scrollTo({ top: top + initial.at * (track.current.offsetHeight - innerHeight), behavior: 'instant' });
        }
        update();
        addEventListener('scroll', scroll, { passive: true });
        addEventListener('resize', scroll);
        return () => { removeEventListener('scroll', scroll); removeEventListener('resize', scroll); cancelAnimationFrame(pending); };
    }, [guided]);
    useEffect(() => {
        if (!enhanced || !canvas.current)
            return;
        const abort = new AbortController();
        let current: CameraStudyScene | undefined;
        markers.current.clear();
        root.current?.querySelectorAll<HTMLButtonElement>('.study-hotspot').forEach(node => markers.current.set(node.dataset.focusTarget as FocusId, node));
        const present = (frame: JourneyFrame) => {
            if (lastShot.current !== frame.shot.id) {
                lastShot.current = frame.shot.id;
                setActive(frame.shot);
            }
            if (caption.current)
                caption.current.style.opacity = String(frame.captionOpacity);
            root.current?.style.setProperty('--study-progress', String(frame.progress));
            root.current?.setAttribute('data-shot', frame.shot.id);
            if (range.current && document.activeElement !== range.current)
                range.current.value = String(frame.progress * 100);
        };
        import('@/lib/camera-study-scene').then(m => m.createCameraStudyScene(canvas.current!, markers.current, abort.signal, present, () => { setFocus(null); setStatus('unavailable'); }, progress.current)).then(s => {
            if (abort.signal.aborted) {
                s.dispose();
                return;
            }
            current = s;
            engine.current = s;
            s.setProgress(progress.current);
            s.setReducedMotion(settings.current.reduced);
            s.setPaused(settings.current.paused);
            s.setFocus(settings.current.focus);
            setStatus('ready');
        }).catch(() => { if (!abort.signal.aborted)
            setStatus('unavailable'); });
        return () => { abort.abort(); current?.dispose(); engine.current = null; };
    }, [enhanced]);
    useEffect(() => { settings.current = { paused, reduced, focus }; engine.current?.setReducedMotion(reduced); engine.current?.setPaused(paused); engine.current?.setFocus(focus); }, [paused, reduced, focus]);
    useEffect(() => {
        const modal = dialog.current;
        if (!focus || !modal)
            return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        modal.showModal();
        return () => { modal.close(); document.body.style.overflow = overflow; };
    }, [focus]);
    return <main id="content" ref={root} className="camera-study" data-guided={guided} data-renderer={status} data-shot="street" onPointerMove={e => { if (e.pointerType === 'mouse')
        engine.current?.setPointer((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2); }} onPointerLeave={() => engine.current?.setPointer(0, 0)}>
    <div className="study-stage" aria-hidden="true"><Image src="/illustrations/camera-study-poster.webp" alt="" fill priority sizes="100vw" unoptimized/><canvas ref={canvas} aria-hidden="true"/><div className="study-scrim"/></div>
    <div className="study-status"><span className="mono">CAMERA DIRECTION / PROTOTYPE</span><Link href="/">Back to portfolio ↗</Link></div>
    <div ref={track} className="study-track">
      <div ref={caption} className="study-caption"><p className="eyebrow" aria-live="polite">{active.label}</p><h1>{active.title}</h1><p>{active.description}</p>{showFocus && <button type="button" className="inline-link" onClick={() => setFocus(showFocus)}>Inspect {studyFocus[showFocus].title.toLowerCase()} <span aria-hidden="true">↗</span></button>}<span className="study-caption-note mono">SCROLL FORWARD TO TRAVEL / BACKWARD TO RETURN</span></div>
      <div className="study-fallback"><p className="eyebrow">BABISAN PIRAPAKARAN / CAMERA STUDY</p><h1>A street. A turn.<br />A quiet court.</h1><p>This small staging environment demonstrates the proposed camera journey before the full city is built.</p>{status === 'unavailable' && <p role="status">The 3D study could not load. The shot sequence and portfolio links remain available.</p>}<ol>{cinematicShots.map(shot => <li key={shot.id} id={shot.id}><h2>{shot.label}</h2><p>{shot.description}</p></li>)}</ol><Link href="/" className="inline-link">Return to the complete portfolio ↗</Link></div>
    </div>
    <nav className="study-navigation" aria-label="Camera compositions">{cinematicShots.map((shot, i) => <a href={'#' + shot.id} key={shot.id} aria-label={shot.label} aria-current={active.id === shot.id ? 'location' : undefined} onClick={e => { if (guided) {
        e.preventDefault();
        seek(shot.at);
        history.replaceState(null, '', '#' + shot.id);
    } }}><span className="mono">0{i + 1}</span><span>{shot.label}</span></a>)}</nav>
    {enhanced && guided && <div className="study-transport"><input ref={range} type="range" min="0" max="100" step=".1" defaultValue="0" aria-label="Camera journey" onInput={e => seek(Number(e.currentTarget.value) / 100, true)}/><button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} disabled={reduced}>{reduced ? 'Reduced motion' : paused ? 'Resume atmosphere' : 'Pause atmosphere'}</button><div className="study-progress" aria-hidden="true"><span /></div></div>}
    {enhanced && guided && Object.entries(studyFocus).map(([id, entry]) => <button key={id} type="button" className="study-hotspot" hidden data-focus-target={id} onClick={() => setFocus(id as FocusId)}><span aria-hidden="true">+</span>{entry.title} <span aria-hidden="true">↗</span></button>)}
    <dialog ref={dialog} className="study-focus-dialog" aria-labelledby="study-focus-title" onCancel={() => setFocus(null)} onClick={e => { if (e.target === e.currentTarget)
        setFocus(null); }} onKeyDown={e => { if (e.key === 'Tab') {
        const elements = [...e.currentTarget.querySelectorAll<HTMLElement>('button,a[href]')];
        if (e.shiftKey && document.activeElement === elements[0]) {
            e.preventDefault();
            elements.at(-1)?.focus();
        }
        else if (!e.shiftKey && document.activeElement === elements.at(-1)) {
            e.preventDefault();
            elements[0]?.focus();
        }
    } }}>
      <div><p className="eyebrow">OBJECT-SPECIFIC CAMERA STUDY</p><button type="button" autoFocus onClick={() => setFocus(null)} aria-label="Return to the journey">Close ×</button></div><h2 id="study-focus-title">{focus ? studyFocus[focus].title : 'Object detail'}</h2><p>{focus ? studyFocus[focus].caption : ''}</p><p className="study-focus-note">The street remains in place. Close this view to return smoothly to the same point in the journey.</p><Link href="/#projects">See the portfolio projects ↗</Link>
    </dialog>
  </main>;
}
