# 0002: Replace the initial visual design with the updated DESIGN.md

Status: superseded for page layout/theme by [0004](0004-personal-systems-portfolio.md); retained as historical reference
Date: 2026-10-14

## Context

The owner explicitly requested replacing the earlier implementation and disregarding earlier color preferences in favor of the new Resend-style `DESIGN.md`.

## Decision

Follow the current design reference closely: pure black canvas, graphite hairline borders, white ghost buttons, a large serif hero, sans-serif section headings, monospaced code, restrained violet identifiers, and a black WebGL cube.

Use the reference's named open font substitutes: Playfair Display for Domaine, Inter for aBC Favorit, and JetBrains Mono for Commit Mono. Bundle fonts locally. Use Three.js for the cube and Motion for restrained transitions.

Where the reference conflicts with itself about colorful primary actions, follow its explicit component specification and repeated do/don't rules: primary buttons remain transparent with white text and a hairline border.

## Alternatives considered

- The prior navy/teal palette and particle constellation were rejected by the owner's latest request.
- A CSS-only cube would be simpler but would not reproduce the specified WebGL material and lighting. Retain a CSS cube only as the loading/failure fallback.

## Consequences

- Remove the old particle component and replace the earlier visual styling.
- Keep the owner's identity, accurate project content, Next.js/TypeScript stack, and separate infrastructure-showcase requirement.
- Provide keyboard controls, pause/reset, reduced motion, and a no-WebGL fallback.
- The proprietary font shapes are approximated using the explicitly permitted substitutes; this is not an exact font match.
