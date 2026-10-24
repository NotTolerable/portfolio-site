# Street scene and character provenance

## Environment

The active night street is built from original procedural Three.js geometry, canvas shop-sign textures and custom ink shaders in `src/lib/night-street.ts` and `src/lib/engraved-material.ts`. No reference-site models, textures or source are included. The comic camera/caption treatment is informed by the [owner’s reference video](https://www.instagram.com/p/De1njZtRl4t/), showing Santioni Spirits by Active Theory.

`public/illustrations/street-poster.webp` is a still capture of this real-time scene. It supplies the initial/reduced-motion/failure poster and the personal chapter image. It is not a project screenshot or a portrait of the owner, and is not projected as the live environment.

## Character

- Source: [Kenney — Animated Characters Protagonists](https://kenney.nl/assets/animated-characters-protagonists), downloaded from the official asset page.
- License: **Creative Commons CC0**. The original license is retained in [public/models/courier/LICENSE.txt](../../public/models/courier/LICENSE.txt).
- Original files: `Model/characterMedium.fbx`, `Skins/skaterMaleA.png`, `Animations/idle.fbx`, `Animations/run.fbx`.
- Repository filenames: `character.fbx`, `skin.png`, `idle.fbx`, `run.fbx`, under `public/models/courier/`.
- Runtime modifications: normalize height/orientation, replace materials with lit ink hatching, apply the supplied skin, and blend idle/locomotion from actual scene movement. Source asset binaries are unchanged.
- This is a fictional game character, not an owner likeness or a claim of original character modelling. Only the required model, texture and two clips are shipped.

The earlier AI city artwork is [archived](night-city.md); it is not used by the active street scene.
