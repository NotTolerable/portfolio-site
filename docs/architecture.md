# Architecture

Status: night-city redesign implemented; main portfolio hosted on Vercel; AWS showcase remains planned. Updated: 2026-10-24.

## Application and hosting

The portfolio is a Next.js App Router application using TypeScript and npm. Vercel hosts [babisanp.com](https://babisanp.com), project `portfolio-site` under `nottolerables-projects`, connected to `NotTolerable/portfolio-site` with `main` as the production branch. No application environment variables, API, or database are required. Credentials and the local `.vercel/` link stay outside Git.

The owner approved a real, street-level comic journey with a character, keeping the night-city palette. [Decision 0006](decisions/0006-street-character-journey.md) supersedes the image-based implementation in 0005. See [DESIGN.md](../DESIGN.md). Both earlier [image-city](../src/archive/image-city/README.md) and [cube](../src/archive/cube-portfolio/README.md) compositions are archived.

## Current experience

- Server-rendered HTML provides the complete name, engineering introduction, project dossiers, experience ledger, personal chapter, interest tabs, cloud-plan link and footer. `src/lib/projects.ts` contains resume-backed project facts; `src/lib/experience.ts` contains the owner-supplied professional history and grouped game server work and other builds. Missing source/contact/resume links remain omitted.
- The `bp` header, self-hosted Barlow Condensed, Inter and JetBrains Mono retain the night-city identity. `ComicEntrance` briefly reveals the actual content without waiting for graphics or blocking navigation.
- `WorldHero` renders the street poster immediately, then progressively imports `night-street.ts`. A paused GSAP timeline and ScrollTrigger map native scrolling to mutable scene progress, comic captions, chapter navigation and an SVG panel exit. No scroll interception or React frame-by-frame state updates are used. Scene readiness refreshes the scroll measurements.
- `night-street.ts` constructs real street/building geometry, façade details, cables, signs, lamps and skyline. Static meshes merge by material; windows use instancing. `engraved-material.ts` adds antialiased, light-dependent hatching to lit surfaces. The camera and character advance through world-space coordinates rather than reframing a background image.
- `street-character.ts` loads a small CC0 Kenney skeletal character and idle/run clips, normalizes scale, applies the ink material and blends locomotion from scroll movement. The character is fictional. [License, source and modifications](assets/street-character.md) accompany the model files.
- Wet pavement uses a 512-pixel desktop / 256-pixel mobile planar reflection updated on alternate frames. A directional shadow, four local lights, GPU line rain, restrained bloom and fog provide atmosphere. DPR is capped at 1.35 desktop / 1 mobile; sustained slow frames reduce DPR and disable reflection/bloom. This is more demanding than the archived image projection, and performance depends on device/browser.
- Primary-pointer dragging and Left/Right keys adjust the view; hover does not steer. Touch retains `pan-y` and releases on cancellation/lost capture. Rain and neon bloom have toggles. Pause/Space freezes automatic atmosphere and character animation; explicit scroll/drag input remains usable.
- Hidden/offscreen scenes skip GPU draws. Paused scenes avoid identical draws. Geometry, textures, materials, render targets, mixer, observers, renderer and GSAP timelines are disposed on unmount. Initial reduced motion retains a static poster without creating WebGL. A later preference change disables automatic motion and removes the scroll sequence.
- The poster is rendered directly from the scene, not used as its texture. Failed WebGL/model loading or lost context retains that image, semantic content and project navigation. Without JavaScript the static opening, projects and native notes still work.
- `ExperienceSection` renders professional/contract roles, grouped multiplayer infrastructure and development, additional builds and education in semantic server-rendered articles and lists. The header links directly to `/#experience`. Raw source PDFs and personal phone/email details are not shipped. AI-assisted client websites are labeled accordingly.
- Motion provides restrained content reveals with `initial={false}`. The personal-interest tabs use proper tab/tabpanel semantics, roving focus and Left/Right/Home/End keys.
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
- Public case-study evidence and source/resume/contact destinations.
- Any custom domain and hosting budget changes; hosting details for the separate showcase.
- Infrastructure-as-code and deployment approach.
- Whether any feature requires an API, external service, or stored data.

Record approved consequential choices in [decisions](decisions/README.md), then update this document to reflect the resulting design.

## Module boundaries

- `src/app/`: route markup, shared layout, styles, metadata, and favicon.
- `src/components/world-hero.tsx`: semantic city section, poster, progressive loading, pointer/keyboard controls, motion preferences, and native scroll input.
- `src/lib/night-street.ts`: geometry, lights, GPU rain, reflection/postprocessing, camera/character journey, adaptive quality and disposal.
- `src/lib/street-character.ts`: licensed model/animation loading and movement blending.
- `src/lib/engraved-material.ts`: surface hatching.
- `src/lib/ink-world.ts`: dormant prior image-based renderer, retained with its archive.
- `src/components/comic-entrance.tsx`: once-per-document headline reveal coordination; no WebGL readiness dependency.
- `src/components/experience-section.tsx` / `src/lib/experience.ts`: professional summaries, grouped multiplayer systems work, client builds and education.
- `src/components/interest-tabs.tsx`: accessible personal-interest exploration.
- `src/components/project-visual.tsx` / `src/lib/projects.ts`: original subject illustrations and confirmed project metadata.
- `src/components/infrastructure-flow.tsx`: proposed AWS architecture interaction.
- `src/components/reveal.tsx`: reduced-motion-aware content reveals.
- `src/archive/cube-portfolio/`: snapshots and restoration notes for the prior design; the existing cube helpers/components remain dormant.
- `tests/portfolio.spec.ts`: current project/cloud navigation, keyboard tabs, scene controls/input, reduced motion, responsive overflow/accessibility, offscreen draw suppression, failed WebGL/model loading, and disabled JavaScript.
- `tests/cube-orbit.spec.ts` / `tests/rubik-state.spec.ts`: retained verification of the archived cube’s exact state/motion logic.
