"use client";

import { useEffect, useRef, useState } from "react";
import { projectCubeDrawing } from "@/lib/cube-drawing";

export function CubeDrawing() {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 1280, height: 900 });
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() => setSize({ width: parent.clientWidth || 1280, height: parent.clientHeight || 900 }));
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  const { faces, silhouette, bounds: b } = projectCubeDrawing(size.width, size.height);
  const shades = ["#10181d", "#182128", "#0e1419", "#1d282e", "#111a20"];
  return (
    <svg ref={ref} className="cube-fallback cube-drawing" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <defs><pattern id="cube-ink-screentone" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".75" fill="#b2c6ce" /></pattern></defs>
      <g data-cube-tone="" stroke="none">{faces.map((face, i) => <path key={face.id} d={face.d} fill={shades[(i * 7 + face.side) % shades.length]} />)}</g>
      <g data-cube-screentone="" opacity=".32">{faces.filter((_, i) => i % 7 === 2).map((face) => <path key={face.id} d={face.d} fill="url(#cube-ink-screentone)" />)}</g>
      <path data-cube-silhouette="" d={silhouette} fill="none" stroke="#d6e2e6" strokeWidth="2.7" strokeLinejoin="round" />
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        {faces.map((face, i) => <path key={face.id} data-cube-contour="" d={face.d} stroke="#7b939f" strokeWidth={i % 4 === 0 ? 1.85 : 1.05} />)}
        <g data-cube-pencil="" opacity=".18" transform="translate(1.3 -.7)" stroke="#a5bdca" strokeWidth=".55">{faces.filter((_, i) => i % 2 === 0).map((face) => <path key={face.id} d={face.d} />)}</g>
        <g data-cube-hatching="" stroke="#8ca4b0" strokeWidth=".65" opacity=".3">{faces.filter((_, i) => i % 3 !== 1).map((face) => <path key={face.id} data-cube-hatch="" d={face.hatch} />)}</g>
        <g className="cube-gesture" stroke="#b3cbd5" opacity="0">
          <path data-cube-gesture="" d={`M${b.left - 17} ${b.bottom - 25}Q${b.left - 86} ${(b.top + b.bottom) / 2} ${b.left - 26} ${b.top + 62}`} strokeWidth="1.3" />
          <path data-cube-gesture="" d={`M${b.right + 20} ${b.top + 50}Q${b.right + 69} ${(b.top + b.bottom) / 2} ${b.right + 18} ${b.bottom - 70}`} strokeWidth=".7" />
          <path data-cube-gesture="" d={`M${b.left + 75} ${b.top - 22}Q${(b.left + b.right) / 2} ${b.top - 58} ${b.right - 48} ${b.top - 7}`} strokeWidth="1.1" />
        </g>
      </g>
    </svg>
  );
}
