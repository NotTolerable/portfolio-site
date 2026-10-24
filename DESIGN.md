# Babisan Pirapakaran — After hours

Status: owner-authorized comprehensive game-inspired refinement; After Hours district and field journal. Updated: 2026-10-24.

## Approved brief

A personal software engineering portfolio with a cinematic, anime/game-inspired **night city**. The owner clarified that a character must stand and move on an actual street, rather than a projected city panorama. Keep the established navy, cyan, amber and restrained vermilion palette, with rain. The circuit-board city, floating garden, earlier cube, serif composition and flashing/splatter entrances are archived directions.

The specific [owner reference](https://www.instagram.com/p/De1njZtRl4t/) shows **Santioni Spirits / The Notturno Experience**, by [Active Theory](https://activetheory.net/), also available at [Santioni](https://santionispirits.com/). Its public video was inspected: engraved 3D surfaces, illustrated characters, moving cameras, bordered caption boxes and sweeping transitions. Adapt that spatial comic language to an original night street; do not copy its alcohol branding, red/ivory world, character, assets or source.

## Creative direction

The owner authorized an independent, comprehensive refinement of the entire experience: grounded third-person movement, complete environment, deliberate camera, cohesive UI and lower rendering cost. The direction is **After Hours**: a quiet rain-washed district and a personal engineering field journal. Serious third-person games inform weight, pacing and camera restraint; their assets, environments and animation clips are not copied.

Keep one cool ink/cyan and warm amber material language across the street, project notes, experience ledger, cloud planning and resume. The character remains an original use of the existing stylized licensed rig, not an owner likeness or a promise of photorealistic game fidelity. Prioritize believable contact and a consistent world over more effects.

## Identity and composition

- Deep ink `#0b1119`, raised surfaces `#101821`, warm paper `#f3efe5`, cyan illumination and warm muted amber accents. Project dossiers use dark journal panels with light diagrams; warm paper is reserved for small primary actions and the actual resume document.
- Self-hosted Barlow Condensed bold/black italic headlines, Inter prose and JetBrains Mono chapter labels.
- The `bp` wordmark, owner’s complete name, software engineering identity and direct project link remain clear and personal. No invented experience, metrics, certifications, studio positioning or decorative Japanese text.
- Real façades, shop windows, cables, awnings, pavement, street furniture and skyline silhouettes create scale. Fine surface hatching and dark edges supply the comic finish. Wet-road reflections and rain share the character’s world space.
- A fictional CC0 rigged character with a procedurally authored measured walk inhabits the street; it is not a portrait of the owner. See [character provenance](docs/assets/street-character.md).

## Experience

1. The server-rendered opening shows the name and an actual render of this street while the 3D scene prepares. No blocking loader or separate intro film.
2. Native scrolling supplies travel intent. The walker accelerates and brakes along a bounded route, while a damped shoulder camera follows actual movement. Auto walk and focused W/S controls also explore the street. Dark field notes link directly to real content. Chapter buttons revisit positions; the persistent project link skips the journey entirely. The horizon/fog fades into journal panels without a large animated wipe.
3. Drag/Left/Right adjust the view within bounds; hover does not steer. Rain, neon glow and pause controls remain compact. Space pauses automatic motion on the focused scene. Touch preserves native vertical scrolling.
4. Three resume-backed project dossiers use implementation summaries, original subject illustrations and native expandable notes. Full case studies, public code and reproducible results remain pending.
5. An editorial Experience ledger covers professional/contract work, grouped multiplayer infrastructure and development, additional client/plugin/coursework builds and education. Use readable task lists, clear role/date metadata and restrained cyan accents; avoid individual game server names and project job titles; label AI-assisted client builds.
6. A dedicated `/resume` page embeds the owner-supplied PDF. Header and Experience buttons open it in a new tab; a download and direct PDF link remain available. Match the ink/cyan palette and keep navigation usable on narrow screens.
7. A personal chapter, keyboard-accessible interest tabs and a planned AWS ticket complete the portfolio. Distinguish demonstrated systems/infrastructure work from future interests such as GPU/CUDA.

## Movement and rendering

Walking is driven by travelled distance, with bounded speed, acceleration/braking, controlled turns, torso counter-rotation, alternating arms, breathing and weight transfer. Two-bone leg IK anchors feet during stance, lifts them during swing and settles into double support on stop. The route is deliberately flat and bounded; this is not a physics sandbox or a general terrain traversal system.

Reuse the existing CC0 model and texture. A small derived reference pose replaces runtime idle/run FBX downloads. The earlier run loader selected a targeting pose rather than its locomotion clip; the new controller does not rely on that clip.

Batch geometry, instance windows and contact shadows, and atlas signs. Use one forward render, diffuse architectural lighting, procedural wet-road light pools and selective light halos. No planar reflection render, shadow-map redraw or fullscreen bloom chain. The glow control adjusts the same local light treatment.

Cap DPR at 1.25 desktop / 1 mobile, falling to .85 after sustained slow frames. Rain uses 560 / 240 lines in one draw. Stop the render loop when hidden/offscreen, avoid identical paused draws, reuse animation scratch objects and dispose resources on unmount. See [architecture](docs/architecture.md).

Keep native scrolling, direct project/resume links and keyboard navigation. A fixed shared header tracks the current journal section. Initial reduced motion avoids WebGL; later changes hold the current scene. Model/graphics failure restores a still captured from the actual district. Native content and PDF links remain usable without JavaScript. Do not promise universal frame rates.

## Archives

- [Former image-based night city](src/archive/image-city/README.md).
- [Former cube portfolio](src/archive/cube-portfolio/README.md).

Neither is imported into the active scene.
