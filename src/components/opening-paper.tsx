/** White paper turns to the permanent dark canvas through overlapping ink washes.
 * Difference blending keeps the existing light drawing legible as dark ink on
 * the untouched paper, without animating a second copy of the page colors. */
export function OpeningPaper() {
  return (
    <svg className="opening-paper" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <mask id="opening-paper-wash" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
          <rect width="1000" height="1000" fill="white" />
          <g fill="none" stroke="black" strokeLinecap="round" strokeLinejoin="round">
            <path data-paper-brush="" strokeWidth="560" d="M-360 -120C-70 50 390 60 720 45S1240 15 1370 200" />
            <path data-paper-brush="" strokeWidth="680" d="M1420 440C1120 240 640 430 310 480S-180 620 -420 620" />
            <path data-paper-brush="" strokeWidth="760" d="M-440 1140C-90 850 310 840 700 910S1150 1120 1440 1010" />
          </g>
        </mask>
      </defs>
      <rect width="1000" height="1000" fill="white" mask="url(#opening-paper-wash)" />
    </svg>
  );
}
