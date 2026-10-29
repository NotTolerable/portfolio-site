# Igloo interaction study — 2026-10-28, refined 2026-10-29

## Scope and evidence

The live [Igloo Inc.](https://www.igloo.inc/) experience was inspected in Chrome through arrival, artifacts, opening/closing records, transition and final particle scene. The publicly served client was inspected to verify mechanisms and cue timing. This is a behavioral study; no application code, models, textures or recordings from the reference were added to the portfolio. Sections below preserve the sequence of implemented refinements; the latest arrival/audio requirement is [0017](../decisions/0017-multilingual-arrival-and-ambient-score.md).

## Rendered observations

Artifacts have rough, thick edges surrounding a clearer internal volume. Moving over an artifact clears a smooth local window with tiny luminous triangular traces. Sparse fine connections and markers remain close to the artifact. Detail records use restrained mono text over a dimmed, closer composition. Fog, particles, distant blurred forms and luminous boundaries establish depth. The final particle field visibly responds to the pointer. Its Arctic colors, infinite-loop navigation and proprietary terrain are not this portfolio’s direction.

## Verified mechanisms

- Cursor strokes feed a decaying, advected frost texture. The material reduces roughness and normal-map strength in the trail, adjusts refraction, and lights a small moving frontier. The effect is more than hover rotation.
- Artifact motion combines scroll-authored rotation and subtle elapsed-time motion. Opening reduces idle movement and approaches over approximately 1.25 seconds; closing restores it over approximately 1.45 seconds.
- Eighteen local plexus nodes allow at most three connections each. Connection growth/fade takes roughly 0.35 seconds.
- Background depth uses multiple noise scales, scroll-coupled fog, particles and separate blurred forms. Major scene transitions combine camera movement and displaced refraction/compositing.
- Audio is layered: music, room, wind, object contact, geometric/particle fields, several hover variants, selection, record entry/exit and text reveal. Object contact intensity follows pointer velocity. Label/reveal beeps are rate-limited; this does not establish per-character typing samples.
- Dependency banners identify Three.js, GSAP and postprocessing. These library licenses do not license the application’s authored assets.

The exact audible timbre of all reference recordings was not established by muted/headless inspection. Their cue roles and scheduling were verified in the client. The site displays All Rights Reserved; no reusable license for authored audio was found. No audio was copied or hotlinked.

## Initial portfolio adaptation (historical; superseded below)

The implementation uses charcoal mineral ice and a blue-hour sky rather than Arctic terrain. A bounded 12-contact object-space history approximates a fading polish/refraction trail without a separate full-resolution frost simulation; cheaper tiers evaluate four contacts. Physical HDR reflection remains responsible for lighting. Sparse local geometric connections respond to the same hover state.

The third shell erodes into a gathering volumetric processor field. The camera descends toward a progressively visible horizon/cloud deck; the processor disperses before the full resume. The previous physical pedestal and fast meteor effects are removed. Unlike Igloo’s infinite journey, this portfolio has finite scroll, named destinations, direct records and a reading fallback.

The soundscape is original reusable buffer synthesis with shared short room processing: harmonic atmosphere, travel/contact textures, varied tactile hover/text cues, record latches, transition swells and arrival resonance. An explicit toggle, master dynamics, voice bounds and hidden-tab suspension keep it controlled.

See [decision 0015](../decisions/0015-nightfall-contact-and-atmosphere.md), its [0016 refinement](../decisions/0016-frost-frontier-and-modern-gpu.md), [design](../../DESIGN.md) and [architecture](../architecture.md) for the active contract.

## Verification of the initial adaptation

Production build, ESLint and TypeScript passed. The complete production browser suite passed 33 checks. After the final compact camera/input adjustments, four affected checks passed again: camera continuity, mobile/accessibility/resume bounds, all manual shader quality modes, and first-touch dragging. Direct records, labeled reversible travel, opt-in/mute audio, graphic adaptation, loading failure, no-script reading and existing routes remain covered.

Chrome visual review covered 1440×900, 390×844, 320×500 and 640×360. The compact processor was repositioned/scaled to keep the heading, record action and controls clear. No console errors or horizontal overflow appeared. Native Web Audio checks verified muted output, distinct nonzero cue output, bounded peaks, suspend/resume and context cleanup. These checks do not establish identical sound timbre or frame rates on the owner’s Windows/mobile hardware.

The review server remains at `http://localhost:3000`. No package installation, Git push, production merge or deployment was performed.

## Previous GPU, surface geometry, UI sound and arrival refinement

The owner subsequently requested a GPU in place of the CPU, more prominent white surface geometry and a new intro. They rejected both the birdlike chirp and all continuous air/ambient audio. That stage used an original dual-fan GPU hologram: translucent scan/grid/rim surfaces, outlines and surface-sampled particles, with actual board depth, cooling frame, expansion bracket and connector edge. The circular orbit was removed. White contact facets were sampled from the actual meteor triangles using a precomputed spatial index; at most 72 faces remained active/history (28 in reduced quality). This replaced the flat regular patch, but was itself rejected and superseded by the two-layer mechanism below.

Audio uses brief fixed-pitch game-interface ticks: hover around 1.6kHz/55ms and softer typing around 1.1kHz/34ms, plus matching confirm/close notes. No source runs continuously. Native Chrome output tests verify that both the meteor hotspot and HTML navigation hover produce sound and that enabled idle/settled movement output is silent. Short cue buffers total approximately 43KB; master dynamics and bounded voices remain.

The intro is a dark name/profile arrival with actual load progress, followed by a gentle camera settle as the first meteor resolves from its own 3D fracture edges. It replaces multilingual cycling, white background and shutters. Reduced motion skips the reveal, and the reading escape remains.

Build, lint and typecheck passed; the full production suite passed 34 checks. Chrome visual review covered 1440×900, 390×844, 320×500 and 640×360, with no console errors or horizontal overflow. Final intro background cleanup was rebuilt and visually rechecked. No push, deployment, added package or external recording was involved.

## Artifact shape and optics refinement

A fresh Chrome reference check confirmed craggy slabs, broken ledges, mottled roughness and readable clear interiors. The reference’s reported stock transmission value is not its visual opacity: a custom refraction pass replaces diffuse light and bypasses attenuation. Roughness .65 and IOR 1.18 are verified reference settings; normal/thickness map strengths depend on its authored geometry and are not portable constants.

The local independent geometry now uses intersected fracture planes and seven subtractive angled wedges, extracted once with the installed Three MarchingCubes helper. It replaces both the former convex gemstone and a rejected overly smooth prototype. Each shell is approximately 8,800 triangles, centered at the existing size. There is no retained extraction renderer or per-frame meshing.

The new optical treatment uses spatial frost coverage, granular triplanar relief, low clearcoat, a clearer neutral transmission window and rougher dark rims. A mipmapped generated height/normal texture replaces sinusoidal ridges and stretched side sampling. At that stage, contact polish, white surface facets, intro erosion and adaptive quality shared the same geometry/material APIs. The subsequent contact correction below preserves the shape/optics and replaces the facet mechanism. No reference models, maps or shader source were bundled.

Artifact refinement validation: production build, ESLint and TypeScript passed. All six affected production checks passed: complete journey/resume, dark arrival/typewriter, asset/context failure, scroll highlights, all manual shader qualities and first-touch dragging. Chrome visual review covered each exhibit at 1440×900, hover contact, Performance and 390×844; there were no console errors or horizontal overflow. An overly smooth intermediate silhouette was rejected before the final angular/wedge-cut geometry. The review server responds at localhost:3000; nothing was pushed or deployed.

## Geometric interaction correction — 2026-10-29

The owner rejected the surface-face approximation. A fresh dynamic reference study separated two effects that the earlier adaptation had incorrectly combined.

### Verified reference observations

- An irregular triangular **line pattern** appears on the rock along a moving frost trail. It is not a patch of the model’s actual mesh faces, a checkerboard or filled panes. Its moving frontier is brighter than the retained clearing. The bright edge recedes first; faint retained marks fade over a few seconds.
- Actual pointer motion paints the trail. Remaining over the surface does not continually refresh it. The surface markings stay attached as the artifact moves.
- Sparse exterior links and tiny plus markers form a separate volume around the rock. They continue drifting while the cursor rests. Long partial connections grow/retract rather than selecting only the nearest neighbors.

Public-client inspection during that study verified a repeating irregular triangle texture, an advected/expanding frost field with persistent polish and a separate signed change/frontier channel, and the exterior 18-node annular motion. Each node permits at most three links; links persist through separation until their nodes leave the eligible band or wrap. Growth/retraction takes approximately 0.35 seconds. These findings explain the visual behavior; they do not license the reference’s authored source or textures. The optional click-flash behavior is deliberately omitted to retain the owner’s no-strobe preference.

### Independent portfolio implementation

`frost-field.ts` replaces the old bounded Gaussian stamps with two small half-float ping-pong targets per exhibit, 256² normally and 128² in cheaper tiers. The renderer supplies actual pointer-motion state and volume-attached hit coordinates. Fixed-step expansion, weak advection and decay retain a polished trail and a moving frontier; autorotation under a stationary cursor does not paint. Quality changes preserve history, and pause/reduced motion stop nonessential updates. `black-ice.ts` uses that field for roughness/refraction clearing and localized line illumination.

`triangle-pattern.ts` generates an original periodic irregular triangulation from seeded points once at initialization. The same shared data texture supplies fine lines and small bright junctions; no reference bitmap is used. `signals.ts` now draws an independent drifting annular network using shell bounds only, with sparse persistent links, tiny rotating plus markers and noise fragmentation. It uses two draw calls per exhibit; reduced quality lowers node/connection counts. It no longer selects or fills surface triangles.

The owner’s subsequent hardware image also supersedes the initial dual-fan card: the current direction is a slanted unbranded modern GPU with one large visible right-hand fan, broad left faceplate and central X/hourglass frame. The original volumetric hologram/assembly and atmospheric transition remain.

These are local implementation changes. Earlier test results in this report describe their respective stages. No package, reference asset, push or deployment is introduced by the correction. See [0016](../decisions/0016-frost-frontier-and-modern-gpu.md).

### Integrated verification

Fresh native Chrome captures of the reference and local site confirmed the two-layer behavior and identified an overly fine local lattice. The final pattern repeat was reduced to bring the apparent cell scale closer to the reference. Local captures show motion-driven illumination, persistent faint clearing, fading after exit and independently drifting links. The black palette remains an intentional difference from the reference’s pale environment.

Production build, ESLint and TypeScript passed. All 34 production checks passed, covering the full journey, records, resume/routes, keyboard/mobile accessibility, pause/reading/fallback, graphics modes, touch input and opt-in audio. After the final lattice-scale adjustment, the production build and three affected checks passed again: GPU silhouette/depth, all manual shader qualities and first-touch rotation. Native Chrome visual review at 1440×900, 390×844 and 320×500 confirmed the slanted single-fan card and readable surrounding content without console errors or horizontal overflow. These checks do not establish visual identity or device-independent frame rates. The local review server responds at localhost:3000; nothing was pushed or deployed.

## Subsequent arrival and music request — 2026-10-29

The owner then explicitly requested Samana-like loading behavior with English, Tamil, Mandarin, Spanish, Arabic, Hindi and French greetings before their name, plus atmospheric background music. This supersedes the name-only entrance and cue-only audio policy described in earlier stages above; it does not restore the rejected wind/air layer or license reference recordings.

That arrival stage used upward greeting transitions, a thin loading line/three-digit counter, a final full-name hold and a curtain lift overlapping the live exhibit’s materialization. Its progress is bounded by actual assets and the greeting clock. Reduced motion shows the name directly and the reading escape remains available. A shared explicit sound toggle is accessible during loading and on the page. The subsequent follow-up below changes the first materialization timing so the curtain no longer conceals it.

The optional score is original: a 48-second seamless stereo composition of soft overlapping chords and sparse notes, rendered offline once on first activation and played by one cached looping source. It retains the existing UI cues, ducks for dialogs and fades when animation is paused. No wind/noise, reference recording, new package or asset is introduced. See [0017](../decisions/0017-multilingual-arrival-and-ambient-score.md).

Production build, ESLint, TypeScript and all 35 production checks passed for this update. Browser checks verify the complete expanded greeting order, centered final name, scene handoff, reduced motion/loading escape, opt-in music, loading-to-page sound/focus continuity, real-time output silence on mute and preserved content/navigation/routes. Lenis measurements are refreshed at scene start and named travel so normalized progress cannot retain the earlier reading-layout height. Native Chrome captures at 1440×900, 390×844 and 320×500 showed readable script glyphs, the exact order and no horizontal overflow or console errors. The narrow loading overlay had no Axe violations. Isolated native audio checks confirmed sustained low-level music beneath cues, a smooth loop boundary, dialog ducking, pause/resume, mute suspension and disposal. Output tests meter the live AudioContext rather than the offline composition renderer. This remains a local Chrome validation, not a cross-device performance guarantee; the review server stays at localhost:3000 and nothing was pushed or deployed.

## White particle exhibits and visible first reveal

The owner subsequently requested all-white particle versions of the basketball, boxing-glove pair and dumbbell inside the ice. These replace the rendered solid sports objects while retaining the original shapes and useful detail. They use the portfolio’s independently authored geometry rather than reference models or textures.

The owner also reported missing the first ice exhibit’s geometric animation beneath the loading curtain. Camera/atmosphere motion can continue during the curtain lift, but the geometric edge-to-material reveal must start immediately after that curtain fully clears. This explicitly supersedes the overlapping materialization timing recorded above. Production build, ESLint, TypeScript and all 35 production checks passed for this follow-up. The arrival check instruments actual intermediate ice-reveal shader uploads and confirms that they start after the outer curtain’s real transition end, within 200ms. Native Chrome review covered all three particle forms at 1440×900, High/Performance graphics, and reduced-motion views at 390×844 and 320×500 without console errors or horizontal overflow. The reveal frames show visible fracture edges followed by the resolving particle basketball and ice. Original surface data are sampled once; only point buffers remain in the rendered sports exhibits. Earlier check counts describe their respective stages. The local review remains at localhost:3000; no push or deployment was performed.
