# Architecture

Status: published observatory and isolated authored-camera prototype; Next.js/Vercel portfolio; separate AWS showcase remains planned. Updated: 2026-10-24.

## Application and hosting

Next.js App Router, React, TypeScript and npm provide server-rendered content and interactive enhancement. Vercel hosts [babisanp.com](https://babisanp.com), project `portfolio-site` under `nottolerables-projects`, connected to `NotTolerable/portfolio-site`; `main` is production. The custom domain is proxied through Cloudflare. The fixed public contact block uses Cloudflare’s documented `email_off` comments to prevent edge email rewriting from changing the markup before React hydrates; no zone-wide setting change is needed. No API, database or application environment variables are required. Credentials and `.vercel/` stay outside Git.

The owner explicitly lifted previous technical restrictions and requested a complete camera-led portfolio world. [Decision 0008](decisions/0008-continuous-observatory.md) supersedes 0006/0007. Next.js and Three.js remain because they fit the revised requirements, not because the redesign is constrained to them. See [DESIGN.md](../DESIGN.md).

## Persistent world and navigation

`WorldProvider` in the root layout owns one canvas, scene lifecycle, preferences, current destination, project/domain selection and focused record. The header and all routes share this provider. Internal navigation preserves the renderer; `/resume` deliberately still opens in a new tab from resume actions.

`PortfolioJourney` renders all six semantic content destinations on the server. With enhancement enabled, native document scroll supplies progress along a Catmull–Rom camera rail in one continuous rooftop scene. Only the active destination’s concise typography is visible/focusable. Header/footer destination links bypass discovery; projected landmark controls offer contextual access. No wheel interception, character controller or independent collection of loaded scenes is used.

The camera damps toward scroll intent, uses bounded pointer parallax and makes a restrained focus adjustment for a record. Camera timing is independent of React updates. React state changes only for destination/selection/preferences; frame updates, projection and rendering remain in the renderer. Asset initialization does not block content navigation.

## Assets, materials and lighting

`observatory-scene.ts` loads self-hosted GLBs through GLTFLoader and its bundled meshopt decoder. CC0 optical/radio/relay/lamp/desk/searchlight models and architectural modules retain source geometry detail; maps are packed as WebP. Concrete uses diffuse/OpenGL-normal/roughness maps. A 1k HDR processed once with PMREM supplies environment lighting/reflections. See [provenance](assets/observatory.md) and `public/world/LICENSE.txt`.

Original receiver rings, braces, optical core, roof, cables and fixtures connect the detailed props. Reusable facade modules are batched by material; skyline blocks/windows are instanced. Quantized attributes are expanded to float before world-space baking to preserve transforms. A fixture-motivated spotlight has a frozen desktop shadow map. Wet PBR patches reflect the environment, not a live mirror of local objects. Local halos and GPU rain provide atmosphere without an expensive full-screen postprocessing chain.

Pixel ratio begins at at most 1.75 desktop / 1.25 narrow viewports and reduces fill rate after sustained slow frames; model detail is preserved. Static geometry/materials are shared/batched before quality is reduced. The only render loop stops when the document is hidden and avoids repeated unchanged paused frames. Geometry, materials, textures, ImageBitmaps, PMREM target, listeners and renderer are released, including late assets after cancellation. No universal device frame-rate claim is made.

## Content, interaction and accessible alternatives

`src/lib/projects.ts` retains three resume-backed projects; `src/lib/experience.ts` retains professional history, grouped game server responsibilities, additional builds and documented scale. Existing facts and dates remain authoritative. Contact destinations come from the separately authorized public resume. No unconfigured project source/demo destination is fabricated.

Project selection changes the physical display’s original conceptual architecture diagram. Role selection changes the experience preview; domain selection changes toolkit copy and the relay’s subtle material response. A native dialog opens complete project, experience, about and skills records. It supports Escape, focus containment/restoration, a close button and document scrolling. Do not present conceptual diagrams as product output or sample activity as real measured results.

Reading mode exposes the entire server-rendered record in ordinary document flow against a scene-rendered still. It is available directly, automatically for initial reduced motion and for graphics/required-asset failure, and without JavaScript. The world may be explicitly enabled under reduced motion; navigation becomes immediate and automatic atmosphere stays disabled. Rain and ambient pause controls remain separate from navigation. All navigation and content access have keyboard/native alternatives to hotspots.

`/resume` embeds the exact owner-supplied PDF at `public/documents/Babisan-Pirapakaran-Resume.pdf`, with accessible fallback, direct-file and download links. No PDF library/service is needed. Private extended experience notes are not published.

`/infrastructure` uses the same environment and readable document language, retaining an interactive proposed AWS flow. This route does not claim that the portfolio currently runs on AWS.

## Separate infrastructure showcase

The proposed static site uses:

```text
Browser -- HTTPS --> CloudFront --> private S3 bucket
                     |
                     +-- TLS certificate managed by ACM
Route 53: DNS records directing the domain to CloudFront
```

Route 53 handles DNS, not HTTP proxying. CloudFront access to the private S3 origin requires explicit configuration such as origin access control. Terraform and GitHub Actions were discussed but are not approved/configured as the separate deployment workflow. Budget, provider permissions, cache behavior and operational checks remain undecided.

## Module boundaries

- `src/app/`: routes, metadata, shared provider/header and visual styles.
- `src/components/world-provider.tsx`: persistent lifecycle, native navigation, preferences, projected control and dialog reader.
- `src/components/portfolio-journey.tsx`: six content destinations and purposeful selection controls.
- `src/components/portfolio-records.tsx`: full factual records reused by dialog and reading mode.
- `src/lib/observatory-scene.ts`: assets, geometry, PBR lighting, camera rail, interaction response, render loop and cleanup.
- `src/lib/observatory-route.ts`: destination metadata, public renderer interface and project technology lists.
- `src/lib/projects.ts` / `experience.ts`: owner-backed public content.
- `src/components/interest-tabs.tsx` / `infrastructure-flow.tsx`: retained keyboard-accessible interests and proposed cloud walkthrough.
- `scripts/prepare-world-assets.mjs`: reproducible development-only asset packing.
- `public/world/`: self-hosted licensed derivatives and credits.
- `tests/portfolio.spec.ts`: current navigation, records, content, preferences, graphics failure, responsive and no-JavaScript behavior.
- `tests/resume.spec.ts`: native PDF, download, new-tab navigation and accessibility.
- `src/archive/`: prior cube, image-city and walking-district notes/styles. Former renderer/rig helpers remain dormant; their retained logic tests do not define the active design.

## Cinematic city-camera prototype

[Decision 0009](decisions/0009-authored-city-camera.md) records the owner’s critical camera addition. `/camera-study` is a bounded prototype, not a replacement of the current home environment or a claim that the full city is complete. The shared `WorldProvider` suppresses its observatory canvas/loader on this route to avoid duplicate WebGL loops.

- `src/lib/cinematic-journey.ts`: deterministic translation rail, arc-length pacing map, independent yaw/pitch/lens tracks, bounded additive parallax, quaternion focus blending, horizon leveling and the render-clock journey director.
- `src/lib/camera-study-scene.ts`: a connected street, storefronts/service bay, corner relay, open gate and empty basketball court. Reuses the existing licensed GLBs/maps; owns its renderer and GPU resources. Projected targets use the director’s actual rendered progress and architectural occlusion proxies.
- `src/components/camera-study.tsx` / `camera-study.css`: native scroll intent, actual-arrival captions/navigation, keyboard scrubber, object-specific focus dialogs, ambient pause and readable failure/no-JavaScript shot list. React does not receive per-frame pose state.
- `tests/cinematic-journey.spec.ts`: forward progression, reversibility, smooth pose continuity, level horizon, display-rate consistency, bounded parallax and focus restoration.
- `tests/camera-study.spec.ts`: real rendered camera poses/orientations, distinct compositions, forward/backward traversal, focus, mobile/keyboard/reduced-motion behavior and graphics failure.

The main orientation track uses authored yaw/pitch channels converted to quaternions rather than six interpolated look targets. Quaternion interpolation handles independent focus transitions; the horizon is explicitly leveled after additive motion. Full city art direction, more detailed architectural assets and rendering polish remain later work.
