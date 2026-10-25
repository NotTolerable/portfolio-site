# Observatory asset provenance

The active world uses original authored composition, receiver geometry, camera choreography and interface, plus the following **CC0** assets from Poly Haven. All model/PBR/HDR assets are self-hosted; there are no runtime third-party asset requests.

| Source | Author(s) | Local derivative |
| --- | --- | --- |
| [Industrial Microscope](https://polyhaven.com/a/industrial_microscope) | Lukas Walzer | `public/world/optics.glb` |
| [Vintage Radio Transceiver](https://polyhaven.com/a/vintage_radio_transceiver) | Mateusz Sadek | `public/world/radio.glb` |
| [Utility Box 01](https://polyhaven.com/a/utility_box_01) | James Ray Cock | `public/world/relay.glb` |
| [Desk Lamp Arm 01](https://polyhaven.com/a/desk_lamp_arm_01) | Kuutti Siitonen; Yann Kervran | `public/world/lamp.glb` |
| [Metal Office Desk](https://polyhaven.com/a/metal_office_desk) | Ulan Cabanilla | `public/world/desk.glb` |
| [Portable Searchlight](https://polyhaven.com/a/portable_searchlight) | Elijah Cragg | `public/world/searchlight.glb` |
| [Modular Urban Apartments Facade](https://polyhaven.com/a/modular_urban_apartments_facade) | James Ray Cock | `public/world/facade.glb` (selected reusable modules) |
| [Concrete Floor Worn 001](https://polyhaven.com/a/concrete_floor_worn_001) | Dimitrios Savva; Rico Cilliers | `public/world/concrete-*.webp` |
| [Modern Buildings Night](https://polyhaven.com/a/modern_buildings_night) | Greg Zaal | `public/world/city-light.hdr` (lighting only) |

[Poly Haven’s license](https://polyhaven.com/license) dedicates its models, textures and HDRIs to [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Commercial use, redistribution and modification are allowed without required attribution. Credits are retained here and alongside the public assets. Poly Haven’s website graphics, logos and example renders are not included.

## Preparation

Download the sources’ 1k glTF packages, preserving their relative `.bin` and texture paths. Name the source glTF `<asset-id>/<asset-id>.gltf`. Download the concrete diffuse/OpenGL-normal/roughness JPGs as `concrete-Diffuse.jpg`, `concrete-nor_gl.jpg`, `concrete-Rough.jpg`, and the 1k HDR as `modern_buildings_night.hdr` in the same source directory.

Run `node scripts/prepare-world-assets.mjs /absolute/path/to/source-directory` after `npm ci`. The script packs original geometry and 1k WebP maps into meshopt-compressed GLBs, deduplicates resources and discards unused architectural modules. The source geometry is not aggressively decimated. Floor maps remain 1k. Dev-only glTF Transform, sharp and meshoptimizer perform preparation; the browser uses Three.js’s bundled decoder.

`public/illustrations/observatory-poster.webp` is a capture of this actual scene for loading, reduced motion, no-JavaScript and graphics failure. It is not a project screenshot. The project display diagrams are original conceptual architecture illustrations; they do not claim live product output.

The isolated `/camera-study` prototype reuses these same licensed models, maps and HDR, with original street/court staging geometry and camera choreography. `public/illustrations/camera-study-poster.webp` captures that actual staging scene for loading and graphics failure; it does not represent the finished city or a portfolio project.

The owner’s public resume remains unchanged at `public/documents/Babisan-Pirapakaran-Resume.pdf`. Extended private experience notes are not assets and are not published.
