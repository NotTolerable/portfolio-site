"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cityShots, type CityShot } from "@/lib/city/route";
import type { CityFrame } from "@/lib/city/camera";
import type { CityScene } from "@/lib/city/scene";
import "./city-preview.css";

const subscribeDevice = (listener: () => void) => {
  const q = matchMedia(
    "(min-width:900px) and (pointer:fine) and (prefers-reduced-motion:no-preference)",
  );
  q.addEventListener("change", listener);
  return () => q.removeEventListener("change", listener);
};
const deviceSnapshot = () =>
  matchMedia(
    "(min-width:900px) and (pointer:fine) and (prefers-reduced-motion:no-preference)",
  ).matches;
export function CityPreview() {
  const desktop = useSyncExternalStore(
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
    [active, setActive] = useState<CityShot>(cityShots[0]);
  const world = desktop && !still && status !== "unavailable";
  const root = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    track = useRef<HTMLDivElement>(null),
    caption = useRef<HTMLDivElement>(null),
    engine = useRef<CityScene | null>(null);
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
      const alpha =
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
    const initial = cityShots.find((s) => s.id === location.hash.slice(1));
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
  function seek(shot: CityShot) {
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
          <h1>{active.title}</h1>
          {active.id === "arrival" && (
            <p className="city-intro">The city has a softer side.</p>
          )}
          {active.id === "bookshop" && (
            <button
              type="button"
              className="city-shop-action"
              aria-pressed={warm}
              onClick={() => setWarm(!warm)}
              onPointerEnter={() => engine.current?.setStorefront(true)}
              onPointerLeave={() => engine.current?.setStorefront(warm)}
              onFocus={() => engine.current?.setStorefront(true)}
              onBlur={() => engine.current?.setStorefront(warm)}
            >
              A little warmth <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
        <div
          className="city-stills"
          aria-label="Still views of the nighttime street"
        >
          {cityShots.map((shot, i) => (
            <section key={shot.id} id={shot.id} className="city-still-view">
              <Image
                src={"/illustrations/city-" + shot.id + ".webp"}
                alt={
                  [
                    "Historic stone buildings and warm shopfronts along a snowy nighttime street.",
                    "A close view of the Late Edition bookshop, with shelves, pendant lamps and a hanging sign.",
                    "The bookshop is behind us and the street opens toward a lit intersection.",
                    "A turn reveals a second street, with a cinema and hotel façade under blue winter light.",
                  ][i]
                }
                fill
                priority={i === 0}
                sizes="100vw"
                unoptimized
              />
              <div className="city-vignette" />
              <div>
                <p className="city-kicker">
                  AFTER HOURS / {shot.label.toUpperCase()}
                </p>
                {i === 0 ? <h1>{shot.title}</h1> : <h2>{shot.title}</h2>}
                {i === 0 && <p>A winter walk, at your own pace.</p>}
              </div>
            </section>
          ))}
          <p className="city-still-note">
            {status === "unavailable"
              ? "The live street could not load. These stills show the same scene."
              : "Still views · For smaller screens and reduced motion."}{" "}
            <Link href="/">Explore the portfolio ↗</Link>
          </p>
        </div>
      </div>
      <footer className="city-footer">
        <div className="city-scroll-hint" aria-hidden="true">
          <span />
          <p>
            {active.id === "corner" ? "THE NIGHT GOES ON" : "SCROLL TO WANDER"}
          </p>
        </div>
        <nav aria-label="Street compositions">
          {cityShots.map((shot, i) => (
            <a
              key={shot.id}
              href={"#" + shot.id}
              aria-label={shot.label}
              aria-current={
                world && active.id === shot.id ? "location" : undefined
              }
              onClick={(e) => {
                if (world) {
                  e.preventDefault();
                  seek(shot);
                }
              }}
            >
              <span className="city-shot-line" />
              <span>0{i + 1}</span>
            </a>
          ))}
        </nav>
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
        {desktop && still && status !== "unavailable" && (
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
