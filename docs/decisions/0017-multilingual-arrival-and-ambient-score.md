# 0017 — Multilingual arrival and ambient score

Status: accepted and implemented locally; integrated checks passed. Date: 2026-10-29. Amends the intro/audio requirements in [0015](0015-nightfall-contact-and-atmosphere.md) and [0016](0016-frost-frontier-and-modern-gpu.md); retains their geometry, GPU, content, navigation and local-only boundaries.

## Context

The owner explicitly requested a Samana-like loading bar and greeting progression in English, Tamil, Mandarin, Spanish, Arabic, Hindi and French before their name, together with atmospheric background music. This reverses the preceding name-only arrival and cue-only/no-music restrictions. It does not restore rejected wind/air sounds or authorize copying reference recordings.

## Decision

Use Hello → வணக்கம் → 你好 → Hola → مرحبا → नमस्ते → Bonjour → Babisan Pirapakaran in a centered dark loading composition. Independently implement upward word rotation/translation, a thin bottom-center line and a three-digit progress counter. Use a calmer 500ms greeting cadence and 320ms blends, with a 4.5-second minimum sequence. Progress is bounded by both actual resource readiness and the greeting clock. Only after assets and sequence are ready does the curtain lift. The camera/atmosphere arrival may run underneath; the subsequent owner refinement below delays the first geometric materialization until the curtain fully clears. Use language metadata and script-appropriate font fallbacks, with right-to-left direction for Arabic. Keep the reading escape and immediate-name reduced-motion alternative.

Retain explicit opt-in audio, with the same accessible sound state available during loading and on the page. Add an original quiet 48-second seamless stereo score: slowly overlapping harmonic pads and sparse upper notes, without a beat or wind/noise bed. Generate it once offline on first activation, cache the buffer and play one looping source. Preserve modern UI hover/typing/confirm cues and bounded one-shot voices. Duck music for dialogs; pause fades music while deliberate interface cues remain usable. Muting, hidden-tab suspension, reading/failure cleanup and unmount disposal remain required.

## Consequences and boundaries

The score requires approximately 9.2MB for its final 24kHz stereo float buffer after opt-in, but does not run live synthesis in the render loop. The greeting sequence lengthens the minimum arrival; loading can still be bypassed for reading and reduced motion removes nonessential motion. The reference’s cadence/composition inform an independent adaptation rather than a copied asset or exact equivalence claim.

All factual portfolio content, `/resume`, `/infrastructure`, adaptive graphics and the current slanted GPU/two-layer ice interaction remain. No package, external recording, push or deployment is introduced. Production build, lint, typecheck and all 35 production tests passed. Native Chrome review covered desktop/mobile script rendering, the curtain handoff, loading controls, music output/mute/pause and cleanup. The narrow-screen loading overlay had no Axe violations. See the [current study](../reports/igloo-hybrid-study.md) for verification scope.

## Particle exhibits and visible reveal follow-up

The owner subsequently requested all-white particle versions of the basketball, boxing gloves and dumbbell inside their ice exhibits, replacing the rendered solid objects. Keep the original three-dimensional silhouettes and useful detail; original procedural geometry may be sampled during initialization but must not remain as a visible solid mesh. This changes the exhibit rendering, not their meaning or the separate GPU hologram.

The owner also reported missing the first ice exhibit’s geometric animation beneath the loading screen. Its edge-to-material reveal must begin immediately after the loading curtain has completely cleared. Camera/atmosphere motion can begin earlier so the handoff remains fluid. Preserve reduced motion, pause, loading skip/failure cleanup, direct navigation and the single renderer clock. The follow-up passed production build, lint, typecheck and all 35 production checks. The arrival test compares actual intermediate `iceReveal` shader uploads with the real curtain transition end, preventing materialization from running under the overlay. Native desktop/mobile review confirmed white particle forms, reduced-motion completion and the visible wireframe-to-ice handoff. The earlier test result above describes the preceding loader/music stage.

## Particle clarity and sculpted gloves

The owner subsequently requested clearer interior particles and a better glove model. Replace the primitive glove source in the normal path with Joachim Bornemann’s CC0 Vintage boxing gloves, retaining a local fallback for missing assets. Sample its sculpted geometry once into white points and dispose the solid source. Decode quantized GLTF coordinates to floating point before applying transforms. Keep author/license/source and preparation details in [asset provenance](../assets/underwater-gallery.md).

Separate rough exterior reflection from the clearer central transmission calculation, disable dispersion and increase High/Balanced transmission-target resolution. Retain frosted edges, contact effects and cheaper no-transmission modes. This improves particle definition without claiming an unchanged GPU cost or universal frame rate. The owner also explicitly authorized Vercel production deployment after completion, superseding the earlier local-only release boundary.

The complete refinement passed build, lint, typecheck and all 36 production tests, including a regression for quantized model coordinates and existing missing-asset/context-loss handling. Native Chrome review covered desktop and 390×844/320×500 layouts, with no JavaScript errors or horizontal overflow. These checks do not establish performance on the owner’s other devices.
