# Underwater gallery assets

Updated 2026-10-29. Complete public attribution is available at [`public/gallery/ATTRIBUTION.txt`](../../public/gallery/ATTRIBUTION.txt) and through the gallery’s Credits panel.

| Local asset | Source / author | License | Changes |
| --- | --- | --- | --- |
| `baby-angel.glb` | [Baby Angel Sculpture](https://skfb.ly/6FPQp), M.Reslan | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Samana web geometry optimization; local centering, scale and material replacement |
| `nike.glb` | [Statue Bust of Nike](https://skfb.ly/oAvWs), skullreaper134 | CC BY 4.0 | Samana web preparation; local centering, scale and material replacement |
| `boxing-gloves.glb` | [Vintage boxing gloves](https://www.blendkit.com/asset-gallery-detail/7a526c99-4ea9-4955-822e-829bb962965f/), Joachim Bornemann | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | Geometry-only Blender export, decimation, Meshopt compression, centering/orientation and white surface sampling; no solid rendering |
| `studio.hdr` | [Studio Small 08](https://polyhaven.com/a/studio_small_08), Sergej Majboroda / Poly Haven | CC0 | 1k HDR, cool desaturated tint in PMREM preparation |
| `fish.glb` | [Barramundi Fish](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/BarramundiFish), Microsoft 2017 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1024px WebP quality85, new tint/placement and procedural motion; geometry unchanged |

Sculpture licenses were independently confirmed in original model pages, embedded GLB author/source/license metadata and [Samana credits](https://samanastudio.es/credits/). Their existing optimized derivatives were retrieved from `/models/baby_angel_opt.glb` and `/models/nike.glb` on that site. The fish was retrieved from the official Khronos Sample Assets repository with its model-specific CC0 license; original 12,488,144 bytes became 480,232 bytes after texture compression.

Geist is self-hosted through `@fontsource/geist` under SIL OFL1.1; JetBrains Mono uses its existing self-hosted Fontsource package/license. Runtime uses the CC0 Studio Small 08 HDRI by Sergej Majboroda / Poly Haven, with generated RoomEnvironment as a failure fallback; the original site’s unidentified HDR is not reused.

The original reference’s ice, fish, third sculpture and HDR had no verified reusable provenance and are not included. Ice hulls, physical materials, processor, particle volume, atmosphere and shaders are independently authored here. Gallery artwork and project diagrams are illustrative; neither is an actual product screenshot. Old city/observatory assets remain dormant and retain their original separate provenance records.

## Active personal black-ice exhibits

The initial sculpture-based adaptation is superseded by [decision 0013](../decisions/0013-personal-black-ice.md). The current owner refinement replaces the visible solid basketball, boxing gloves and dumbbell with white particle forms. Original procedural geometry supplies the basketball/dumbbell shapes. The glove pair now uses Joachim Bornemann’s detailed CC0 sculpted model, replacing the rejected primitive source in the normal path. Its author and Creative Commons Zero license were verified against the source page and official asset API on 2026-10-29. The source’s low-texture .blend variant retains the geometry; temporary Blender 4.5.15 exports geometry only, then the existing glTF-Transform/Meshopt tools produce a 1,362,116-byte GLB. Preparation scripts are included; the .blend and temporary Blender tool are not application dependencies. The model is posed as a close, cuff-up hanging pair with an original curved lace source, then sampled once and disposed; its solid meshes never remain visible. The shipped GLB is unchanged by this posing adjustment. The angel and Nike files remain dormant with their attribution intact. The current renderer fetches the CC0 studio HDR and sculpted glove GLB; the fish is now dormant.

`public/documents/resume-preview.png` is a 1530×1980 rendering of the exact one-page authorized resume PDF; the original file is unchanged. Recreate it with `scripts/render-resume-preview.swift` on macOS after changing the PDF. This preview contains the same owner-authorized public information as the PDF.

## Historical systems-chamber refinement — 2026-10-27

The active fish scene is superseded by [decision 0014](../decisions/0014-systems-chamber-and-adaptive-graphics.md). No fish or sculpture GLB is fetched by the active renderer. Original instanced processor detail, instrument-platform geometry, identity decal, signal arcs and synthesized sound define the later stage. Studio Small 08 remains the active external HDR under CC0, with generated RoomEnvironment fallback. Previous attribution remains for the dormant distributed assets. No Igloo geometry, textures, application source or audio recordings are included.

## Nightfall hybrid — 2026-10-28

[Decision 0015](../decisions/0015-nightfall-contact-and-atmosphere.md) supersedes the physical chamber. Contact-history ice shaders, sparse fields, atmospheric horizon/clouds and buffered sound design are original. No Igloo recordings or assets are imported; its authored audio has no verified reusable license. At this historical stage the studio HDR was the only external gallery artwork fetched at runtime; the later glove refinement above adds a CC0 model.

Audio combines original short game UI cues with the opt-in atmospheric score approved in [decision 0017](../decisions/0017-multilingual-arrival-and-ambient-score.md). The 48-second stereo loop is generated offline on first activation; no reference recording, wind or noise bed is included. The initial dual-fan GPU and surface-mesh highlight patch are superseded by [decision 0016](../decisions/0016-frost-frontier-and-modern-gpu.md): an original slanted modern single-fan GPU, translucent hologram shader and particles sampled from those same surfaces. Contact uses a generated periodic triangle data texture exposed by a GPU frost frontier, separate from the drifting exterior network. Those GPU/contact effects require no external asset or additional package.
