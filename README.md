# Babisan Pirapakaran — After Hours

A software engineering portfolio built as one continuous, camera-led night-city observatory. Next.js App Router, TypeScript and Three.js serve the experience and its complete server-rendered reading alternative. Hosted at [babisanp.com](https://babisanp.com).

## Development and verification

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run lint
npm run typecheck
npm run test:e2e
```

Browser checks require Google Chrome and start their own production server at `127.0.0.1:3012`; build first. They cover destinations, records/focus, content, persistent cross-route rendering, interests/cloud flow, ambient pause, reduced motion, model/WebGL/context failure, responsive accessibility, PDF download and no-JavaScript access. Retained cube/rig tests exercise dormant archived logic, not active design requirements.

## Experience

- One persistent rooftop world connects introduction, projects, complete experience, personal background, toolkit and contact. Native scroll drives a continuous camera rail; direct destination links and object-anchored controls provide alternatives.
- Detailed licensed optical/radio/relay/desk/lamp/searchlight models, modular architecture, PBR surfaces, wet patches, HDR reflections, a static shadow map and GPU rain form the environment. See [asset provenance](docs/assets/observatory.md) and `public/world/LICENSE.txt`.
- Project and domain selection respond in the actual scene. Native dialog readers present complete factual records with keyboard access, focus handling and readable document layout.
- JetBrains Mono identity/annotations and professional Inter headings/body replace the former heavy comic typography.
- Reading mode, initial reduced motion, failed graphics/assets and no JavaScript expose all records. The fallback poster is a capture of the actual world. Ambient movement can be paused independently of navigation.
- Verilly, Behaviourly and Axiom retain resume-backed descriptions and conceptual illustrations; unprovided live demos/source links/results are not invented. GPU/CUDA remains a learning interest.
- Complete experience includes 407 ETR, freelance/contract work, grouped multiplayer infrastructure/performance/anti-cheat/Java development, AI-assisted client builds, plugins, coursework and education.
- `/resume` embeds the exact owner-authorized PDF with direct-file/download links. `/infrastructure` presents a clearly proposed separate AWS architecture. This portfolio runs on Vercel.
- Owner email, GitHub and LinkedIn come from the published resume. Private extended experience notes are not published.

## Camera direction prototype

`/camera-study` previews a connected nighttime street journey ending in an empty basketball court. Six authored compositions demonstrate independent position/orientation/lens/pacing tracks, reversible scroll travel, horizon-safe pointer parallax, object-specific focus and synchronized captions/hotspots. It reuses the existing licensed assets and preserves the published homepage; full city expansion follows camera review. See [decision 0009](docs/decisions/0009-authored-city-camera.md).

## Assets

`node scripts/prepare-world-assets.mjs /absolute/path/to/source-downloads` rebuilds the self-hosted model derivatives. See [preparation and licenses](docs/assets/observatory.md). Source geometry and 1k map detail are retained; repeated materials/geometry are shared and GLBs use meshopt compression. The tools are development-only.

The former [grounded district](src/archive/grounded-district/README.md), [image-city](src/archive/image-city/README.md) and [cube](src/archive/cube-portfolio/README.md) are dormant archives. Old preparation/profiling scripts target those archived implementations.

## Deployment

Vercel project `portfolio-site` under `nottolerables-projects` is connected to [NotTolerable/portfolio-site](https://github.com/NotTolerable/portfolio-site). Pushes to `main` deploy production with default Next.js settings. No application environment variables are required. `.vercel/`, credentials, environment files, dependencies, builds and browser artifacts are ignored. The separate AWS showcase remains planned.

## Project context

See [design](DESIGN.md), [requirements](docs/product-requirements.md), [architecture](docs/architecture.md), [roadmap](docs/roadmap.md) and [decisions](docs/decisions/README.md). The current experience follows [decision 0008](docs/decisions/0008-continuous-observatory.md), superseding the walking-character composition.
