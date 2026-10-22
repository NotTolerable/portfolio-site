# Babisan Pirapakaran — Personal systems portfolio

Status: approved direction, implemented. Updated: 2026-10-22.

The owner requested a personal software engineering portfolio with a low-level, code-like feel, very restrained color, a distinct opening composition, and scroll-driven particle effects inspired by [Viszen](https://viszen.tech/). This supersedes the earlier Resend page layout and violet theme. A later refinement restores a serif specifically for the personal identity and subtle glass controls. The previous page reference is [archived](docs/references/resend-style-reference.md).

## Visual identity

- Ink-black foundation with a faint blue-gray cast, slate surfaces, cool off-white text, and a muted icy-blue accent. Color should feel embedded in the materials rather than added as neon decoration.
- Primary background: `#090d10`; raised surface: `#0e151a`; borders: `#253039` / `#34434b`; main text: `#e6ecee`; secondary text: `#9aa8b1`; accent: `#a3c3d3`.
- The owner requested the serif used by Resend’s “Email for developers” headline for their name. Its live styles use Domaine regular. The owner approved a free serif alternative for now; the implementation uses self-hosted Playfair Display regular, not an exact match. Keep both parts of the name in the same serif family, with no underscore suffixes. Inter remains the body typeface; JetBrains Mono serves navigation details, section indices, captions, and small controls.
- Restore the original cube-outline mark in a small glass tile, paired with “BP.” Remove the former “personal index” branding. Keep the name-led opening composition distinct from the Resend landing page.
- Fine rules, a faint coordinate grid, sparse ambient points, narrow seams, and restrained glass controls. Glass needs fine static frosting, translucent backdrop blur, a light-catching rim, and small inset/drop shadows, rather than a smooth gradient alone. Apply it to buttons, the brand tile, project-note toggles, and infrastructure selectors; keep whole sections matte. The frosting is a small local SVG texture, not an animated effect. Avoid fake terminal windows, invented runtime statistics, logo bands, and repeated conversion sections.
- Keep the interface spacious and personal. Use asymmetric project entries, a simple interests list, and a quiet footer.

## Page structure

1. A detailed, roughly 2.6-second Black Flash–inspired entrance strikes the actual cube, with rapid impact cuts and fluid surrounding motion. A red-rimmed black strike enters from above-left; four distinct contact/negative/rupture drawings cut across the whole viewport within 285 ms, including two short paper-light inversions. The cube holds on contact, squashes into a wide, low splat, bursts into tumbling cubelets, then pulls precisely back into place. Original branching electrical ink, satellite splatter, directional speed lines, a broken shockwave, fragments, and a fading electrical afterimage share the cube's clock. All visible page elements take the palette and camera cuts together; the permanent serif name reveals directly with no blade, separate splash screen, or PORTFOLIO wordmark. Crimson is transient entrance VFX only; restore the normal textured cube and cool portfolio palette. Keep the incoming strike, layered electrical expansion, physical breakup, and recovery fluid and time-based; reserve held drawings for the brief contact cuts. Use a single bounded hit rather than separated slow impacts or looping strobe; keep characters, episode imagery, and sound absent. Keep Skip intro, Escape/Tab dismissal, immediate completion on scroll/touch intent or resize, reduced-motion bypass (including runtime changes), direct section-link access, and no replay on internal navigation. Preserve the actual headline/canvas and settled personal portfolio layout.
2. A short, native-scroll deconstruction sequence. The opening text recedes, cubelets separate/fade, and a soft blue-gray particle cloud morphs into a generic processor silhouette. A personal transition line leads into the work. The project link skips this sequence directly.
3. Two substantial project entries for the confirmed governance checker and computer-vision mock interview project. Original SVG subject illustrations are labeled concept illustrations, never represented as actual project screenshots. Native expandable notes expose known project context; detailed case studies remain pending owner evidence.
4. A personal about section with systems/performance, GPU/CUDA, and cloud/infra explicitly framed as interests to explore.
5. A compact planned cloud experiment linking to the existing infrastructure planning page, clearly marked planned.
6. A minimal footer. Omit contact/resume/GitHub destinations until the owner supplies them.

## Cube and particles

- Preserve the original Resend material image maps with [source provenance](docs/assets/resend-cube.md) in the repository. The custom Three.js implementation is not a complete Spline embed.
- Keep the rounded 26-cubelet geometry, exact legal Rubik model, and initial scrambled texture arrangement. Keep automatic two-axis rotation and autonomous layer scrambles. Manual rotation requires a held primary-pointer drag, with arrow keys as the keyboard alternative; hover must not steer the cube. Automatic rotation resumes immediately after dragging in the last input direction. Touch horizontal dragging remains available while vertical touch scrolling stays native.
- Remove the entire caption/control overlay from both the solid cube and particle hologram: no self-scrambling/move-to-rotate label, visible material credit, pause button, or reset button. Keep input guidance in the accessible label.
- Scroll controls a separate, reversible visual transformation. It must never mutate the logical cube state. Scrolling back reconstructs the same pose while animation is paused. The particle cloud retains its subtle automatic drift and rotation.
- Use one point-cloud draw call and a small line-segment overlay within the existing WebGL renderer. Interpolate from a cube surface through a dispersed cloud to a generic processor motif on the GPU. Use about 6,800 points on desktop and 3,400 on small screens, with a capped device pixel ratio.
- Keep the broad soft ray behind the intro, integrated into the cool tint without hard lines or artificial cone edges.
- Ambient dust is subtle and static. The larger particle transition is scroll-driven. No pointer trails, continuous strobing, wheel interception, or forced section snapping. Page-wide intro cuts follow the bounded sequence above.

## Accessibility and performance

- Core identity, project text, notes, and navigation remain semantic HTML and usable without WebGL. Decorative imagery is hidden from assistive technology.
- Keep visible pause/reset controls removed. Space while the cube is focused pauses or resumes automatic cube/particle motion; reduced motion suppresses automatic animation.
- Reduced motion removes the extended sticky sequence and particle morph, leaves the cube static, and keeps a short direct route to projects. Native keyboard navigation and touch scrolling remain available.
- Skip rendering while hidden/offscreen; dispose scene, material, geometry, texture, and event resources on unmount. A missing material image or unavailable WebGL keeps the static fallback usable.
- Test desktop/mobile overflow, keyboard notes and cube rotation, drag/release/cancellation, automatic rotation/scrambles, no manual hover response, reduced motion, fallback behavior, keyboard pause, and exact paused reconstruction when scrolling back.
