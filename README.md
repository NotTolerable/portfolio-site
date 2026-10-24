# Babisan Pirapakaran — portfolio

A personal software engineering portfolio built with Next.js App Router, TypeScript, Three.js, GSAP and Motion. Hosted on Vercel at [babisanp.com](https://babisanp.com).

## Deployment

The Vercel project `portfolio-site` is connected to [NotTolerable/portfolio-site](https://github.com/NotTolerable/portfolio-site). Pushes to `main` deploy to production. Vercel detects Next.js and uses its default build settings; no application environment variables are required. The local `.vercel/` account/project link and credentials are excluded from Git. The separate AWS showcase remains planned.

## Local development

```sh
npm ci
npm run dev
```

## Verification

```sh
npm run build
npm run lint
npm run typecheck
npm run test:e2e
```

Browser checks require installed Google Chrome. They start a separate production server at `127.0.0.1:3012`; build first. Tests cover project/cloud navigation, interest tabs, scroll-driven street progression, scene controls, mouse/touch/keyboard input, reduced motion, responsive accessibility, offscreen drawing suppression, model/WebGL failures and no-JavaScript access. Archived cube state/motion tests remain.

## Experience

- A real 3D night street with a fictional rigged character, ink-hatched architecture, procedural wet-road lighting, warm/cyan windows and GPU rain. Native scrolling, Auto walk and focused W/S drive a measured, grounded walk with a stable shoulder camera and field notes. No city panorama is projected as the live scene.
- An immediate semantic introduction, self-hosted Barlow Condensed / Inter / JetBrains Mono, and a direct project link that skips the journey.
- Bounded drag/arrow camera controls, rain/glow toggles and keyboard pause. One forward render, capped resolution, batched geometry, a sign atlas, instanced windows/contact shadows and adaptive resolution manage GPU cost. Offscreen/hidden scenes stop drawing.
- A scene-rendered poster for loading, reduced motion and failed graphics/model downloads. Content and native project notes remain usable without JavaScript.
- Three resume-backed project dossiers for Verilly, Behaviourly and Axiom, with original subject illustrations. Public source/demo links and reproducible results remain pending.
- A complete experience ledger spanning the 407 ETR internship, freelance/contract development, grouped multiplayer infrastructure and development, AI-assisted client builds, public plugins and education. The owner-authorized resume is embedded at `/resume` with PDF/download links; extended experience notes remain private. GPU/CUDA remains an exploration interest.
- A clearly labeled `/infrastructure` planning route for a separate static AWS showcase. The actual portfolio runs on Vercel.

See [character and scene provenance](docs/assets/street-character.md). Previous [image-city](src/archive/image-city/README.md) and [cube](src/archive/cube-portfolio/README.md) designs are archived and do not load on the active route.

## Scene profiling

With a separate production server running on port 3012, run `node scripts/profile-district.mjs` (add `--walk` for locomotion). It records 100 frames at 1280×900 in headless Chrome with ANGLE SwiftShader, including draw calls, buffer resolution and character asset bytes. Adaptive resolution remains enabled. These figures diagnose regressions; they do not predict a device’s hardware frame rate.

`node scripts/prepare-courier.mjs` regenerates the compact reference pose from the licensed source idle clip. The active scene does not download the idle/run FBXs.

## Context

See [DESIGN.md](DESIGN.md), [product requirements](docs/product-requirements.md), [architecture](docs/architecture.md), [roadmap](docs/roadmap.md), and [decisions](docs/decisions/README.md).

The supplied resume is public at `/resume`. Additional contact and public profile/project-source links are not configured. Supply publishable destinations before adding those links. Environment files, account credentials, dependencies, build output, and browser artifacts are ignored by Git.
