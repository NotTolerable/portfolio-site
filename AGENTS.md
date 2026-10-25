# Project instructions

## Working agreement

- This repository is a job-seeking software engineering portfolio. Read `docs/product-requirements.md`, `docs/architecture.md`, and `docs/roadmap.md` before implementation work.
- Website implementation is authorized. The current approved direction is a faithful Samana Studio underwater-gallery adaptation, personalized for Babisan Pirapakaran. Follow `DESIGN.md` and `docs/decisions/0012-underwater-portfolio.md`. The owner explicitly canceled the night city; prior character, observatory, court and city-stage requirements are historical, not active. Preserve factual content and `/resume` and `/infrastructure`.
- Keep confirmed requirements separate from proposals and open questions. Do not silently turn a suggested stack or visual direction into an approved decision.
- Describe demonstrated experience accurately. Do not invent certifications, project outcomes, benchmark results, employment history, or expertise.

## Context ownership

- `AGENTS.md`: durable contributor instructions, conventions, commands, boundaries, and verification expectations.
- `DESIGN.md`: visual direction, design tokens, and interaction guidance.
- `docs/product-requirements.md`: audience, goals, scope, and acceptance criteria.
- `docs/architecture.md`: current system design and proposed architecture, with status clearly labeled.
- `docs/decisions/`: significant decisions, alternatives, consequences, and superseding records.
- `docs/roadmap.md`: priorities, milestones, deferred work, and unresolved planning questions.
- Keep temporary plans, tool output, and session logs out of these documents. Use the current conversation or a disposable task note for temporary context.
- Update the relevant document when an approved requirement or implemented architecture changes. Link to its source document instead of duplicating detailed requirements.

## Implementation conventions

- Use Next.js App Router, TypeScript and npm, with direct Three.js, GSAP and Lenis for the gallery. One homepage renderer owns authored scroll/camera poses, ice/sculpture exhibits, atmosphere, particles and the processor formation. Content routes remain HTML and do not initialize WebGL. Update the existing content records rather than inventing new experience. See `docs/architecture.md`.
- Preserve `archive/3d-city-2026-10-25` (snapshot `8004668`) as the complete pre-redesign working state. Work on `redesign/samana-portfolio`; do not deploy or push unless requested. Existing GitHub-connected `main` remains production. Old experimental URLs redirect home; old city integration tests live under `tests/archive` and are excluded from the active browser suite.
- Respect third-party asset licenses. Keep model authors, source URLs, licenses and modifications in `public/gallery/ATTRIBUTION.txt`, with visible Credits access. Original reference code and unidentified-license assets are not application dependencies.
- Prefer accessible, semantic markup, responsive layouts, and restrained dependencies.
- Keep application code, infrastructure configuration, and content responsibilities clear once their structure is defined.
- Never commit credentials, private environment values, or personal data not intended for publication. Document required configuration with placeholders.
- Record consequential technical choices in `docs/decisions/`; routine implementation details do not need decision records.

## Commands and verification

- Install with `npm ci`; develop with `npm run dev`; build with `npm run build`; serve production with `npm start`.
- Verify with `npm run lint`, `npm run typecheck`, and `npm run test:e2e` (build first, installed Google Chrome required). Browser checks start a separate production server on port 3012. Do not reuse an unrelated existing preview server.
- For documentation changes, check consistency, relative links, and the distinction between confirmed and proposed work.
- For site changes, run the available checks appropriate to the change and verify affected behavior. Check responsive layout, keyboard access, and content readability when UI is introduced.
- Test meaningful behavior and failure cases; avoid tests that merely duplicate implementation details.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
