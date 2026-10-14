# Product requirements

Status: initial implementation and design review. Updated: 2026-10-14.

## Purpose and audience

Create an impressive software engineering portfolio whose primary purpose is helping the owner find a job. Primary visitors are recruiters, hiring managers, and engineers evaluating the owner's work.

The owner is interested in infrastructure, low-latency systems, GPU/CUDA programming, and low-level engineering, alongside cloud and container technologies such as Docker and Kubernetes. These are target interests, not claims of demonstrated expertise.

## Confirmed starting point

- Existing projects: an AI governance compliance checker and an AI mock interview project involving computer vision.
- No projects in the target systems/GPU/infrastructure areas have been identified yet.
- The main portfolio should be animated and interactive, built with Next.js and TypeScript, with Vercel as the initial hosting plan.
- A Cloud / Infrastructure entry should navigate to a separate static showcase demonstrating cloud hosting and explaining its actual infrastructure.
- Visual direction: follow the latest [DESIGN.md](../DESIGN.md), a Resend-style reference with pure black, graphite borders, serif hero typography, ghost buttons, and restrained violet code accents. The user explicitly superseded the earlier navy/teal preference.
- The owner is Babisan Pirapakaran and has authorized implementation. The current headline is “Hey, I’m Babisan.” The latest copy direction is relaxed and personal, with fewer slogan-like headings.
- Add a brief loading-bar intro on the initial page load, respecting reduced motion and keyboard navigation.
- Keep the main portfolio distinct from the planned static infrastructure showcase.

## Visitor needs

- Quickly understand the owner's interests and demonstrated skills.
- Inspect actual projects and understand personal contributions, engineering choices, and results.
- Find deeper technical evidence, such as source code, architecture explanations, or measurements where available.
- Understand how this site runs through an accurate, approachable technical explanation.
- Find a way to contact the owner or access a resume, if the owner chooses to publish these.

## Proposed initial scope

The initial implementation follows this structure:

- Introduction communicating career direction and current experience.
- Project summaries and technical case studies for the two existing projects.
- A Cloud / Infrastructure entry linking to the separate static showcase and its architecture walkthrough.
- Resume, source-code profile, and contact links once owner-provided details are available; omit missing destinations.

The current project explorer presents overviews and copyable portfolio metadata. Deeper case studies and measured results remain pending. The cloud entry currently opens a clearly labeled planning page until the separate static showcase exists.

Potential case-study topics include the problem, personal contribution, architecture, tradeoffs, deployment, and measured results. Include only topics supported by the actual project.

## Acceptance criteria for the eventual site

- Visitors can identify the owner's engineering interests and find project evidence easily.
- Project descriptions distinguish implemented work from planned improvements.
- Any performance claims include actual measurements and enough context to interpret them.
- The hosting explanation matches the deployed system and links to publishable infrastructure or deployment code where available.
- Content does not imply unearned certifications or experience. The referenced AWS-certified portfolio is inspiration, not the owner's biography.
- Pages work on mobile and desktop and support keyboard navigation, readable contrast, and semantic structure.
- Published links work and no placeholder identity, project result, or contact information remains.

## Open questions

- Career stage and target opportunities: internships, new-grad roles, or other positions?
- Which target area should lead the positioning: systems/performance, GPU computing, or infrastructure/platform engineering?
- What did the owner personally build in each existing project? What code, demos, deployment details, and results are available?
- What identity, resume, profile, and contact details should be public?
- Which further refinements should follow review of the current design?
- Should a new systems project be developed alongside the portfolio?
- What hosting budget, domain, cloud experience, and existing accounts are available?
