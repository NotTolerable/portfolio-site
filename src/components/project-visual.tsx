import { useId } from "react";
/** Abstract subject illustrations; these are not screenshots or product UIs. */
export function ProjectVisual({ kind }: { kind: "governance" | "interview" | "axiom" }) {
  const uid = useId();
  return (
    <div className={`project-visual project-visual-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 600 360" fill="none">
        <defs><pattern id={`${uid}-grid`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" stroke="currentColor" strokeOpacity=".07" /></pattern></defs>
        <rect width="600" height="360" fill={`url(#${uid}-grid)`} />
        {kind === "axiom" ? <>
          <path d="M70 180h80m300 0h80" stroke="currentColor" strokeWidth="2" />
          <rect x="150" y="70" width="300" height="220" rx="5" fill="#152a35" stroke="currentColor" strokeWidth="2" />
          <path d="M300 90v180M170 120h260" stroke="currentColor" strokeOpacity=".4" />
          {[0,1,2,3,4].map((row) => <g key={row}><rect x={190+row*13} y={143+row*24} width={86-row*13} height="10" fill="currentColor" opacity={.25+row*.1} /><rect x="324" y={143+row*24} width={22+row*13} height="10" fill="#d4a678" opacity={.35+row*.1} /></g>)}
          <path d="m82 225 32-24 25 9 30-45 30 12 25-35 20 8 36-42m80 130 24-21 24 7 35-42 25 9 28-40" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="70" cy="180" r="7" fill="currentColor" /><circle cx="530" cy="180" r="7" fill="currentColor" />
        </> : kind === "governance" ? <>
          <path d="M80 180h98m244 0h98M300 48v48m0 168v48" stroke="currentColor" strokeOpacity=".35" strokeDasharray="3 7" />
          <rect x="194" y="74" width="212" height="212" rx="8" transform="rotate(12 300 180)" stroke="currentColor" strokeOpacity=".15" />
          <rect x="194" y="74" width="212" height="212" rx="8" transform="rotate(-8 300 180)" stroke="currentColor" strokeOpacity=".25" />
          <rect x="194" y="74" width="212" height="212" rx="2" fill="#152a35" stroke="currentColor" strokeWidth="2" />
          <path d="m300 110 47 19v44c0 39-47 66-47 66s-47-27-47-66v-44l47-19Z" stroke="currentColor" strokeWidth="1.3" />
          <path d="m278 174 16 16 30-34" stroke="currentColor" strokeWidth="1.6" />
          {[96, 156, 216].map((y, i) => <g key={y}><rect x="89" y={y} width="34" height="30" rx="3" stroke="currentColor" strokeOpacity=".4" /><path d={`M98 ${y + 10}h16m-16 7h${i === 1 ? 10 : 16}`} stroke="currentColor" strokeOpacity=".5" /></g>)}
          {[126, 180, 234].map((y) => <g key={y}><circle cx="490" cy={y} r="11" stroke="currentColor" strokeOpacity=".5" /><path d={`m486 ${y} 3 3 5-6`} stroke="currentColor" /></g>)}
          <path d="M224 253h66m9 0h22" stroke="currentColor" strokeOpacity=".25" />
        </> : <>
          <rect x="160" y="46" width="280" height="268" rx="6" stroke="currentColor" strokeOpacity=".15" />
          <path d="M160 82V46h36m208 0h36v36M160 278v36h36m208 0h36v-36" stroke="currentColor" strokeWidth="1.5" />
          <path d="M239 120c10-62 112-62 122 0l-9 87-52 52-52-52-9-87Z" stroke="currentColor" strokeOpacity=".55" />
          <path d="m239 120 61-19 61 19-23 39-38-58-38 58 38 20 38-20m-76 0-14 48 52-28 52 28-14-48M248 207l52 25 52-25m-52-28v53m-35-12 35 39 35-39" stroke="currentColor" strokeOpacity=".25" />
          {[[239,120],[300,101],[361,120],[262,159],[338,159],[300,179],[248,207],[352,207],[300,232],[300,259]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" />)}
          <path d="M123 179h354" stroke="currentColor" strokeOpacity=".6" /><path d="M83 179h18m398 0h18" stroke="currentColor" strokeOpacity=".3" />
          <circle cx="285" cy="160" r="2.5" fill="currentColor" /><circle cx="315" cy="160" r="2.5" fill="currentColor" />
        </>}
      </svg>
      <span className="visual-coordinate">{kind === "governance" ? "01 / RULES & REASONING" : kind === "interview" ? "02 / VISION & INTERACTION" : "03 / MARKET DATA & EXECUTION"}</span>
      <span className="visual-caption">CONCEPT ILLUSTRATION</span>
    </div>
  );
}
