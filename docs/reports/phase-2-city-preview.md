# Phase 2 — cinematic night-city vertical slice

Date: 2026-10-25. Status: implemented on `experiment/cinematic-night-street`; **not deployed or merged into production**. Review locally at `/city-preview` after `npm run dev`. Existing homepage, `/camera-study`, `/resume`, `/infrastructure`, portfolio data and contact links remain in place. The full city, court and portfolio integration are outside this phase.

## 1. Files and boundaries

| Files | Responsibility |
| --- | --- |
| `src/app/city-preview/page.tsx` | Isolated, non-indexed experimental route |
| `src/components/city-preview.tsx`, `city-preview.css` | Sparse editorial UI, native scroll, caption reveal, composition links, warmth/atmosphere/still controls and responsive still narrative |
| `src/lib/city/route.ts` | Lightweight shot metadata; still visitors do not initialize Three.js |
| `src/lib/city/camera.ts` | Four-shot director, translation/orientation/lens/pacing, bounded parallax and sign spring |
| `src/lib/city/assets.ts` | Lazy self-hosted asset loading and resource ownership |
| `src/lib/city/environment.ts` | Authored street, detailed historic shells, bookshop/cafés, residential frontage, original architectural details, lighting and batching |
| `src/lib/city/effects.ts` | World-space snow and restrained sky |
| `src/lib/city/scene.ts` | Renderer, postprocessing, interaction projection, render clock, quality adjustment, telemetry and cleanup |
| `src/lib/camera-tracks.ts`, `src/lib/cinematic-journey.ts` | Extract shared interpolation while retaining the prior study's behavior |
| `src/components/world-provider.tsx`, `header.tsx` | Suppress the existing scene/header only on the isolated preview route |
| `scripts/prepare-city-assets.mjs`, `profile-city.mjs` | Reproducible asset preparation and actual-browser performance measurement |
| `public/city/`, `public/illustrations/city-*.webp` | Licensed derivatives/credits and four actual-scene fallback captures |
| `tests/city-camera.spec.ts`, `city-preview.spec.ts`, `camera-study.spec.ts` | New camera/interactions/fallback coverage; separate the existing study’s route-return test from its six-shot timing budget |

Product/design/architecture/roadmap documents and [decision 0010](../decisions/0010-winter-street-vertical-slice.md) record the bounded scope and production prohibition. No project runtime or development dependency was added. Three.js's existing addons supply bloom, output conversion and SMAA.

## 2. Assets and licenses

[Full provenance and reproduction](../assets/city-preview.md) identifies every source and author. Poly Haven's [CC0 asset license](https://polyhaven.com/license) permits these derivatives. The expanded architectural kit, lantern, bench, café furniture, encyclopedias, bookshelf and planter retain source model geometry. Cobble/brick diffuse, normal, roughness and AO maps are packed as 1k WebP; existing concrete/HDR assets are reused. Meshopt compresses the GLBs. Credits also ship in `public/city/LICENSE.txt`.

Shop names, posters and world layout are fictional environmental details, not claims about clients/projects. Roofs, shutters, balconies, awnings, window rooms, signs, snow accumulation and narrative UI are authored for this slice. No Samana proprietary art/source, external example renders or observatory props are included.

## 3. Camera director

One physical L-shaped street supports four compositions:

1. **Arrival:** an eye-level establishing view with foreground architecture, warm bookshop/café light and a distant intersection.
2. **Storefront approach:** forward travel lowers the camera and turns it toward the inset bookshop.
3. **Passing:** the camera advances beyond the shop, rises and faces the next stretch; the bookshop is physically behind it, not faded or swapped away.
4. **Corner:** an eastward turn reveals the hotel entrance, second café and a new street axis.

A centripetal translation rail uses an arc-length lookup and an independent monotone pacing track. Orientation uses uniformly spaced authored quaternion keys and precomputed SQUAD tangents, with explicit horizon leveling. Lens/framing has a separate smooth track. Native scroll sets intent; one frame-rate-independent render-clock director supplies the actual camera progress, active composition and caption opacity. Backward scrolling evaluates the same route in reverse. Damped cursor offsets are additive and bounded to 6 cm horizontally, 2.5 cm vertically and under a degree of rotation.

Numerical checks sample the complete route for continuity, level horizon and reversibility. They verify that the shop is behind the passing camera and that spring/travel behavior remains consistent at 30, 60 and 120 updates/second. These checks establish timing behavior, not device frame rates.

## 4. Rendering and visual review

- Detailed licensed modules are assembled into varied shop/residential frontage with real side/back walls, inset interiors, roof profiles, cornices, shutters and balconies. Furniture is placed at believable scale and ground height.
- Source normal/roughness/AO maps, textured stone/cobbles, local contact surfaces and static moon/shop shadow maps establish depth/contact. Window-room emissive surfaces sit behind frames and glazing.
- Warm area/interior/practical lights contrast with cool moon/sky light. A small shader adaptation neutralizes the source plaster's orange base while preserving weathering and normal detail, allowing coordinated mineral finishes.
- PMREM supplies image-based environment lighting. Local light specular response creates street highlights; the scene does **not** claim live mirror reflections of local objects.
- ACES and sRGB output use a single-sample half-float target. Bloom is thresholded and runs at 45% linear resolution; linear-space SMAA precedes the final OutputPass. There is no SSAO, screen-space reflection or temporal stack.
- Static geometry is batched per building/material with original indices retained. Identical materials, repeat variants and sign textures are shared. Books use instancing; static matrices are frozen.

