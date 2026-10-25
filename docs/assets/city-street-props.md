# Detailed static street props

Prepared 2026-10-25 for the experimental `/city-preview` environment. These are
self-hosted licensed assets; acquisition does not authorize deployment or change
the Phase 3 integration scope. See [the city preview provenance](city-preview.md)
for the existing architecture and furniture.

## Sources and licenses

| Runtime file | Original asset and author | License evidence |
| --- | --- | --- |
| `public/city/props/bicycle.glb` | [City bicycle](https://www.innerscene.com/tools/library/3d-parts/city-bicycle-58a2a324), Innerscene original model | The primary asset page explicitly dedicates this original model to CC0. [Library terms](https://www.innerscene.com/tools/library/terms) permit commercial use, modification and redistribution. |
| `public/city/props/trash-can.glb` | [Metal Trash Can](https://polyhaven.com/a/metal_trash_can), GurJas Studios / Poly Haven | Asset page and [Poly Haven license](https://polyhaven.com/license): CC0. |
| `public/city/props/covered-car.glb` | [Covered Car](https://polyhaven.com/a/covered_car), MP / Poly Haven | Asset page and [Poly Haven license](https://polyhaven.com/license): CC0. |

All three use [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/),
which permits this public self-hosted use and derivative redistribution without
mandatory attribution. Credits are retained in
[`public/city/props/LICENSE.txt`](../../public/city/props/LICENSE.txt) and each
GLB's asset copyright field. No runtime request goes to an external asset host.

The bicycle retains individual spokes, rims, frame tubes, seven-speed cassette,
48-tooth chainring, chain, cranks, pedals, brake cables and controls. It is a
nominal-scale visualization asset; the source explicitly describes simplified
internal/manufacturer interfaces. It uses metal, rubber and painted PBR material
factors and has no texture images. It is suitable as a parked environmental prop.

The trash-can source displays two independent variants side by side. The runtime
derivative retains the complete intact metal can, both handles and the detached
lid leaning beside it. Only the separate duplicate rusty variant is removed.
The covered car retains all four wheels and the detailed folded cover. It is a
static covered parked vehicle, suitable for a parking recess away from the camera
and pedestrian routes.

## Runtime measurements

Measurements below are from re-reading the prepared GLBs through the installed
Meshopt decoder. Dimensions are world metres in width X × height Y × length Z.

| File | Bytes | Triangles | Mesh primitives | Dimensions (m) |
| --- | ---: | ---: | ---: | --- |
| `bicycle.glb` | 102,404 | 11,784 | 7 | 0.5802 × 1.0760 × 1.7800 |
| `trash-can.glb` | 604,056 | 6,428 | 1 | 0.7780 × 0.9062 × 0.5563 |
| `covered-car.glb` | 591,436 | 12,592 | 1 | 1.7888 × 1.4112 × 4.3803 |

Total file size: 1,297,896 bytes. The bicycle and car run lengthwise along Z.
All assets are centred on X/Z with the lowest source geometry grounded at Y=0;
Meshopt quantization introduces less than 0.1 mm of floor/bounds rounding. The
trash-can width includes its leaning lid, so retain that full clearance when
placing it. Material joining reduces the bicycle's many static component nodes
to seven draw primitives; no source geometry decimation is applied. The two Poly
Haven models each contain three 1024 × 1024 WebP maps: base color, OpenGL normal,
and packed ambient-occlusion/roughness/metalness.

| File | SHA-256 |
| --- | --- |
| `bicycle.glb` | `87d1e9709a4f8ab5927cab43909549346ca910c8633e1d3be524e452bf5a1a96` |
| `trash-can.glb` | `6ae10b5a1e44c5f2382691dab8fa185fddd8e299c3dbbbc1e4efb1299061add9` |
| `covered-car.glb` | `6e7c8fa282f79f0e639614eacdbb3025f1d79ea55edbf77e2422e50a1542abb7` |

## Reproduction and verification

Download the Innerscene original through the primary page's [Download GLB
endpoint](https://www.innerscene.com/api/library/city-bicycle-58a2a324/download)
and save it as `bicycle-original.glb` in a local source directory.

For each Poly Haven model, use its public file manifest:
[metal trash can](https://api.polyhaven.com/files/metal_trash_can),
[covered car](https://api.polyhaven.com/files/covered_car). Select
`gltf["1k"].gltf`, save the main glTF as `<id>/<id>.gltf`, and download all
`include` entries relative to that model directory, retaining their paths.
The source layout is:

```text
city-prop-sources/
  bicycle-original.glb
  metal_trash_can/
    metal_trash_can.gltf
    metal_trash_can.bin
    textures/...
  covered_car/
    covered_car.gltf
    covered_car.bin
    textures/...
```

Run:

```sh
node scripts/prepare-city-props.mjs /path/to/city-prop-sources
```

The [preparation script](../../scripts/prepare-city-props.mjs) uses the existing
`@gltf-transform`, `sharp` and `meshoptimizer` dependencies. It grounds/centres
the retained source geometry, bakes static transforms, joins compatible material
primitives, removes unused resources, converts texture maps to 1k WebP at quality
90, and writes Meshopt GLBs. It re-reads the output to report byte counts,
triangles, primitives, decoded bounds, texture dimensions and SHA-256 hashes.

The three prepared files were successfully loaded together using the installed
Three.js `GLTFLoader` and bundled `MeshoptDecoder`, rendered in installed Google
Chrome, and visually inspected in an isolated 1500 × 750 preview. This verifies
asset decoding, intact proportions and materials; placement and lighting in the
city are verified separately by the scene integration work.
