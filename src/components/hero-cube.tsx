"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import type { CubeInput } from "@/lib/cube-scene";
import { CubeDrawing, type CubeDrawingHandle } from "./cube-drawing";
import { CUBE_REVEAL_START, markCubePrepared, subscribeEntrance } from "@/lib/entrance-timeline";

export function HeroCube({ scrollProgress }: { scrollProgress?: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<CubeDrawingHandle>(null);
  const sceneRef = useRef<{ dispose(): void } | null>(null);
  const input = useRef<CubeInput>({ paused: false, pressed: false, reduced: false, x: 0, y: 0, scroll: 0, entranceStartedAt: null, entranceActive: true });
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [prepared, setPrepared] = useState(false);
  const [mode, setMode] = useState<"loading" | "webgl" | "fallback">("loading");

  useEffect(() => {
    let active = true;
    let shown = false;
    let revealRequested = false;
    let revealTimer: number | undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncProgress = (progress: number) => { input.current.scroll = input.current.reduced ? 0 : progress; };
    const syncPreference = () => { input.current.reduced = media.matches; syncProgress(scrollProgress?.get() ?? 0); };
    syncPreference();
    media.addEventListener("change", syncPreference);
    const unsubscribe = scrollProgress?.on("change", syncProgress);
    function reveal() {
      if (!active || shown) return;
      revealRequested = true;
      input.current.entranceActive = false;
      if (!sceneRef.current) return;
      shown = true;
      window.clearTimeout(revealTimer);
      input.current.entranceStartedAt = performance.now();
      setMode("webgl");
    }
    const unsubscribeEntrance = subscribeEntrance((time) => {
      if (time !== null) {
        input.current.entranceActive = true;
        revealTimer = window.setTimeout(reveal, Math.max(0, time + CUBE_REVEAL_START - performance.now()));
      } else {
        queueMicrotask(() => {
          const entrance = document.documentElement.dataset.entrance;
          if (entrance !== "pending" && entrance !== "running") reveal();
        });
      }
    });
    // Prepare the first frame before drawing when assets arrive promptly. The
    // ready scene holds its pose until the final crossfade, then rotates at once.
    import("@/lib/cube-scene").then(async ({ createCubeScene }) => {
      if (!active || !canvasRef.current) return;
      try {
        const scene = await createCubeScene(canvasRef.current, input.current, (pitch, yaw) => drawingRef.current?.followPose(pitch, yaw));
        if (!active) { scene.dispose(); return; }
        sceneRef.current = scene;
        setPrepared(true);
        markCubePrepared();
        if (revealRequested) reveal();
      } catch {
        markCubePrepared();
        if (active) setMode("fallback");
      }
    }).catch(() => { markCubePrepared(); if (active) setMode("fallback"); });
    return () => {
      active = false;
      window.clearTimeout(revealTimer);
      media.removeEventListener("change", syncPreference);
      unsubscribe?.();
      unsubscribeEntrance();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [scrollProgress]);

  function endDrag() {
    drag.current = null;
    input.current.pressed = false;
  }

  return (
    <figure className="cube-figure" data-renderer={mode} data-prepared={prepared}>
      <div className="cube-stage" tabIndex={mode === "webgl" ? 0 : -1} role={mode === "webgl" ? "group" : "img"} aria-label={mode === "webgl" ? "Interactive black cube with six mixed textures. Rotates and scrambles automatically. Drag or use arrow keys to rotate. Press Space to pause or resume animation. Scroll to deconstruct the cube into particles." : "Static preview of a black geometric cube."}
        onKeyDown={(event) => {
          if (mode !== "webgl") return;
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
          if (event.key === "ArrowLeft") input.current.x -= 0.12;
          if (event.key === "ArrowRight") input.current.x += 0.12;
          if (event.key === "ArrowUp") input.current.y = Math.max(-1.35, input.current.y - 0.12);
          if (event.key === "ArrowDown") input.current.y = Math.min(1.35, input.current.y + 0.12);
          if (event.key === " " && !event.repeat) input.current.paused = !input.current.paused;
        }}
        onPointerDown={(event) => {
          if (mode !== "webgl" || event.button !== 0 || !event.isPrimary || drag.current) return;
          drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
          input.current.pressed = true;
          event.currentTarget.focus({ preventScroll: true });
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (mode !== "webgl" || !drag.current || drag.current.pointerId !== event.pointerId) return;
          if (event.pointerType === "mouse" && (event.buttons & 1) === 0) { endDrag(); return; }
          input.current.x += (event.clientX - drag.current.x) * 0.007;
          input.current.y = Math.max(-1.35, Math.min(1.35, input.current.y + (event.clientY - drag.current.y) * 0.0055));
          drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return;
          endDrag();
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => { if (drag.current?.pointerId === event.pointerId) endDrag(); }}
        onLostPointerCapture={endDrag}
      >
        <CubeDrawing ref={drawingRef} />
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
    </figure>
  );
}
