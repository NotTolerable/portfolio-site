import { ENTRANCE_DURATION } from "./entrance-timeline";

type Animate = (element: Element, frames: Keyframe[], duration: number, delay?: number, easing?: string) => void;
const ns = "http://www.w3.org/2000/svg";
function svgNode<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>) {
  const node = document.createElementNS(ns, tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
  return node;
}
function inkPath(path: SVGPathElement, animate: Animate, duration: number, delay: number) {
  const length = path.getTotalLength() + 1;
  animate(path, [{ strokeDasharray: `${length} ${length}`, strokeDashoffset: length }, { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 }], duration, delay, "cubic-bezier(.38,0,.2,1)");
}

/** Draw the actual first viewport's typesetting and controls as an inked cel. */
export function preparePageInk(animate: Animate) {
  const width = window.innerWidth, height = window.innerHeight;
  const overlay = svgNode("svg", { class: "opening-drawing", viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true", focusable: "false" });
  overlay.style.width = `${width}px`;
  overlay.style.height = `${height}px`;
  document.body.append(overlay);
  const cleanup = () => overlay.remove();
  try {
    const sketch = svgNode("g", { fill: "none", stroke: "#a6bbc6", "stroke-linecap": "round", "stroke-linejoin": "round", "data-page-sketch": "" });
    overlay.append(sketch);
    // Loose, curved animation-layout marks live in the margins and negative
    // space. Fine companion strokes suggest pencil pressure, without filters.
    const margin = width < 761 ? 8 : Math.max(24, (width - 1200) / 2 - 26);
    const marks = [
      `M${margin} ${height * .21}Q${margin - 4} ${height * .44} ${margin + 2} ${height * .61}`,
      `M${width - margin} ${height * .18}Q${width - margin + 5} ${height * .43} ${width - margin - 3} ${height * .64}`,
      `M${margin + 10} ${height - 59}Q${width * .36} ${height - 64} ${width * .52} ${height - 58}`,
      `M${width * .69} 100Q${width * .91} 73 ${width - margin} 126`,
    ];
    marks.forEach((d, index) => {
      const path = svgNode("path", { d, "stroke-width": index === 2 ? .55 : .85, opacity: .3 });
      sketch.append(path);
      inkPath(path, animate, 950, 100 + index * 150);
    });
    // Small tapered pencil ticks give the drawing an illustrated finish rather
    // than a perfectly uniform technical wireframe.
    for (let i = 0; i < (width < 761 ? 8 : 14); i++) {
      const x = width - margin - 8 - i * (width < 761 ? .75 : 3.2), y = height * .68 + i * 2.5;
      const path = svgNode("path", { d: `M${x} ${y}q-5 6 -7 ${10 + i % 3 * 3}`, "stroke-width": i % 3 === 0 ? 1.05 : .45, opacity: .28 });
      sketch.append(path);
      inkPath(path, animate, 260, 800 + i * 30);
    }
    animate(sketch, [{ opacity: 0, offset: 0 }, { opacity: 1, offset: .18 }, { opacity: 1, offset: .64 }, { opacity: 0, offset: 1 }], 2900, 0, "linear");

    const sources = new Map<HTMLElement, string>();
    const blocks: [string, number, number][] = [
      [".brand-initials", 100, 35], [".site-header nav", 180, 65], [".header-note", 300, 25],
      [".intro-overline .section-index", 450, 40], [".intro-greeting", 650, 60],
      [".intro-copy p:not(.intro-greeting)", 950, 42], [".intro-work-link", 1550, 60], [".intro-footer", 1800, 28],
    ];
    blocks.forEach(([selector, start, stagger]) => {
      let cursor = start;
      document.querySelectorAll<HTMLElement>(selector).forEach((block) => {
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const parent = node.parentElement;
          if (!parent || parent.closest("svg")) continue;
          const style = getComputedStyle(parent), size = Number.parseFloat(style.fontSize);
          const value = node.textContent ?? "";
          for (const word of value.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, word.index);
            range.setEnd(node, word.index + word[0].length);
            const box = range.getBoundingClientRect();
            if (!box.width || !box.height || box.top >= height || box.bottom <= 0) continue;
            sources.set(parent, style.color);
            const text = svgNode("text", { x: box.x, y: box.y + size, "font-family": style.fontFamily, "font-size": size, "font-weight": style.fontWeight, "letter-spacing": style.letterSpacing, fill: style.color, stroke: style.color, "stroke-width": size < 11 ? .35 : .55, "stroke-linejoin": "round", "data-page-lettering": "" });
            text.textContent = word[0];
            overlay.append(text);
            text.setAttribute("y", String(box.y + size + box.y - text.getBoundingClientRect().y));
            const dash = size * 12;
            const dashArray = `${dash} ${dash}`;
            animate(text, [
              { offset: 0, strokeDasharray: dashArray, strokeDashoffset: dash, fillOpacity: 0, strokeOpacity: .75 },
              { offset: .4, strokeDasharray: dashArray, strokeDashoffset: dash * .15, fillOpacity: 0, strokeOpacity: .75 },
              { offset: .7, strokeDasharray: dashArray, strokeDashoffset: 0, fillOpacity: .65, strokeOpacity: .35 },
              { offset: 1, strokeDasharray: dashArray, strokeDashoffset: 0, fillOpacity: 1, strokeOpacity: 0 },
            ], 520, cursor, "linear");
            cursor += stagger;
          }
        }
      });
    });
    sources.forEach((color, element) => animate(element, [{ color: "transparent", offset: 0 }, { color: "transparent", offset: .94 }, { color, offset: 1 }], ENTRANCE_DURATION, 0, "linear"));

    document.querySelectorAll<HTMLElement>(".brand-symbol, .intro-work-link").forEach((control, index) => {
      const box = control.getBoundingClientRect(), r = index === 0 ? 10 : 8;
      const { x, y, width: w, height: h } = box;
      const d = `M${x + r} ${y}Q${x + w * .5} ${y - .6} ${x + w - r} ${y}Q${x + w} ${y} ${x + w} ${y + r}L${x + w} ${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}Q${x + w * .5} ${y + h + .5} ${x + r} ${y + h}Q${x} ${y + h} ${x} ${y + h - r}L${x} ${y + r}Q${x} ${y} ${x + r} ${y}Z`;
      const outline = svgNode("path", { d, fill: "none", stroke: "#b2c8d4", "stroke-width": .85, "stroke-linecap": "round", "data-page-contour": "" });
      overlay.append(outline);
      inkPath(outline, animate, 800, index === 0 ? 30 : 1200);
      animate(control, [{ opacity: 0 }, { opacity: 1 }], 700, index === 0 ? 1000 : 1950);
    });
    const mark = document.querySelector<SVGSVGElement>(".brand-mark");
    if (mark) {
      const box = mark.getBoundingClientRect();
      const drawing = mark.cloneNode(true) as SVGSVGElement;
      drawing.setAttribute("x", String(box.x)); drawing.setAttribute("y", String(box.y));
      drawing.setAttribute("width", String(box.width)); drawing.setAttribute("height", String(box.height));
      drawing.removeAttribute("class"); drawing.style.color = "#c5d6df";
      overlay.append(drawing);
      drawing.querySelectorAll<SVGPathElement>("path").forEach((path, i) => inkPath(path, animate, 650, 90 + i * 100));
    }
    animate(overlay, [{ opacity: 1 }, { opacity: 0 }], 180, ENTRANCE_DURATION - 180);

    document.querySelectorAll<SVGPathElement>("[data-cube-contour]").forEach((path, i) => {
      inkPath(path, animate, 950, 130 + i * 24);
      animate(path, [{ stroke: "#d1e0e5" }, { stroke: "#7b939f" }], 2200, 1000);
    });
    document.querySelectorAll<SVGPathElement>("[data-cube-pencil] path").forEach((path, i) => inkPath(path, animate, 500, 50 + i * 32));
    document.querySelectorAll<SVGPathElement>("[data-cube-hatch]").forEach((path, i) => inkPath(path, animate, 650, 850 + i * 38));
    const silhouette = document.querySelector<SVGPathElement>("[data-cube-silhouette]");
    if (silhouette) inkPath(silhouette, animate, 1300, 100);
    const screentone = document.querySelector("[data-cube-screentone]");
    if (screentone) animate(screentone, [{ opacity: 0 }, { opacity: .32 }], 950, 1300);
    const tone = document.querySelector("[data-cube-tone]");
    if (tone) animate(tone, [{ opacity: 0 }, { opacity: 1 }], 1100, 1500);
    const pencil = document.querySelector("[data-cube-pencil]");
    if (pencil) animate(pencil, [{ opacity: 0, offset: 0 }, { opacity: .55, offset: .3 }, { opacity: .18, offset: 1 }], 2200);
    const gesture = document.querySelector(".cube-gesture");
    if (gesture) animate(gesture, [{ opacity: 0, offset: 0 }, { opacity: .7, offset: .25 }, { opacity: .7, offset: .6 }, { opacity: 0, offset: 1 }], 2200, 300);
    document.querySelectorAll<SVGPathElement>("[data-cube-gesture]").forEach((path, i) => inkPath(path, animate, 750, 400 + i * 120));
    return cleanup;
  } catch (error) { cleanup(); throw error; }
}
