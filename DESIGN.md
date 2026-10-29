# Babisan Pirapakaran — Nightfall

Status: approved Nightfall direction, with the existing gallery hosted at [babisanp.com](https://babisanp.com). The opening-name refinement, hanging-glove pose and quicker intro are deployed and publicly verified as release `801fa92` from `redesign/samana-portfolio`. Updated 2026-10-29. Supersedes the physical chamber direction in [0014](docs/decisions/0014-systems-chamber-and-adaptive-graphics.md), with geometric interaction/GPU refinement in [0016](docs/decisions/0016-frost-frontier-and-modern-gpu.md) and the current greeting/music refinement in [0017](docs/decisions/0017-multilingual-arrival-and-ambient-score.md). The city, observatory, characters, court, cube and anime-impact directions remain historical.

## Direction

Combine the suspended gallery/camera language of [Samana Studio](https://samanastudio.es/) with the localized material contact, fine geometric fields and layered interaction sound studied at [Igloo Inc.](https://www.igloo.inc/). The original identity is **Nightfall**: black glacier ice in a deep blue environment, descending toward a blue-hour upper-atmosphere horizon. It is a personal software engineering portfolio with direct access to content, not an Arctic clone or a game visitors must solve.

The owner reported deploying an earlier version and explicitly requested Vercel production deployment of this completed refinement on 2026-10-29. The latest request to add the large name behind the first exhibit and deploy the complete version explicitly supersedes the subsequent local-only holds for the hanging gloves and faster intro. The complete update is deployed and verified at babisanp.com. See [decision 0015](docs/decisions/0015-nightfall-contact-and-atmosphere.md), its [0016](docs/decisions/0016-frost-frontier-and-modern-gpu.md) and [0017](docs/decisions/0017-multilingual-arrival-and-ambient-score.md) refinements, and the [reference study](docs/reports/igloo-hybrid-study.md).

## Composition and movement

- The opening composition places **Babisan / Pirapakaran** on two large centered lines behind the first ice exhibit, using the existing self-hosted Geist typeface in solid cool off-white. The name belongs to the 3D scene: the ice must genuinely cover and refract it. Fit the name to the viewport on desktop and mobile, retain clear space for navigation and the introduction, and fade it early as scrolling starts. Keep the smaller first chapter label **About me** and preserve the accessible HTML heading and complete reading portfolio. Do not add outline/neon styling or another render loop.
- One fixed WebGL scene and finite 760vh native scroll. One normalized progress state controls camera, artifacts, labels, highlights, assembly, atmosphere and resume.
- Three suspended **black-ice** exhibits introduce **Babisan**, **experience**, and **projects**. White three-dimensional particle forms of a basketball, boxing gloves and dumbbell sit inside the ice, replacing the visible solid objects. Preserve their recognizable seams, cuffs/thumbs and plate/grip silhouettes. Use the licensed sculpted glove pair rather than a primitive-built shape. Arrange it as a compact hanging pair: cuffs up, fists down, unequal heights/depth and a slight inward overlap, joined by a thin white particle lace. Keep interior particles crisp by separating refraction smoothing from the rough exterior skin. They represent personal interests, not project output.
- Retain the 35° lens and three authored views per exhibit. Separate position/aim channels remain smooth, reversible and horizon-stable. Mobile retreats the camera. Idle rotation, hover response and drag accumulation are separate elapsed-time channels.
- Match the Igloo artifact treatment with asymmetrical chipped slabs, broken shoulders/ledges and an uneven granular frost skin. Rougher opaque edges surround a clearer central volume. Keep the outer skin charcoal; transmitted light stays comparatively neutral so the personal objects remain readable. Avoid pristine gemstone planes, smooth soap-bar outlines and broad chrome-white reflections.
- Actual cursor motion leaves a fading polished trail in the frosted surface: reduced relief/roughness, clearer refraction and a spreading crystalline frontier. A fine, irregular triangular line pattern is brightest at that advancing frontier and faint inside the retained clearing. It fades over a few seconds and moves with the object. Stationary hover or idle rotation must not paint new strokes. Keep the base charcoal even under HDR illumination and avoid full neon outlines, filled triangle panes and circular contact patches.
- A separate sparse network drifts around each exhibit, including while the cursor rests. Tiny plus markers and long, partially broken white links grow and retract smoothly. The network occupies a real volume around the ice; it is independent of the surface trail. Exactly one projected hotspot follows the current exhibit’s scroll reading order. Its halo breathes over 3.2 seconds; hover/focus shows a compact semantic label. Drag never changes reading order.
- After projects, the third shell erodes and its particle field gathers into a slanted, rotating holographic GPU. Match the owner’s modern hardware reference with one large visible fan on the right, a broad left faceplate, a perimeter frame and central X/hourglass structure, diagonal cooling fins, bracket and connector edge. Omit branding and model-name text. Keep the GPU suspended, with restrained measurement marks and no manufactured pedestal. As the camera descends, a night-sky horizon and slow cloud deck gradually emerge. The GPU disperses before the complete resume appears. No flash or abrupt background swap.
- Closing interests sit left of the GPU on desktop and below its upper composition on mobile. The resume is a complete-page image, fitted within the viewport, with PDF/open/download, GitHub, LinkedIn and email links. No nested homepage PDF scroller. Preserve `/resume`.
- Use a centered multilingual arrival: **Hello → வணக்கம் → 你好 → Hola → مرحبا → नमस्ते → Bonjour → Babisan Pirapakaran**. Each word lifts/flips upward into the next; the name gets a calmer final hold. A thin bottom-center loading line and three-digit counter reflect both real asset readiness and sequence progress. Once both are complete, the dark curtain lifts while the camera and atmosphere settle underneath. Start the first ice exhibit’s geometric edge-to-material reveal immediately **after the curtain fully clears**, so visitors see the complete animation. Keep the handoff continuous, without a white flash or a circular intro graphic. Reduced motion shows the name and completed exhibit directly; the reading escape remains available.

## Visual system

| Token | Value / use |
| --- | --- |
| Background | `#040910`, near-black night |
| Ice | charcoal chipped slabs; granular frosted edges and clearer refractive centers |
| Text | `#e8f0ff`, cool off-white |
| Secondary | `#a4b6c8`, slate-blue |
| Contact / signal | muted pearl-teal, localized and restrained |
| Horizon | blue-hour slate with a faint warm limb |
| Rules | translucent pale blue, 1px |
| Headings / UI | self-hosted Geist, 400/500 |
| Technical controls | self-hosted JetBrains Mono, 400 |
| CTA | small transparent dark surface, thin rim and quiet focus/hover |

Depth comes from physical artifact highlights, near/far particles, local geometry, cursor atmosphere, a moving camera and the developing cloud horizon. No fast meteor decoration or fictional meter-depth UI. Grain and travel chromatic separation remain restrained. Avoid ornamental chrome, bright neon fog and excessive bloom.

## Navigation and content

Use casual first-person copy with straightforward headings such as About me, Experience, Projects and Interests. Avoid dramatic slogans, entrepreneurial positioning and forced technical metaphors. Preserve useful engineering detail within factual project and experience records. The hosting page describes the current Vercel/Cloudflare setup in present tense, including prebuilt pages and browser-side graphics.

The header opens About, Projects and Experience directly and links to the PDF resume. A labeled five-stop rail — About, Experience, Projects, Interests, Resume — drives the same scroll journey and shows the active destination. The section readout uses names, not game terminology. Recruiters can read records without discovering hotspots.

Native dialogs use a simple heading, mono typewriter introduction and restrained selectors. Experience entries follow the introduction with semantic bullet lists for individual contributions; game-server work uses the same structure within technical categories. Full technical records remain expandable. Escape, focus containment/restoration, visible focus and complete factual experience are mandatory. Assistive technology receives the full paragraph immediately. No unprovided source/demo URL or unpublished performance claim may be invented.

A complete server-rendered reading portfolio remains available without JavaScript, after WebGL failure and through the menu. Reduced motion freezes nonessential motion and contact effects but retains direct scroll and drag. Pause preserves navigation. Mobile keeps labeled destinations, sharp controls and usable bottom-sheet records. `/resume` and `/infrastructure` prioritize documents over WebGL.

## Sound and graphics

Sound starts off and requires an explicit toggle, available during loading and in the main interface. The owner’s latest request restores **quiet atmospheric background music**, superseding the earlier cue-only restriction. Use an original seamless score of soft, slowly overlapping chord pads and sparse upper notes, alongside the existing bright 55ms hover ticks, softer 34ms typing blips and matching confirm/close tones. Keep wind/air/noise beds, birdlike chirps and movement-triggered sound loops absent. Dialogs duck the music; animation pause fades the score while intentional UI cues remain usable. Share buffers, cap voices and control levels. Mute/suspend when hidden or in reading mode; dispose on failure/unmount. Reference recordings have no verified redistribution license and are not dependencies.

Graphics default to Auto, with High/Balanced/Performance overrides. Sustained slow cadence reduces DPR, particle counts, transmission, material contacts, secondary fields and effect cadence. Low-spec pixelation applies only to the canvas; text and controls remain sharp. Warm-up, cooldown and recovery backoff prevent oscillation. Do not promise 60fps on all hardware.

## Asset boundaries

Geometry, material/contact shaders, GPU hologram and particle formation, sky and sound design are independently authored. The active external artwork is the CC0 Studio Small 08 HDR and Joachim Bornemann’s CC0 Vintage boxing gloves, used only as a particle sampling source. Dormant sculpture/fish files retain their source credits. Keep visible Credits access and [attribution](public/gallery/ATTRIBUTION.txt). Publicly hosted reference code or recordings are not licensed application dependencies. This hybrid studies behavior and composition; it does not claim proprietary or pixel-identical assets.
