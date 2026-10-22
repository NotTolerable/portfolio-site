// Original ink/electrical drawings. Deterministic geometry keeps SSR and hydration identical.
const noise = (n: number) => { const x = Math.sin(n * 127.1 + 41.7) * 43758.5453; return x - Math.floor(x); };
function bolt(index: number, variant: number) {
  const angle = index / 13 * Math.PI * 2 + variant * .34 + (noise(index * 5 + variant) - .5) * .8;
  const length = 160 + noise(index + variant * 30) * 410;
  const points = Array.from({ length: 17 }, (_, j) => {
    const t = j / 16;
    const kink = j === 0 ? 0 : (noise(index * 19 + j + variant * 53) - .5) * 100 * Math.sin(t * Math.PI * .8);
    return [Math.cos(angle) * length * t - Math.sin(angle) * kink, Math.sin(angle) * length * t * .68 + Math.cos(angle) * kink];
  });
  const left: number[][] = [], right: number[][] = [];
  points.forEach(([x, y], j) => {
    const width = (1 - j / 16) * (2 + noise(j * 71 + index) * 10);
    left.push([x - Math.sin(angle) * width, y + Math.cos(angle) * width]);
    right.push([x + Math.sin(angle) * width, y - Math.cos(angle) * width]);
  });
  const line = (p: number[][]) => p.map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const branch = [4, 8, 11].map((j) => {
    const [x, y] = points[j], a = angle + (j % 2 ? -.7 : .9);
    return `M${x} ${y}l${Math.cos(a) * 35} ${Math.sin(a) * 35} ${Math.cos(a - .6) * 30} ${Math.sin(a - .6) * 30} ${Math.cos(a + .2) * 45} ${Math.sin(a + .2) * 45}`;
  }).join(" ");
  return { path: line(points), ribbon: line([...left, ...right.reverse()]) + "Z", branch };
}
const splat = Array.from({ length: 90 }, (_, i) => {
  const a = i / 90 * Math.PI * 2;
  const r = 65 + noise(i + 301) * 55 + (i % 7 === 0 ? 75 : 0);
  return `${i ? "L" : "M"}${(Math.cos(a) * r * 1.9).toFixed(1)} ${(Math.sin(a) * r * .45).toFixed(1)}`;
}).join(" ") + "Z";

