# 0010: Winter street vertical slice

Status: accepted for local Phase 2 implementation. Production merge/deployment is explicitly not authorized.
Date: 2026-10-25

## Context

The owner requests one polished nighttime street proving visual direction and cinematic interaction, separate from the current portfolio. Preserve all routes/content and accessibility. The full city, court and portfolio integration are deferred. Detailed licensed assets, believable materials, motivated atmosphere and a restrained temporary interface take priority over filling the scene with effects.

## Decision

Build `/city-preview` on `experiment/cinematic-night-street`, without replacing the published homepage or earlier camera study. **After Hours / The Late Edition** is a historic winter street: an illuminated bookshop, cafés, residential shutters, a cinema and a hotel entrance around the corner. Reuse the architecture source and HDR, extend the existing glTF preparation pipeline with compatible CC0 furniture, books, shelves and PBR surfaces, and keep all assets self-hosted. No observatory props load on this route.

Keep Next.js and Three.js because they already support the required material, lighting, loading and camera systems. A pure render-clock director owns native-scroll intent, separately paced arc-length translation, SQUAD quaternion orientation, lens, bounded pointer parallax and actual rendered progress. Four compositions establish, approach, pass and turn; the shop physically moves behind the camera. Shared monotone interpolation is extracted without changing the existing study.

Source AO/normal/roughness maps, detailed geometry, static shadow maps, PMREM lighting and local area/practical lights establish the rendering. A single-sample half-float target, low-resolution thresholded bloom, linear-space SMAA and final OutputPass finish it. Indexed geometry is retained, identical materials are shared and static object matrices are frozen. GPU snow reacts locally to the cursor; an analytic spring moves a hinge-mounted sign; shop lighting responds to a ray/box hover or keyboard control. No suitable skeletal pedestrian belongs to this acquired set, so no placeholder people are added.

Smaller/coarse-pointer/reduced-motion/no-JavaScript visitors see a four-view narrative captured from the real scene without loading the model/HDR payload. Desktop can pause atmosphere or switch reversibly to stills. Graphics/required-asset failure exposes that same narrative. The old provider suppresses its renderer/header only on the isolated route; existing portfolio pages remain intact.

## Alternatives and consequences

Another primitive staging set would not prove visual direction. A complete engine rewrite offers no demonstrated benefit for this bounded slice. Heavy temporal effects, screen-space reflections and an SSAO stack add cost before improving asset/layout quality, so source AO/contact/shadows and direct specular lighting are used first. Image-based environment reflections do not claim to mirror local objects dynamically.

The coordinated modular kit provides detail and predictable material scale, with authored variations in frontage, height, roofs, windows and finish. Some shared architectural motifs remain visible; bespoke hero-building assets can follow owner review. Frame pacing is measured on the actual browser/GPU/viewport rather than promised for every desktop. The experiment must stay undeployed/unmerged until the owner approves it.
