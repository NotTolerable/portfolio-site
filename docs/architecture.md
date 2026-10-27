# Architecture

Status: owner reports deploying the earlier gallery. The 2026-10-27 game-style refinement remains local on `redesign/samana-portfolio`; no production deployment or push is authorized. [Decision 0012](decisions/0012-underwater-portfolio.md) supersedes the city and observatory architectures.

## Stack and hosting

Next.js App Router, React, TypeScript and npm serve static/server-rendered content. Three.js renders the homepage gallery directly; GSAP handles the introduction/panel timing and Lenis 1.3.23 drives smoothed native scroll from the renderer’s clock. Self-hosted Geist and JetBrains Mono provide the interface typography. No framework rewrite or React Three Fiber is needed.

Vercel project `portfolio-site` under `nottolerables-projects` remains connected to `NotTolerable/portfolio-site`; `main` is production at babisanp.com. Cloudflare proxies the domain. No API, database, contact-form backend or application secrets are needed. The trusted public email block retains Cloudflare `email_off` exclusions. The current local refinement has not been pushed or deployed. The earlier deployment was reported by the owner.

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Composes client enhancement and server-rendered complete portfolio |
| `src/components/gallery/gallery-experience.tsx` | Scene lifecycle, loading/failure UI, chapter presentation, dialogs, controls, reading mode |
| `src/components/gallery/reading-portfolio.tsx` | Complete semantic HTML content, usable without graphics/scripts |
| `src/lib/gallery/journey.ts` | Exhibit metadata, independent position/aim keyframes, reversible shot sampling |
| `src/lib/gallery/renderer.ts` | One Three renderer/RAF, Lenis, asset loading, camera, projection, input and disposal |
| `src/lib/gallery/art.ts` | Original fractured ice and volumetric particle processor |
| `src/lib/gallery/sports.ts` | Original basketball, boxing gloves and dumbbell |
| `src/lib/gallery/aurora.ts`, `motion.ts` | Cursor-field lifecycle and greeting timing; former fish helpers are dormant |
| `src/lib/gallery/runtime-core.ts` | Original manufactured chamber and instanced processor detail |
| `src/lib/gallery/quality.ts`, `audio.ts` | Adaptive/manual graphics and original opt-in sound lifecycle |
| `src/lib/gallery/shaders.ts` | Depth gradient/shafts, marine snow, CPU particles and restrained film/travel grade |
| `src/lib/projects.ts`, `src/lib/experience.ts` | Authoritative factual content |
| `src/components/portfolio-records.tsx` | Shared full records in dialogs and reading view |

The root layout no longer mounts `WorldProvider` or any city renderer. `/resume` and `/infrastructure` initialize no WebGL. `/camera-study` and `/city-preview` redirect to `/`. Old source/assets remain dormant for provenance/reuse; the complete city snapshot is independently preserved in its archive branch. Old city integration tests are retained in `tests/archive` and excluded from current tests. Retained cube/walker mathematical tests still exercise dormant code.

## Journey and camera

A 1014vh native document proxy is authoritative. Lenis updates in the render loop, normalized scroll intent is damped with elapsed time, and a pure shot sampler interpolates independently authored position/aim tracks using smoothstep. A 35° camera moves through introduction/experience/projects ice exhibits at `(0,0,0)`, `(-6,-2,-44)` and `(5,1.5,-86)`, then descends to the systems chamber at y=-84 and a resume-focused finale near y=-118. Three viewpoints per exhibit reproduce the measured framing sequence; the closing holds before the final descent. Mobile widens the camera distance.

