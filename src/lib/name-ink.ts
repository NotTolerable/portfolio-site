import { ENTRANCE_DURATION } from "./entrance-timeline";

// Centerline pen routes, hand-authored for the self-hosted Playfair Display 400.
// Coordinates use its 1,000-unit em and baseline. The real font clips each brush
// stroke, preserving the original serif silhouette rather than tracing contours.
type Stroke = readonly [path: string, width: number];
const strokes: Record<string, readonly Stroke[]> = {
  B: [["M170 706V4", 106], ["M42 698H305", 28], ["M216 698H290Q480 698 480 540Q480 370 283 369H216", 108], ["M216 370H300Q528 370 528 198Q528 12 291 12H216", 112], ["M42 10H338", 30]],
  a: [["M115 446Q151 523 250 519Q365 519 365 408V73Q365 -25 491 39", 104], ["M326 330C325 262 82 280 82 121Q82 12 207 12Q281 12 331 109", 96], ["M118 465V358", 116]],
  b: [["M125 775V-6", 108], ["M4 762H126", 30], ["M166 376Q205 514 312 514Q468 514 468 257Q468 -3 285 -3Q211 -3 166 58", 106]],
  i: [["M150 521V9", 104], ["M29 505H190", 32], ["M29 10H271", 30], ["M143 766V636", 130]],
  s: [["M365 528V413", 34], ["M365 435Q326 520 214 520Q98 520 98 426C98 310 355 274 355 116Q355 -3 222 -3Q85 -3 71 132", 104], ["M70 -7V193", 30]],
  n: [["M150 522V8", 104], ["M29 505H190", 30], ["M194 343Q222 513 350 513Q462 513 462 382V6", 108], ["M29 10H261M350 10H582", 32]],
  P: [["M170 706V4", 106], ["M42 698H305", 28], ["M216 698H290Q506 698 506 505Q506 296 283 296H216", 110], ["M42 10H317", 30]],
  r: [["M150 521V8", 104], ["M29 505H190", 30], ["M193 343Q235 515 339 515Q405 515 379 441", 82], ["M374 494V387", 112], ["M29 10H301", 30]],
  p: [["M143 522V-176", 108], ["M22 505H186", 32], ["M183 373Q230 514 333 514Q486 514 486 267Q486 -3 294 -3Q219 -3 184 66", 108], ["M32 -170H284", 32]],
  k: [["M141 776V7", 108], ["M20 762H141", 30], ["M460 504L276 313Q230 274 183 277", 50], ["M247 288L435 9", 102], ["M304 505H504M20 10H252M351 10H543", 30]],
};

const ns = "http://www.w3.org/2000/svg";
function svgElement<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>) {
  const element = document.createElementNS(ns, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

/** Prepare once after fonts load. No measurement or React updates on frames. */
export function prepareNameInk(word: HTMLElement, id: string, delay: number, animate: (element: Element, frames: Keyframe[], duration: number, delay: number, easing?: string) => void) {
  const text = word.querySelector<HTMLElement>(".name-ink-text");
  if (!text) throw new Error("Missing name text");
  const value = text.textContent ?? "";
  const style = getComputedStyle(word);
  const size = Number.parseFloat(style.fontSize);
  const box = word.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(text);
  // Calibrate the SVG baseline against the browser's actual font metrics. This
  // also accounts for subpixel rounding at each responsive font size.
  let baseline = 1000;
  const width = box.width * 1000 / size;
  const height = box.height * 1000 / size;
  const svg = svgElement("svg", { class: "name-ink", viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true", focusable: "false" });
  const definitions = svgElement("defs", {});
  const typesetting = svgElement("text", { x: 0, y: baseline, "font-size": 1000, "letter-spacing": Number.parseFloat(style.letterSpacing) * 1000 / size, fill: "currentColor" });
  typesetting.textContent = value;
  svg.append(definitions, typesetting);
  word.append(svg);
  baseline += (range.getBoundingClientRect().top - typesetting.getBoundingClientRect().top) * 1000 / size;
  typesetting.setAttribute("y", String(baseline));
  const cleanup = () => { svg.remove(); delete word.dataset.ink; };
  try {
    let cursor = delay;
    for (const [index, letter] of [...value].entries()) {
      const routes = strokes[letter];
      if (!routes) throw new Error(`Missing pen route: ${letter}`);
      const position = typesetting.getStartPositionOfChar(index);
      const advance = typesetting.getEndPositionOfChar(index).x - position.x;
      const maskId = `${id}-${index}`;
      const mask = svgElement("mask", { id: maskId, maskUnits: "userSpaceOnUse", x: position.x - 120, y: 0, width: advance + 240, height, "mask-type": "luminance" });
      const pen = svgElement("g", { transform: `translate(${position.x} ${baseline}) scale(1 -1)`, fill: "none", stroke: "white", "stroke-linecap": "butt", "stroke-linejoin": "round" });
      mask.append(pen);
      definitions.append(mask);
      const glyph = svgElement("text", { x: position.x, y: baseline, "font-size": 1000, fill: "currentColor", mask: `url(#${maskId})` });
      glyph.textContent = letter;
      svg.append(glyph);
      const paths = routes.map(([d, brush]) => {
        const path = svgElement("path", { d, "stroke-width": brush });
        pen.append(path);
        return path;
      });
      const lengths = paths.map((path) => path.getTotalLength());
      const total = lengths.reduce((sum, length) => sum + length, 0);
      let strokeStart = cursor;
      paths.forEach((path, stroke) => {
        const length = lengths[stroke];
        const duration = 70 + 470 * length / total;
        animate(path, [
          { strokeDasharray: `${length + 1} ${length + 1}`, strokeDashoffset: length + 1 },
          { strokeDasharray: `${length + 1} ${length + 1}`, strokeDashoffset: 0 },
        ], duration, strokeStart, "cubic-bezier(.35,0,.25,1)");
        strokeStart += duration * .78;
      });
      // A short finishing pass catches fine serif corners after the pen routes.
      // It is local to a completed letter, never a wipe across the name.
      const finish = svgElement("rect", { x: position.x - 100, y: 0, width: advance + 200, height, fill: "white" });
      mask.append(finish);
      animate(finish, [{ opacity: 0 }, { opacity: 1 }], 140, strokeStart);
      cursor += 85 + advance * .065;
    }
    typesetting.remove();
    word.dataset.ink = "drawing";
    // Blend back to selectable HTML after the last serif is complete. SVG and
    // HTML can rasterize fine edges differently, even with identical bounds.
    animate(svg, [{ opacity: 1 }, { opacity: 0 }], 160, ENTRANCE_DURATION - 160);
    animate(text, [{ opacity: 0 }, { opacity: 1 }], 160, ENTRANCE_DURATION - 160);
    return cleanup;
  } catch (error) { cleanup(); throw error; }
}
