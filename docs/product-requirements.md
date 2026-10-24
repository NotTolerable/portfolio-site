# Product requirements

Status: initial portfolio deployed; content and design review continues. Updated: 2026-10-24.

## Purpose and audience

Create an impressive software engineering portfolio whose primary purpose is helping the owner find a job. Primary visitors are recruiters, hiring managers, and engineers evaluating the owner's work.

The owner is interested in infrastructure, low-latency systems, GPU/CUDA programming, and low-level engineering, alongside cloud and container technologies such as Docker and Kubernetes. Distinguish these interests from the experience documented below; GPU/CUDA expertise is not established.

## Confirmed starting point

- Resume-confirmed projects: Axiom (C++20 low-latency multi-venue trading), Verilly (AI compliance verification), and Behaviourly (multimodal mock-interview analysis).
- Demonstrated experience now includes a 407 ETR platforms/infrastructure internship, freelance development, dedicated game server operations, and Axiom. GPU/CUDA remains an exploration interest.
- The main portfolio is animated and interactive, built with Next.js and TypeScript, and deployed on Vercel with GitHub-connected production builds. See [architecture](architecture.md) for the current hosting details.
- A Cloud / Infrastructure entry should navigate to a separate static showcase demonstrating cloud hosting and explaining its actual infrastructure.
- Visual direction: a cinematic anime/game-inspired **night city** with high-quality graphics and smooth performance, following [DESIGN.md](../DESIGN.md). The owner referenced Samana Studio’s comic/anime social work and Igloo’s immersive quality, authorized a complete redesign of layout, typography, and color, and clarified that a circuit-board city and floating-garden direction are not wanted.
- The owner is Babisan Pirapakaran. The introduction must remain personal, clearly identify a software engineer, and give recruiters a direct route to demonstrated work.
- The previous cube, serif-led systems layout, and whole-page ink/splatter entrance are superseded. Store the cube implementation for possible future reuse; it should not load on the active homepage.
- Following [the owner’s specific comic-style reference](https://www.instagram.com/p/De1njZtRl4t/), show a character on the **actual 3D street**, with a camera travelling through the environment. Keep the approved navy/cyan/warm night-city palette and rain. The previous image-based city panorama does not meet this requirement. Three.js, GSAP, custom shaders/canvas/SVG, and other necessary animation tools are authorized.
- Use real street geometry, a rigged fictional character, inked shading, coordinated camera motion, native scroll progression, and responsive layouts. Keep core content available before graphics initialize and when WebGL/JavaScript are unavailable. Reduced motion retains a polished static scene; automatic effects can be paused. Do not claim universal frame rates or present concept artwork as actual project output.
- Preserve honest project descriptions, keyboard-accessible project notes, and the planned Cloud / Infrastructure route. Engineering interests must remain distinct from demonstrated project experience. Omit missing resume/contact/source destinations.
- Keep the main portfolio distinct from the planned static infrastructure showcase.
- The owner supplied a resume and extended experience notes and requested all experience be represented. Describe the earlier Minecraft-related work as **game server** development/operations and professionalize the tasks without changing their meaning or inflating seniority. Cover professional, freelance, contract, independent, volunteer, client-web and plugin work. Separate AI-assisted website delivery from personally authored code.
- Publish professional summaries. The owner subsequently authorized publishing their supplied resume PDF in full at `/resume`, embedded on the page, with a button opening that route in a new tab and direct PDF/download links. The extended Experience notes remain private. The owner confirmed that the resume governs employment dates. Group the game server work by technical responsibility; omit individual game server names and volunteer/ownership/job titles for those projects. Emphasize infrastructure, Java development, performance diagnostics, anti-cheat engineering and documented metrics. Keep per-network scale separate from aggregate totals.

## Comprehensive experience refinement

The owner authorized an independent game-inspired refinement of the complete website, preserving all content, important routes and functionality. Grounded movement, smooth blending/turning/stopping, convincing foot contact, deliberate camera composition, complete environmental depth, cohesive UI and lower rendering cost take priority over extra effects. Use the existing stylized rig’s actual capabilities; do not claim parity with a commercial game or copy its assets.

Keep a clear route to the projects, experience, cloud plan and embedded resume. Support native scrolling, keyboard use, reduced motion, lower-powered devices and graphics failure. Measurements must identify their test setup; software-rendered/headless timings are not universal frame-rate guarantees. See [DESIGN.md](../DESIGN.md) for the implemented creative direction.

## Visitor needs

- Quickly understand the owner's interests and demonstrated skills.
- Inspect actual projects and understand personal contributions, engineering choices, and results.
- Find deeper technical evidence, such as source code, architecture explanations, or measurements where available.
- Understand how this site runs through an accurate, approachable technical explanation.
- Find a way to contact the owner or access a resume, if the owner chooses to publish these.

## Current scope

The initial implementation follows this structure:

- Introduction communicating career direction and current experience.
- Resume-backed summaries and expandable technical notes for the three confirmed projects.
- A dedicated Experience section with professional roles, grouped multiplayer infrastructure and development, client websites, public plugins, coursework builds and education.
- A Cloud / Infrastructure entry linking to the separate static showcase and its architecture walkthrough.
- A public `/resume` page embedding the supplied resume PDF, linked from the header and Experience section in a new tab, with direct PDF and download controls.
- Additional source-code profile/contact links when selected; omit missing destinations.

The current project entries present resume-backed implementation summaries, original concept illustrations and expandable notes. Illustrations are not actual project screenshots. Public repositories, actual screenshots, full case studies and reproducible benchmark evidence remain pending. Experience metrics are attributed to the owner-supplied resume/notes, not independently measured site results. The cloud entry currently opens a clearly labeled planning page until the separate static showcase exists.

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
- What public code, demos, screenshots and reproducible measurements can accompany the resume-backed project summaries?
- Which additional profile/contact destinations should accompany the published resume?
- Which further refinements should follow review of the current design?
- Should a new systems project be developed alongside the portfolio?
- What hosting budget, domain, cloud experience, and existing accounts are available?
