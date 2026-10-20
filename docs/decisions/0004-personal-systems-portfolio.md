# 0004: Personal systems portfolio and reversible particle intro

Status: implemented. Date: 2026-10-18. Supersedes the page-level direction in [0002](0002-design-reference.md); retains [source cube assets and motion](0003-source-cube-materials.md).

## Context

The owner requested a personal portfolio that feels like low-level systems/code, uses very restrained color, and has an original intro layout. They approved replacing the company-style sections and requested a cube scroll transition with particles, referencing [Viszen](https://viszen.tech/).

## Decision

Use ink black, muted icy-blue/slate, Inter, and JetBrains Mono. Lead with the full name across the composition, the cube within the visual field, and direct personal copy. Replace marketing-like sections and simulated code/terminal windows with two project articles, native expandable notes, personal background, and a clearly planned cloud experiment. Label project illustrations as conceptual until actual screenshots are supplied.

Later identity refinement: the owner requested a Resend-style serif name, the original cube-outline logo with name/initials, removal of underscore suffixes and “personal index” branding, and more selective glass depth. The owner approved a free serif alternative for now. Playfair Display regular serves the name; current tokens and controls are maintained in [DESIGN.md](../../DESIGN.md).

Implement one reversible native-scroll sequence using the existing Motion and Three.js dependencies. Scroll separates/fades cubelets while a GPU point cloud morphs from a cube surface into a generic processor silhouette. Reuse the existing WebGL renderer, source materials, cube controls, and legal state model. No Viszen models/code/assets are embedded.

## Consequences

The introduction has a short sticky interval that visitors can skip through the project link. Reduced motion removes that interval and the morph. The 2026-10-19 refinement removes the cube/hologram overlay while keeping automatic rotation and scrambling. Manual steering requires drag/keyboard input, and Space toggles automatic motion without visible controls. GPU interpolation avoids per-frame point-buffer rebuilding; 3,400/6,800 point budgets and offscreen rendering suppression bound the work. Tests verify reversibility, mouse/touch/keyboard interactions, automatic motion and drag handoff, reduced motion, overflow, fallbacks, and accessibility. Missing project evidence/contact details remain explicit product gaps.
