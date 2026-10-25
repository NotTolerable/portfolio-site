# Babisan Pirapakaran — Under the Surface

A personal software engineering portfolio presented as an underwater gallery, closely adapting [Samana Studio](https://samanastudio.es/). Next.js, TypeScript, direct Three.js, GSAP and Lenis combine three project exhibits, authored camera passes, complete experience records and a particle-built processor.

## Current branches

- `redesign/samana-portfolio`: new local gallery, not deployed.
- `archive/3d-city-2026-10-25`: complete pre-redesign working state, snapshot `8004668`.
- `main`: existing GitHub-connected Vercel production at babisanp.com; unchanged by this work.

The previous ZIP snapshot remains in ignored `archives/`. City/observatory/cube source is dormant; old city integration checks are preserved under `tests/archive`. `/camera-study` and `/city-preview` now redirect home.

## Run and verify

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Browser tests require installed Google Chrome and create a dedicated production server at `127.0.0.1:3012`. Build first. They cover reversible travel, project/experience records, focus, reading mode, narrow layouts/accessibility, no-script/WebGL failure, infrastructure and resume embedding/download. Retained cube/walker math checks cover dormant code.

## Content and access

Axiom, Verilly and Behaviourly retain resume-backed descriptions. Complete experience includes 407 ETR, freelance/contract work, grouped multiplayer infrastructure/performance/anti-cheat/Java development, client builds, plugins, coursework and education. No missing project links, certifications or measured benchmarks are invented; CUDA remains an exploration interest.

The menu offers complete reading mode and animation pause. No JavaScript or unavailable WebGL exposes server-rendered records automatically. Reduced motion skips the entrance/ambient animation and keeps direct scroll navigation. Native detail dialogs support keyboard focus and Escape.

`/resume` embeds the owner-authorized PDF and provides open/download actions. `/infrastructure` documents the clearly proposed separate AWS static-site flow; it does not claim the portfolio runs on AWS. Email, GitHub and LinkedIn use the owner’s existing public details.

## Design and provenance

See [DESIGN.md](DESIGN.md), [architecture](docs/architecture.md), [decision0012](docs/decisions/0012-underwater-portfolio.md), [reference study](docs/reports/samana-reference-study.md) and [asset provenance](docs/assets/underwater-gallery.md).

Two attributed CC BY4 sculptures and a CC0 Microsoft fish are self-hosted. Ice, processor and shaders are original approximations; the source application, S data and unidentified-license reference assets are not bundled. Credits are visible in the site.

Vercel project `portfolio-site` under `nottolerables-projects` remains connected to `NotTolerable/portfolio-site`; pushes to `main` deploy production. Publishing this redesign is outside the current request. No application environment variables or backend services are required.
