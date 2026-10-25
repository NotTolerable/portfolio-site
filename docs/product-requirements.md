# Product requirements

Status: continuous immersive redesign authorized and implemented; content evidence review continues. Updated: 2026-10-24.

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
- The latest attached brief supersedes the earlier character-on-street interpretation: remove the character and game mechanics. The entire portfolio must inhabit one continuous camera-led world, with detailed licensed assets, camera travel, interactive landmarks and focused project presentations. A 3D introduction followed by ordinary stacked sections does not meet the current requirement. Preserve the night-city atmosphere and all factual content/working routes.
- The owner explicitly grants complete choice of engines, libraries, assets, architecture and rendering techniques. Retain working systems only where they serve the result; visual quality takes priority over preserving the old implementation or simplifying assets. The public [Samana Studio](https://samanastudio.es/) reference informs polish, continuity, reflective detail and restraint without copying proprietary assets or branding.
- Keep core content available before graphics initialize and when WebGL/JavaScript are unavailable. Support reduced motion, direct keyboard navigation, a complete reading view, graphics failure and appropriate device quality adjustments. Do not claim universal frame rates or present concept artwork as actual project output.
- Preserve honest project descriptions, keyboard-accessible project notes, and the planned Cloud / Infrastructure route. Engineering interests must remain distinct from demonstrated project experience. Omit missing resume/contact/source destinations.
- Keep the main portfolio distinct from the planned static infrastructure showcase.
- The owner supplied a resume and extended experience notes and requested all experience be represented. Describe the earlier Minecraft-related work as **game server** development/operations and professionalize the tasks without changing their meaning or inflating seniority. Cover professional, freelance, contract, independent, volunteer, client-web and plugin work. Separate AI-assisted website delivery from personally authored code.
- Publish professional summaries. The owner subsequently authorized publishing their supplied resume PDF in full at `/resume`, embedded on the page, with a button opening that route in a new tab and direct PDF/download links. The extended Experience notes remain private. The owner confirmed that the resume governs employment dates. Group the game server work by technical responsibility; omit individual game server names and volunteer/ownership/job titles for those projects. Emphasize infrastructure, Java development, performance diagnostics, anti-cheat engineering and documented metrics. Keep per-network scale separate from aggregate totals.

## Continuous immersive redesign

The owner explicitly rejected the previous character-led opening and conventional sections underneath. Introduction, projects, experience, about, skills, resume and contact belong to a continuous interactive world. Use intuitive scroll/camera navigation, composed spatial landmarks, meaningful object/selection responses and readable focused presentations. No important content may depend solely on finding an environmental hotspot.

The implemented original direction is a night-city rooftop observatory/workshop, following [DESIGN.md](../DESIGN.md). It reuses portfolio facts and important routes while replacing the previous movement system, composition and renderer. Full technical/creative freedom supersedes prior one-pass, primitive-only and character-preservation constraints. The owner’s later clarification prioritizes detailed visuals and preserving the night-city feel over forced asset simplification.

Preserve complete documented experience, truthful project descriptions, the supplied embedded resume, proposed cloud architecture and verified owner contact links. Keep complete reading, no-JavaScript, reduced-motion and graphics-failure experiences. Measurements identify their setup rather than promising universal frame rates.

## Visitor needs

- Quickly understand the owner's interests and demonstrated skills.
- Inspect actual projects and understand personal contributions, engineering choices, and results.
- Find deeper technical evidence, such as source code, architecture explanations, or measurements where available.
- Understand how this site runs through an accurate, approachable technical explanation.
- Find a way to contact the owner or access a resume, if the owner chooses to publish these.

## Current scope

The immersive implementation connects six destinations in one persistent world: arrival, project workshop, experience archive, personal desk, engineering toolkit and contact. Compact contextual copy accompanies the environment; native dialog readers expose complete records. Reading mode presents all records in normal document flow.

- Project selection changes an instrument display and opens resume-backed implementation notes, technology lists and conceptual illustrations. Public project repositories, live demos, actual screenshots, full case studies and reproducible benchmark evidence remain pending; omit absent destinations.
- The complete Experience record includes professional/contract roles, grouped multiplayer infrastructure, diagnostics, anti-cheat and Java work, AI-assisted client websites, public plugins, coursework and education.
- `/resume` embeds the supplied public PDF with direct-file/download actions; requested resume buttons open it in a new tab.
- `/infrastructure` preserves the proposed interactive AWS architecture, clearly labeled planned. This portfolio is deployed on Vercel.
- Contact uses the owner’s email, GitHub and LinkedIn from the published resume. No contact-form backend is established.

Experience metrics come from the supplied resume/notes and are not independently measured website results. Environmental instruments and conceptual diagrams are spatial/technical metaphors, not claimed product screenshots or laboratory experience.

Potential case-study topics include the problem, personal contribution, architecture, tradeoffs, deployment, and measured results. Include only topics supported by the actual project.

## Acceptance criteria for the eventual site

- Visitors can identify the owner's engineering interests and find project evidence easily.
- Project descriptions distinguish implemented work from planned improvements.
- Any performance claims include actual measurements and enough context to interpret them.
- The hosting explanation matches the deployed system and links to publishable infrastructure or deployment code where available.
- Content does not imply unearned certifications or experience. The referenced AWS-certified portfolio is inspiration, not the owner's biography.
- Pages work on mobile and desktop and support keyboard navigation, readable contrast, and semantic structure. The night-city scene respects reduced motion and ambient pause, keeps native scrolling, and can be skipped directly through the project link.
- Published links work and no placeholder identity, project result, or contact information remains.

## Open questions

- Career stage and target opportunities: internships, new-grad roles, or other positions?
- Which target area should lead the positioning: systems/performance, GPU computing, or infrastructure/platform engineering?
- What public code, demos, screenshots and reproducible measurements can accompany the resume-backed project summaries?
- Which additional profile/contact destinations should accompany the published resume?
- Which further refinements should follow review of the current design?
- Should a new systems project be developed alongside the portfolio?
- What hosting budget, domain, cloud experience, and existing accounts are available?

## Critical cinematic-camera addition

The owner requires a continuous physical journey forward through connected nighttime city streets, with old streets/buildings passing behind and new environments emerging ahead. Author distinct camera positions, heights, yaw, pitch and framing; use storefront approaches, side-looking views, controlled orbits and a deliberate transition into an empty nighttime basketball court. Keep translation and orientation independently controllable, transitions smooth and the horizon level. Native scrolling reverses the same route predictably; bounded cursor parallax and object-specific focus cannot disrupt it. Camera arrival, text and hotspots share one rendered progress state.

Build a small prototype with at least four meaningfully different compositions before expanding the full city. `/camera-study` stages six compositions while preserving the current portfolio and all existing factual content/routes. See [DESIGN.md](../DESIGN.md) and [decision 0009](decisions/0009-authored-city-camera.md).

## Phase 2 — cinematic night-city vertical slice

The owner's Phase 2 brief authorizes implementation of a separate experimental `/city-preview`, preserving all existing portfolio content/routes, resume functionality and accessibility. **Do not deploy or merge this experiment into production until approved.** This phase is one polished, short historic nighttime street with blue-black atmosphere, warm shops, believable detailed assets/materials, restrained snow and coherent lighting. It excludes the complete city, basketball court and full portfolio integration.

Prove four continuous, reversible authored compositions: arrival down the street, a forward storefront approach, physically passing the shop until it leaves frame, and turning a corner into a new composition. Independently control camera translation/orientation/framing/pacing, bound pointer parallax, and synchronize UI with rendered progress. Add restrained cursor-responsive snow, a damped hanging sign and localized storefront hover/focus lighting. Background pedestrians are conditional on suitable animated assets, not a requirement to add placeholder people.

Use sparse editorial UI and a smooth text introduction. Keep mobile/reduced-motion/graphics-failure alternatives usable. Verify the visual result in the browser, all four camera views, reversal, interactions, existing routes and actual desktop performance. Supply an implementation report covering files, assets/licenses, camera architecture, rendering, interactions, measurements and known limitations. See [DESIGN.md](../DESIGN.md), [decision 0010](decisions/0010-winter-street-vertical-slice.md) and [asset provenance](assets/city-preview.md).

## Phase 3 — connected nighttime city

The owner authorizes expanding the existing `/city-preview` into four physically connected districts using the Phase 2 Three.js foundation. Preserve the production homepage, professional content/data, resume, infrastructure and contact routes. No production deployment or merge is authorized. Do not add full portfolio panels or the complete final basketball court in this phase.

- A: varied historic commercial arrival, warm furnished windows, street furniture and pedestrian groups.
- B: cafés/restaurants, arcade and music venue, more signage and ambient activity, restrained lighting.
- C: intimate neighborhood, boxing gym, alley hoop, independent shops and understated anime displays. Approved anime interests include Ippo, Bleach, Solo Leveling and original-series Rock Lee; displays are environmental details, not explicit interest labels.
- D: lower density, open sky, softer practical lights, fewer pedestrians and a plausible approach to the Phase 6 court.
- All districts occupy one navigable metre-based world. Camera travel must pass old buildings, reveal new streets around corners and reverse without teleportation or scene swapping.
- Camera position, orientation, lens and segment pacing remain independent authored channels. Vary composition with storefront, architectural, side-facing, alley and quiet-approach shots. Bound cursor parallax and synchronize navigation/text/landmark availability with rendered arrival.
- Pedestrians are mandatory here, superseding Phase 2's conditional scope: coherent sidewalk routes, independent speeds/timing, smooth stops/turns, grounded animation and occasional entry/exit through a real storefront portal. No obvious wall or pedestrian intersections.
- Keep most scenery noninteractive. Reserve four stable landmark IDs/metadata for later projects, experience, background and skills, without implementing full content integration.
- Stage upcoming district construction/loading, retain visited chunks, reuse materials/assets, cull spatially, control light/shadow/particle budgets and adapt quality without replacing detailed buildings with boxes.
- Provide real mobile 3D traversal, keyboard navigation, reduced-motion/still/graphics-failure alternatives and no-JavaScript access back to all portfolio content.
- Validate actual browser views and district transitions, forward/reverse travel, pedestrian routes, continuity, mobile/readability and failure recovery. Report measured performance with its test setup, actual screenshots, asset sources/licenses, limitations and Phase 4 recommendations.

See [DESIGN.md](../DESIGN.md), [decision 0011](decisions/0011-connected-night-city.md) and the [implementation report](reports/phase-3-connected-city.md).
