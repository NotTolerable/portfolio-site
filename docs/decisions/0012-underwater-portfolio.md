# 0012 — Reference-faithful underwater portfolio

Status: accepted and implemented locally. Date: 2026-10-25.

## Context and authorization

The owner canceled the full 3D city, requested an archive, then explicitly authorized replacing the experience with a faithful adaptation of https://samanastudio.es/. The new request prioritizes matching its visual design, camera choreography, scrolling and interactions while replacing branding/content and the S hologram with a processor. Preserve the prior implementation in a separate branch before major changes.

This decision supersedes the active directions in 0005–0011, including city preservation, experimental-route-only scope and the basketball-court finale. Existing content accuracy, accessibility, resume and infrastructure requirements remain valid.

## Decision

Preserve the complete pre-redesign state in `archive/3d-city-2026-10-25`, commit `8004668`. Implement on `redesign/samana-portfolio`, retaining Next.js for portfolio content/routing and using direct Three.js, GSAP and Lenis for a reference-faithful underwater gallery. Do not deploy or push as part of this local implementation request.

Follow the actual live reference: three icy floating exhibits with three authored camera viewpoints each, projected detail hotspots, a deep closing descent, particle-built processor and contact finale. Maintain a complete server-rendered reading mode and functional `/resume` and `/infrastructure` routes. Historical city prototype URLs redirect to the new homepage; old code remains dormant.

Reuse only models whose licenses were verified: M.Reslan’s Baby Angel and skullreaper134’s Nike under CC BY 4.0, plus Microsoft’s CC0 Barramundi. Independently implement ice, processor, shaders, UI and control logic; do not transplant unidentified-license reference assets or application code. Keep attribution visible and in the asset record.

## Alternatives and consequences

- Reusing the city would preserve investment but contradict the owner’s explicit cancellation and reference.
- Replacing Next.js with the reference’s Vite shell would not improve its Three.js rendering and would unnecessarily disturb content routes and deployment.
- Reusing the complete original application/assets would create license/provenance uncertainty and retain irrelevant branding/content. Measurement-led reimplementation preserves the intended experience with owned content and traceable dependencies.
- Original ice geometry, fish and processor simulation differ from proprietary reference assets. Fidelity is assessed against rendered compositions, not asserted as exact equivalence. Device performance requires actual hardware validation.

See [reference study](../reports/samana-reference-study.md), [design](../../DESIGN.md) and [active architecture](../architecture.md).
