# 0003: Reuse source cube image maps with Three.js matcaps

Status: implemented. Date: 2026-10-18.

## Context

The owner rejected the procedural PBR approximation and explicitly requested the textures from Resend’s cube. Inspection of its public Spline export revealed studio-lighting/reflection matcaps, fine surface grain, a terrazzo image, and layered procedural material effects.

## Decision

Update 2026-10-19: material reuse remains current. The owner clarified that automatic motion remains enabled. Manual steering is drag/keyboard-only; remove the visible caption, credit, pause, and reset overlay. Keyboard Space retains pause/resume access. See [current architecture](../architecture.md) and [DESIGN.md](../../DESIGN.md). Source attribution is preserved in the repository.

Self-host the original image bytes and use Three.js matcap materials on rounded solid cubelets. Port the source’s nested X/Y rotation rate and layer-turn easing into our animation loop. Preserve our logical Rubik state, custom autonomous double-turn sequences, mouse/touch/keyboard controls, pause, reset, and reduced motion. Recreate fiber and perforation relief rather than embedding Spline’s full scene/runtime. Credit the source beneath the cube and document [image provenance](../assets/resend-cube.md).

## Consequences

The renderer now uses the source’s baked studio reflections instead of live PBR lighting, removing the earlier spotlight/environment and raised sticker plates. Matcaps do not respond to world-space lights; the decorative ray remains a separate SVG. Material images are fetched locally and awaited before scene initialization, with disposal on failure/unmount. The source’s −359° / 10-second X/Y angular rates are integrated continuously rather than resetting at each loop. Each manipulated axis follows the user’s last input direction after release. The result reuses original image assets and authored motion settings but does not reproduce the complete Spline shader stack or guarantee pixel-identical output.
