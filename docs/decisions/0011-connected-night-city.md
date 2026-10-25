# 0011: Connected night city and staged camera journey

Status: accepted for local Phase 3 implementation; production publication is not authorized.
Date: 2026-10-25

## Context

The owner's Phase 3 brief expands the Phase 2 street into four connected neighborhoods, with cinematic reversible traversal, pedestrians, mobile 3D and a residential approach to a future court. It explicitly retains Three.js and the production portfolio, deferring full content integration and the final basketball court.

## Decision

Expand `/city-preview` on `experiment/connected-night-city`. Retain the existing renderer, detailed CC0 facade/furniture assets, PBR output pipeline and camera interpolation foundations. Author one metre-based map shared by street geometry, camera rails, pedestrian lanes and four stable landmark records.

Use 35 translation control points, an independent uniform quaternion/SQUAD track, authored yaw/pitch, lens and monotone segment pacing, with 14 subject-specific compositions. Limit render-clock travel by actual world distance. One rendered progress controls districts, captions, hover availability and streaming. Pointer parallax is additive and bounded.

Build district A before first presentation. Prebuild B/C/D incrementally on approaching thresholds or direct navigation; yield between buildings and budgeted batching work, preupload new textures while hidden and compile against the fixed scene light budget and cap camera travel at the last complete street. Retain loaded chunks for reversal. Reuse materials, maps, repeated shape geometry and once-expanded static source attributes, batch per building/material, preserve instanced books and cull spatially.

Pool four point lights, two area lights and one shadowed spot, plus moon and hemisphere. Fade fixture changes through zero rather than transporting a light through the street. Recenter the frozen moon shadow at bounded travel intervals. Keep one render loop, shader snow, explicit cleanup, adaptive pixel ratio and lower-cost mobile shadows/particles.

Reuse the CC0 Kenney skinned character through an 84KB Meshopt derivative, independent skeleton clones and the existing analytic leg rig. Seventeen fictional pedestrians use distance-driven routes, eased stops, physical turns, stance anchors, independent timing and distance-based skeletal updates. The arcade has a clear architectural portal and floor-height transition. Keep these as ambient NPCs, not a return to player movement controls.

## Alternatives considered

- Engine rewrite: no demonstrated need; existing asset loaders, camera mathematics and rendering pipeline support the required world.
- Four scene swaps: rejected by the continuous physical geography requirement.
- Loading/building the entire city before presentation: delays the opening and prevents meaningful staged delivery.
- Every fixture as a rendered dynamic light: causes growing per-pixel lighting cost and shader changes as districts load.
- Placeholder primitive buildings: rejected; detailed source architecture remains the primary facade geometry.
- A new motion-capture dependency: not needed for restrained background pedestrians; the retained rig supports the required measured walk and foot planting.

## Consequences

There is a single coherent city, real forward/reverse traversal and mobile access without a heavy new dependency. Districts reuse one architectural collection; massing, floors, businesses, interiors and props differentiate them. This is an authored linear journey, not free roaming or a general crowd simulation. Distant buildings load as runtime geometry composed from shared initial assets; the new neighborhood print is deferred. Full baked GI, local real-time reflections, bespoke human models and further distinct architectural kits remain possible art improvements rather than completed features. See the [implementation report](../reports/phase-3-connected-city.md) and [asset provenance](../assets/city-pedestrian.md).
