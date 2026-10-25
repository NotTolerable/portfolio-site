# Architecture

Status: published observatory/camera study plus an undeployed Phase 3 connected city; Next.js/Vercel portfolio; separate AWS showcase remains planned. Updated: 2026-10-25.

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

## Phase 2 experimental street

`/city-preview` is an isolated local vertical slice under [decision 0010](decisions/0010-winter-street-vertical-slice.md). It must not be deployed or merged into production without approval. It does not replace the homepage or `/camera-study`, and it does not implement the court or full portfolio integration.

- `src/lib/city/route.ts`: lightweight shot/title metadata, keeping the still experience independent of Three.js initialization.
- `src/lib/city/camera.ts`: arc-length translation rail, monotone pacing/lens tracks, a C1 SQUAD quaternion orientation track with precomputed tangents, horizon leveling, additive cursor offsets and an analytic damped sign spring. The render-clock director supplies the authoritative progress for all four compositions and captions.
- `src/lib/camera-tracks.ts`: shared pure monotone interpolation extracted without changing the existing camera study's behavior.
- `src/lib/city/assets.ts`: self-hosted GLB/HDR/map loading, meshopt decoding and explicit resource tracking, including late-load cancellation. Asset preparation/provenance is in [city assets](assets/city-preview.md).
- `src/lib/city/environment.ts`: authored L-shaped street, detailed modular historic shells, varied shop/residential frontage, inset bookshop/café interiors, roofs, balconies, shutters, snow accumulation and source-model furniture. Static geometry is batched per building/material with source index buffers preserved; identical materials/texture variants are shared and shelf books are instanced. A ray/box intersection drives the localized storefront response.
- `src/lib/city/effects.ts`: world-space GPU snow with bounded cursor influence and a restrained procedural sky. Each snow point wraps independently without long streak artifacts.
- `src/lib/city/scene.ts`: one renderer/loop; ACES/sRGB output, half-float single-sample render target, reduced-resolution high-threshold bloom, linear-space SMAA and final OutputPass. Source normal/roughness/AO maps, PMREM image-based environment lighting, static moon/shop shadow maps and local contact surfaces supply the primary material/depth cues. No screen-space AO, live reflection pass or temporal effect is used.
- `src/components/city-preview.tsx` and `city-preview.css`: native scroll intent, render-progress text, keyboard-accessible composition links and warmth control, atmosphere pause and reversible still mode. Desktop/fine-pointer/no-reduced-motion enables 3D; smaller/coarse-pointer/reduced-motion/no-JavaScript visitors use scene captures without requesting models/HDR. Required-asset, WebGL or context failure exposes the same still narrative.

The shared world loader is suspended and its canvas removed on either experimental route; the preview has its own minimal header. Other routes retain their original provider and content. Pixel ratio caps at 1.5 and can reduce after sustained slow frames without reducing model detail. Hidden tabs suspend animation. Unchanged paused frames stop rendering. Teardown releases instancing, shadow/composer targets, geometry, materials, textures, ImageBitmaps, PMREM and listeners. `scripts/profile-city.mjs` reports actual machine/browser/viewport measurements; it makes no universal device frame-rate promise.

## Phase 3 — four connected districts (local experiment)

This supersedes the Phase 2 route details above, preserving its assets/rendering foundation and all production routes. [Decision 0011](decisions/0011-connected-night-city.md) records scope and tradeoffs.

- `city/layout.ts` is the shared metre-based map: road/walkable rectangles, district bounds/thresholds and four stable landmark IDs. `city/route.ts` supplies 14 subject-specific composition records without pulling Three.js into fallback UI.
- `city/camera.ts` combines a 35-point centripetal translation rail with arc-length lookup, monotone segment pacing/lens tracks and independent uniformly sampled SQUAD orientation. World-distance-capped render-clock progression prevents distant links from teleporting the camera. Availability caps stop travel at the last complete district. Parallax is a separate damped offset; the horizon stays level. The same rendered frame drives UI and interactions.
- `city/building-kit.ts` extracts shared detailed architecture, texture/material caches, signs, furniture, interior treatments and per-building material batching. `environment.ts` retains arrival; dynamically imported `districts.ts` constructs B/C/D in world coordinates. Chunk roots remain identity transforms because batching bakes source world matrices. Construction reuses shared shape geometry, expands source attributes once, and yields during batching at a roughly 4ms work budget; each chunk preuploads new textures and compiles against the main scene's fixed light configuration while still hidden before releasing the camera cap. Completed chunks stay resident for reverse travel and use bounding-rectangle visibility plus per-mesh frustum culling.
- Initial delivery loads shared detailed architecture/furniture/maps, HDR and one compact skinned pedestrian asset. It does not construct every distant building or request the C print before the opening is usable. B/C/D prebuild at progress .12/.36/.67, or sooner for a direct district request. Geometry is not rebuilt on ordinary scroll. Source assets are shared rather than separately downloaded per district.
- `city/lighting.ts` registers hidden authored practicals and assigns a fixed pool of four points, two areas and one shadowed spotlight. Fixture changes fade through zero before repositioning; moon and hemisphere complete the nine-light budget. The moon shadow is frozen between discrete world-travel updates. Source map AO/contact surfaces, PMREM lighting, linear HDR bloom/SMAA and one final OutputPass remain. No SSAO, temporal filter or local reflection render is added.
- `city/pedestrian-motion.ts` authors 17 separate sidewalk routes and static conversations. Distance drives phase, acceleration/deceleration, endpoint dwell and bounded turns. `pedestrians.ts` clones independent skeletons, shares skin/geometry/materials and uses the retained analytic leg/foot-planting rig. Nearby actors update at 60Hz, middle at 30Hz and distant at 12Hz; out-of-view rig updates stop. Runtime forward proximity yielding supplements nonintersecting authored lanes. The arcade portal omits glazing/plinth/shutter; its floor-height transition is matched by the walker root.
- `city/effects.ts` supplies camera-relative wrapped GPU snow restricted to actual street corridors and a translation-free sky. Local cursor influence, motivated practical warmth and hanging-sign motion remain restrained; snow thins in the residential district.
- `city-preview.tsx` now enables 3D on mobile as well as desktop when motion is allowed. Native scroll, four district links and previous/next shot controls work without hover. React updates on shot/district changes, not every frame. Touch uses the authored camera without pointer offsets. Mobile caps DPR at 1.15, halves moon/spot shadow sizes and reduces snow/bloom resolution; sustained slow frames can reduce DPR further to 1.
- Reduced motion, manual still mode, unavailable graphics/assets and no JavaScript use four actual district captures. Internal links still expose the original portfolio, records, resume and cloud plan. Scene cancellation, hidden tabs, settled pause, late assets, instancing/skeletons/shadows/composer targets/textures/bitmaps and listeners have explicit lifecycle cleanup.

See [Phase 3 report](reports/phase-3-connected-city.md) for review evidence, measurements and remaining limitations. This route remains an experiment, not a claim that the production portfolio has adopted the city.
