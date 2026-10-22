# Roadmap

Updated: 2026-10-22. Current phase: deployed portfolio with content/design refinements pending.

## 1. Establish project context

- [x] Separate contributor instructions, product requirements, architecture, decisions, and roadmap.
- [x] Capture confirmed goals and identify unresolved choices.

## 2. Agree on positioning and content

- [ ] Identify career stage, target roles, and primary engineering focus.
- [ ] Review the two existing projects and the owner's contributions.
- [ ] Inventory publishable code, screenshots, demos, and technical evidence.
- [x] Agree on a personal systems portfolio direction and replace the company-style layout with the latest `DESIGN.md`.
- [ ] Decide whether to develop a systems project alongside the site.

## 3. Choose the implementation approach

- [x] Select Next.js and TypeScript for the main portfolio.
- [x] Choose Vercel as the initial hosting plan.
- [x] Select npm, TSX content, Three.js, Motion, and locally bundled reference font substitutes.
- [x] Deploy the main portfolio to Vercel with GitHub-connected production builds from `main`.
- [ ] Decide any custom domain/budget changes and the separate AWS deployment workflow.
- [x] Record the main stack and initial hosting decision.
- [ ] Record remaining significant technical decisions as agreed.
- [x] Obtain the user's go-ahead to implement and then rebuild to the new design reference.

## 4. Build and validate

- [x] Implement the new visual design, 3D cube, project explorer, and infrastructure planning page.
- [x] Add autonomous legal cube turns, six scrambled surface textures, display-synchronized rendering, controlled whole-cube dragging, and glass-finish buttons.
- [x] Refine cube materials with distinct near-black-to-charcoal shades, above-right directional lighting, and hover rotation.
- [x] Match the cube reference with original material maps, rounded solid cubelets, and authored two-axis motion.
- [x] Restore the cube’s original column, enlarge it slightly, add a visible ray, and ease faster idle direction changes.
- [x] Rewrite the copy as a relaxed personal portfolio and add a quick first-load greeting.
- [x] Introduce the name-led systems theme, asymmetric project entries, expandable notes, and a reversible cube-to-particle scroll transition.
- [x] Replace the initial loading bar with a short kinetic entrance in which the actual name, PORTFOLIO wordmark, and dot settle into the homepage; preserve skip controls, reduced motion, direct links, and resize handling.
- [x] Refine identity with a serif name, original cube-outline mark and BP, no underscore suffixes/index branding, and selective glass depth on controls.
- [x] Refine glass with static frosting and rim highlights; remove the cube/hologram overlay while retaining automatic animation and requiring drag/keyboard input for manual steering.
- [ ] Complete owner-verified project case studies, source links, resume, and contact details.
- [x] Configure the main portfolio's Vercel project and GitHub integration.
- [ ] Configure infrastructure and deployment for the separate AWS showcase.
- [ ] Write the hosting walkthrough from the actual implementation.
- [x] Verify the local build, types, lint, interactive behavior, responsive layout, reduced motion, WebGL fallback, and automated accessibility.
- [ ] Complete and verify owner-provided project evidence.
- [x] Publish the current portfolio to Vercel at the owner's request.
- [x] Verify public access, desktop/mobile layout, WebGL assets, cube/particle interactions, and project/cloud navigation on the deployed portfolio.

## Deferred or undecided

- New low-latency, GPU/CUDA, or infrastructure projects and their scope.
- Benchmarks and performance visualizations, pending projects and real measurements.
- Container/Kubernetes demos, pending a project with suitable runtime requirements.
- Any backend, database, analytics, or contact-form service; no current requirement establishes a need.

This roadmap tracks product milestones, not temporary agent tasks or session logs. Revisit it as scope and priorities change.
