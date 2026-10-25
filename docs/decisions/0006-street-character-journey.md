# 0006: A real street and character in the comic night city

Status: superseded by [0008](0008-continuous-observatory.md); previously accepted; supersedes the image-based rendering approach in 0005.
Date: 2026-10-24

## Context

After supplying a specific comic-style reference, the owner rejected a city image as the environment. They requested a character on an actual street, rain, and the existing night-city colours. They explicitly authorized Three.js, advanced GSAP timelines and any other necessary graphics tools.

## Decision

Build a real Three.js street scene with batched architecture, instanced windows, procedural ink shading, a CC0 rigged fictional character, GPU rain and wet-road reflections. GSAP maps native scroll to character and camera movement, comic captions and a restrained SVG transition. Retain Next.js, TypeScript, Motion, npm and Vercel. Preserve semantic portfolio content and a direct skip to projects.

Use official Kenney character assets with their CC0 license; record provenance and modifications. Capture the still fallback from the actual scene. The reference informs camera/engraving/caption treatment; its assets, branding and source are not embedded.

## Alternatives

- The former 2.5D projection is cheaper but cannot place a character in a spatial street or deliver the requested moving camera.
- A full game engine, physics and unrestricted navigation would increase load/input complexity without helping recruiters inspect projects.
- A rendered video cannot support the requested responsive camera and user controls.

## Consequences

Real geometry and skeletal animation increase download and GPU costs. Batch/instance repeated detail, cap DPR, reduce effects on sustained slow frames and stop offscreen/paused drawing. Keep reduced-motion, model/WebGL failure and no-JavaScript paths usable. Visual quality and frame rate depend on the device; no universal performance claim is made.

See [design](../../DESIGN.md), [architecture](../architecture.md) and [asset provenance](../assets/street-character.md).