export function EntranceField() {
  return (
    <div className="intro-cinema" aria-hidden="true">
      <svg className="impact-speed" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
        <g data-entrance-effect="speed" stroke="#ae253e">
          {Array.from({ length: 78 }, (_, i) => {
            const angle = i / 78 * Math.PI * 2;
            const x = Math.cos(angle), y = Math.sin(angle);
            const inner = 260 + noise(i) * 400;
            return <path key={i} d={`M${780 + x * inner} ${510 + y * inner * .65}l${x * 950} ${y * 650}`} strokeWidth={i % 9 === 0 ? 3 : .4 + noise(i) * 1.2} opacity={.1 + noise(i + 8) * .55} />;
          })}
        </g>
      </svg>
      <div className="impact-origin">
        <svg viewBox="-650 -450 1300 900" fill="none" overflow="visible">
          <defs>
            <pattern id="impact-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0V7" stroke="currentColor" strokeWidth=".7" /></pattern>
            <radialGradient id="impact-red"><stop stopColor="#e52b47" stopOpacity=".5" /><stop offset="1" stopColor="#a50022" stopOpacity="0" /></radialGradient>
          </defs>
          <g data-entrance-effect="charge">
            <path d="M-850-430-590-285-410-248-445-181-235-114-270-65-26-12" stroke="#9e1430" strokeWidth="21" />
            <path d="M-850-430-590-285-410-248-445-181-235-114-270-65-26-12" stroke="#040405" strokeWidth="15" />
            <path d="M-520-300-460-140-330-128-350-69-120-42" stroke="#ed3850" strokeWidth="1.4" />
            <path d="M-770-337-400-120-560-260-28-12-315-85Z" fill="#080406" stroke="#7b1228" />
          </g>
          <g data-entrance-effect="ink" fill="#020204" stroke="#8f1730" strokeWidth="1.5">
            <path d={splat} />
            {Array.from({ length: 54 }, (_, i) => {
              const a = noise(i * 5) * Math.PI * 2, r = 130 + noise(i + 37) * 260;
              return <ellipse key={i} cx={Math.cos(a) * r * 1.45} cy={Math.sin(a) * r * .35} rx={2 + noise(i + 12) * 13} ry={1 + noise(i + 25) * 4} transform={`rotate(${a * 180 / Math.PI})`} />;
            })}
          </g>
          {[0, 1, 2].map((variant) => <g key={variant} data-entrance-effect={`lightning-${variant}`}>
            <ellipse rx="380" ry="240" fill="url(#impact-red)" />
            {Array.from({ length: 13 }, (_, index) => {
              const drawing = bolt(index, variant), width = 4 + noise(index + variant) * 6;
              return <g key={index} strokeLinejoin="miter"><path d={drawing.path} stroke="#b51234" strokeWidth={width * .3} /><path d={drawing.ribbon} fill="#030204" stroke="#e02b47" strokeWidth="1.2" /><path d={drawing.branch} stroke="#e73550" strokeWidth="1.3" /><path d={drawing.path} stroke="#ff8290" strokeWidth=".45" transform="translate(2 -2)" /></g>;
            })}
          </g>)}
          {[0, 1, 2, 3].map((variant) => <g key={variant} data-entrance-effect={`cut-${variant}`} className={variant % 2 === 0 ? "impact-paper" : "impact-dark"}>
            <path d={splat} fill="currentColor" opacity=".35" transform={`rotate(${variant * 31 - 25}) scale(${.7 + variant * .1})`} />
            {Array.from({ length: 19 }, (_, i) => {
              const drawing = bolt(i, variant + 4);
              return <g key={i}><path d={drawing.ribbon} fill="currentColor" opacity={i % 3 === 0 ? 1 : .5} /><path d={drawing.path} stroke="currentColor" strokeWidth=".8" /><path d={drawing.branch} stroke="currentColor" strokeWidth=".7" /></g>;
            })}
            <path d={`M-1200 ${-550 + variant * 110} -480-168-530-148-210-76-270-86-34-14 40-10 160 60 100 21 520 ${160 - variant * 45}`} stroke="currentColor" strokeWidth={variant % 2 === 0 ? 10 : 6} />
            <path d="M-700-300-110-140 120-105 750 310 160 180-110 100Z" fill="url(#impact-hatch)" opacity=".5" />
            {Array.from({ length: 48 }, (_, i) => {
              const a = noise(i + variant * 9) * Math.PI * 2, r = 16 + noise(i + 17) * 140;
              return <path key={`scratch-${i}`} d={`M${Math.cos(a) * r} ${Math.sin(a) * r}l${Math.cos(a) * (6 + noise(i) * 100)} ${Math.sin(a) * (6 + noise(i) * 100)}`} stroke="currentColor" strokeWidth={.3 + noise(i + 8) * 1.5} />;
            })}
          </g>)}
          <g data-entrance-effect="wake" stroke="#c52e49">
            <ellipse rx="330" ry="120" transform="rotate(-24)" strokeWidth="2" strokeDasharray="420 60 160 80" />
            <ellipse rx="350" ry="128" transform="rotate(-24)" strokeWidth=".5" />
            <path d="M-600-210Q-120 210 610 80M-640-240Q-120 190 650 100" strokeWidth="1" />
          </g>
          <g data-entrance-effect="debris">
            {Array.from({ length: 86 }, (_, i) => {
              const a = noise(i + 440) * Math.PI * 2, r = 120 + noise(i + 51) * 340;
              const x = Math.cos(a) * r, y = Math.sin(a) * r * .7, size = 1 + noise(i + 84) * 9;
              return <path key={i} d={`M${x} ${y}l${size} ${-size * .7} ${size * .5} ${size * 1.6}Z`} fill={i % 4 === 0 ? "#f1b1b7" : "#ac263e"} />;
            })}
          </g>
          <g data-entrance-effect="afterimage" stroke="#6c3842" strokeWidth=".65">
            {Array.from({ length: 18 }, (_, i) => <path key={i} d={bolt(i, 7).path} />)}
          </g>
        </svg>
      </div>
    </div>
  );
}
