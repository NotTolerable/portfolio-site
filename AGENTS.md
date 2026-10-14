# Project instructions

## Working agreement

- This repository is a job-seeking software engineering portfolio. Read `docs/product-requirements.md`, `docs/architecture.md`, and `docs/roadmap.md` before implementation work.
- Website implementation is authorized. The user requested replacing the earlier design with the new `DESIGN.md`, including its colors. Follow the current reference rather than earlier navy/teal preferences.
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

- Use Next.js App Router, TypeScript, and npm. Vercel is the initial hosting plan. Three.js implements the black hero cube; Motion handles restrained transitions. AWS infrastructure tools remain undecided.
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
