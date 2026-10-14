"use client";

import { useEffect, useRef, useState } from "react";
import type { CubeInput } from "@/lib/cube-scene";
import { CubeRay } from "./cube-ray";

export function HeroCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{ reset(): void; dispose(): void } | null>(null);
  const input = useRef<CubeInput>({ paused: false, reduced: false, pressed: false, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<"loading" | "webgl" | "fallback">("loading");

  useEffect(() => {
    let active = true;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => { input.current.reduced = media.matches; };
    syncPreference();
    media.addEventListener("change", syncPreference);
    import("@/lib/cube-scene").then(({ createCubeScene }) => {
      if (!active || !canvasRef.current) return;
      try {
        sceneRef.current = createCubeScene(canvasRef.current, input.current);
        setMode("webgl");
      } catch {
        setMode("fallback");
      }
    }).catch(() => { if (active) setMode("fallback"); });
    return () => {
      active = false;
      media.removeEventListener("change", syncPreference);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  function togglePause() {
    input.current.paused = !input.current.paused;
    setPaused(input.current.paused);
  }

  function endDrag() {
    drag.current = null;
    input.current.pressed = false;
  }

  return (
    <figure className="cube-figure" data-renderer={mode}>
      <div className="cube-stage" tabIndex={mode === "webgl" ? 0 : -1} role={mode === "webgl" ? "group" : "img"} aria-label={mode === "webgl" ? "Interactive black cube with six mixed textures. Layers turn automatically. Move your mouse, drag on a touchscreen, or use arrow keys to rotate the whole cube. Press Space to pause animation." : "Static preview of a black geometric cube."}
        onKeyDown={(event) => {
          if (mode !== "webgl") return;
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
          if (event.key === "ArrowLeft") input.current.x -= 0.12;
          if (event.key === "ArrowRight") input.current.x += 0.12;
          if (event.key === "ArrowUp") input.current.y = Math.max(-1.35, input.current.y - 0.12);
          if (event.key === "ArrowDown") input.current.y = Math.min(1.35, input.current.y + 0.12);
          if (event.key === " ") togglePause();
        }}
        onPointerEnter={(event) => {
          if (mode !== "webgl" || event.pointerType !== "mouse") return;
          drag.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerDown={(event) => {
          if (mode !== "webgl" || event.button !== 0) return;
          drag.current = { x: event.clientX, y: event.clientY };
          input.current.pressed = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (mode !== "webgl") return;
          if (!drag.current && event.pointerType === "mouse") drag.current = { x: event.clientX, y: event.clientY };
          if (!drag.current) return;
          input.current.x += (event.clientX - drag.current.x) * 0.007;
          input.current.y = Math.max(-1.35, Math.min(1.35, input.current.y + (event.clientY - drag.current.y) * 0.0055));
          drag.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onLostPointerCapture={endDrag}
      >
        <CubeRay />
        <div className="cube-fallback" aria-hidden="true"><div className="fallback-face front" /><div className="fallback-face top" /><div className="fallback-face right" /></div>
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <figcaption className="cube-caption"><span className="mono">{mode === "fallback" ? "GEOMETRY STUDY / STATIC PREVIEW" : "SELF-SCRAMBLING / MOVE TO ROTATE"}</span><div className="cube-controls"><button type="button" disabled={mode !== "webgl"} aria-label={paused ? "Resume cube animation" : "Pause cube animation"} aria-pressed={paused} onClick={togglePause}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">{paused ? <path d="m5 3 7 5-7 5V3Z" stroke="currentColor" /> : <path d="M5 3v10m6-10v10" stroke="currentColor" />}</svg></button><button type="button" disabled={mode !== "webgl"} aria-label="Reset cube view" onClick={() => sceneRef.current?.reset()}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 6a5 5 0 1 1 0 4M3 2v4h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div></figcaption>
    </figure>
  );
}
