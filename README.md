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

- A real 3D night street with a fictional rigged character, ink-hatched architecture, wet-road reflections, warm/cyan windows and GPU rain. Native scrolling advances the character and camera through comic-caption chapters. No city panorama is projected as the live scene.
- An immediate semantic introduction, self-hosted Barlow Condensed / Inter / JetBrains Mono, and a direct project link that skips the journey.
- Bounded drag/arrow camera controls, rain/glow toggles and keyboard pause. Capped resolution, batched geometry, instanced windows and adaptive effects manage GPU cost. Offscreen/hidden scenes stop drawing.
- A scene-rendered poster for loading, reduced motion and failed graphics/model downloads. Content and native project notes remain usable without JavaScript.
- Two personal-project dossiers with original subject illustrations. Detailed contributions, source/demo links and measured results await owner-provided evidence. Systems, GPU and cloud remain learning interests.
- A clearly labeled `/infrastructure` planning route for a separate static AWS showcase. The actual portfolio runs on Vercel.

See [character and scene provenance](docs/assets/street-character.md). Previous [image-city](src/archive/image-city/README.md) and [cube](src/archive/cube-portfolio/README.md) designs are archived and do not load on the active route.

## Context

See [DESIGN.md](DESIGN.md), [product requirements](docs/product-requirements.md), [architecture](docs/architecture.md), [roadmap](docs/roadmap.md), and [decisions](docs/decisions/README.md).

Contact details, a resume, and public profile/project-source links are not configured. Supply publishable destinations before adding those links. Environment files, account credentials, dependencies, build output, and browser artifacts are ignored by Git.
