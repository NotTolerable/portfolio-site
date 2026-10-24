# Street scene and character provenance

## Environment

The active night street is built from original procedural Three.js geometry, canvas shop-sign textures and custom materials in `src/lib/district-environment.ts`, `src/lib/district-materials.ts` and `src/lib/engraved-material.ts`. No reference-site models, textures or source are included. The comic camera/caption treatment is informed by the [owner’s reference video](https://www.instagram.com/p/De1njZtRl4t/), showing Santioni Spirits by Active Theory.

`public/illustrations/street-poster.webp` is a still capture of this real-time scene. It supplies the initial/reduced-motion/failure poster and the personal chapter image. It is not a project screenshot or a portrait of the owner, and is not projected as the live environment.

## Character

- Source: [Kenney — Animated Characters Protagonists](https://kenney.nl/assets/animated-characters-protagonists), downloaded from the official asset page.
- License: **Creative Commons CC0**. The original license is retained in [public/models/courier/LICENSE.txt](../../public/models/courier/LICENSE.txt).
- Original files: `Model/characterMedium.fbx`, `Skins/skaterMaleA.png`, `Animations/idle.fbx`, `Animations/run.fbx`.
- Repository filenames: `character.fbx`, `skin.png`, `idle.fbx`, `run.fbx`, under `public/models/courier/`.
- Runtime modifications: normalize height/orientation, adjust head/leg proportions, apply lit ink materials and the supplied skin, and author walking/turning/idle with analytic two-bone leg IK and distance-based stance/swing phases. Source asset binaries are unchanged.
- `scripts/prepare-courier.mjs` derives `idle-pose.json` from the first sample of the named `Root|Idle` clip. Run it with Node when updating source assets. The pose is covered by the same CC0 license.
- Only `character.fbx`, `skin.png` and `idle-pose.json` are requested by the active scene. The idle/run FBXs are retained as licensed source material and are not downloaded at runtime. The old run file begins with a targeting pose, not its run cycle.
- This is a fictional game character, not an owner likeness or a claim of original character modelling. Only the required mesh, texture and compact pose are loaded by the active route.

The earlier AI city artwork is [archived](night-city.md); it is not used by the active street scene.
