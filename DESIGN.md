# Babisan Pirapakaran — After hours

Status: owner-approved street-level comic direction. Updated: 2026-10-24.

## Approved brief

A personal software engineering portfolio with a cinematic, anime/game-inspired **night city**. The owner clarified that a character must stand and move on an actual street, rather than a projected city panorama. Keep the established navy, cyan, amber and restrained vermilion palette, with rain. The circuit-board city, floating garden, earlier cube, serif composition and flashing/splatter entrances are archived directions.

The specific [owner reference](https://www.instagram.com/p/De1njZtRl4t/) shows **Santioni Spirits / The Notturno Experience**, by [Active Theory](https://activetheory.net/), also available at [Santioni](https://santionispirits.com/). Its public video was inspected: engraved 3D surfaces, illustrated characters, moving cameras, bordered caption boxes and sweeping transitions. Adapt that spatial comic language to an original night street; do not copy its alcohol branding, red/ivory world, character, assets or source.

## Identity and composition

- Deep ink `#0b1119`, raised surfaces `#101821`, warm paper `#f3efe5`, cyan illumination and warm amber/vermilion accents. Project dossiers use paper panels.
- Self-hosted Barlow Condensed bold/black italic headlines, Inter prose and JetBrains Mono chapter labels.
- The `bp` wordmark, owner’s complete name, software engineering identity and direct project link remain clear and personal. No invented experience, metrics, certifications, studio positioning or decorative Japanese text.
- Real façades, shop windows, cables, awnings, pavement, street furniture and skyline silhouettes create scale. Fine surface hatching and dark edges supply the comic finish. Wet-road reflections and rain share the character’s world space.
- A fictional CC0 rigged character inhabits the street; it is not a portrait of the owner. See [character provenance](docs/assets/street-character.md).

## Experience

1. The server-rendered opening shows the name and an actual render of this street while the 3D scene prepares. No blocking loader or separate intro film.
2. Native scrolling moves the character along the street and advances coordinated camera positions. Bordered paper captions punctuate the journey. Chapter buttons revisit positions; the persistent project link skips it entirely. An SVG panel edge closes the scene into the project chapter.
3. Drag/Left/Right adjust the view within bounds; hover does not steer. Rain, neon glow and pause controls remain compact. Space pauses automatic motion on the focused scene. Touch preserves native vertical scrolling.
4. Two personal-project dossiers use honest descriptions, original subject illustrations and native expandable notes. Contributions, links and results remain pending owner verification.
5. A personal chapter, keyboard-accessible interest tabs and a planned AWS ticket complete the portfolio. Systems, GPU/CUDA and cloud are interests, not invented expertise.

## Rendering and accessibility

This is a real Three.js scene graph with skeletal character animation and a GSAP camera timeline, not an image projected onto a plane. The still image is a fallback captured from that scene. See [architecture](docs/architecture.md).

Batch static geometry by material, instance windows, and animate rain in one GPU draw. Cap DPR at 1.35 desktop / 1 mobile; reduce resolution and disable reflections/bloom after sustained slow frames. Reflections use a small render target at alternate frames. No real-time physics or heavy environment texture downloads.

Stop drawing offscreen or hidden. A paused scene stops repeated identical draws. Dispose scene resources and timelines on unmount. Initial reduced motion does not create WebGL and retains the same street poster; later preference changes remove automatic motion. Graphics/model failure restores the poster and usable content. Native scrolling, semantic content, keyboard navigation and no-JavaScript access remain available. Do not promise universal frame rates.

## Archives

- [Former image-based night city](src/archive/image-city/README.md).
- [Former cube portfolio](src/archive/cube-portfolio/README.md).

Neither is imported into the active scene.
