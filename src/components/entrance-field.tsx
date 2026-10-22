import { SLICE_STARTS } from "@/lib/entrance-timeline";

// A few precise lines carry the sequence; timing and depth supply the detail.
const perimeterCuts = [
  { left: "24%", top: "22%", angle: "-14deg" },
  { left: "80%", top: "30%", angle: "68deg" },
  { left: "20%", top: "79%", angle: "24deg" },
  { left: "77%", top: "84%", angle: "-32deg" },
];

export function EntranceField() {
  return (
    <div className="intro-cinema" aria-hidden="true">
      {SLICE_STARTS.map((_, index) => (
        <div className={`screen-slice screen-slice-${index}`} key={index}>
          <svg viewBox="-1000 -20 2000 40" preserveAspectRatio="none" fill="none">
            <g data-slice-stroke={index}>
              <path d="M-1000 0H1000" stroke="currentColor" strokeWidth="4" opacity=".08" vectorEffect="non-scaling-stroke" />
              <path d="M-1000 .1-100-1.1 80-.55 1000 0 80 .55-100 .7Z" fill="currentColor" />
              <path d="M-1000 0H1000" stroke="currentColor" strokeWidth=".65" vectorEffect="non-scaling-stroke" />
            </g>
            <g data-slice-seam={index}>
              <path d="M-1000-2H1000" stroke="currentColor" strokeWidth=".45" opacity=".5" vectorEffect="non-scaling-stroke" />
              <path d="M-1000 2H1000" stroke="currentColor" strokeWidth=".4" opacity=".18" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
        </div>
      ))}
      {perimeterCuts.map((cut, index) => (
        <div key={index} className="peripheral-slice" style={{ left: cut.left, top: cut.top, rotate: cut.angle }}>
          <svg viewBox="-1000 -10 2000 20" preserveAspectRatio="none" fill="none">
            <path data-slice-peripheral={index} pathLength="1" strokeDasharray="1" d="M-1000 0H1000" stroke="currentColor" strokeWidth=".5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      ))}
    </div>
  );
}
