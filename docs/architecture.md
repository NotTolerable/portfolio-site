# Architecture

Status: night-city redesign implemented; main portfolio hosted on Vercel; AWS showcase remains planned. Updated: 2026-10-24.

## Application and hosting

The portfolio is a Next.js App Router application using TypeScript and npm. Vercel hosts [babisanp.com](https://babisanp.com), project `portfolio-site` under `nottolerables-projects`, connected to `NotTolerable/portfolio-site` with `main` as the production branch. No application environment variables, API, or database are required. Credentials and the local `.vercel/` link stay outside Git.

The owner approved a full night-city/anime rebrand; [decision 0005](decisions/0005-anime-night-city.md) supersedes the old active composition. See [DESIGN.md](../DESIGN.md) for the visual source. The old cube is retained in source and the [archive](../src/archive/cube-portfolio/README.md), and its meshes/materials/entrance are not imported by the current homepage.

## Current experience

- Server-rendered HTML supplies the complete name, introduction, project dossiers, native project notes, personal story, cloud-plan link, and footer. `src/lib/projects.ts` remains the factual project source; no owner contributions, outcomes, technologies, or credentials have been invented.
- The shared header uses the new `bp` wordmark and Work / The human / Cloud lab links. Barlow Condensed, Inter, and JetBrains Mono are self-hosted. The font license is included in `public/licenses/`.
- `ComicEntrance` coordinates a short CSS reveal of the actual headline/copy, without hiding the page behind a loader or waiting for WebGL. The persistent layout prevents it replaying after internal navigation. Interaction completes the entrance; reduced-motion CSS disables it. Native CSS still works without hydration.
- `WorldHero` immediately supplies the server-rendered city poster and progressively imports `ink-world.ts`. The same direct image URL is reused for its texture and the concept-art panel, avoiding duplicate optimized/raw downloads. Readable content and navigation do not depend on graphics readiness.
- `ink-world.ts` implements an **image-based 2.5D environment**, not a fully modelled city or free-roaming game level. A single original rendered city image provides baked architectural detail and lighting. An 80×48-segment depth-deformed plane, seven low-opacity mist sprites, and one GPU line-segment rain draw call provide depth and atmosphere. There are no real-time building lights, physics simulations, postprocessing chains, or model downloads.
- The image is an approximately 283 KB, 1536×1024 WebP. [Provenance and the generation prompt](assets/night-city.md) distinguish it from actual project screenshots. Samana/Igloo assets and source code are not embedded.
- A short native-scroll interval advances the camera and reframes the city; it never intercepts wheel input. Primary-pointer dragging and arrow keys move the view within bounded limits; hover does not steer. Touch keeps native vertical scrolling through `pan-y` and releases the drag on cancel/lost capture. Rain and neon grading have explicit toggles; a visible pause control and Space on the scene hold automatic atmosphere/camera drift.
- Rendering follows display frames with mutable inputs, without React frame updates. DPR is capped at 1.5 desktop / 1.25 mobile and drops to 1 after 90 sustained slow frames. Rain uses 420 / 180 line segments. Initial reduced motion does not initialize WebGL; a later preference change freezes automatic motion and removes the scroll movement. A paused/still scene stops issuing identical draw calls, and hidden/offscreen scenes skip drawing. Scene geometry, textures, materials, observers, listeners, and renderer resources are disposed on unmount.
- Failed initialization, image loading, or a lost graphics context leaves the poster/content presentation usable. The site also works without JavaScript. Automatic enhancements never replace the semantic name or project text.
- Motion supplies restrained content reveals with `initial={false}` so server content remains visible. The personal-interest tabs implement proper tab/tabpanel semantics, roving focus, Left/Right/Home/End keys, and honest learning-interest descriptions.
- `/infrastructure` retains an interactive, explicitly proposed AWS request path and uses the new identity. It describes the current Vercel portfolio separately from the planned static AWS showcase.

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

- Further features beyond the current city scene, project notes, personal interests, and architecture diagram.
- Owner-verified case-study content and publishable source, resume, and contact destinations.
- Any custom domain and hosting budget changes; hosting details for the separate showcase.
- Infrastructure-as-code and deployment approach.
- Whether any feature requires an API, external service, or stored data.

Record approved consequential choices in [decisions](decisions/README.md), then update this document to reflect the resulting design.

## Module boundaries

- `src/app/`: route markup, shared layout, styles, metadata, and favicon.
- `src/components/world-hero.tsx`: semantic city section, poster, progressive loading, pointer/keyboard controls, motion preferences, and native scroll input.
- `src/lib/ink-world.ts`: lightweight Three.js image projection, mist, GPU rain, color grading, adaptive resolution, and resource disposal.
- `src/components/comic-entrance.tsx`: once-per-document headline reveal coordination; no WebGL readiness dependency.
- `src/components/interest-tabs.tsx`: accessible personal-interest exploration.
- `src/components/project-visual.tsx` / `src/lib/projects.ts`: original subject illustrations and confirmed project metadata.
- `src/components/infrastructure-flow.tsx`: proposed AWS architecture interaction.
- `src/components/reveal.tsx`: reduced-motion-aware content reveals.
- `src/archive/cube-portfolio/`: snapshots and restoration notes for the prior design; the existing cube helpers/components remain dormant.
- `tests/portfolio.spec.ts`: current project/cloud navigation, keyboard tabs, scene controls/input, reduced motion, responsive overflow/accessibility, offscreen draw suppression, failed WebGL/image loading, and disabled JavaScript.
- `tests/cube-orbit.spec.ts` / `tests/rubik-state.spec.ts`: retained verification of the archived cube’s exact state/motion logic.
