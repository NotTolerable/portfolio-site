# Product requirements

Status: initial portfolio deployed; content and design review continues. Updated: 2026-10-24.

## Purpose and audience

Create an impressive software engineering portfolio whose primary purpose is helping the owner find a job. Primary visitors are recruiters, hiring managers, and engineers evaluating the owner's work.

The owner is interested in infrastructure, low-latency systems, GPU/CUDA programming, and low-level engineering, alongside cloud and container technologies such as Docker and Kubernetes. These are target interests, not claims of demonstrated expertise.

## Confirmed starting point

- Existing projects: an AI governance compliance checker and an AI mock interview project involving computer vision.
- No projects in the target systems/GPU/infrastructure areas have been identified yet.
- The main portfolio is animated and interactive, built with Next.js and TypeScript, and deployed on Vercel with GitHub-connected production builds. See [architecture](architecture.md) for the current hosting details.
- A Cloud / Infrastructure entry should navigate to a separate static showcase demonstrating cloud hosting and explaining its actual infrastructure.
- Visual direction: a cinematic anime/game-inspired **night city** with high-quality graphics and smooth performance, following [DESIGN.md](../DESIGN.md). The owner referenced Samana Studio’s comic/anime social work and Igloo’s immersive quality, authorized a complete redesign of layout, typography, and color, and clarified that a circuit-board city and floating-garden direction are not wanted.
- The owner is Babisan Pirapakaran. The introduction must remain personal, clearly identify a software engineer, and give recruiters a direct route to demonstrated work.
- The previous cube, serif-led systems layout, and whole-page ink/splatter entrance are superseded. Store the cube implementation for possible future reuse; it should not load on the active homepage.
- Use a detailed, original night-city environment with lightweight interactive depth/atmosphere, native scroll progression, and responsive layouts. Keep core content available before graphics initialize and when WebGL/JavaScript are unavailable. Reduced motion retains a polished static scene; automatic effects can be paused. Do not claim universal frame rates or present concept artwork as actual project output.
- Preserve honest project descriptions, keyboard-accessible project notes, and the planned Cloud / Infrastructure route. Engineering interests must remain distinct from demonstrated project experience. Omit missing resume/contact/source destinations.
- Keep the main portfolio distinct from the planned static infrastructure showcase.

## Visitor needs

- Quickly understand the owner's interests and demonstrated skills.
- Inspect actual projects and understand personal contributions, engineering choices, and results.
- Find deeper technical evidence, such as source code, architecture explanations, or measurements where available.
- Understand how this site runs through an accurate, approachable technical explanation.
- Find a way to contact the owner or access a resume, if the owner chooses to publish these.

## Current scope

The initial implementation follows this structure:

- Introduction communicating career direction and current experience.
- Project summaries and technical case studies for the two existing projects.
- A Cloud / Infrastructure entry linking to the separate static showcase and its architecture walkthrough.
- Resume, source-code profile, and contact links once owner-provided details are available; omit missing destinations.

The current project entries present confirmed overviews, original concept illustrations, and expandable notes. Illustrations are not actual project screenshots. Deeper case studies, owner contributions, actual screenshots, links, and measured results remain pending. The cloud entry currently opens a clearly labeled planning page until the separate static showcase exists.

Potential case-study topics include the problem, personal contribution, architecture, tradeoffs, deployment, and measured results. Include only topics supported by the actual project.

## Acceptance criteria for the eventual site

- Visitors can identify the owner's engineering interests and find project evidence easily.
- Project descriptions distinguish implemented work from planned improvements.
- Any performance claims include actual measurements and enough context to interpret them.
- The hosting explanation matches the deployed system and links to publishable infrastructure or deployment code where available.
- Content does not imply unearned certifications or experience. The referenced AWS-certified portfolio is inspiration, not the owner's biography.
- Pages work on mobile and desktop and support keyboard navigation, readable contrast, and semantic structure. The night-city scene respects reduced motion and keyboard pause, keeps native scrolling, and can be skipped directly through the project link.
- Published links work and no placeholder identity, project result, or contact information remains.

## Open questions

- Career stage and target opportunities: internships, new-grad roles, or other positions?
- Which target area should lead the positioning: systems/performance, GPU computing, or infrastructure/platform engineering?
- What did the owner personally build in each existing project? What code, demos, deployment details, and results are available?
- What identity, resume, profile, and contact details should be public?
- Which further refinements should follow review of the current design?
- Should a new systems project be developed alongside the portfolio?
- What hosting budget, domain, cloud experience, and existing accounts are available?
