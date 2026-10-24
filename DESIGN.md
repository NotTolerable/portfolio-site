# Babisan Pirapakaran — After hours

Status: owner-approved night-city direction, implemented. Updated: 2026-10-24.

## Approved brief

The owner requested a complete visual rebrand inspired by the immersive, comic/anime and game-like quality of Samana Studio’s work and the visual polish of Igloo. They specifically chose a **night-time city**, high-quality graphics, and smooth performance. The circuit-board city and floating-garden concepts were rejected. The former cube, serif-led systems composition, and paper-splatter entrance are superseded and archived.

References: [Samana Studio](https://samanastudio.es/), [owner-identified Instagram account](https://www.instagram.com/samanastudios/), [Igloo](https://www.igloo.inc/). The exact social reel was not available through public access; this is an original interpretation of the owner’s description, not a reproduction of a verified reel.

## Visual identity

- Cinematic, densely detailed anime-inspired city at night: illuminated windows, wet streets, rooftops, atmospheric depth, and restrained moving rain.
- Deep blue-black foundation `#0b1119`, raised ink surfaces `#101821`, warm paper text `#f3efe5`, pale blue-gray supporting text, and warm vermilion/amber highlights. Project dossiers introduce paper-colored panels as a comic/editorial counterpoint.
- Self-hosted Barlow Condensed bold/black italic for large expressive headlines, Inter for prose, JetBrains Mono for chapter labels and quiet interface details. The previous Playfair identity belongs to the archived version.
- Original lowercase `bp` wordmark and small asterisk; no cube logo, underscore, invented credentials, or studio/service-agency positioning.
- Crisp panel boundaries, selective translucent scene controls, asymmetric chapters, generous spacing, and strong readable typography. Avoid fake code terminals, invented runtime metrics, decorative Japanese text, forced scrolling, flashing frames, or character cameos.

## Experience

1. Full-viewport night-city opening with a brief reveal of the actual name and copy, no separate splash or blocking loader. The city poster is server-rendered and immediately available while effects prepare. The complete name, engineering identity, and project link remain semantic HTML.
2. A small native-scroll camera move adds depth to the scene. Drag/arrow keys shift the view; rain, neon grading, and pause controls are available when WebGL is ready. Space pauses the focused scene. No cursor capture outside a drag or scroll interception.
3. Selected-work chapter with two personal-project dossiers, original abstract concept illustrations, honest descriptions, and native expandable build notes. Missing case studies remain explicitly in progress.
4. Personal chapter: engineering curiosity, interest in anime, original city concept art, and an accessible tabbed exploration of systems, GPUs/CUDA, and cloud interests. These are learning interests rather than fabricated expertise.
5. A vermilion next-chapter ticket links to the planned AWS showcase. The cloud route uses the same typography/palette and retains its interactive proposed architecture.
6. A compact personal footer. Resume, email, and social destinations remain omitted until supplied by the owner.

## Graphics and performance

The city uses **image-based 2.5D rendering**, not a fully modelled city or playable game level. An original rendered environment supplies baked detail and lighting. A lightly depth-deformed Three.js mesh, layered mist, GPU-driven rain, camera motion, and optional neon grading make the scene interactive without a large environment-model download. See [architecture](docs/architecture.md) and [art provenance/prompt](docs/assets/night-city.md).

- One shared 283 KB WebP is used for the initial poster and WebGL texture. Preserve the direct URL/preload so they share browser caching; do not reintroduce duplicate multi-megabyte downloads.
- Cap DPR at 1.5 desktop / 1.25 mobile, use 420 / 180 rain streaks, and reduce DPR to 1 after sustained slow frames.
- Stop GPU draws offscreen/hidden; hold a paused scene without repeated identical draws. Dispose textures, geometry, materials, observers, listeners, and the renderer on unmount.
- Initial reduced motion keeps the static artwork and does not initialize WebGL. A later preference change updates the scene. If graphics fail, retain the same poster, content, and navigation.
- Native CSS/scroll animations respect reduced motion. Content remains accessible with JavaScript disabled.

## Archive

The previous cube implementation and material provenance remain in the repository. Restore the prior composition from [the archive](src/archive/cube-portfolio/README.md), not by combining incompatible active themes. It is not imported by the current homepage.
