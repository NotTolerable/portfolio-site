# City preview — assets and licenses

The experimental `/city-preview` is an original winter street composition. Shop names, signs, cinema posters, interiors, street layout, roofs, balconies, shutters, snow accumulation, window treatments and interface are authored for this scene. Fictional shops are environmental storytelling; they do not represent clients or portfolio projects. No Samana source, branding, models or screenshots are included.

## Self-hosted CC0 assets

All third-party models and maps below are from Poly Haven. Its [asset license](https://polyhaven.com/license) dedicates these assets to [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), permitting adaptation, redistribution and commercial use. Credits are retained voluntarily. Poly Haven website images and example renders are not used as scene artwork.

| Source | Author | Local derivative |
| --- | --- | --- |
| [Modular Urban Apartments Facade](https://polyhaven.com/a/modular_urban_apartments_facade) | James Ray Cock | `public/city/architecture.glb`; a larger, normalized module selection from the previously acquired original |
| [Street Lamp 02](https://polyhaven.com/a/street_lamp_02) | Josh Dean | `public/city/lantern.glb` |
| [Painted Wooden Bench](https://polyhaven.com/a/painted_wooden_bench) | Kirill Sannikov | `public/city/bench.glb` |
| [Outdoor Table Chair Set 01](https://polyhaven.com/a/outdoor_table_chair_set_01) | James Ray Cock | `public/city/cafe.glb` |
| [Book Encyclopedia Set 01](https://polyhaven.com/a/book_encyclopedia_set_01) | John Malcolm | `public/city/books.glb` |
| [Wooden Bookshelf Worn](https://polyhaven.com/a/wooden_bookshelf_worn) | Ulan Cabanilla | `public/city/shelf.glb` |
| [Planter Box 01](https://polyhaven.com/a/planter_box_01) | James Ray Cock | `public/city/planter.glb` |
| [Cobblestone Floor 08](https://polyhaven.com/a/cobblestone_floor_08) | Rob Tuytel | `public/city/cobbles-*.webp`; diffuse, normal, roughness and AO |
| [Brick Wall 02](https://polyhaven.com/a/brick_wall_02) | Dimitrios Savva | `public/city/brick-*.webp`; diffuse, normal, roughness and AO |
| [Concrete Floor Worn 001](https://polyhaven.com/a/concrete_floor_worn_001) | Dimitrios Savva; Rico Cilliers | Existing `public/world/concrete-*.webp`, reused on stone/paving |
| [Modern Buildings Night](https://polyhaven.com/a/modern_buildings_night) | Greg Zaal | Existing `public/world/city-light.hdr`; lighting only |

The runtime performs no third-party asset requests. The original optical/radio/receiver/desk assets are not part of this route. There is no skeletal pedestrian asset in the selected set; the prototype uses illuminated interiors, furniture, snow and a suspended sign to suggest a lived-in street rather than adding placeholder people.

## Reproduction

Acquire the models' 1k glTF downloads through Poly Haven's public file API. Preserve each glTF's original relative `.bin` and texture resources under `<city-source>/<asset-id>/`, and name the glTF `<asset-id>.gltf`. Put the surface diffuse, OpenGL normal, roughness and AO JPGs in `<city-source>/<asset-id>-{diff,nor_gl,rough,ao}.jpg`. The original facade source directory is the one documented in [observatory provenance](observatory.md).

Run:

```sh
node scripts/prepare-city-assets.mjs /absolute/path/to/city-source /absolute/path/to/original-world-source
```

The script uses existing glTF Transform, sharp and meshoptimizer dependencies. It retains model geometry, prunes unused architecture modules, normalizes module pivots, deduplicates resources, packs meshopt GLBs and converts maps to 1k WebP. No model decimation is performed. Architecture texture detail and source normal/AO maps remain intact. The source downloads stay outside the repository.

`public/illustrations/city-{arrival,bookshop,passing,corner}.webp` are captures of the actual experimental scene. They provide mobile, reduced-motion, no-JavaScript and graphics-failure views. They are not project screenshots or imported reference renders.