Intro and pointer offsets are additive to the authored path. Hovering within the current shell’s world-space bounding sphere adds a damped local tilt. Drag accumulates independent rotation; release inertia decays by time. Camera arrival, visible labels, depth and projected hotspot positions use the same rendered progress. Hotspot selection follows the current exhibit’s authored scroll stops in reading order (0→1→2), independently of camera distance or pointer-driven rotation. Only the current visible anchor receives a 3.2-second breathing halo; hidden/modal states clear it. Automatic block rotation is an independent elapsed-time channel, suspended during direct manipulation and under pause/reduced motion. Frame updates write transforms/style/output imperatively; React changes only chapter/modal/preferences. Dialog focus stops Lenis and holds a tighter camera composition; native modal semantics provide focus containment and background inertness. Compact HUDs type only their visual text with one owned animation callback; assistive technology receives the complete text immediately. Full factual records remain under native details controls.

## Rendering and assets

Renderer: antialiasing, sRGB output, ACES Filmic, exposure 1. The cool-graded CC0 studio HDR provides PMREM reflections, with RoomEnvironment fallback. Physical frosted shells use greater roughness and lower transmission than the clear baseline. The opening retains personal basketball/glove/dumbbell objects; the later fish/water scene is dormant.

`runtime-core.ts` constructs an original physical processor, low graphite pedestal, precision ticks and sparse teal/brass arcs. Pins and traces are instanced; a point-volume processor resolves into this manufactured core during arrival. No fish GLB is loaded. Desktop high quality draws up to 10,000 marine particles and 85,000 formation points; cheaper profiles reduce those counts. Shader atmosphere includes cursor trails, light pockets and occasional shooting stars.

`quality.ts` owns four measured frame-cadence tiers: High, Balanced, Performance and Low-spec. Auto starts high on desktop/balanced on narrow screens, ignores warm-up and long isolated stalls, evaluates 1.4-second windows, degrades after sustained slow frames and recovers only after extended headroom/backoff. Manual overrides persist in localStorage. Changes reduce DPR (desktop 1.7→1.15→.75→.6 caps), draw ranges, transmission and secondary geometry. Performance modes skip the grade pass and update the aurora less often; the lowest tier pixelates only the canvas. DOM labels, controls and resume remain full resolution. These are adaptations toward 60fps, not a hardware-independent promise.

`audio.ts` creates an original Web Audio graph only after explicit opt-in: filtered noise, low tonal ambience, travel-responsive gain/filtering and short UI cues. Sound starts muted, fades when toggled, suspends in hidden tabs, stops in reading/failure mode and releases its context/nodes on unmount. No reference recordings or external audio assets are loaded. `experience-controls.tsx` presents sound and automatic/manual graphics controls.

One RAF owns scroll, frame sampling, scene update, cursor-field updates and rendering. React changes only chapter/modal/preferences/tier state. Hidden and reading views suspend rendering and reset timing samples. Tier transitions and resize use cooldowns. Geometry, materials, textures, both cursor targets, PMREM, composer, renderer, event listeners and audio are disposed by their owners.

## Content routes and access

The full reading portfolio is rendered before client enhancement; CSS hides it only after successful scene initialization. It remains accessible without JavaScript and after graphics failure. Reading mode suspends rendering and returns to ordinary document flow. Reduced motion skips the entrance, idle atmosphere and pointer effects while retaining immediate scroll-driven navigation. Native dialog readers support Escape and explicit close/focus restoration. Top-level navigation offers direct experience and resume access independently of scene hotspots.

The homepage finale and reading view display `public/documents/resume-preview.png`: a full-page 1530×1980 rendering of the exact one-page authorized PDF. CSS fits it wholly within desktop and narrow viewports, with contact and PDF actions beside/below it and no nested scrolling viewer. Recreate after PDF updates using `swift -module-cache-path /private/tmp/portfolio-swift-cache scripts/render-resume-preview.swift public/documents/Babisan-Pirapakaran-Resume.pdf public/documents/resume-preview.png` on macOS. `/resume` still embeds `public/documents/Babisan-Pirapakaran-Resume.pdf` with open/download fallback. `/infrastructure` shares typography/palette and preserves the interactive planned flow: Route 53 DNS → CloudFront with ACM → private S3 through origin access control. That AWS site is not yet deployed. No infrastructure tool choice is assumed.