The scene was reviewed in Chrome at all four compositions, with forward/reverse travel and close storefront views. Review exposed overly even lighting, oversized cobbles, empty neighboring displays and a dark/unfinished corner. Revisions introduced smaller paving scale, directional night contrast, complete interior/shutter/residential treatments, varied rooflines and a lit hotel/café corner. Final fallback art is captured from the scene with UI hidden; text is not baked into it.

## 5. Interactions and alternatives

Snow falls in the actual open street volumes, is depth-tested against the environment and receives a bounded local cursor influence. A hinge-mounted shop sign uses an analytic critically damped spring; it settles rather than snapping. A ray/box hit on the bookshop raises only its local light contribution. The keyboard-accessible warmth button supports focus and a latched toggle.

Atmosphere pause holds snow/sign/time while camera navigation still works. Still mode disposes the live scene and can return to it. Smaller/coarse-pointer/reduced-motion/no-JavaScript visitors see the four real scene captures without requesting GLB/HDR assets. Asset/WebGL/context failure exposes the same readable narrative and portfolio links. Hidden tabs stop rendering; teardown releases GPU resources, instancing, shadow/composer targets, texture bitmaps and listeners.

No suitable licensed skeletal pedestrian/locomotion set was acquired for this slice. It uses illuminated interiors, furniture, snow and sign movement to suggest occupancy; placeholder people were deliberately omitted.

## 6. Measured performance

Measured 2026-10-25 using the local **production build**, headless installed Chrome **155.0.8059.86**, ANGLE/Metal **Apple M4**, viewport **1440×900**, device scale factor/render DPR **1**. No network throttling. Fresh browser context; local server/files and shader/OS caches may be warm. Thirty warm-up frames followed by 180 requestAnimationFrame intervals per settled composition. These are frame-pacing measurements on one machine, not GPU timer-query results or a universal FPS promise.

| Composition | Mean FPS | Median frame interval | 95th percentile | Draw calls incl. post passes | Reported triangles |
| --- | ---: | ---: | ---: | ---: | ---: |
| Arrival | 59.7 | 16.7 ms | 16.7 ms | 369 | 2,883,258 |
| Bookshop | 60.0 | 16.7 ms | 16.8 ms | 100 | 833,815 |
| Passing | 60.0 | 16.7 ms | 16.8 ms | 125 | 953,574 |
| Corner | 60.0 | 16.7 ms | 16.7 ms | 172 | 1,519,695 |

The renderer reported 85–88 textures and 329–357 geometries across the journey; counts include postprocessing resources. The required 19 GLB/map/HDR resources total **9,975,328 encoded bytes** (about 9.98 MB), excluding Next.js/UI code and fallback images. First live scene took **2.58 seconds** in this run, including initialization/compilation; the captured poster and return navigation remain available during that time.

The initial 4× multisampled half-float pipeline measured roughly 34 FPS at arrival and 43 FPS at the corner on the same setup. Sharing materials removed 144 arrival draw calls; preserving indices retained source vertex reuse. Switching the final edge treatment to SMAA delivered the measured near-60 FPS wide views without decimating models. Higher-DPR and other hardware can differ. The renderer caps DPR at 1.5 and reduces fill rate after sustained slow frames; manual still mode remains available.

Reproduce with a production server in one terminal and:

```sh
npm run build
npm start -- --hostname 127.0.0.1 --port 3014
# Separate terminal:
node scripts/profile-city.mjs http://127.0.0.1:3014
```

An optional `--software` flag explicitly requests SwiftShader; those results must be labeled as software rendering. Stop other active WebGL browser tests during measurement.

## 7. Known limits and next boundary

Verification completed: lint, TypeScript and the production build pass. All 50 current test cases were verified through the full regression run and a focused rerun after separating the legacy six-shot journey and renderer-return timing budgets. The new route's eight browser cases cover real camera reversal/return, pointer and keyboard interactions, pause/still return, mobile/reduced motion, asset/context/WebGL failure and 320px no-JavaScript access. Desktop and 390px/320px still layouts were also visually reviewed; no overflow or browser errors were observed in the final captures.

- This is a single authored vertical slice, not a complete game/city or portfolio integration. The experimental route is intentionally undeployed and unmerged.
- Coordinated modular architecture still repeats some window/trim motifs. A bespoke hero frontage and bespoke baked-lighting atlas could add identity in a future phase.
- Reflections are image-based/direct-light specular; no live local-object mirror/SSR is implemented. Static shadow maps approximate the tiny moving sign's shadow.
- No animated pedestrians, traffic system, audio, character controls or court are added. Those are not hidden unfinished controls.
- The roughly 10 MB 3D payload and shader initialization remain meaningful costs on slow connections. Real still images provide the immediate/simplified experience.
- Performance was measured on the stated M4/Chrome setup. Windows GPU, Safari, high-DPR and low-power hardware have not been physically profiled. Mobile/reduced-motion and failure paths are verified as still alternatives, not claimed 3D performance wins.
- Owner review is required before any production merge or deployment. Future work should follow that review rather than silently widening this slice.
