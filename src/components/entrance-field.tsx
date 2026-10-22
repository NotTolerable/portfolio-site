// Original vector linework: layered cuts and engraving, rather than a burst icon.
export function EntranceField() {
  return (
    <svg className="intro-cinema" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="entrance-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><path d="M0 0V9" stroke="currentColor" strokeWidth=".7" /></pattern>
        <pattern id="entrance-dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="currentColor" /></pattern>
        <linearGradient id="entrance-edge"><stop stopColor="currentColor" stopOpacity="0" /><stop offset=".48" stopColor="currentColor" /><stop offset=".85" stopColor="currentColor" stopOpacity=".4" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient>
      </defs>
      <g data-entrance-effect="field" opacity=".25">
        <path d="M-160 100 650-80 1540 260 1500 340 580 42Z" fill="url(#entrance-hatch)" />
        <path d="M-100 790 540 540 1530 680 1490 960 620 760Z" fill="url(#entrance-dots)" />
        {Array.from({ length: 64 }, (_, i) => {
          const y = (i * 137 + 29) % 1050 - 70;
          const x = (i * 353 + 51) % 1800 - 180;
          const length = 95 + i % 9 * 24;
          return <path key={i} d={`M${x} ${y}l${length} ${-length * .36}`} stroke="currentColor" strokeWidth={i % 7 === 0 ? 2 : .5} opacity={.25 + i % 4 * .2} />;
        })}
      </g>
      <g data-entrance-effect="sweep" stroke="url(#entrance-edge)">
        <path d="M-240 830Q520 290 1710 64" strokeWidth="2" />
        <path d="M-240 840Q520 300 1710 74" strokeWidth=".5" />
        <path d="M-180 920Q560 340 1670 110" strokeWidth=".8" />
        <path d="M-100 740Q650 240 1600 35" strokeWidth=".4" />
      </g>
      <g data-entrance-effect="panel-0">
        <path d="M-100 780Q520 270 1590 60L1590 78Q520 290-100 805Z" fill="currentColor" />
        <path d="M-100 700 470 304 1590-60" stroke="currentColor" strokeWidth=".7" />
        <path d="M-120 845 550 380 1540 135 1600 450 1100 190 420 580Z" fill="url(#entrance-hatch)" opacity=".2" />
      </g>
      <g data-entrance-effect="panel-1">
        <path d="M-120 70Q540 610 1580 770L1580 793Q540 620-120 86Z" fill="currentColor" />
        <path d="M-140 35Q570 580 1600 720" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 28 }, (_, i) => <path key={i} d={`M${i * 63 - 100} ${i * 19 + 40}l${90 + i % 4 * 42} ${55 + i % 3 * 24}`} stroke="currentColor" strokeWidth={i % 4 === 0 ? 2 : .5} />)}
      </g>
      <g data-entrance-effect="panel-2">
        <path d="M-100 510Q620 490 1540 220L1540 233Q620 500-100 535Z" fill="currentColor" />
        <path d="M-140 600Q620 540 1580 270" stroke="currentColor" strokeWidth=".6" />
        <path d="M-80 680 600 480 1560 450 1560 470 580 510Z" fill="url(#entrance-dots)" opacity=".3" />
      </g>
      <g data-entrance-effect="registration" stroke="currentColor" opacity=".4">
        <path d="M28 78V28H78M1362 28h50v50M28 822v50h50M1362 872h50v-50" />
        <path d="M720 20v20M710 30h20M720 860v20M710 870h20" strokeWidth=".5" />
      </g>
    </svg>
  );
}
