# Architecture

Status: main portfolio deployed on Vercel; separate AWS showcase remains planned. Updated: 2026-10-23.

## Current repository

The repository contains a Next.js App Router application using TypeScript and npm. Content is authored in TSX and `src/lib/projects.ts`; no API or persistence layer is required.

## Design goals

- Present project evidence clearly and load efficiently.
- Make content and technical explanations easy to maintain.
- Make hosting and deployment understandable and reproducible.
- Choose infrastructure that serves an actual requirement.

## Main portfolio

- Next.js + TypeScript for the animated, interactive experience.
- Vercel hosts production at the owner-confirmed custom domain [babisanp.com](https://babisanp.com), project `portfolio-site` under `nottolerables-projects`. The connected repository is `NotTolerable/portfolio-site`, with `main` as the production branch. Next.js build settings are detected automatically; no app environment variables are required. Account credentials and the local `.vercel/` link remain outside Git.
- Three.js renders a monochrome 3×3 cube with 26 rounded solid cubelets and 54 logical face assignments, initially scrambled through 22 legal quarter-turns. Each rounded mesh uses six face material slots so the texture extends onto its bevels without separate raised sticker geometry. Integer positions/orientation bases make the starting scramble exact. The client lazily loads the scene and awaits self-hosted material images; stale asynchronous scene results are disposed after unmount. Primary-pointer dragging, arrow-key input, display-synchronized rendering, offscreen/hidden skipping, reduced motion, and the CSS loading/WebGL fallback remain supported.
- Automatic orbit and timed layer turns remain enabled; only the pause/reset buttons, captions, and visible source-credit overlay are removed. Space on the focused cube toggles pause without adding visible clutter. Material provenance remains in the repository.
- Original reflection, roughness-lighting matcaps, surface-grain, and terrazzo image assets were extracted unchanged from Resend’s public Spline export and are self-hosted under `public/textures/resend/`. `MeshMatcapMaterial` uses those baked lighting images alongside recreated fiber/perforation relief; the original Spline material-layer stack is not embedded wholesale. See [asset provenance](assets/resend-cube.md) and [the rendering decision](decisions/0003-source-cube-materials.md). The previous PBR spotlight/environment setup has been removed. The broad SVG ray is a separate hero-wide decorative backdrop, extending above and beyond the cube with a viewport-width layer; matcap shading does not respond to scene lights.
- A fixed outer group preserves the portfolio’s view tilt. CubeOrbit integrates the original nested X/Y tumble at 359 degrees per ten seconds, without resetting at loop boundaries. Holding a drag suppresses idle orbit; release resumes immediately in the last input direction. Timed scrambles ease a continuous 180-degree turn over 1.7 seconds, followed every 3–5 sequences by an opposite-layer quarter-turn over 1.15 seconds, with no added beat; sequences have a 900 ms rest. Pause freezes both; reduced motion completes an active layer turn and suppresses further automatic animation. The client tracks the active primary pointer, captures it during a drag, and releases the gesture on pointer-up/cancel/lost capture. Hover cannot create a drag; manual input is direct with no inertial fling. Touch uses `pan-y` so native vertical scrolling can cancel the gesture normally.
- The shared root layout coordinates a three-second entrance using native Web Animations and `entrance-timeline.ts`. `name-ink.ts` supplies hand-authored centerline pen routes for the name’s Playfair glyphs. Per-letter SVG brush masks reveal the real serif shapes with eased, overlapping strokes and short serif-finishing passes. Browser-measured character positions/baselines match the persistent HTML words; a short final blend accounts for SVG/HTML edge rasterization, then cleanup removes the decorative SVG and restores selectable text without changing layout. Only initial setup measures DOM; there are no per-frame React updates. Navigation/copy reveal promptly. The page palette stays stable and links remain usable. Font readiness is bounded at 500 ms. Two animation frames let the browser compositor start before creating the drawing animations; their shared start uses the document timeline. The completion timer begins only then, so initial paint setup cannot silently consume the drawing. Text never waits for cube assets or WebGL. There is no separate splash layer.
- Graphics-context creation and scene loading wait until the name completes or is skipped, because context initialization can otherwise block the main thread on software renderers. The CSS fallback stays visible during this interval. The intact cube’s arrival starts when its renderer is ready and uses a single parent group’s eased tilt, 5% scale adjustment, and small vertical offset for 900 ms. Regular orbit continues smoothly; layer scrambles wait until the arrival finishes. No cubelet entrance transforms, extra line geometry, special materials, or per-frame DOM measurements are needed. The arrival resets only that parent. Mutable input supplies the renderer-ready timestamp without per-frame React renders; deferred initialization never replays the lettering. A guarded entrance subscription starts graphics once and is disposed on unmount.
- A small parser-run script hides entrance children before first paint only on the homepage without a hash or reduced-motion preference. A four-second pending failsafe restores visibility if hydration fails; late hydration bypasses the entrance. Without JavaScript, server-rendered content stays visible. Slow fonts bypass animation. Skip intro, Escape/Tab, wheel/touch intent, resize, and reduced-motion changes cancel animations and restore natural layout. Native scroll transforms stay on separate parent elements. The persistent root prevents replay on internal navigation, and the headline keeps one accessible full name.
- `PortfolioIntro` maps native scroll progress through Motion to a sticky, name-led composition. It passes a motion value to `HeroCube`, which updates a mutable scene input rather than re-rendering React on every scroll frame. Scrolling separates and fades the cubelets and interpolates one GPU point cloud into a generic processor silhouette, with a small circuit-line overlay. No wheel interception or scroll-snapping library is used. Reduced motion removes the extended sticky interval and suppresses the morph.
- The particle geometry uses 6,800 points on desktop or 3,400 on smaller initial viewports. Shader uniforms handle scroll interpolation and subtle time-based drift. The time clock freezes while paused/reduced; returning to the top restores the exact paused pose. Logical cubie coordinates/orientations are unchanged. Rendering follows display frames during animation, with offscreen/hidden work suppressed.
- Shared glass controls use a static local SVG frost texture (`public/textures/glass-frost.svg`), translucent backdrop blur, a fine rim highlight, and inset/drop shadows. Text remains above the non-interactive texture; whole content sections stay matte.
- The ink-black/blue-gray theme uses Inter for body copy, JetBrains Mono for code-like details, thin dividers, faint grids, and restrained glass controls. The original cube-outline header logo is paired with BP; identity text has no underscore suffixes or “personal index” label. See [DESIGN.md](../DESIGN.md) for current typography and glass guidance. The Resend page composition, feature strip, mock terminal, oversized farewell, and metadata-copying project tabs have been replaced.
- Inter, JetBrains Mono, and Playfair Display regular are self-hosted through Fontsource. The owner approved a free serif alternative to Domaine for now, implemented with Playfair for the name.
- Two server-rendered project articles use original decorative SVG concept illustrations and native keyboard-accessible `<details>` notes. No actual screenshots, project technology stacks, owner contributions, or performance results are invented.
- The Cloud / Infrastructure link currently opens `/infrastructure`, a labeled plan with an interactive proposed AWS architecture. It will link to the separate static showcase when deployed; that URL is undecided.

## Separate infrastructure showcase

An AWS static-site architecture was discussed for this separate showcase:

```text
Browser -- HTTPS --> CloudFront --> private S3 bucket (site assets)
                     |
                     +-- TLS certificate managed through ACM

Route 53: DNS records directing the domain to CloudFront
```

Route 53 handles DNS resolution; it is not an HTTP proxy in the request path. Access from CloudFront to the private bucket would need explicit configuration.

Terraform for infrastructure and GitHub Actions for build/deployment were suggested. These infrastructure tools have not been approved or configured. Provider details, access controls, deployment permissions, cache behavior, costs, and operational checks remain to be designed if this option is selected.

## Application and content boundaries

- The portfolio presents public content; no backend or database requirement has been established.
- The hosting explanation must describe the real deployed architecture.
- Project demos may have separate runtime needs; decide their hosting independently once requirements are known.
- Kubernetes is an interest to demonstrate where useful, not an established requirement for hosting the portfolio.

## Decisions still needed

- Further features beyond the cube/particle intro, project notes, and architecture diagram.
- Owner-verified case-study content and publishable source, resume, and contact destinations.
- Any custom domain and hosting budget changes; hosting details for the separate showcase.
- Infrastructure-as-code and deployment approach.
- Whether any feature requires an API, external service, or stored data.

Record approved consequential choices in [decisions](decisions/README.md), then update this document to reflect the resulting design.

## Module boundaries

- `src/app/`: layouts, route content, metadata, shared CSS, and icon.
- `src/components/portfolio-intro.tsx`: sticky intro, native scroll motion values, name/copy transitions, and decorative ambient dust.
- `src/components/hero-cube.tsx` and `src/lib/cube-scene.ts`: accessible controls, lazy WebGL rendering, legal turns, and reversible scroll composition.
- `src/lib/cube-particles.ts`: deterministic source/processor point geometry, GPU interpolation, circuit lines, and resource disposal.
- `src/lib/rubik-state.ts`: exact logical cube state, legal turns, deterministic initial scrambling, and autonomous double-turn planning.
- `src/lib/cube-textures.ts`: asynchronous local source-image loading, six shared matcap materials, recreated surface relief, and texture/material disposal.
- `src/components/cube-ray.tsx`: hero-wide diffuse light shaft behind the hero content, with no hard streaks or source line.
- `src/components/site-intro.tsx` and `src/lib/entrance-timeline.ts`: name-drawing coordination, intact cube arrival timing, bounded font readiness, skip action, and cleanup. `src/lib/name-ink.ts` prepares the per-letter masks and pen-stroke animations.
- `src/components/project-visual.tsx` and `src/lib/projects.ts`: original concept illustrations and factual project metadata. Project articles and native notes are authored in `src/app/page.tsx`.
- `src/components/infrastructure-flow.tsx`: explorable proposed architecture.
- `src/components/reveal.tsx`: reusable reduced-motion-aware transitions.
- `tests/portfolio.spec.ts`: shared-element continuity, skip/resize/direct-link handling, delayed/disabled JavaScript, project notes, scroll morph/reconstruction, mouse/touch/keyboard input, automatic motion, drag-only manual steering, keyboard pause, touch cancellation, responsive layouts, reduced motion, material/WebGL fallback, and automated accessibility checks.
- `src/lib/cube-orbit.ts` and `tests/cube-orbit.spec.ts`: frame-rate-independent automatic tumble, drag handoff, input direction, and pause/reduced-motion suppression.
- `tests/rubik-state.spec.ts`: inverse moves, repeated turns, lattice/sticker preservation, mixed initial faces, and automatic double-turn/opposite-layer cadence.
