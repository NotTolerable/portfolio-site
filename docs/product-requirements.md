# Product requirements

Status: owner reports deploying the earlier gallery; the 2026-10-27 game-style refinement is local-only and not deployed.

## Audience and purpose

Help Babisan Pirapakaran find software engineering work. Recruiters, hiring managers and engineers should understand his work, inspect technical contributions, find his complete experience and resume, and contact him without needing to discover a 3D hotspot.

Primary interests are infrastructure, low-latency systems, low-level engineering and GPU/CUDA programming. Separate demonstrated work from exploration; CUDA expertise and certifications are not established.

## Current approved experience

The owner explicitly canceled the entire city project and requested a faithful [Samana Studio](https://samanastudio.es/) adaptation. Its actual live design is an underwater sculpture gallery. Match its visual language, three-exhibit spatial journey, authored camera passes, atmosphere, sparse interface, hotspot records, descending transition and contact finale. Replace its branding/content with the owner’s portfolio and its S particle identity with a processor. Complete freedom over implementation does not require replacing working technologies. Follow [DESIGN.md](../DESIGN.md).

Preserve the complete pre-redesign working state in a separate Git branch before changes. This is satisfied by `archive/3d-city-2026-10-25` at `8004668`. The redesign is isolated on `redesign/samana-portfolio`; production deployment is not part of this request. Old city/camera prototype URLs redirect to the new homepage.

## Personal black-ice baseline (2026-10-25; amendments below)

The owner subsequently requested these explicit changes (see [decision 0013](decisions/0013-personal-black-ice.md)):

- First iceberg: personal introduction with a basketball; second: work experience with boxing gloves; third: all projects with a dumbbell. Use black ice with enough clarity to recognize the interior objects.
- A genuinely volumetric, continuously rotating particle processor. The separate sports exhibit replaces only the former solid processor.
- Former fish choreography is superseded by the systems chamber in the current refinement below.
- Cursor-following aurora trails, occasional shooting stars, more prominent snow, and damped hover tilt on the ice while retaining drag.
- A slower, multilingual greeting/name entrance matching the reference’s cadence.
- Minimal typewritten detail popups with complete records still accessible. Superseded selection rule: the 2026-10-27 request replaces nearest-camera selection with scroll-driven reading order. Only one circle glows, with a gentle breathing halo.
- Finish with the exact resume rendered as a complete page, visually like an image, with no nested scrolling viewport. Include links to the PDF, GitHub, LinkedIn and email. Preserve the existing `/resume` PDF viewer.

## Current refinement — 2026-10-27

The owner explicitly requested a local review at `localhost:3000` and prohibited deploying this version. They reported deploying the earlier version themselves; this is an owner report, not a new verified deployment action by the agent.

- Frostier, more opaque black ice; slow automatic rotation layered with hover/drag.
- Hotspot reading order driven only by scroll progress, with one softly breathing halo at a time.
- More visible drifting particles and atmospheric rays/aurora, while retaining dark personal portfolio colors rather than adopting Igloo’s Arctic theme.
- Original optional audio with an explicit mute control and browser-appropriate activation.
- An independently designed game-style continuation after the former fish section. The implemented systems chamber replaces the fish and water crossing while preserving all content, navigation and the complete resume finale.
- Automatic graphics adjustment for sustained sub-target frame cadence, with cheaper resolution/effects and an intentional low-spec visual treatment. Keep HTML text and controls sharp, provide manual overrides, honor reduced motion and avoid universal frame-rate guarantees.

See [decision 0014](decisions/0014-systems-chamber-and-adaptive-graphics.md).

## Confirmed public content

- Axiom: C++20 multi-venue execution, in-memory order books, Linux execution-path work, pre-trade risk, deterministic replay and latency benchmark tooling. Measured latency results are not yet published.
- Verilly: AI compliance verification, LangGraph, constrained outputs, control dependency graph, deterministic checks and cited reports.
- Behaviourly: multimodal interview analysis using visual, speech and transcript signals.
- Complete professional/contract experience: 407 ETR, DevRoom, Orbital Studios and Polaris Studios, using resume-governed dates and supported metrics. Details remain authoritative in `src/lib/experience.ts`.
- Group game-server work by infrastructure, runtime diagnostics, anti-cheat/vector math and Java development. Omit individual server names, ownership/volunteer labels and invented roles. Per-network player/community metrics are not aggregate totals.
- Include AI-assisted client website work, public plugins, coursework and University of Waterloo education. Clearly identify AI-assisted delivery.
- Preserve public email, GitHub and LinkedIn from the supplied resume. Unprovided project source/demo URLs stay absent.
- `/resume` embeds the exact authorized public PDF, with direct/open/download controls; portfolio resume actions open a new tab. Private extended experience documents are not published.
- `/infrastructure` retains the interactive, clearly **proposed** Route 53 / CloudFront / ACM / private S3 plan. The current portfolio is a Next.js app on Vercel, not a deployed AWS showcase.

## Functional acceptance

1. One homepage renderer and one authoritative scroll journey synchronize the camera, exhibit labels, hotspots, closing copy and resume/contact finale.
2. Scroll reversal returns through the same continuous positions; camera approach, orbit and descent remain smooth and horizon-stable.
3. Drag rotates exhibits; subtle cursor response never disrupts framing. The processor uses a thick point volume with continuous Y rotation. Hover tilts the ice smoothly; cursor-driven aurora, marine snow, shooting stars and the systems-chamber motion remain coherent with pause/reduced-motion preferences.
4. Work, complete experience, resume, contact and infrastructure remain discoverable and functional. Native dialog readers support keyboard access, Escape, scroll and restored focus.
5. Reading mode, no JavaScript and graphics failure expose all factual content. Reduced motion removes nonessential animation; pausing atmosphere preserves navigation.
6. Narrow layouts remain readable, without horizontal overflow. Include visible focus, suitable contrast and a skip link.
7. Properly licensed assets carry source/author/license/change attribution. Do not treat public hosting as a license.
8. Run build, lint, typecheck and meaningful production browser tests. Describe device-specific checks honestly; do not promise universal frame rates or exact visual equivalence.

## Deferred work

Public project repositories, reproducible benchmark results, source screenshots, detailed case studies and the separate AWS deployment need evidence or implementation. No contact-form service is established; use verified contact links. Publishing the local redesign requires a separate request.

## History

Night-city stages, the observatory, character controller, final basketball court, cube and anime impact entrances are superseded. Their decisions/reports remain historical records. See [decision 0012](decisions/0012-underwater-portfolio.md) for the latest supersession and [architecture](architecture.md) for the active implementation.
