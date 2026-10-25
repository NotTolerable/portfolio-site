# 0009: Authored city camera and isolated direction prototype

Status: accepted under the owner’s critical cinematic-camera addition; extends 0008 with a prototype before the full city build.
Date: 2026-10-24

## Context

The owner finds the six-pose rooftop camera too restrained and repetitive. The approved next direction requires continuous forward progression through a connected nighttime city, meaningfully different angles, independent position/orientation channels, reversible scrolling, bounded cursor parallax, custom object focus and a deliberate transition into an empty basketball court. Build at least four distinct compositions as a small prototype before expanding the environment.

## Decision

Add `/camera-study` alongside the published portfolio. It stages six compositions: eye-level street establishment, left storefront approach, right side-looking service bay, rising corner orbit, crane/turn through an open gate, and a lower settled view inside an empty basketball court. Existing licensed assets are reused; this is a camera-direction staging set, not the completed city redesign. The home portfolio, factual records, resume and cloud routes remain available.

`cinematic-journey.ts` owns a deterministic authored timeline. A 23-point centripetal translation rail is sampled by arc length through a separate monotone cubic pacing track. Independently keyed yaw, pitch and lens tracks control orientation/framing. Orientation is represented by quaternions; focus uses quaternion interpolation, and additive pointer offsets are horizon-leveled to prevent roll. The main orientation track is deliberately authored in yaw/pitch to preserve the horizon, rather than inferred from a small set of look targets.

A single render-clock director damps requested scroll progress and produces the camera pose, active composition, caption opacity and hotspot ranges from the same rendered progress. Native scrolling and keyboard scrubbing set intent; reverse scrolling evaluates the same poses in reverse. Object focus has a separate explicit composition for each landmark and returns to the same journey point.

The shared layout suspends/removes the old observatory renderer on the prototype route, so two WebGL scenes do not render simultaneously. Scene loading, resource cleanup, hidden-tab suspension, reduced motion, static fallback and keyboard/native-dialog access remain explicit requirements. Reduced motion uses immediate seeks with ambient motion disabled.

## Alternatives and consequences

Another six-point position/look-target spline would reproduce the previous limitation. An engine rewrite is unnecessary. GSAP remains available, but the prototype uses pure track evaluation and exponential render-clock damping so scroll reversal, testing and a single authoritative state remain straightforward. Reconsider a timeline library only if later shot orchestration becomes easier to author with it.

The small scene includes actual street/court geometry, reused detailed props, architectural modules, lights and rain to make parallax and framing assessable. It does not establish the final environment’s asset density, bespoke city architecture, postprocessing or commercial-game fidelity. Full city expansion follows camera review rather than being silently treated as completed.
