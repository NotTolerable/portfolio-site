# Product requirements

Status: initial portfolio deployed; content and design review continues. Updated: 2026-10-23.

## Purpose and audience

Create an impressive software engineering portfolio whose primary purpose is helping the owner find a job. Primary visitors are recruiters, hiring managers, and engineers evaluating the owner's work.

The owner is interested in infrastructure, low-latency systems, GPU/CUDA programming, and low-level engineering, alongside cloud and container technologies such as Docker and Kubernetes. These are target interests, not claims of demonstrated expertise.

## Confirmed starting point

- Existing projects: an AI governance compliance checker and an AI mock interview project involving computer vision.
- No projects in the target systems/GPU/infrastructure areas have been identified yet.
- The main portfolio is animated and interactive, built with Next.js and TypeScript, and deployed on Vercel with GitHub-connected production builds. See [architecture](architecture.md) for the current hosting details.
- A Cloud / Infrastructure entry should navigate to a separate static showcase demonstrating cloud hosting and explaining its actual infrastructure.
- Visual direction: a personal systems engineering portfolio, following [DESIGN.md](../DESIGN.md). Use ink black, subtle blue-gray color, code-like details, a distinct name-led intro, and a Viszen-inspired particle scroll transition. This supersedes the Resend-style page layout and violet theme. The owner subsequently requested Resend-style serif typography for their name, the original cube-outline logo with a name/initials, no identity underscores or “personal index” branding, and subtle glass depth on controls. A free serif alternative is approved for now, documented in the design source.
- The owner is Babisan Pirapakaran and has authorized implementation and the new layout/theme. The opening emphasizes the full name and personal engineering interests, with relaxed, direct copy.
- The current entrance should draw the entire opening viewport, including the cube, with a clear anime art influence. The owner requested illustrated ink contours, pencil/hatched shading, and fluid detail across the actual page rather than a name-only reveal. The implemented roughly 3.4-second sequence coordinates the serif name strokes, logo/navigation, supporting text, control outlines, footer, and a drawn cube that resolves into the textured scene. This supersedes the name-only opening and earlier slicing/impact-frame directions. The owner subsequently requested a fluid background drawing from white into the permanent dark theme and a continuous handoff into the rotating cube, without an intentional pause at the end. Reveal the dark background with fluid ink splats and scattered droplets, rather than brush strokes. Keep the cube drawing progressing until its final handoff, with a shared moving pose through the drawing-to-material transition and no completed-drawing hold. Prepare the cube ahead of the handoff and begin its crossfade before completion. Keep navigation usable; retain the illustrated fallback when assets fail or remain slow. Maintain continuity with the actual homepage elements, without a separate splash screen or PORTFOLIO wordmark. Preserve skip, Escape/Tab/scroll/navigation dismissal, resize completion, reduced-motion suppression, direct section access, and no replay on internal navigation. Visual details belong in [DESIGN.md](../DESIGN.md).
- Preserve automatic cube rotation and scrambling. Only manual mouse rotation is drag-only, with an arrow-key alternative and no hover steering. Keep the starting scrambled materials and scroll transformation. Remove the entire cube/hologram caption, material credit, and pause/reset overlay. Glass controls should have subtle actual surface texture, beyond a smooth gradient.
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
- Pages work on mobile and desktop and support keyboard navigation, readable contrast, and semantic structure. The cube/particle scroll sequence is reversible, respects reduced motion and keyboard pause, and can be skipped directly through the project link.
- Published links work and no placeholder identity, project result, or contact information remains.

## Open questions

- Career stage and target opportunities: internships, new-grad roles, or other positions?
- Which target area should lead the positioning: systems/performance, GPU computing, or infrastructure/platform engineering?
- What did the owner personally build in each existing project? What code, demos, deployment details, and results are available?
- What identity, resume, profile, and contact details should be public?
- Which further refinements should follow review of the current design?
- Should a new systems project be developed alongside the portfolio?
- What hosting budget, domain, cloud experience, and existing accounts are available?
