# Babisan Pirapakaran — Nightfall

A personal software engineering portfolio combining [Samana Studio](https://samanastudio.es/) gallery composition with [Igloo Inc.](https://www.igloo.inc/) interaction studies in an original Nightfall theme. Next.js, TypeScript, direct Three.js, GSAP and Lenis combine three black-ice exhibits (introduction/basketball, experience/boxing gloves, projects/dumbbell), authored camera passes, typed detail HUDs, contact-responsive mineral shaders, a holographic GPU, atmospheric descent and a full-page resume finale.

## Current branches

- `redesign/samana-portfolio`: current Nightfall implementation, published through explicit Vercel production releases.
- `archive/3d-city-2026-10-25`: complete pre-redesign working state, snapshot `8004668`.
- `main`: configured GitHub-connected Vercel production branch. The current release was deployed explicitly from `redesign/samana-portfolio` without changing `main`.

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

A multilingual loading sequence leads through English, Tamil, Mandarin, Spanish, Arabic, Hindi and French greetings to Babisan’s name. Its thin loading line/counter waits for both the greeting sequence and real assets, then lifts into the live scene. The first ice exhibit’s geometric reveal starts after the curtain clears. The authorized opening-name update places a large two-line Babisan / Pirapakaran identity behind this exhibit, using scene depth/refraction and an early scroll fade; the update is being prepared alongside the hanging gloves and quicker intro. White particle basketball, boxing-glove and dumbbell forms replace the visible solid sports objects inside the ice, with sharper central refraction and a detailed licensed glove source. Cursor-polished black ice, an irregular triangular frost frontier, independently drifting geometric links, depth particles and a blue-hour cloud horizon connect the journey. The slanted GPU hologram has a modern single-fan silhouette and no branding. Direct record navigation and a labeled section rail keep it traversable. Opt-in audio combines an original quiet atmospheric score with short game-interface tones for hotspot/UI hover, typing and record actions; there are no wind/noise beds. The loading and page controls share sound state. Automatic graphics adapts resolution/effects to sustained frame cadence, with manual High/Balanced/Performance controls and a pixelated low-spec tier for the canvas. The menu offers complete reading mode and animation pause. No JavaScript or unavailable WebGL exposes server-rendered records automatically. Reduced motion skips the greeting motion/ambient animation and keeps direct scroll navigation. Native detail dialogs support keyboard focus and Escape.

The finale presents the whole authorized resume page as an image, with PDF, GitHub, LinkedIn and email actions. `/resume` still embeds the original PDF and provides open/download actions. `/infrastructure` explains the live Vercel serverless delivery setup, Cloudflare DNS/proxy, prebuilt pages and browser-side graphics. Email, GitHub and LinkedIn use the owner’s existing public details.

## Design and provenance

See [DESIGN.md](DESIGN.md), [architecture](docs/architecture.md), [current decision](docs/decisions/0017-multilingual-arrival-and-ambient-score.md), [Igloo study](docs/reports/igloo-hybrid-study.md), [Samana study](docs/reports/samana-reference-study.md) and [asset provenance](docs/assets/underwater-gallery.md).

Former attributed CC BY4 sculptures and the CC0 Microsoft fish remain dormant, with provenance retained. The active mineral shaders, basketball/dumbbell artwork, geometric fields, sky and sound design are original. The 3D renderer fetches the CC0 studio HDR and Joachim Bornemann’s CC0 Vintage boxing gloves; the gloves supply particle positions only. Ice, GPU and shaders are original approximations; the source application, S data and unidentified-license reference assets are not bundled. Credits are visible in the site.

Vercel project `portfolio-site` under `nottolerables-projects` remains connected to `NotTolerable/portfolio-site`; pushes to `main` deploy production automatically. The owner’s latest request authorizes publishing the completed, verified large-name, hanging-glove and quicker-intro update to Vercel production, superseding the intervening local-only holds. This update is being prepared and must not be reported live until deployment and public verification finish. Production releases use `vercel --prod --yes --scope nottolerables-projects` from the committed `redesign/samana-portfolio` checkout against the existing linked project; it does not merge or change `main`. The public site is [babisanp.com](https://babisanp.com). The preceding release passed build, lint, typecheck and all 36 tests; public Chrome verification confirmed scene initialization, the sculpted glove asset, experience navigation, resume/PDF and infrastructure routes without JavaScript errors. The current update requires its own verification. No application environment variables or backend services are required.
