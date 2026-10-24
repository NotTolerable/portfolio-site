// Deterministic lobes and fine droplets make an ink splash without bitmap assets,
// turbulence filters, or a frame-by-frame particle simulation.
function splatShape(seed: number) {
  const points = Array.from({ length: 96 }, (_, i) => {
    const angle = i / 96 * Math.PI * 2;
    const radius = 1 + .09 * Math.sin(angle * 7 + seed) + .055 * Math.sin(angle * 13 - seed)
      + .22 * Math.pow(Math.max(0, Math.sin(angle * 11 + seed * 2)), 12);
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  });
  return points.map(([x, y], i) => {
    const previous = points[(i + 95) % 96], next = points[(i + 1) % 96];
    return `${i ? "" : `M${((x + previous[0]) / 2).toFixed(4)} ${((y + previous[1]) / 2).toFixed(4)}`}Q${x.toFixed(4)} ${y.toFixed(4)} ${((x + next[0]) / 2).toFixed(4)} ${((y + next[1]) / 2).toFixed(4)}`;
  }).join("") + "Z";
}

const splats = [
  { x: 690, y: 350, radius: 345, seed: 2 },
  { x: 130, y: 760, radius: 490, seed: 5 },
  { x: 190, y: 40, radius: 530, seed: 9 },
  { x: 720, y: 690, radius: 1070, seed: 12 },
];

/** White paper gives way to overlapping ink splashes. Difference blending keeps
 * the same page drawing legible on both the paper and the revealed dark theme. */
export function OpeningPaper() {
  return (
    <svg className="opening-paper" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <mask id="opening-paper-splatter" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
          <rect width="1000" height="1000" fill="white" />
          {splats.map(({ x, y, radius, seed }) => (
            <g key={seed} transform={`translate(${x} ${y}) scale(${radius})`} fill="black">
              <g data-paper-splat="">
                <path d={splatShape(seed)} />
                {Array.from({ length: 18 }, (_, i) => {
                  const angle = i * 2.39996 + seed;
                  const distance = 1.23 + (i % 5) * .065;
                  const cx = Math.cos(angle) * distance, cy = Math.sin(angle) * distance;
                  return <ellipse key={i} data-ink-droplet="" cx={cx} cy={cy} rx={.009 + (i % 4) * .006} ry={.018 + (i % 3) * .012} transform={`rotate(${angle * 180 / Math.PI - 90} ${cx} ${cy})`} />;
                })}
              </g>
            </g>
          ))}
        </mask>
      </defs>
      <rect width="1000" height="1000" fill="white" mask="url(#opening-paper-splatter)" />
    </svg>
  );
}
