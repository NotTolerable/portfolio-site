# Architecture

Status: underwater-gallery redesign implemented locally on `redesign/samana-portfolio`; existing `main` deployment remains unchanged. Updated 2026-10-25. [Decision 0012](decisions/0012-underwater-portfolio.md) supersedes the city and observatory architectures.

## Stack and hosting

Next.js App Router, React, TypeScript and npm serve static/server-rendered content. Three.js renders the homepage gallery directly; GSAP handles the introduction/panel timing and Lenis 1.3.23 drives smoothed native scroll from the renderer’s clock. Self-hosted Geist and JetBrains Mono provide the interface typography. No framework rewrite or React Three Fiber is needed.

Vercel project `portfolio-site` under `nottolerables-projects` remains connected to `NotTolerable/portfolio-site`; `main` is production at babisanp.com. Cloudflare proxies the domain. No API, database, contact-form backend or application secrets are needed. The trusted public email block retains Cloudflare `email_off` exclusions. The local redesign has not been pushed or deployed.

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Composes client enhancement and server-rendered complete portfolio |
| `src/components/gallery/gallery-experience.tsx` | Scene lifecycle, loading/failure UI, chapter presentation, dialogs, controls, reading mode |
| `src/components/gallery/reading-portfolio.tsx` | Complete semantic HTML content, usable without graphics/scripts |
| `src/lib/gallery/journey.ts` | Exhibit metadata, independent position/aim keyframes, reversible shot sampling |
| `src/lib/gallery/renderer.ts` | One Three renderer/RAF, Lenis, asset loading, camera, projection, input and disposal |
| `src/lib/gallery/art.ts` | Original ice geometry, processor mesh and deterministic particle formation |
| `src/lib/gallery/shaders.ts` | Depth gradient/shafts, marine snow, CPU particles and restrained film/travel grade |
| `src/lib/projects.ts`, `src/lib/experience.ts` | Authoritative factual content |
| `src/components/portfolio-records.tsx` | Shared full records in dialogs and reading view |

The root layout no longer mounts `WorldProvider` or any city renderer. `/resume` and `/infrastructure` initialize no WebGL. `/camera-study` and `/city-preview` redirect to `/`. Old source/assets remain dormant for provenance/reuse; the complete city snapshot is independently preserved in its archive branch. Old city integration tests are retained in `tests/archive` and excluded from current tests. Retained cube/walker mathematical tests still exercise dormant code.

## Journey and camera

A 1014vh native document proxy is authoritative. Lenis updates in the render loop, normalized scroll intent is damped with elapsed time, and a pure shot sampler interpolates independently authored position/aim tracks using smoothstep. A 35° camera moves through three ice exhibits at `(0,0,0)`, `(-6,-2,-44)` and `(5,1.5,-86)`, then descends to the particle processor at y=-84 and finale near y=-118. Three viewpoints per exhibit reproduce the measured framing sequence; the closing holds before the final descent. Mobile widens the camera distance.

Intro and pointer offsets are additive to the authored path. Drag rotates the current exhibit; release inertia decays by time. Camera arrival, visible labels, depth and projected hotspot positions use the same rendered progress. Frame updates write transforms/style/output imperatively; React changes only chapter/modal/preferences. Dialog focus stops Lenis and holds a tighter camera composition; native modal semantics provide focus containment and background inertness.

## Rendering and assets

Renderer: antialiasing, sRGB output, ACES Filmic, exposure 1, DPR capped at 1.8 desktop / 1.5 narrow. A cool-graded CC0 Studio Small 08 HDR PMREM supplies varied softbox reflections, with generated RoomEnvironment as a failure fallback. Cool hemisphere/directional lighting and local exhibit lights shade licensed sculptures and original uneven physical-transmission ice. No dynamic shadow maps or scene-wide bloom.

A camera-centered shader sphere establishes blue-to-abyss depth; 4,200 GPU points provide marine snow. A deterministic 85k desktop / 34k mobile point-volume processor uses perspective-attenuated white/cyan particles with cursor displacement. The closing fish is a 480KB CC0 GLB, with shader-based tail movement. A subtle animated plane provides the later water crossing. EffectComposer contains RenderPass, an original subtle grain/vignette/travel-chromatic shader and OutputPass.

GLTFLoader uses the bundled MeshoptDecoder for the angel derivative; Nike and fish need no geometry decoder. The scene compiles before loader release. Model failures substitute an original processor sculpture, while unavailable WebGL/context loss exposes reading content. [Asset provenance](assets/underwater-gallery.md) records source licenses and modifications. No unidentified-license reference shell, fish, HDR, S binary or application code is reused.

The single loop skips rendering when hidden or reading mode is active. Ambient pause freezes nonessential time while preserving journey navigation. DPR/particle caps control fill/point cost; these are safeguards, not a measured universal performance guarantee. Unmount releases the loop, Lenis, GSAP tween, event listeners, geometry, materials, textures, PMREM, composer and renderer. Late scene initialization is disposed after cancellation.

## Content routes and access

The full reading portfolio is rendered before client enhancement; CSS hides it only after successful scene initialization. It remains accessible without JavaScript and after graphics failure. Reading mode suspends rendering and returns to ordinary document flow. Reduced motion skips the entrance, idle atmosphere and pointer effects while retaining immediate scroll-driven navigation. Native dialog readers support Escape and explicit close/focus restoration. Top-level navigation offers direct experience and resume access independently of scene hotspots.

`/resume` embeds `public/documents/Babisan-Pirapakaran-Resume.pdf` with open/download fallback. `/infrastructure` shares typography/palette and preserves the interactive planned flow: Route 53 DNS → CloudFront with ACM → private S3 through origin access control. That AWS site is not yet deployed. No infrastructure tool choice is assumed.
