# Babisan Pirapakaran — Portfolio

An interactive Next.js + TypeScript portfolio following the current [DESIGN.md](DESIGN.md): pure black, a serif hero, graphite hairlines, ghost buttons, and restrained violet code accents. The earlier navy/teal particle design has been replaced.

## Development

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Next.js. For production:

```sh
npm run build
npm start
```

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Browser checks require installed Google Chrome and start a dedicated production server on port 3012. They exercise project selection, keyboard navigation, clipboard copying, the 3D cube, idle direction/resumption, reduced motion, WebGL failure, responsive overflow, and automated WCAG accessibility checks. Screenshots and failure traces go in ignored `test-results/`.

## Visual implementation

- **Fonts:** locally bundled Inter, Playfair Display as the specified Domaine substitute, and JetBrains Mono as the specified Commit Mono substitute. Commercial reference font files are not included.
- **3D:** A self-scrambling 3×3 Three.js cube with six procedural monochrome textures with distinct near-black-to-charcoal base shades. Raised beveled tiles have individual clearcoat, roughness, and height relief. A fixed soft spotlight shines from above-right, paired with a broad, diffuse SVG light shaft and supporting reflections. The initial legal scramble mixes textures across every side. Layers turn autonomously; moving the mouse rotates the whole cube without holding a button; touch dragging and arrow keys are also supported. The idle orbit resumes on the next frame after movement or pointer release, carrying its speed into the last movement direction and easing from 0.28 toward 0.36 radians/second. It smoothly steers toward a new heading every 3–4 seconds. A stationary hovering cursor allows idle rotation to resume; holding the pointer pauses the idle orbit. Space or the pause button freezes all automatic motion; reset restores only the view. Rendering follows `requestAnimationFrame` with no 30 fps cap; actual frame rate depends on display and GPU. No external models, textures, or HDR downloads are required.
- **Fallback:** a CSS cube remains visible if WebGL cannot initialize. Reduced motion shows the initially scrambled cube without automatic motion; rendering is skipped offscreen and while the document is hidden.
- **Motion:** Motion for restrained reveals and project content transitions, respecting reduced-motion preferences. Buttons have a subtle neutral glass finish with vertical gradients, top-edge highlights, and backdrop blur.
- **Intro:** a short loading-bar greeting appears on a fresh page load and clears in about one second. It does not replay on internal navigation, is skipped for reduced motion, and dismisses on Tab/Escape.
- **Projects:** an accessible tabbed explorer with overview and copyable portfolio metadata. Metadata is not presented as the projects' implementation source.

## Content

The two existing projects are AI governance compliance checking and AI mock interviews involving computer vision. Deeper implementation details, screenshots, source links, resume, and contact details require owner-provided material. The site does not invent results or capabilities.

`/infrastructure` is a clearly labeled plan for a future separate AWS static showcase, with an interactive proposed architecture. Update its link when that site exists. The main portfolio is intended for Vercel.

## Vercel

Import `NotTolerable/portfolio-site` into Vercel, keep the detected Next.js preset and default build/output settings, and select the production branch. No environment variables are required by this implementation. After connecting, Git pushes produce deployments and production branch updates deploy to production. The account connection and deployment have not been configured here. See [Vercel's Git integration documentation](https://vercel.com/docs/git).

## Dependency status

The dependency installation reports an unpatched `braces` advisory in the development-only Next.js ESLint dependency chain. The application dependencies are not implicated by that advisory. Do not force an incompatible Next.js lint-tool downgrade; recheck when upstream tooling updates. See [the advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
