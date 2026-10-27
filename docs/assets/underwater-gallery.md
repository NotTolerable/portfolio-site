# Underwater gallery assets

Updated 2026-10-25. Complete public attribution is available at [`public/gallery/ATTRIBUTION.txt`](../../public/gallery/ATTRIBUTION.txt) and through the gallery’s Credits panel.

| Local asset | Source / author | License | Changes |
| --- | --- | --- | --- |
| `baby-angel.glb` | [Baby Angel Sculpture](https://skfb.ly/6FPQp), M.Reslan | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Samana web geometry optimization; local centering, scale and material replacement |
| `nike.glb` | [Statue Bust of Nike](https://skfb.ly/oAvWs), skullreaper134 | CC BY 4.0 | Samana web preparation; local centering, scale and material replacement |
| `studio.hdr` | [Studio Small 08](https://polyhaven.com/a/studio_small_08), Sergej Majboroda / Poly Haven | CC0 | 1k HDR, cool desaturated tint in PMREM preparation |
| `fish.glb` | [Barramundi Fish](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/BarramundiFish), Microsoft 2017 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1024px WebP quality85, new tint/placement and procedural motion; geometry unchanged |

Sculpture licenses were independently confirmed in original model pages, embedded GLB author/source/license metadata and [Samana credits](https://samanastudio.es/credits/). Their existing optimized derivatives were retrieved from `/models/baby_angel_opt.glb` and `/models/nike.glb` on that site. The fish was retrieved from the official Khronos Sample Assets repository with its model-specific CC0 license; original 12,488,144 bytes became 480,232 bytes after texture compression.

Geist is self-hosted through `@fontsource/geist` under SIL OFL1.1; JetBrains Mono uses its existing self-hosted Fontsource package/license. Runtime uses the CC0 Studio Small 08 HDRI by Sergej Majboroda / Poly Haven, with generated RoomEnvironment as a failure fallback; the original site’s unidentified HDR is not reused.

The original reference’s ice, fish, third sculpture and HDR had no verified reusable provenance and are not included. Ice hulls, physical materials, processor, particle volume, atmosphere and shaders are independently authored here. Gallery artwork and project diagrams are illustrative; neither is an actual product screenshot. Old city/observatory assets remain dormant and retain their original separate provenance records.

## Active personal black-ice exhibits

The initial sculpture-based adaptation is superseded by [decision 0013](../decisions/0013-personal-black-ice.md). The active scene uses original procedural basketball, boxing gloves and dumbbell geometry with original leather, seams, stitching and machined-metal details. The angel and Nike files remain dormant with their attribution intact. Only the CC0 fish and studio HDR are fetched by the active renderer.

`public/documents/resume-preview.png` is a 1530×1980 rendering of the exact one-page authorized resume PDF; the original file is unchanged. Recreate it with `scripts/render-resume-preview.swift` on macOS after changing the PDF. This preview contains the same owner-authorized public information as the PDF.

## Current systems-chamber refinement — 2026-10-27

The active fish scene is superseded by [decision 0014](../decisions/0014-systems-chamber-and-adaptive-graphics.md). No fish or sculpture GLB is fetched by the active renderer. Original instanced processor detail, instrument-platform geometry, identity decal, signal arcs and synthesized sound define the later stage. Studio Small 08 remains the active external HDR under CC0, with generated RoomEnvironment fallback. Previous attribution remains for the dormant distributed assets. No Igloo geometry, textures, application source or audio recordings are included.
