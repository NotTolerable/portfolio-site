# 0016 — Frost frontier and modern GPU

Status: accepted and implemented locally; integrated checks passed. Date: 2026-10-29. Refines the geometric contact mechanism and GPU silhouette in [0015](0015-nightfall-contact-and-atmosphere.md); preserves its Nightfall identity, finite navigation and local-only review. Its then-current name-only entrance and cue-only sound are subsequently amended by [0017](0017-multilingual-arrival-and-ambient-score.md).

## Context

The owner rejected the geometric effect and requested a more thorough Igloo reference analysis. The previous implementation conflated a surface trail with an exterior network, replacing both with highlighted mesh faces. The owner also supplied a modern GPU reference and requested a slanted, unbranded version of that silhouette.

## Decision

Keep the effects distinct. Actual pointer motion paints a decaying GPU frost history on each ice shell. Persistent polish clears roughness/refraction, while a spreading, advected frontier illuminates a fine irregular triangle pattern. A stationary pointer must not paint as the ice rotates beneath it. Retained marks fade over a few seconds. Generate the periodic triangle texture independently; do not import the reference’s bitmap or shader source.

A separate annular cloud of 18 drifting nodes produces sparse long links and tiny plus markers. Link growth/retraction takes 0.35 seconds; each node has at most three connections. The cloud continues moving when the cursor rests. Retire the 72-face surface highlight patch, nearest-face selection and flat circular overlays. Omit click flashes to retain the owner’s earlier no-strobe preference.

Use the existing renderer clock and bounded resources: 256² frost targets per exhibit, 128² in cheaper tiers, fixed simulation steps and preserved history during quality changes. Keep pause, static reduced motion, input/drag behavior, sharp HTML controls and fallback content. No new package or asset is required.

Reshape the original GPU hologram to a long modern card with one large visible right-hand fan, a broad left faceplate, perimeter and central X/hourglass frame, diagonal cooling fins, bracket and connector edge. The renderer supplies a slanted presentation and continuous rotation. Keep volumetric surface-sampled formation, translucent scan surfaces and the existing atmospheric transition. Omit manufacturer/model text and logos.

## Alternatives and consequences

The old Gaussian contacts and mesh-face highlights were cheaper approximations but did not reproduce the observed moving frontier or separate drifting links. A bounded low-resolution field adds small offscreen passes while preserving the single rendering loop and adaptive tiers. It reproduces behavior independently rather than claiming pixel identity with differently authored assets.

All factual content, routes, resume, navigation and audio preferences remain. No push or deployment is authorized. The [reference study](../reports/igloo-hybrid-study.md) separates verified observations from this implementation and records integrated validation.
