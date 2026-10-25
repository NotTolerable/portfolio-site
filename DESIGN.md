# Babisan Pirapakaran — After Hours / The Observatory

Status: owner-authorized continuous immersive redesign. Updated: 2026-10-24.

## Current mandate

The whole portfolio is one continuous, camera-led interactive world. Remove the walking character, its game mechanics and the separation between a 3D opening and conventional stacked portfolio sections. Preserve the identity, all factual portfolio content, resume, cloud planning and working links.

The owner explicitly grants full technical, creative, architectural and asset freedom. Prior engine, one-pass, procedural-only, character and implementation-preservation constraints are superseded. Keep the night-city atmosphere and prioritize visual quality; asset compression must not become an excuse for simplified placeholder art.

[Samana Studio](https://samanastudio.es/) informs cinematic camera progression, detailed reflective forms, atmosphere, spatial continuity, minimal chrome and negative space. Adapt those principles to an original night-city world. Do not copy its proprietary art, branding, source or studio contact information.

## Art direction

**After Hours / The Observatory** is a rooftop workshop above a rain-washed city. A slowly moving orbital receiver, detailed optical instruments, an aged radio, electrical relay, work desks, lamp and communications antenna establish a place for curiosity and engineering. They are fictional spatial metaphors, not portraits, project screenshots or claims of laboratory experience.

Cool blue-black architecture and concrete contrast with warm paper text, restrained cyan illumination and amber practical lights. Reflective metal, worn PBR surfaces, wet patches, cables, repeated architectural details, distant windows and fog establish foreground, midground and depth. Licensed detailed models complement original receiver geometry and authored composition. Keep lighting motivated and contrast deliberate rather than washing every object in ambient light.

The owner’s latest typography instruction replaces the bold comic face: use self-hosted JetBrains Mono for the name and code annotations, and regular/medium Inter for headings and readable prose. Avoid the former condensed, heavy, italic comic treatment. The owner’s name and software-engineering identity remain immediately clear. Keep the small box mark and `bp` initials. Never add invented certifications, expertise, decorative Japanese copy or fictional portfolio metrics.

## Composition and journey

One camera rail traverses one connected terrace:

1. **Arrival / The observatory.** Personal name, software engineering identity, current 407 ETR work, direct Work and Resume links. Receiver and workshop occupy the visual focal area. No blocking movie or loading gate.
2. **Work / The workshop.** Axiom, Verilly and Behaviourly are selected in a compact index; the physical display switches conceptual architecture diagrams. Each project opens a focused reader with description, technologies, implementation notes and original conceptual illustration. No invented demo/source links or fabricated performance values.
3. **Experience / The relay archive.** Select professional roles and open the complete record, including grouped game server infrastructure, performance, anti-cheat, Java tooling, client builds, coursework and education. Preserve all owner-confirmed dates and per-network metrics. Omit individual game server names and ownership/volunteer/project job titles. Label AI-assisted client development.
4. **About / After hours.** A lamp and desk accompany a personal note, Waterloo background, engineering curiosity and anime influence.
5. **Toolkit / The toolbench.** Explore systems, demonstrated platforms/delivery work and future GPU/CUDA interests. Selection subtly changes the relay’s material response. Link to the planned cloud lab; do not imply it is already deployed on AWS.
6. **Contact / Open channel.** Direct owner email, verified GitHub/LinkedIn, resume and hosting explanation. Keep navigation open and reversible.

The primary experience uses fixed, restrained typography alongside the moving world. Project and experience records open in a native dialog with focus containment, Escape/close and scrollable readable content; the world stays behind it. This reader is intentional document access, not a set of scattered floating cards.

## Interaction language

Native scrolling advances the camera; destination links give immediate discoverability. Camera movement eases without sudden zooms or snapping. Pointer parallax is subtle and bounded. A projected landmark control follows its actual 3D position and responds to hover/focus. Never make important information depend on discovering a hotspot.

The shared scene persists through internal navigation to `/infrastructure`. `/resume` keeps the same visual shell and embeds the supplied PDF, with direct-file and download controls; requested resume buttons still open it in a new tab.

Use restrained glass on small actions, soft highlights, thin boundaries and clear focus states. Keep text readable without covering the whole environment. On narrow screens, reframe the camera and place a shorter reading area lower in the viewport, with a collapsible index and direct destination navigation.

## Resilience and rendering

PBR models, HDR environment reflections and material detail are primary tools. Environmental reflections are image-based; they do not mirror local objects in real time. Use a frozen shadow map, batched static geometry, instanced distant windows/buildings, GPU rain and local halos where useful. Retain high-quality source geometry and reduce repeated work before reducing visual detail.

The default motion preference, pause/rain controls, tab visibility handling, conservative initial pixel ratio and adaptive fill-rate adjustment prevent unnecessary work. Initial reduced motion defaults to a complete reading view and a still captured from the actual world. An explicit opt-in may show the world with ambient movement disabled and immediate camera navigation. Required model, WebGL or context failure returns to complete reading mode. Core content is server rendered and works without JavaScript. Do not promise universal frame rates.

See [architecture](docs/architecture.md), [decision 0008](docs/decisions/0008-continuous-observatory.md) and [asset provenance](docs/assets/observatory.md).

## Superseded directions

The walking district is [archived](src/archive/grounded-district/README.md). The [image-city](src/archive/image-city/README.md) and [cube](src/archive/cube-portfolio/README.md) remain dormant. Prior serif layouts, circuit-board cities, floating gardens, character controls, splatter/blade/impact entrances and company-style stacked landing sections are not active requirements.
