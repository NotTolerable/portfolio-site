# Babisan Pirapakaran — portfolio

A personal software engineering portfolio built with Next.js App Router, TypeScript, Three.js, and Motion. Hosted on Vercel at [portfolio-site-mu-six-92.vercel.app](https://portfolio-site-mu-six-92.vercel.app).

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

Browser checks require installed Google Chrome. They start a separate production server at `127.0.0.1:3012`; build first. Tests exercise project notes, mouse/touch/keyboard cube rotation, automatic animation, drag-only manual steering, keyboard pause, touch cancellation, the reversible particle transition, reduced motion, responsive layouts, missing assets/WebGL fallback, and automated accessibility.

## Experience

- An ink-black, subtly blue-gray systems theme with self-hosted Inter, JetBrains Mono details, a Playfair Display name, and selective glass controls.
- A name-led intro with the interactive, textured Rubik-style cube. A short native-scroll sequence deconstructs its cubelets into a GPU particle cloud, then a generic processor silhouette. The project link skips directly to work. Reduced motion removes the extended scroll sequence and morph.
- A legal initial scramble mixes the materials. Automatic tumble and eased double-scrambles remain enabled. Manual steering requires mouse/touch dragging or arrow keys; hover does not steer. Space on the focused cube pauses/resumes automatic motion. The cube and hologram have no caption/control overlay. The static glass-frost SVG gives buttons subtle texture and rim highlights.
- Original Resend material images are self-hosted with [provenance and motion notes](docs/assets/resend-cube.md). The custom Three.js implementation recreates some material layers and is not a complete Spline embed.
- Two project articles with original SVG concept illustrations and native expandable notes. The illustrations are not actual product screenshots. Project contributions, stacks, source/demo links, results, and detailed case studies await owner-provided evidence.
- A personal about section and a clearly labeled `/infrastructure` planning page for a separate static AWS showcase. No certifications or deployment claims are invented.
- Offscreen/hidden rendering suppression, capped device pixel ratio, 3,400/6,800 point budgets, and scene/texture/geometry/event disposal. A static CSS fallback preserves content if WebGL or material loading fails.
- A roughly one-second first-load greeting, skipped for reduced motion and dismissible with Tab/Escape. It does not replay on internal navigation.

## Context

See [DESIGN.md](DESIGN.md), [product requirements](docs/product-requirements.md), [architecture](docs/architecture.md), [roadmap](docs/roadmap.md), and [decisions](docs/decisions/README.md).

Contact details, a resume, and public profile/project-source links are not configured. Supply publishable destinations before adding those links. Environment files, account credentials, dependencies, build output, and browser artifacts are ignored by Git.
