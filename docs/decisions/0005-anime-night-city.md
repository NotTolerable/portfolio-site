# 0005: Anime-inspired night city and lightweight scene rendering

Status: accepted; supersedes the active visual composition in 0004.
Date: 2026-10-24

## Context

The owner requested a complete rebrand with Samana/Igloo-like immersive visual quality, comic/anime art direction, and smooth performance. They clarified that they want a night city, and rejected both a circuit-board city and floating garden. They authorized storing the existing cube and changing layout, typography, and color.

## Decision

Use an original rendered night-city illustration with baked lighting, projected through a small depth-deformed Three.js mesh. Add real-time GPU rain, layered mist, restrained camera movement, and optional neon grading. This is an image-based 2.5D environment, not a fully modelled free-roaming game level.

Retain Next.js, TypeScript, npm, Motion, Three.js, and Vercel. Keep all portfolio content in semantic HTML. Use Barlow Condensed, Inter, and JetBrains Mono; rebrand the page around dark city surfaces, warm text, vermilion, and paper project dossiers. Archive the previous cube composition instead of deleting its implementation.

## Alternatives

- A fully modelled city could support larger camera moves, but requires a separate authored/optimized 3D environment, texture pipeline, and larger GPU/download budget.
- A static background alone is simpler but omits the requested interactive depth and atmosphere.
- Continuing the cube does not satisfy the approved change in direction.

## Consequences

Detailed art appears before WebGL loads. The current environment needs one approximately 283 KB city texture and a small set of procedural graphics resources. Camera motion is deliberately limited to preserve the image projection. Reduced motion and unavailable graphics retain a complete still presentation. The old cube remains recoverable at `f48b6df` and through the archive notes.

See [DESIGN.md](../../DESIGN.md), [architecture](../architecture.md), and [art provenance](../assets/night-city.md).
