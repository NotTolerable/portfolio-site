"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { exhibits, exhibitAt, journeyChapters, chapterForProgress } from "@/lib/gallery/journey";
import type { GalleryController } from "@/lib/gallery/renderer";
import { SimplePanel, TypingSoundContext, type Panel } from "./typed-panels";
import { GreetingName } from "./greeting-loader";
import { ResumeFinale } from "./resume-finale";
import { ExperienceControls, SoundControl } from "./experience-controls";
import { createAmbientAudio, type AmbientAudio } from "@/lib/gallery/audio";
import type { GraphicsState, GraphicsMode } from "@/lib/gallery/quality";

export function GalleryExperience({ children }: { children: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    loader = useRef<HTMLDivElement>(null),
    controller = useRef<GalleryController | null>(null),
    audio = useRef<AmbientAudio | null>(null),
    hotspotRefs = useRef<(HTMLButtonElement | null)[]>([]),
    depth = useRef<HTMLOutputElement>(null),
    closing = useRef<HTMLDivElement>(null),
    finale = useRef<HTMLDivElement>(null),
    chapterNodes = useRef<(HTMLDivElement | null)[]>([]),
    dialog = useRef<HTMLDialogElement>(null),
    scrollHint = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false),
    [loading, setLoading] = useState(0),
    [failed, setFailed] = useState(false),
    [reading, setReading] = useState(false),
    [active, setActive] = useState(0),
    [journeyStep, setJourneyStep] = useState(0),
    [panel, setPanel] = useState<Panel | null>(null),
    [subject, setSubject] = useState(0),
    [paused, setPaused] = useState(false),
    [sound, setSound] = useState(false),
    [soundPending, setSoundPending] = useState(false),
    [audioUnavailable, setAudioUnavailable] = useState(false),
    [graphics, setGraphics] = useState<GraphicsState>({
      mode: "auto",
      tier: 0,
      label: "High",
    });
  const skipped = useRef(false),
    introComplete = useRef(false),
    enterGallery = useRef<() => void>(() => {}),
    focusAfterIntro = useRef(false),
    activeRef = useRef(0),
    stepRef = useRef(0),
    objectEnergy = useRef(0),
    restoreFocus = useRef<HTMLElement | null>(null);
  const typeSound = useCallback(() => audio.current?.cue("type"), []);
  const completeIntro = useCallback(() => {
    introComplete.current = true;
    enterGallery.current();
  }, []);
  useEffect(() => {
    let cancelled = false,
      owned: GalleryController | undefined,
      entered = false;
    enterGallery.current = () => {
      if (cancelled || skipped.current || entered || !owned || !introComplete.current) return;
      entered = true;
      focusAfterIntro.current = document.activeElement instanceof HTMLElement && !!document.activeElement.closest(".gallery-loader");
      document.documentElement.classList.add("gallery-enhanced");
      setReady(true);
      owned.start();
      if (location.hash === "#experience") openPanel("experience");
      else if (location.hash === "#about") openPanel("about");
      else if (location.hash === "#contact") owned.go(1, true);
    };
    document.documentElement.classList.add("gallery-booting");
    const failure = () => {
      if (cancelled) return;
      setFailed(true);
      setReady(false);
      skipped.current = true;
      owned?.dispose();
      audio.current?.dispose();
      audio.current = null;
      controller.current = null;
      window.scrollTo(0, 0);
      document.documentElement.classList.remove(
        "gallery-enhanced",
        "gallery-booting",
        "gallery-reading",
      );
    };
    import("@/lib/gallery/renderer")
      .then(({ createGallery }) => {
        if (cancelled || !canvas.current) return;
        return createGallery({
          canvas: canvas.current,
          hotspots: hotspotRefs.current.filter(
            (n): n is HTMLButtonElement => !!n,
          ),
          onFailure: failure,
          onQuality: (state) => {
            if (!cancelled) setGraphics(state);
          },
          onLoad: (n) => {
            if (!cancelled) setLoading((previous) => Math.max(previous, n));
          },
          onInteraction: (energy) => { objectEnergy.current = energy; },
          onProgress: (p) => {
            if (cancelled) return;
            audio.current?.update(p, {object: objectEnergy.current, panel: !!dialog.current?.open});
            const step = chapterForProgress(p);
            if (step !== stepRef.current) {
              if (step === 3) audio.current?.cue("transition");
              else if (step === 4) audio.current?.cue("arrive");
              stepRef.current = step;
              setJourneyStep(step);
            }
            const chapter = exhibitAt(p);
            if (chapter !== activeRef.current) {
              activeRef.current = chapter;
              if (chapter >= 0) audio.current?.cue("chapter");
              setActive(chapter);
            }
            const sectionLabel = `${String(step + 1).padStart(2, "0")} / 05 · ${journeyChapters[step]?.label ?? "Resume"}`;
            if (depth.current && depth.current.value !== sectionLabel)
              depth.current.value = sectionLabel;
            chapterNodes.current.forEach((node, i) => {
              if (!node) return;
              const starts = [0, 0.15, 0.36],
                ends = [0.15, 0.36, 0.535];
              const visibility = Math.min(
                1,
                (p - starts[i] + 0.016) / 0.025,
                (ends[i] - p) / 0.035,
              );
              node.style.opacity = String(Math.max(0, visibility));
              node.style.pointerEvents = chapter === i ? "auto" : "none";
            });
            if (closing.current) {
              const value = Math.min(
                1,
                Math.max(0, (p - 0.65) / 0.045),
                Math.max(0, (0.88 - p) / 0.04),
              );
              closing.current.style.opacity = String(value);
              closing.current.style.visibility =
                value > 0.01 ? "visible" : "hidden";
              closing.current.inert = value < 0.1;
            }
            if (finale.current) {
              const value = Math.max(0, Math.min(1, (p - 0.91) / 0.07));
              finale.current.style.opacity = String(value);
              finale.current.style.visibility =
                value > 0.01 ? "visible" : "hidden";
              finale.current.inert = value < 0.1;
            }
            if (scrollHint.current)
              scrollHint.current.style.opacity = p > 0.95 ? "0" : "1";
          },
        });
      })
      .then((instance) => {
        if (!instance) return;
        owned = instance;
        if (cancelled || skipped.current) {
          instance.dispose();
          return;
        }
        controller.current = instance;
        enterGallery.current();
      })
      .catch((error) => {
        console.error("Gallery initialization failed", error);
        failure();
      });
    return () => {
      cancelled = true;
      enterGallery.current = () => {};
      owned?.dispose();
      audio.current?.dispose();
      audio.current = null;
      controller.current = null;
      document.documentElement.classList.remove(
        "gallery-enhanced",
        "gallery-booting",
        "gallery-reading",
      );
    };
  }, []);
  useEffect(() => {
    if (ready && focusAfterIntro.current) {
      focusAfterIntro.current = false;
      document.querySelector<HTMLElement>(".experience-controls .sound-control")?.focus({ preventScroll: true });
    }
  }, [ready]);
  useEffect(() => {
    const curtain = loader.current;
    if (!ready || failed || !curtain) return;
    // Normally transitionend owns this handoff. Read the actual CSS timing for
    // zero-duration styles and a guarded fallback if a browser drops the event.
    const style = getComputedStyle(curtain);
    const milliseconds = (value: string) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000);
    const properties = style.transitionProperty.split(",").map(value => value.trim());
    const durations = style.transitionDuration.split(",").map(milliseconds);
    const delays = style.transitionDelay.split(",").map(milliseconds);
    const duration = Math.max(0, ...properties.map((property, index) =>
      property === "transform" || property === "all" ?
        durations[index % durations.length] + delays[index % delays.length] : 0));
    const timer = setTimeout(() => {
      if (getComputedStyle(curtain).visibility === "hidden" || curtain.getBoundingClientRect().bottom <= 1)
        controller.current?.reveal();
    }, duration > 1 ? duration + 64 : 0);
    return () => clearTimeout(timer);
  }, [ready, failed]);
  useEffect(() => {
    const node = dialog.current;
    if (!panel || !node) return;
    controller.current?.focus(true);
    if (!node.open) node.showModal();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      gsap.fromTo(
        node,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          clearProps: "transform",
        },
      );
    return () => {
      gsap.killTweensOf(node);
    };
  }, [panel]);
  useEffect(() => {
    if (
      !ready ||
      active < 0 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const span = chapterNodes.current[active]?.querySelector(
      "[data-reveal-title]",
    );
    if (!span) return;
    const text = exhibits[active].title,
      letters = "abcdefghijklmnopqrstuvwxyz",
      state = { progress: 0 };
    let lastReveal = -1;
    const tween = gsap.to(state, {
      progress: 1,
      duration: 0.75,
      ease: "none",
      onUpdate: () => {
        const revealed = Math.floor(state.progress * (text.length + 3));
        if (revealed !== lastReveal) { typeSound(); lastReveal = revealed; }
        span.textContent = text
          .split("")
          .map((c, i) =>
            i < revealed
              ? c
              : letters[
                  (i * 7 + Math.floor(state.progress * 24)) % letters.length
                ],
          )
          .join("");
      },
      onComplete: () => {
        span.textContent = text;
      },
    });
    return () => {
      tween.kill();
      span.textContent = text;
    };
  }, [active, ready, typeSound]);
  function openPanel(next: Panel, index = 0) {
    audio.current?.cue("open");
    setSubject(index);
    restoreFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setPanel(next);
  }
  function closePanel() {
    audio.current?.cue("close");
    dialog.current?.close();
  }
  function closed() {
    setPanel(null);
    controller.current?.focus(false);
    restoreFocus.current?.focus({ preventScroll: true });
  }
  function go(p: number) {
    closePanel();
    controller.current?.go(p);
  }
  function toggleReading() {
    closePanel();
    const next = !reading;
    setReading(next);
    if (next) {
      void audio.current?.setEnabled(false);
      setSound(false);
    }
    controller.current?.suspend(next);
    document.documentElement.classList.toggle("gallery-reading", next);
    window.scrollTo(0, 0);
  }
  function togglePause() {
    const next = !paused;
    setPaused(next);
    controller.current?.pause(next);
    audio.current?.setPaused(next);
  }
  async function toggleSound() {
    if (soundPending) return;
    setSoundPending(true);
    try {
      audio.current ??= createAmbientAudio();
      audio.current.setPaused(paused);
      const enabled = await audio.current.setEnabled(!sound);
      setSound(enabled);
    } catch {
      setAudioUnavailable(true);
      setSound(false);
      audio.current?.dispose();
      audio.current = null;
    } finally {
      setSoundPending(false);
    }
  }
  function selectGraphics(mode: GraphicsMode) {
    controller.current?.setGraphics(mode);
    audio.current?.cue("select");
  }
  return (
    <main
      id="content"
      data-graphics-tier={graphics.tier}
      data-journey-step={journeyStep}
      onPointerOver={(event) => {
        const target = (event.target as HTMLElement).closest("button,a,summary,select");
        const from = event.relatedTarget instanceof Node ? event.relatedTarget : null;
        if (target && !target.contains(from)) audio.current?.cue("hover");
      }}
      onFocusCapture={() => audio.current?.cue("hover")}
      onClickCapture={() => audio.current?.cue("press")}
      className={`gallery-page ${ready ? "is-ready" : ""} ${failed ? "has-failed" : ""} ${reading ? "is-reading" : ""} ${paused ? "motion-paused" : ""}`}
    >
      <div className="gallery-stage" aria-hidden="true">
        <canvas
          ref={canvas}
          className="gallery-canvas"
          aria-label="An interactive black-ice gallery with a holographic GPU descending into a nighttime sky"
        />
      </div>
      {!failed && (
        <div
          ref={loader}
          className={`gallery-loader ${ready ? "is-finished" : ""}`}
          aria-hidden={ready}
          inert={ready}
          role="region"
          aria-label="Loading interactive portfolio"
          onTransitionEnd={(event) => {
            if (ready && event.target === event.currentTarget && event.propertyName === "transform")
              controller.current?.reveal();
          }}
        >
          <span className="visually-hidden" role="status">Loading interactive portfolio</span>
          <GreetingName loading={loading} onComplete={completeIntro} />
          <div className="loader-audio">
            <SoundControl sound={sound} pending={soundPending} audioUnavailable={audioUnavailable} onSound={() => void toggleSound()} />
            <span>Ambient music & interface sounds</span>
          </div>
          <button
            className="loader-skip"
            onClick={() => {
              skipped.current = true;
              setFailed(true);
              controller.current?.dispose();
              audio.current?.dispose();
              audio.current = null;
              setSound(false);
              document.documentElement.classList.remove(
                "gallery-enhanced",
                "gallery-booting",
              );
            }}
          >
            Read portfolio instead ↗
          </button>
        </div>
      )}
      <header className="gallery-header">
        <button
          className="wordmark"
          onClick={() => (reading ? toggleReading() : go(0))}
          aria-label="Babisan — back to the top"
        >
          Babisan
        </button>
        <nav aria-label="Main navigation">
          <button onClick={() => openPanel("about")}>About</button>
          <button onClick={() => openPanel("project")}>Projects</button>
          <a
            href="#reading-experience"
            onClick={(event) => {
              event.preventDefault();
              openPanel("experience");
            }}
          >
            Experience
          </a>
          <a href="/resume" target="_blank" rel="noopener">
            Resume<span className="visually-hidden"> (opens in a new tab)</span>{" "}
            <span aria-hidden="true">↗</span>
          </a>
          <button
            className="menu-trigger"
            onClick={() => openPanel("menu")}
            aria-label="Open menu"
          >
            <i />
            <i />
          </button>
        </nav>
      </header>
      <div className="gallery-interface" hidden={!ready || reading}>
        <h1 className="visually-hidden">
          Babisan Pirapakaran — Software Engineer
        </h1>
        {exhibits.map((e, i) => (
          <div
            className={`gallery-chapter chapter-${i}`}
            key={e.id}
            ref={(node) => {
              chapterNodes.current[i] = node;
            }}
            aria-hidden={active !== i}
            inert={active !== i}
          >
            <h2 aria-label={e.title}>
              <span data-reveal-title aria-hidden="true">
                {e.title}
              </span>
            </h2>
            <p className="chapter-subtitle">{e.subtitle}</p>
            <div className="chapter-phrases">
              <p>{e.phrases[0]}</p>
              <p>{e.phrases[1]}</p>
            </div>
            <button
              className="chapter-detail"
              onClick={() =>
                openPanel(
                  i === 0 ? "about" : i === 1 ? "experience" : "project",
                )
              }
            >
              {e.action} <span aria-hidden="true">↗</span>
            </button>
          </div>
        ))}
        {[0, 1, 2].map((_, i) => (
          <button
            key={i}
            ref={(node) => {
              hotspotRefs.current[i] = node;
            }}
            className="gallery-hotspot"
            onClick={() => {
              if (active === 0)
                openPanel(i === 0 ? "about" : i === 1 ? "education" : "skills");
              else if (active === 1) openPanel("experience", [0, 1, 4][i]);
              else openPanel("project", i);
            }}
            aria-label={
              active === 0
                ? ["About Babisan", "Education", "Technical interests"][i]
                : active === 1
                  ? [
                      "407 ETR experience",
                      "DevRoom experience",
                      "Game server engineering",
                    ][i]
                  : ["Explore Axiom", "Explore Verilly", "Explore Behaviourly"][
                      i
                    ]
            }
            tabIndex={active >= 0 ? 0 : -1}
          >
            <span />
            <i />
            <b className="hotspot-label" aria-hidden="true">{
              active === 0 ? ["About", "Education", "Interests"][i] : active === 1 ? ["407 ETR", "DevRoom", "Game servers"][i] : ["Axiom", "Verilly", "Behaviourly"][i]
            }</b>
          </button>
        ))}
        <div className="gallery-closing" ref={closing} inert>
          <p className="chamber-eyebrow">04 / SYSTEMS & INTERESTS</p>
          <h2>one layer deeper.</h2>
          <p className="closing-subtitle">
            systems. infrastructure. curiosity, in motion.
          </p>
          <h3>
            Built from curiosity.
            <br />
            Closer to the machine.
          </h3>
          <p>
            I study Computational Mathematics at Waterloo, with a Computer
            Science minor. My work spans platforms, infrastructure, backend
            development, and game server operations.
          </p>
          <p>
            I’m drawn to the details: memory, concurrency, latency, and the
            systems that keep everything running. Lately, I’m exploring GPU
            programming and CUDA.
          </p>
          <button className="closing-link" onClick={() => openPanel("skills")}>
            Tools & interests <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="gallery-finale" ref={finale} inert>
          <ResumeFinale />
          <footer>
            © 2026 Babisan Pirapakaran <span>·</span>{" "}
            <button onClick={() => openPanel("credits")}>Credits</button>
            <span>·</span>
            <a href="/infrastructure">Infrastructure</a>
          </footer>
        </div>
        <nav className="journey-nav" aria-label="Explore portfolio sections">
          {journeyChapters.map((chapter, index) => (
            <button key={chapter.label} onClick={() => go(chapter.progress)} aria-current={journeyStep === index ? "step" : undefined}>
              <span className="journey-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{chapter.label}</span><i aria-hidden="true" />
            </button>
          ))}
        </nav>
        <button
          className="scroll-hint"
          ref={scrollHint}
          onClick={() =>
            controller.current?.go(
              active < 0 ? 1 : [0.212, 0.423, 0.705][active],
            )
          }
          aria-label="Continue through portfolio"
        >
          <span aria-hidden="true">↓</span> Scroll to explore
        </button>
        <output className="depth-meter" ref={depth} aria-label="Portfolio section">
          01 / 05 · About
        </output>
      </div>
      {ready && !reading && !failed && (
        <ExperienceControls
          graphics={graphics}
          sound={sound}
          pending={soundPending}
          audioUnavailable={audioUnavailable}
          onSound={() => void toggleSound()}
          onGraphics={selectGraphics}
        />
      )}
      {failed && (
        <p className="fallback-notice">
          The interactive gallery is unavailable on this device. Everything is
          available below.
        </p>
      )}
      {reading && (
        <button className="return-gallery" onClick={toggleReading}>
          Return to the gallery ↗
        </button>
      )}
      {children}
      <dialog
        ref={dialog}
        className={`gallery-dialog ${panel === "contact" ? "contact-dialog" : ""}`}
        onClose={closed}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePanel();
        }}
        aria-label={
          panel === "project"
            ? "Project details"
            : panel === "experience"
              ? "Professional experience"
              : panel === "skills"
                ? "Technical skills"
                : panel === "education"
                  ? "Education"
                  : panel === "about"
                    ? "About Babisan"
                    : panel === "credits"
                      ? "Credits"
                      : panel === "menu"
                        ? "Portfolio menu"
                        : "Contact Babisan"
        }
        data-lenis-prevent
      >
        <div className="dialog-shell">
          <button
            className="dialog-close"
            onClick={closePanel}
            autoFocus
            aria-label="Close panel"
          >
            ×
          </button>
          {panel === "menu" ? (
            <div className="portfolio-menu">
              <p className="eyebrow">BABISAN PIRAPAKARAN</p>
              <h2>Find your way.</h2>
              <button onClick={() => go(0.423)}>
                Selected work <span>01</span>
              </button>
              <button onClick={() => setPanel("experience")}>
                Experience <span>02</span>
              </button>
              <button onClick={() => setPanel("about")}>
                About <span>03</span>
              </button>
              <button onClick={() => setPanel("skills")}>
                Technical skills <span>04</span>
              </button>
              <a href="/infrastructure">
                Infrastructure lab <span>↗</span>
              </a>
              <a href="/resume" target="_blank" rel="noopener">
                Resume <span>↗</span>
              </a>
              <button onClick={() => go(1)}>
                Get in touch <span>↗</span>
              </button>
              <div className="menu-preferences">
                <button onClick={toggleReading}>
                  {reading ? "Return to gallery" : "Read portfolio without 3D"}
                </button>
                <button onClick={togglePause} aria-pressed={paused}>
                  {paused ? "Resume animation" : "Pause animation"}
                </button>
                <button onClick={() => setPanel("credits")}>Credits</button>
              </div>
            </div>
          ) : panel ? (
            <TypingSoundContext.Provider value={typeSound}>
              <SimplePanel key={`${panel}-${subject}`} panel={panel} subject={subject} />
            </TypingSoundContext.Provider>
          ) : null}
        </div>
      </dialog>
    </main>
  );
}
