# Samana Studio reference study

Inspected 2026-10-25 using installed Chrome, live rendered screenshots at ten progress positions, DOM/CSS, public application bundle/runtime and public credits. Measurements describe the observed version, not a claim that its internals will never change.

## Verified findings

- The live https://samanastudio.es/ is a dark underwater gallery, not a nighttime street. Three ice-encased sculptures lead into a particle S and fish/contact finale.
- Runtime canvas reports Three.js r180. Public bundle identifies GSAP/ScrollTrigger3.15.0 and Lenis1.3.23. [Credits](https://samanastudio.es/credits/) explicitly confirms Three.js, GSAP, Vite and Geist. React/R3F was not found or needed for the measured renderer.
- One 35° perspective camera traverses a1014vh scroll proxy. Each sculpture receives three separate authored camera/aim poses; interpolation is smoothstep and scroll/camera values are damped. The final sequence descends to y=-84, holds its closing composition, then reaches camera y=-118.
- Exhibit centers are `(0,0,0)`, `(-6,-2,-44)` and `(5,1.5,-86)` with max extents3.6,6,4.5. Shot spans normalize `[0,.25,.5,1.5,1.75,2,3,3.25,3.5,5,5.9,7.1]` by7.1.
- Three frame directions are normalized `(.39,.185,.889)`, `(.62,-.05,.78)` and `(-.75,.08,.66)` with size-relative distances3,2.05,2.3. Closing camera `(0,-84,-88)` aims `(0,-84,-128)`; final camera `(0,-118,-104)` aims `(0,-122,-150)`.
- ACES Filmic/sRGB, cool PMREM environment lighting, physical frost/transmission, depth fog, marine particles and custom atmospheric/travel passes establish the appearance. No standard BloomPass was identified.
- The S is a dense point-volume with white/cyan displacement response, not a solid hologram mesh. A moving fish disturbs its formation. The full GPGPU implementation is reference-specific.
- Fixed upper-left wordmark, lower-left exhibit title/subtitle/monospace phrases, projected circular hotspots, right detail HUD, lower-right depth meter, left closing manifesto and centered contact screen define the HTML composition. Loader uses off-white typography and six alternating vertical shutters.

## Implementation mapping

The redesign follows these measured spatial layouts and scroll regions while keeping Next.js content/routing. Three.js/GSAP remain; Lenis and self-hosted Geist are the only new dependencies. Independently authored shaders/scene/control code replace the earlier world provider. The original S becomes an85k/34k point processor with cursor displacement; original source/data/simulation code is not transplanted.

Three portfolio chapters replace the original commercial prose. Direct experience/resume/menu controls keep recruiter access practical. Native dialog records intentionally provide stronger keyboard and focus semantics. Readable fallback, infrastructure planning and the exact PDF are preserved.

## Fidelity boundaries

Licensed angel/Nike derivatives match two source sculptures. Ice hulls/material detail are original approximations, the third exhibit is an original processor, and the closing fish is a separate CC0 model. A CC0 Studio Small 08 HDRI replaces the unidentified HDR; atmosphere/transition shaders are independent. The particle processor uses analytic vertex displacement rather than the reference’s GPGPU spring/fish simulation. These differences are explicit, not verified one-to-one reproduction claims.

Browser comparison covers desktop1440×900 and narrow390×844 framing; automated checks cover additional narrow widths, reversal, dialogs, keyboard, reduced motion and fallback. Specific device frame rates and exact optical equivalence are not established by this study.

## Local verification — 2026-10-25

- Production build, ESLint and TypeScript checks pass.
- Full production suite: 20 passed, including resume PDF/download, reversible gallery travel, focus and panel scrolling, narrow-screen accessibility, reading/no-script mode, unavailable/missing graphics assets, real context loss and early loader skip. After the final ice-surface/fish-material changes, all nine gallery checks were rerun and passed.
- Final Chrome review at 1440×900/DPR1 and 390×844 showed no console errors or horizontal overflow. A short 120-callback desktop animation-frame sample had median and p95 intervals of16.7ms. This is a local browser cadence sample, not a sustained GPU benchmark or a cross-device guarantee.
- The reference’s ice and processor simulation remain approximations; licensed sculpture matching, palette, framing, shot timing and page structure are verified against the observed reference. No claim of pixel-identical rendering is made.
- The redesign is local; no GitHub push, production merge or deployment was performed.
