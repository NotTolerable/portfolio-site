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
