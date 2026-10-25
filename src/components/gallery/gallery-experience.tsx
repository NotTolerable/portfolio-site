"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import {
  AboutRecord,
  ExperienceRecord,
  ProjectRecord,
  SkillsRecord,
} from "@/components/portfolio-records";
import { PublicContact } from "@/components/public-contact";
import { exhibits, exhibitAt } from "@/lib/gallery/journey";
import type { GalleryController } from "@/lib/gallery/renderer";

type Panel =
  | "project"
  | "experience"
  | "about"
  | "skills"
  | "contact"
  | "credits"
  | "menu";
export function GalleryExperience({ children }: { children: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    controller = useRef<GalleryController | null>(null),
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
    [panel, setPanel] = useState<Panel | null>(null),
    [paused, setPaused] = useState(false);
  const skipped = useRef(false),
    activeRef = useRef(0),
    restoreFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    let cancelled = false,
      owned: GalleryController | undefined,
      timer: ReturnType<typeof setTimeout> | undefined;
    const started = performance.now();
    document.documentElement.classList.add("gallery-booting");
    const failure = () => {
      if (cancelled) return;
      setFailed(true);
      setReady(false);
      skipped.current = true;
      owned?.dispose();
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
          onLoad: (n) => {
            if (!cancelled) setLoading(n);
          },
          onProgress: (p) => {
            const chapter = exhibitAt(p);
            if (chapter !== activeRef.current) {
              activeRef.current = chapter;
              setActive(chapter);
            }
            if (depth.current)
              depth.current.value = `−${String(Math.round(p * 320)).padStart(3, "0")} M`;
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
        timer = setTimeout(
          () => {
            if (cancelled || skipped.current) return;
            document.documentElement.classList.add("gallery-enhanced");
            setReady(true);
            instance.start();
            if (location.hash === "#experience") openPanel("experience");
            else if (location.hash === "#about") openPanel("about");
            else if (location.hash === "#contact") instance.go(1, true);
          },
          Math.max(0, 1200 - (performance.now() - started)),
        );
      })
      .catch((error) => {
        console.error("Gallery initialization failed", error);
        failure();
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      owned?.dispose();
      controller.current = null;
      document.documentElement.classList.remove(
        "gallery-enhanced",
        "gallery-booting",
        "gallery-reading",
      );
    };
  }, []);
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
    const tween = gsap.to(state, {
      progress: 1,
      duration: 0.75,
      ease: "none",
      onUpdate: () => {
        const revealed = Math.floor(state.progress * (text.length + 3));
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
  }, [active, ready]);
  function openPanel(next: Panel) {
    restoreFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setPanel(next);
  }
  function closePanel() {
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
    controller.current?.suspend(next);
    document.documentElement.classList.toggle("gallery-reading", next);
    window.scrollTo(0, 0);
  }
  function togglePause() {
    const next = !paused;
    setPaused(next);
    controller.current?.pause(next);
  }
  return (
    <main
      id="content"
      className={`gallery-page ${ready ? "is-ready" : ""} ${failed ? "has-failed" : ""} ${reading ? "is-reading" : ""}`}
    >
      <div className="gallery-stage" aria-hidden="true">
        <canvas
          ref={canvas}
          className="gallery-canvas"
          aria-label="An underwater gallery of floating ice sculptures and a particle processor"
        />
      </div>
      {!failed && (
        <div
          className={`gallery-loader ${ready ? "is-finished" : ""}`}
          aria-hidden={ready}
          role="status"
          aria-label="Loading interactive portfolio"
        >
          <div className="loader-name">Babisan</div>
          <div className="loader-foot">
            <span className="loader-track">
              <i style={{ transform: `scaleX(${loading / 100})` }} />
            </span>
            <span>{String(loading).padStart(3, "0")}</span>
          </div>
          <div className="loader-shutters" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <i key={i} style={{ "--column": i } as React.CSSProperties} />
            ))}
          </div>
          <button
            className="loader-skip"
            onClick={() => {
              skipped.current = true;
              setFailed(true);
              controller.current?.dispose();
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
          <button
            onClick={() =>
              reading
                ? document.getElementById("reading-projects")?.scrollIntoView()
                : go(0)
            }
          >
            Work
          </button>
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
              onClick={() => openPanel("project")}
            >
              Explore project <span aria-hidden="true">↗</span>
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
            onClick={() =>
              openPanel(i === 0 ? "project" : i === 1 ? "skills" : "experience")
            }
            aria-label={
              i === 0
                ? "Explore this project"
                : i === 1
                  ? "Explore technical skills"
                  : "Explore professional experience"
            }
            tabIndex={active >= 0 ? 0 : -1}
          >
            <span />
            <i />
          </button>
        ))}
        <div className="gallery-closing" ref={closing} inert>
          <h2>i’m babisan.</h2>
          <p className="closing-subtitle">
            software engineer.
            <br />
            always one layer deeper.
          </p>
          <h3>
            From what it does,
            <br />
            to how it works.
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
          <button className="closing-link" onClick={() => openPanel("about")}>
            A little more about me <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="gallery-finale" ref={finale} inert>
          <h2>
            Let’s build something
            <br />
            worth understanding.
          </h2>
          <button className="contact-cta" onClick={() => openPanel("contact")}>
            LET’S TALK <span aria-hidden="true">→</span>
          </button>
          <div className="social-rail">
            <a
              href="https://github.com/NotTolerable"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
            >
              GH
            </a>
            <a
              href="https://linkedin.com/in/babisan-p"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn (opens in a new tab)"
            >
              in
            </a>
            <button
              onClick={() => openPanel("contact")}
              aria-label="Email Babisan"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m3 6 9 7 9-7" />
              </svg>
            </button>
          </div>
          <footer>
            © 2026 Babisan Pirapakaran <span>·</span>{" "}
            <button onClick={() => openPanel("credits")}>Credits</button>
            <span>·</span>
            <a href="/infrastructure">Infrastructure</a>
          </footer>
        </div>
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
          <span />
        </button>
        <output className="depth-meter" ref={depth} aria-label="Journey depth">
          −000 M
        </output>
      </div>
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
          {panel === "project" ? (
            <ProjectRecord id={exhibits[Math.max(0, active)].id} />
          ) : panel === "experience" ? (
            <ExperienceRecord />
          ) : panel === "about" ? (
            <AboutRecord />
          ) : panel === "skills" ? (
            <>
              <SkillsRecord />
              <a className="inline-link" href="/infrastructure">
                The cloud & infrastructure lab ↗
              </a>
            </>
          ) : panel === "contact" ? (
            <div className="contact-record">
              <p className="eyebrow">OPEN CHANNEL</p>
              <h2>
                A good place
                <br />
                to start.
              </h2>
              <p>
                Opportunities, systems, or something worth exploring. I’d love
                to hear from you.
              </p>
              <PublicContact />
              <div className="reading-links">
                <a
                  href="https://github.com/NotTolerable"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
                <a
                  href="https://linkedin.com/in/babisan-p"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
                <a href="/resume" target="_blank" rel="noopener">
                  View resume ↗
                </a>
              </div>
            </div>
          ) : panel === "credits" ? (
            <div>
              <p className="eyebrow">CREDITS & ACKNOWLEDGEMENTS</p>
              <h2>Behind the gallery.</h2>
              <p>
                Visual direction and journey reference:{" "}
                <a
                  href="https://samanastudio.es/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Samana Studio ↗
                </a>
                . Independently implemented for Babisan Pirapakaran with
                Three.js, GSAP, Lenis and Next.js.
              </p>
              <p>
                “Baby Angel Sculpture” by{" "}
                <a href="https://skfb.ly/6FPQp">M.Reslan</a> and “Statue Bust of
                Nike” by <a href="https://skfb.ly/oAvWs">skullreaper134</a>,
                licensed under{" "}
                <a href="https://creativecommons.org/licenses/by/4.0/">
                  CC BY 4.0
                </a>
                . Web geometry optimized by Samana Studio; scale and materials
                adapted here. Artworks are gallery illustrations, not project
                models.
              </p>
              <p>
                Ice geometry, processor, particle formation, shaders and
                portfolio interface are original to this implementation.
                Barramundi Fish by Microsoft is CC0, with resized textures and
                procedural motion. Studio Small 08 HDRI by Sergej Majboroda /
                Poly Haven is CC0. Geist is licensed under the SIL Open Font
                License.
              </p>
              <a href="/gallery/ATTRIBUTION.txt">Asset attribution record ↗</a>
            </div>
          ) : panel === "menu" ? (
            <div className="portfolio-menu">
              <p className="eyebrow">BABISAN PIRAPAKARAN</p>
              <h2>Find your way.</h2>
              <button onClick={() => go(0)}>
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
          ) : null}
        </div>
      </dialog>
    </main>
  );
}
