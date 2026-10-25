# 0008: Continuous camera-led observatory

Status: accepted under the owner’s explicit full redesign and implementation mandate; supersedes 0006 and 0007 for the active experience.
Date: 2026-10-24

## Context

The owner rejected the character-led opening followed by conventional portfolio sections. The entire portfolio must inhabit one continuous interactive environment, with camera-based navigation, detailed licensed assets, focused project presentations and preserved factual content/routes. The owner explicitly lifted previous restrictions on engines, libraries, architecture, assets and rendering complexity. Visual quality and the night-city atmosphere take precedence over preserving the old renderer or simplifying assets.

The public Samana Studio reference informed continuous camera travel, reflective sculptural objects, atmospheric depth, minimal interface and deliberate negative space. Its branding, source and proprietary artwork are not used.

## Decision

Build **After Hours / The Observatory**, an original rain-washed rooftop workshop above a night city. One persistent Three.js scene contains a receiver, instrument workbench, relay archive, personal desk and communications antenna. Six composed camera stations connect the introduction, projects, experience, about, toolkit and contact. Scroll and direct destination links supply camera intent; a damped camera rail and bounded pointer parallax compose the journey. Remove the character and game controls from the active route.

Use the owner’s subsequently requested professional typography: JetBrains Mono identity/annotations and regular Inter headings/body, replacing the heavy condensed comic face.

Keep Next.js and TypeScript because they already support the content, accessible rendering, PDF route, reliable local workflow and Vercel deployment. Retain Three.js because PBR, glTF, environment lighting, instancing and precise camera control suit this environment. The choice is purposeful, not a restriction on future work. No engine migration is needed to satisfy this design.

Use CC0 Poly Haven models and PBR maps with a self-hosted HDR lighting environment. Preserve source detail while packing models into WebP-textured, meshopt-compressed GLBs. The production loader uses Three.js’s bundled meshopt decoder. Asset preparation dependencies are development-only. Record provenance and the reproducible preparation process in [asset documentation](../assets/observatory.md).

Mount the world in the shared layout so internal navigation to the planned cloud lab preserves the renderer. Project selection changes the instrument display; selecting a landmark opens a native dialog reader. The complete experience history, personal background, education, interests and project implementation notes remain readable there and in a complete server-rendered reading mode. Resume continues to open in a new tab and embed the exact supplied PDF.

## Alternatives and consequences

A different engine would not by itself fix disconnected navigation, plain assets or weak composition. A single image would not provide interactive spatial focus. Making every paragraph a mesh or scattered floating card would impair reading and accessibility. A conventional long page remains available as an explicit reading/failure/no-JavaScript alternative, not the primary enhanced composition.

Image-based environment reflections and wet PBR materials are not real-time planar reflections of local objects. A single static shadow map, geometry batching, instanced skyline, GPU rain, visibility suspension and adaptive pixel ratio control cost without replacing detailed assets. Reduced motion defaults to the complete reading view with a captured still; visitors may explicitly enter the world with immediate camera navigation and ambient motion disabled. Graphics or required-asset failure restores readable content.

The prior scene, rig and tests remain archived/dormant. No claims of commercial-game fidelity, universal frame rates, certifications, fabricated project demos or unmeasured latency results are introduced.
