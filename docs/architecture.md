# Architecture

Status: night-city redesign implemented; main portfolio hosted on Vercel; AWS showcase remains planned. Updated: 2026-10-24.

## Application and hosting

The portfolio is a Next.js App Router application using TypeScript and npm. Vercel hosts [babisanp.com](https://babisanp.com), project `portfolio-site` under `nottolerables-projects`, connected to `NotTolerable/portfolio-site` with `main` as the production branch. No application environment variables, API, or database are required. Credentials and the local `.vercel/` link stay outside Git.

The owner approved a real, street-level comic journey with a character, keeping the night-city palette. [Decision 0007](decisions/0007-grounded-district.md) refines 0006 into a grounded district and unified journal; 0006 superseded the image-based implementation in 0005. See [DESIGN.md](../DESIGN.md). Both earlier [image-city](../src/archive/image-city/README.md) and [cube](../src/archive/cube-portfolio/README.md) compositions are archived.

## Current experience

- Server-rendered HTML provides the complete name, engineering introduction, project dossiers, experience ledger, personal chapter, interest tabs, cloud-plan link and footer. `src/lib/projects.ts` contains resume-backed project facts; `src/lib/experience.ts` contains the owner-supplied professional history and grouped game server work and other builds. Unconfigured source/contact links remain omitted; the resume is available at `/resume`.
- The `bp` header, self-hosted Barlow Condensed, Inter and JetBrains Mono retain the night-city identity. `ComicEntrance` briefly reveals the actual content without waiting for graphics or blocking navigation.
- `WorldHero` supplies the district poster and progressively imports `night-street.ts`. GSAP/ScrollTrigger map native scroll to travel intent and clickable field notes. No wheel interception or React frame updates are used. Timeline initialization waits for graphics readiness; failed/reduced-motion scenes retain a compact, usable opening.
- `district-environment.ts` constructs the complete curated street: batched architecture, instanced windows, a sign atlas, continuous ground and pavement, overhead cables, planters/benches, an arcade closing the vista and distant silhouettes. `district-materials.ts` provides diffuse surface hatching and procedural wet-road light pools/ripples. These are inexpensive stylized lighting techniques rather than a mirror render or a physically based global illumination simulation.
- `walker-motion.ts` integrates bounded distance/velocity and heading with small time substeps. Speed is capped at 0.9 m/s, with acceleration, braking, turning before reversal and double-support settling. Scroll, Auto walk and focused W/S all drive the same controller.
- `walker-rig.ts` authors the gait on the existing skeleton. Analytic two-bone IK holds world-space stance anchors, advances swing feet, and adds weight transfer, torso/shoulder response, alternating arms, breathing and subtle head motion. A damped shoulder camera follows the actual position without crossing the street. Grounding is designed for the curated flat route, not arbitrary terrain/collision physics.
- `street-character.ts` loads the CC0 model, skin and compact derived reference pose. The old idle/run FBXs remain dormant. The prior run loader selected a two-frame targeting pose; that asset is no longer used for locomotion. [Provenance and preparation](assets/street-character.md) describe the model and pose pipeline.
- Rendering uses one forward pass. Architectural materials use vertex lighting; windows/contact shadows are instanced, signs share one atlas, rain uses one GPU draw, and local halos replace fullscreen bloom. No planar reflection or real-time shadow-map pass is rendered. The rain/glow/pause controls remain functional.
- DPR is capped at 1.25 desktop / 1 mobile and drops to .85 after sustained slow frames. Rain uses 560 / 240 lines. Hidden/offscreen scenes stop requesting render frames; paused scenes avoid identical draws while retaining input. Geometry, textures, materials, observers, renderer and timelines are disposed on unmount, including cancellation after asset loading.
- Initial reduced motion avoids WebGL. A later preference change freezes automatic movement and disables the scroll sequence. Failed model/graphics loading or lost context restores the scene-rendered poster. Semantic content and native links/notes remain usable without JavaScript.
- Shared navigation tracks journal sections with IntersectionObserver rather than a per-frame scroll handler. Project dossiers, experience, interests, cloud planning and resume use the same ink/cyan/amber field-journal typography and panels. All existing factual content and routes remain present.
- `ExperienceSection` renders professional/contract roles, grouped multiplayer infrastructure and development, additional builds and education in semantic server-rendered articles and lists. The header links directly to `/#experience`. The extended source notes remain private. The owner separately authorized publishing the supplied resume PDF in full. AI-assisted client websites are labeled accordingly.
- Motion provides restrained content reveals with `initial={false}`. The personal-interest tabs use proper tab/tabpanel semantics, roving focus and Left/Right/Home/End keys.
- `/resume` is a server-rendered page with a native PDF object, accessible fallback/direct-file links and a download action. The exact owner-supplied PDF is self-hosted at `public/documents/Babisan-Pirapakaran-Resume.pdf`. Header and Experience links open `/resume` in a new tab. No client PDF-rendering library or external document service is required.
- `/infrastructure` remains an explicitly proposed AWS architecture walkthrough and distinguishes this Vercel portfolio from the planned static showcase.

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

- Further features beyond the current street journey, project notes, personal interests, and architecture diagram.
- Public case-study evidence and source/contact destinations.
- Any custom domain and hosting budget changes; hosting details for the separate showcase.
- Infrastructure-as-code and deployment approach.
- Whether any feature requires an API, external service, or stored data.

Record approved consequential choices in [decisions](decisions/README.md), then update this document to reflect the resulting design.

## Module boundaries

- `src/app/resume/page.tsx` / `public/documents/`: public resume viewer and owner-authorized PDF.
- `src/app/`: route markup, shared layout, styles, metadata, and favicon.
- `src/components/world-hero.tsx`: semantic city section, poster, progressive loading, pointer/keyboard controls, motion preferences, and native scroll input.
- `src/lib/night-street.ts`: scene lifecycle, shoulder camera, controller input, single-pass rendering, adaptive resolution and disposal.
- `src/lib/district-environment.ts` / `district-materials.ts`: batched set, lighting, local halos, wet ground and GPU rain.
- `src/lib/walker-motion.ts` / `walker-rig.ts`: frame-independent locomotion and procedural skeletal grounding.
- `src/lib/street-character.ts`: licensed mesh/skin/pose loading and rig preparation.
- `src/lib/engraved-material.ts`: character surface hatching.
- `src/lib/ink-world.ts`: dormant prior image-based renderer, retained with its archive.
- `src/components/comic-entrance.tsx`: once-per-document headline reveal coordination; no WebGL readiness dependency.
- `src/components/experience-section.tsx` / `src/lib/experience.ts`: professional summaries, grouped multiplayer systems work, client builds and education.
- `src/components/interest-tabs.tsx`: accessible personal-interest exploration.
- `src/components/project-visual.tsx` / `src/lib/projects.ts`: original subject illustrations and confirmed project metadata.
- `src/components/infrastructure-flow.tsx`: proposed AWS architecture interaction.
- `src/components/reveal.tsx`: reduced-motion-aware content reveals.
- `src/archive/cube-portfolio/`: snapshots and restoration notes for the prior design; the existing cube helpers/components remain dormant.
- `tests/portfolio.spec.ts`: current project/cloud navigation, keyboard tabs, scene controls/input, reduced motion, responsive overflow/accessibility, offscreen draw suppression, failed WebGL/model loading, and disabled JavaScript.
- `tests/walker-motion.spec.ts`: display-rate consistency, stopping/turn bounds and stance-foot stability on the actual model.
- `tests/resume.spec.ts`: embedded document, new-tab navigation, download, narrow layout, no-JavaScript controls and page accessibility.
- `tests/cube-orbit.spec.ts` / `tests/rubik-state.spec.ts`: retained verification of the archived cube’s exact state/motion logic.
