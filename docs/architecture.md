# Architecture

Status: initial site implemented locally; external deployment pending. Updated: 2026-10-14.

## Current repository

The repository contains a Next.js App Router application using TypeScript and npm. Content is authored in TSX and `src/lib/projects.ts`; no API or persistence layer is required.

## Design goals

- Present project evidence clearly and load efficiently.
- Make content and technical explanations easy to maintain.
- Make hosting and deployment understandable and reproducible.
- Choose infrastructure that serves an actual requirement.

## Main portfolio

- Next.js + TypeScript for the animated, interactive experience.
- Vercel is the initial hosting plan, with Git-connected automatic deployment intended but not configured.
- Three.js renders a monochrome textured 3×3 cube, initially scrambled through legal quarter-turns. Its 26 pieces carry 54 raised, beveled face tiles across six procedural physical materials with independent clearcoat, roughness, and height-map relief. An integer lattice and orientation basis preserve exact piece positions through repeated autonomous turns. The scene module is dynamically loaded in a client component; it disposes GPU resources on unmount, skips rendering offscreen/hidden, supports pause/reset and whole-cube mouse-hover, touch-drag, and keyboard input, renders at the display refresh rate without a 30 fps cap, and respects reduced motion. A CSS cube supplies loading and WebGL-failure fallback.
- Each texture has its own neutral base shade from near-black to charcoal. Dim environment reflections support an above-right spotlight; a diffuse, feathered SVG shaft behind the transparent canvas suggests the light path without full-scene fog or per-frame shadow passes. The lighting stays in world space while the cube rotates.
- A separate idle-orbit model retains speed during pointer input and resumes on the next frame after movement or pointer release, easing from 0.28 toward 0.36 radians/second. It follows the last horizontal/vertical direction, then gradually steers toward a new heading every 3–4 seconds. Pointer presence alone does not stop the orbit; holding a pointer, pausing, or reduced motion suppresses automatic rotation.
- The shared root layout includes a roughly one-second loading-bar greeting. It clears on a timer or keyboard interaction, is skipped for reduced motion, and does not replay on internal navigation. CSS also hides it if client JavaScript does not run.
- Motion handles restrained reveals and project-view transitions. Buttons use a neutral translucent glass finish with vertical gradients, inset top-edge highlights, and backdrop blur.
- Inter, Playfair Display, and JetBrains Mono are self-hosted through Fontsource, using the substitutes named in `DESIGN.md`.
- The project explorer supports keyboard-selectable project tabs, overview/source views, and clipboard copying of portfolio metadata.
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

- Any richer features beyond the current cube, project explorer, and architecture diagram.
- Page structure and project case-study organization.
- Vercel project/repository connection, domain, and budget; hosting details for the separate showcase.
- Infrastructure-as-code and deployment approach.
- Whether any feature requires an API, external service, or stored data.

Record approved consequential choices in [decisions](decisions/README.md), then update this document to reflect the resulting design.

## Module boundaries

- `src/app/`: layouts, route content, metadata, shared CSS, and icon.
- `src/components/hero-cube.tsx` and `src/lib/cube-scene.ts`: accessible whole-cube controls and lazy WebGL rendering with autonomous layer turns.
- `src/lib/rubik-state.ts`: exact logical cube state, legal turns, and deterministic scrambling.
- `src/lib/cube-textures.ts`: six shared procedural face materials with distinct grayscale tones and GPU texture disposal.
- `src/components/cube-ray.tsx`: broad, diffuse light shaft behind the WebGL canvas, with no hard streaks or source line.
- `src/components/site-intro.tsx`: first-load greeting and timed loading bar.
- `src/lib/cube-orbit.ts`: pointer-direction memory, immediate handoff from manual movement, and idle angular drift.
- `src/lib/cube-light.ts`: fixed above-right spotlight and supporting fill/rim lights.
- `src/components/project-explorer.tsx` and `src/lib/projects.ts`: client interactions and factual project metadata.
- `src/components/infrastructure-flow.tsx`: explorable proposed architecture.
- `src/components/reveal.tsx`: reusable reduced-motion-aware transitions.
- `tests/portfolio.spec.ts`: browser behavior, responsive, fallback, and automated accessibility checks.
- `tests/cube-orbit.spec.ts`: idle resumption, direction reversal, diagonal direction, and suppression during pause/held input.
- `tests/rubik-state.spec.ts`: inverse moves, repeated turns, lattice/sticker preservation, and mixed initial faces.
