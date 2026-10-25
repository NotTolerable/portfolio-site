"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cityShots, type CityShot } from "@/lib/city/route";
import {districts,districtAt,landmarks} from "@/lib/city/layout";
import type { CityFrame } from "@/lib/city/camera";
import type { CityScene } from "@/lib/city/scene";
import "./city-preview.css";

const subscribeDevice = (listener: () => void) => {
  const q = matchMedia(
    "(prefers-reduced-motion:no-preference)",
  );
  q.addEventListener("change", listener);
  return () => q.removeEventListener("change", listener);
};
const deviceSnapshot = () =>
  matchMedia(
    "(prefers-reduced-motion:no-preference)",
  ).matches;
export function CityPreview() {
  const motionAllowed = useSyncExternalStore(
    subscribeDevice,
    deviceSnapshot,
    () => false,
  );
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [still, setStill] = useState(false),
    [paused, setPaused] = useState(false),
    [warm, setWarm] = useState(false),
    [district,setDistrict]=useState<string>("a"),
    [active, setActive] = useState<CityShot>(cityShots[0]);
  const world = motionAllowed && !still && status !== "unavailable";
  const root = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    track = useRef<HTMLDivElement>(null),
    caption = useRef<HTMLDivElement>(null),
    engine = useRef<CityScene | null>(null);
  const currentDistrict=useRef("a");
  const progress = useRef(0),
    lastShot = useRef("arrival"),
    settings = useRef({ paused: false, warm: false });
  useEffect(() => {
    if (!world || !canvas.current) return;
    const abort = new AbortController();
    let scene: CityScene | undefined;
    queueMicrotask(() => {
      if (!abort.signal.aborted) setStatus("loading");
    });
    const present = (frame: CityFrame) => {
      root.current?.setAttribute("data-shot", frame.shot.id);
      const actualDistrict=districtAt(frame.progress).id;
      root.current?.setAttribute("data-district",actualDistrict);
      if(currentDistrict.current!==actualDistrict){currentDistrict.current=actualDistrict;setDistrict(actualDistrict);}

      root.current?.style.setProperty(
        "--city-progress",
        String(frame.progress),
      );
      if (frame.shot.id !== lastShot.current) {
        lastShot.current = frame.shot.id;
        setActive(frame.shot);
      }
      const next = cityShots[cityShots.indexOf(frame.shot) + 1];
      const ease = (a: number, b: number) => {
        const t = Math.max(0, Math.min(1, (frame.progress - a) / (b - a)));
        return t * t * (3 - 2 * t);
      };
      const alpha = (frame.shot.title?1:0)*
        (frame.shot.start === 0
          ? 1
          : ease(frame.shot.start, frame.shot.start + 0.045)) *
        (next ? 1 - ease(next.start - 0.065, next.start) : 1);
      if (caption.current) {
        caption.current.style.opacity = String(alpha);
        caption.current.inert = alpha < 0.05;
      }
    };
    import("@/lib/city/scene")
      .then((m) =>
        m.createCityScene(
          canvas.current!,
          abort.signal,
          present,
          () => setStatus("unavailable"),
          progress.current,
        ),
      )
      .then((s) => {
        if (abort.signal.aborted) {
          s.dispose();
          return;
        }
        scene = s;
        engine.current = s;
        s.setProgress(progress.current);
        s.setPaused(settings.current.paused);
        s.setStorefront(settings.current.warm);
        setStatus("ready");
      })
      .catch(() => {
        if (!abort.signal.aborted) setStatus("unavailable");
      });
    return () => {
      abort.abort();
      scene?.dispose();
      engine.current = null;
    };
  }, [world]);
  useEffect(() => {
    if (!world) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!track.current) return;
      const top = track.current.getBoundingClientRect().top + scrollY;
      progress.current = Math.max(
        0,
        Math.min(
          1,
          (scrollY - top) /
            Math.max(1, track.current.offsetHeight - innerHeight),
        ),
      );
      engine.current?.setProgress(progress.current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const hash=location.hash.slice(1);
    const destination=districts.find(d=>d.id===hash);
    const initial = cityShots.find((s) => s.id === hash) ?? (destination?{at:destination.at}:undefined);
    if (initial && track.current) {
      const top = track.current.getBoundingClientRect().top + scrollY;
      scrollTo({
        top: top + initial.at * (track.current.offsetHeight - innerHeight),
        behavior: "instant",
      });
    }
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [world]);
  useEffect(() => {
    settings.current = { paused, warm };
    engine.current?.setPaused(paused);
    engine.current?.setStorefront(warm);
  }, [paused, warm]);
  function seek(shot: {at:number;id:string}) {
    if (!world || !track.current) return;
    const top = track.current.getBoundingClientRect().top + scrollY;
    scrollTo({
      top: top + shot.at * (track.current.offsetHeight - innerHeight),
      behavior: "smooth",
    });
    history.replaceState(null, "", "#" + shot.id);
  }
  return (
    <main
      ref={root}
      id="content"
      className="city-preview"
      data-world={world}
      data-renderer={status}
      data-shot="arrival"
      onPointerMove={(e) => {
        if (e.pointerType === "mouse")
          engine.current?.setPointer(
            (e.clientX / innerWidth - 0.5) * 2,
            (e.clientY / innerHeight - 0.5) * 2,
          );
      }}
      onPointerLeave={() => engine.current?.setPointer(0, 0, false)}
    >
      <div className="city-stage" aria-hidden="true">
        <Image
          src="/illustrations/city-arrival.webp"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
        />
        <canvas ref={canvas} />
        <div className="city-vignette" />
      </div>
      <header className="city-header">
        <Link
          href="/"
          className="city-identity"
          aria-label="Babisan Pirapakaran, return to portfolio"
        >
          <span>bp</span>
          <span>
            BABISAN PIRAPAKARAN
            <br />
            <small>AFTER HOURS</small>
          </span>
        </Link>
        <Link href="/">
          Back to portfolio <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <div ref={track} className="city-scroll-track">
        <div ref={caption} className="city-caption" key={active.id}>
          <p className="city-kicker">
            AFTER HOURS /{" "}
            {active.id === "arrival"
              ? "A WINTER WALK"
              : active.label.toUpperCase()}
          </p>
          <h1>{active.title || active.subject}</h1>
          {active.id === "arrival" && (
            <p className="city-intro">The city has a softer side.</p>
          )}

        </div>
        <div
          className="city-stills"
          aria-label="Still views of the nighttime street"
        >
          {districts.map((d,i)=>(
            <section key={d.id} id={d.id} className="city-still-view">
              <Image src={"/illustrations/"+d.image+".webp"} alt={[
                "Warm bookshop windows and historic façades on a snowy commercial street.",
                "Restaurants, an arcade and a music venue along Lantern Street at night.",
                "A boxing gym, independent print shop and a small hoop in a quiet side alley.",
                "Lower residential houses and garden walls lead toward a quiet park entrance."
              ][i]} fill priority={i===0} sizes="100vw" unoptimized />
              <div className="city-vignette" />
              <div><p className="city-kicker">AFTER HOURS / {d.label.toUpperCase()}</p>
                {i===0?<h1>{d.title}</h1>:<h2>{d.title}</h2>}
                {i===0&&<p>A winter walk, at your own pace.</p>}
              </div>
            </section>
          ))}
          <p className="city-still-note">
            {status === "unavailable"
              ? "The live street could not load. These stills show the same scene."
              : "Still views · A quieter way to explore."}{" "}
            <Link href="/">Explore the portfolio ↗</Link>
          </p>
        </div>
      </div>
      {world && landmarks.some(l=>l.district===district && (active.id==='bookshop'||active.id==='music'||active.id==='printshop'||active.id==='residential')) &&
        <button type="button" className="city-local-action" aria-pressed={warm} onClick={()=>setWarm(!warm)}
        onPointerEnter={()=>engine.current?.setStorefront(true)} onPointerLeave={()=>engine.current?.setStorefront(warm)}
        onFocus={()=>engine.current?.setStorefront(true)} onBlur={()=>engine.current?.setStorefront(warm)}>A little warmth ↗</button>}
      <footer className="city-footer">
        <div className="city-scroll-hint" aria-hidden="true">
          <span />
          <p>
            {active.id === "corner" ? "THE NIGHT GOES ON" : "SCROLL TO WANDER"}
          </p>
        </div>
        <nav aria-label="City districts">
          {districts.map((d,i)=>(
            <a key={d.id} href={"#"+d.id} aria-label={d.short} aria-current={world&&district===d.id?"location":undefined}
              onClick={e=>{if(world){e.preventDefault();seek(d);}}}>
              <span className="city-shot-line"/><span>0{i+1}</span><span className="city-district-name">{d.short}</span>
            </a>
          ))}
        </nav>
        {world && <div className="city-shot-controls">
          <button type="button" aria-label="Previous composition" disabled={active.id==='arrival'} onClick={()=>seek(cityShots[Math.max(0,cityShots.indexOf(active)-1)])}>←</button>
          <button type="button" aria-label="Next composition" disabled={active.id==='last-light'} onClick={()=>seek(cityShots[Math.min(cityShots.length-1,cityShots.indexOf(active)+1)])}>→</button>
        </div>}
        {world && (
          <div className="city-motion">
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? "Resume atmosphere" : "Pause atmosphere"}
            </button>
            <button type="button" onClick={() => setStill(true)}>
              Still views
            </button>
          </div>
        )}
        {motionAllowed && still && status !== "unavailable" && (
          <button
            type="button"
            className="city-return-motion"
            onClick={() => setStill(false)}
          >
            Return to the street ↗
          </button>
        )}
      </footer>
      <p className="city-load-status visually-hidden" role="status">
        {world && status === "loading"
          ? "Preparing the street. Navigation remains available."
          : status === "ready"
            ? "Street ready. Scroll to explore."
            : ""}
      </p>
    </main>
  );
}
