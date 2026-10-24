# 0007: Grounded district and unified field journal

Status: accepted under the owner’s comprehensive creative/technical implementation mandate; refines 0006.
Date: 2026-10-24

## Context

The owner requested a complete game-inspired experience with grounded measured movement, a complete environment, deliberate camera, cohesive UX and better efficiency. Inspection found that the first run-file clip was a two-frame targeting pose; camera keys swept independently across the street; planar reflection, shadow and bloom passes multiplied rendering work; paper dossiers and bright accent panels diverged from the night environment.

## Decision

Keep the licensed stylized character and build an original distance-based procedural gait with two-bone leg IK, stance anchors, swing clearance, weight transfer, smooth heading changes, stopping and breathing. Feed scroll, Auto walk and W/S intent into one bounded controller. Follow actual movement with a damped shoulder camera. Use a small derived static pose instead of runtime animation FBX downloads.

Unify all existing pages as an After Hours field journal: cool ink surfaces, warm text/amber accents, cyan wayfinding, shared navigation and restrained panels. Preserve all factual content, project notes, interests, cloud planning, resume and direct navigation.

Use one forward render with batched/instanced geometry, a sign atlas, diffuse architectural lighting, analytic wet-road pools, local halos, GPU rain and soft contact shadows. Remove mirror, shadow-map and fullscreen bloom passes. Keep pause, reduced motion, adaptive resolution, offscreen suppression, failure fallback and no-JavaScript content.

## Alternatives and consequences

Slowing a run clip does not establish foot planting or a measured gait. Replacing the character/engine would add asset, licensing and download cost without fixing coordination. A full physics sandbox or open-world controller would complicate navigation without helping recruiters inspect the portfolio.

The result deliberately uses stylized lighting and a curated flat route. It does not claim commercial-game animation fidelity, arbitrary terrain collision, or physically accurate reflections. Shader/model resource management and display-rate/actual-rig tests protect the bounded experience. Performance figures require the viewport, renderer and adaptive resolution context; no universal frame rate is promised.

See [design](../../DESIGN.md), [architecture](../architecture.md) and [character provenance](../assets/street-character.md).
