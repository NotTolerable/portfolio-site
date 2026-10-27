# Babisan Pirapakaran — Under the Surface

Status: approved reference-led redesign implemented locally on `redesign/samana-portfolio`. Updated 2026-10-27. This supersedes every night-city, observatory, character, basketball-court and cube direction. See [decision 0012](docs/decisions/0012-underwater-portfolio.md).

## Direction

Faithfully adapt [Samana Studio](https://samanastudio.es/) as Babisan’s personal software engineering portfolio. Follow its actual live underwater gallery, not the unrelated comic/interior social references or the former city. Match its restrained composition, depth, three icy exhibits, close camera passes, marine snow, descent, particle identity and contact finale. Keep the owner’s factual content and functional links.

The owner reports deploying the earlier gallery. The current game-style refinement is local-only for review at `localhost:3000`, with no deployment authorized. See [decision 0014](docs/decisions/0014-systems-chamber-and-adaptive-graphics.md).

Three suspended **black-ice** exhibits introduce **Babisan**, **work experience**, and **projects**, in that order. An original basketball, pair of boxing gloves, and dumbbell replace the classical sculptures and solid processor. They are personal gallery objects, not project output. The later fish-led scene is superseded by a dark systems chamber: an assembling particle processor resolves into a physical manufactured core above a low instrument platform, with sparse teal/brass arcs and restrained lighting. See [decision 0013](docs/decisions/0013-personal-black-ice.md).

## Composition and movement

- Fixed full-viewport WebGL scene; native document scroll spans 1014vh in enhanced mode.
- A 35° perspective lens and three authored views per exhibit: establishing angle, approach, and reverse-side view. The camera then descends into the systems chamber and continues into the resume composition.
- Scroll advances or reverses the same physical journey. Camera position and aim have separate keyframes. Smoothstep shot interpolation and time-based damping maintain a stable horizon. Cursor parallax is additive and restrained; the frosted blocks turn slowly on their own, hover adds a restrained tilt, and drag adds persistent rotation with damped release.
- Sparse wordmark upper left; small Work, Experience, Resume and menu controls preserve recruiter access. Introduction, experience and projects copy sits lower left; projected circular hotspots provide additional access. Exactly one visible hotspot follows scroll reading order through the three authored compositions. Its halo breathes smoothly over 3.2 seconds; pointer movement, automatic spin and camera distance do not change selection. The other circles stay clickable without glow.
- Closing copy sits left of the physical systems core; sparse arcs and precision marks provide a game-like sense of place without copying Igloo’s ice terrain. The journey ends with a full-page resume image as the main composition, accompanied by PDF/open/download, GitHub, LinkedIn and email links. Fit the entire page within the viewport; never embed a nested scrolling PDF viewer in the homepage. The dedicated `/resume` viewer remains available. A discreet depth readout mirrors journey progress.
- A minimum four-second off-white loader cycles through multilingual greetings (including Tamil), holds Babisan’s full name, then transitions through six alternating vertical shutters into a 3.2-second gallery approach. No flashes, impact frames, blades, city or cube entrance.

## Visual system

| Token | Value / use |
| --- | --- |
| Background | `#040910`, near-black abyss |
| Text | `#e8f0ff`, cool off-white |
| Secondary | `#a4b6c8`, slate-blue |
| Rules | translucent pale blue, 1px |
| Headings / UI | self-hosted Geist, 400/500 |
| Technical details | self-hosted JetBrains Mono, 400 |
| Heading treatment | restrained lowercase, moderate scale, no comic type or serif |
| Surfaces | dark translucent HUD panels, minimal borders, subtle blur |
| CTA | thin rounded pill, small rim highlight, controlled glow |

More opaque, uneven frosted shells obscure but retain hints of their personal objects. Cool artifact lighting carries the opening; graphite hardware, muted warm metal and pale teal accents define the later chamber. Deep blue progressively falls toward almost black/teal. A low-resolution advected cursor field creates a rising aurora trail with a restrained ambient curtain. Occasional shooting stars and more prominent marine snow create near/far depth; grain and travel chromatic separation stay subtle. Avoid heavy bloom, neon, bright fog and ornamental interface chrome.

## Content and access

Compact native dialogs use a simple heading, monospace typewriter paragraph and restrained selectors. Full factual records remain available under an expandable technical record. Escape, focus containment/restoration and close controls remain mandatory. Keep all roles and grouped game-server technical work. No missing source/demo URLs or unpublished performance results may be invented.

A complete server-rendered reading portfolio is available without JavaScript, after WebGL failure, and through the menu. Reduced motion removes the entrance and idle atmosphere while retaining immediate scroll exploration. Pause animation must preserve navigation. Mobile keeps the gallery, retreats the camera, centers exhibit labels and uses bottom-sheet records. `/resume` and `/infrastructure` share this type/palette but prioritize documents over WebGL.

## Reference and asset boundaries

The live reference was inspected in Chrome across the full scroll range; public runtime, CSS and credit information verified its stack and composition. Implementation is independently authored. Former CC BY sculpture assets remain dormant with their attribution. The active sports objects are original; the fish is Microsoft’s CC0 Barramundi with a travelling swim path, heading changes and visible tail deformation; that model is now dormant. Ice, processor and shaders are original approximations. This is a close adaptation, not a claim of pixel-identical proprietary geometry or simulation. See [reference study](docs/reports/samana-reference-study.md) and [asset provenance](docs/assets/underwater-gallery.md).

## Sound and graphics

Sound starts off and requires the explicit bottom-left toggle. Use original quiet procedural ambience, travel swells and restrained UI cues; do not copy reference recordings. Pause/suspend audio when hidden or in reading mode, and keep mute available.

The lower-right graphics control defaults to Auto and names the active tier. Sustained slow frame cadence reduces DPR, particle counts, transmission, secondary geometry and field/postprocessing updates. A deliberately pixelated lowest tier applies only to the 3D canvas; typography and controls remain sharp. Use warm-up, cooldown and slow recovery to avoid repeated switches. Manual High, Balanced and Performance remain available. Do not promise 60fps on every device.
