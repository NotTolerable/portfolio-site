# Realistic city civilians

Status: three licensed human assets prepared for the experimental Phase 3.5 city. Sam and Harper suit outdoor background pedestrians; Maya's sleeveless clothing suits indoor café patrons. This work does not authorize deployment or a production merge. These are fictional library characters, not owner likenesses or original modelling claims.

## Source and rights

The original downloadable GLBs come directly from Innerscene's Free Parts Library:

| Character | Primary source and file | Appearance |
| --- | --- | --- |
| Sam | [Locomotion collection — Sam](https://www.innerscene.com/tools/library/3d-parts/locomotion-collection-sam-3d-person-animated-dc23800f) | Adult man, short dark hair, sage long-sleeve crewneck, navy chinos, brown leather shoes |
| Harper | [Locomotion collection — Harper](https://www.innerscene.com/tools/library/3d-parts/locomotion-collection-harper-3d-person-animated-797e1e2a) | Older adult woman, silver pixie hair, charcoal jacket and trousers, pale shirt and tie, dark shoes |
| Maya | [Locomotion collection — Maya](https://www.innerscene.com/tools/library/3d-parts/locomotion-collection-maya-3d-person-animated-1499b2fd) | Adult woman, brown ponytail, plum sleeveless top, charcoal trousers, black ankle boots |

Each individual source page dedicates the **entire supplied file to CC0**, explicitly identifying original character styling and authored motion, plus MakeHuman/MPFB CC0 body, rig and skin assets. This is the license for the dressed and animated derivative, rather than an inference from the base mesh's license. The [library terms](https://www.innerscene.com/tools/library/terms) require contributors to hold rights to release the complete file, dedicate it under CC0 and permit copying, modification, redistribution and commercial use. Embedded model metadata also identifies CC0 graphical assets and original mathematical IK motion without capture data. No Adobe, Mixamo or game-proprietary assets are included.

The [MakeHuman license clarification](https://static.makehumancommunity.org/makehuman/faq/why_is_makehuman_licensed_agpl_while_the_assets_are_cc0.html) separately describes its graphical assets as CC0. Reuse here relies on the specific Innerscene file dedications above, including their clothing and textures. The local [license notice](../../public/city/people/LICENSE.txt) records provenance; [CC0 legal text](https://creativecommons.org/publicdomain/zero/1.0/legalcode) governs the originals. Source pages and terms checked 2026-10-25. Exact original SHA-256 digests and output metrics are retained in [manifest.json](../../public/city/people/manifest.json).

## Preparation and budgets

Run [prepare-city-human-assets.mjs](../../scripts/prepare-city-human-assets.mjs):

```sh
node scripts/prepare-city-human-assets.mjs [source-cache-directory]
```

The default source cache is the operating system's temporary directory. A source is downloaded from its official endpoint only if absent, then checked against a pinned SHA-256 digest before processing. Raw 18–21 MB source files are intentionally outside the published asset directory. No new npm package is required.

The derivative removes closed-mouth internal teeth, scalp microgeometry invisible at street distances and accessories used only by the discarded carrying clip. It preserves the real hair cards, eyes, eyebrows, eyelashes, skin maps, clothing, original named joints and all retained motion. Meshopt simplification limits positional error to 0.1% of mesh extent and locks primitive borders. Faces and hands remain detailed for background pedestrians. Textures use WebP at up to 1024×1024; normal maps use up to 512×512. Geometry is quantized and Meshopt compressed.

| Asset | Bytes | Triangles | Draw primitives | Skin joints |
| --- | ---: | ---: | ---: | ---: |
| [sam.glb](../../public/city/people/sam.glb) | 1,790,924 | 26,442 | 10 | 56 |
| [harper.glb](../../public/city/people/harper.glb) | 1,906,484 | 33,504 | 9 | 56 |
| [maya.glb](../../public/city/people/maya.glb) | 1,498,540 | 29,658 | 10 | 56 |

Harper retains slightly more geometry to preserve jacket and facial detail. These assets are intended for medium and distant background views; they do not provide facial animation or a cinematic close-up human system. Some source garment/boot intersections remain visible close up during strong knee bends, especially Maya; this behavior also occurs in the unmodified original GLBs. Reserve Maya for the seated café pose.

## Runtime integration

Use `GLTFLoader` with the existing bundled Meshopt decoder. Three.js natively handles the preserved `EXT_texture_webp`, `KHR_texture_transform` and material extensions. Textures are embedded; preserve loader color spaces and image orientation. Do not assign the old Kenney skin or execute its procedural pose/proportion preparation.

Keep the **whole loaded `gltf.scene`** as a child of an actor root. Its original scene transforms and skin bind matrices already produce metres, Y up, forward **+Z**, with soles at approximately Y = 0.002 m. Avoid another height normalization or grounding pass. Idle at t=0.4 s measures Sam 1.7743 m, Harper 1.6710 m and Maya 1.6683 m. This is measured geometry, which differs slightly from the source's declared nominal heights. Additional actor uniform scaling is safe if travel speed is adjusted consistently.

Clone with `SkeletonUtils.clone`; each actor needs an independent skeleton and `AnimationMixer`, while geometry and textures may remain shared. Use the retained authored animations and blend action weights at start/stop. Do not procedurally rotate their bones using the old Kenney rig conventions.

| Clip name | Duration | Use |
| --- | ---: | --- |
| `Idle_Standing` | 6.0000 s | Subtle standing idle |
| `Walk_Relaxed` | 2.0000 s | In-place walk; measured stance speed 1.3 m/s |
| `Walk_Brisk` | 1.7333 s | In-place brisk walk; measured stance speed 1.7 m/s |
| `Sit_Stand` | 6.0000 s | Sit/stand transition; hold at 3.0 s for seated pose |

`Root` has constant translation, rotation and scale throughout each retained clip; its nonidentity rotation is the source axis conversion. Root travel belongs to the actor wrapper. The relaxed clip contains two repeated 1 s gait periods, for 2.6 m of travel at original scale; the brisk clip contains two 0.8667 s periods, for 2.9467 m. Calibrate playback with `timeScale = travelSpeed / (nominalStanceSpeed * actorUniformScale)`. Advance gait from travelled distance, preserving phase as action weights blend, to avoid visible foot sliding.

The shared named rig uses `Root`, `pelvis`, `spine_01`, `spine_02`, `spine_03`, `neck_01`, `head`, paired `clavicle_l/r`, `upperarm_l/r`, `lowerarm_l/r`, `hand_l/r`, `thigh_l/r`, `calf_l/r`, `foot_l/r`, `ball_l/r`, fingers and supporting lower-arm joints. The complete ordered joint list is in the manifest. These are different names and bind poses from the archived Kenney model.

### Grounding and stride measurements

The optimized assets were measured in installed Chrome through the current Three.js loader at 240 intervals per walking clip. For samples within 6 mm of each ankle's minimum Y, the median backward Z velocity is 1.300000 m/s relaxed and 1.700000 m/s brisk for both feet on all three people, agreeing with the source speed within 0.000005 m/s. Relaxed ankle lift is 0.09292 m; brisk ankle lift is 0.12403 m. The authored foot plant is compatible with translation at the nominal speeds.

| Character | Grounded ankle Y | Relaxed ankle Z range | Sole minimum Y |
| --- | ---: | --- | ---: |
| Sam | 0.072752 m | −0.395714 to 0.419795 m | 0.002014 m |
| Harper | 0.076067 m | −0.380098 to 0.435412 m | 0.002013 m |
| Maya | 0.070857 m | −0.382518 to 0.432991 m | 0.002012 m |

Sole bounds remain at these values through 25 sampled poses in each retained clip. Add the destination floor elevation to the actor wrapper; do not add the ankle height.

For `Sit_Stand` at 3 s, the source seat height is 0.46 m and feet stay at ground level. The pelvis bone is at Y≈0.57494 m and Z≈−0.36106 m (Sam), −0.33189 m (Harper), or −0.33705 m (Maya). Place the actor wrapper approximately 0.34 m forward of the chair centre along the character's facing direction, then verify rump contact visually. A floor at Y=0.23 m makes the seat approximately Y=0.69 m without an extra character lift. Freeze the seated action at 3 s instead of looping the entire stand transition.

### Clothing variants

Clone only materials that need different colors. Keep texture/geometry sharing and avoid tinting skin or eyes. Three.js material color is linear; glTF color factors below are also linear.

| Character | Material name | Safe variation |
| --- | --- | --- |
| Sam | `Sam | original top` | Untextured sage fabric factor `[0.105, 0.170, 0.130]`; replace with restrained winter knit colors |
| Sam | `Sam | original bottom` | Untextured navy fabric factor `[0.025, 0.039, 0.065]`; replace with charcoal/navy/olive |
| Harper | `Harper | original tailored business fabric` | Textured jacket, shirt, tie and trousers share this material; apply a subtle whole-fabric multiplier |
| Maya | `Maya | plum satin full-length top` | Embedded colored fabric map; apply a subtle multiplier |
| Maya | `Maya | charcoal tailored trousers` | Embedded fabric map; apply a subtle multiplier |

Do not convert all materials to a single shared tint. Keep alpha masks on real hair, eyebrows and eyelashes. Skin materials end in `.body`, the eye material in `.low-poly`; preserve them.

## Verification

The preparation script validates original download hashes, exact ordered joint preservation, four retained clip names, finite animation samples, static root tracks, retained skin indices/weights and the 1k image limit, then re-reads each Meshopt-packed output. ESLint passes for the preparation script. A separate isolated Chrome viewer loaded all three packed assets with the bundled Three.js decoder and rendered idle, walk and seated poses without page errors. Source-versus-packed comparison confirmed clothing deformation behavior is inherited; compression preserves the observed human silhouette and face detail. Scene placement, lighting, pathfinding, animation blending and mobile performance remain the city runtime's responsibility.
