# Cube material assets

Source: [Resend’s public cube scene](https://resend.com/static/cube.splinecode), referenced by the [Resend homepage](https://resend.com/). Inspected 2026-10-18. The export identifies version 1.10.16.

Original image bytes were extracted unchanged from the scene. They are credited to their original creators, Resend / Spline, and are not presented as original portfolio work. No Spline runtime or third-party decoder is included in the application.

| Local file | Source image | SHA-256 |
| --- | --- | --- |
| `reflection-5.png` | Matcap Reflection 5 | `3724de93b4912288f5fc13a3d0aee1c9b96bf63780e80875444f2d5883b65368` |
| `roughness-2.png` | Matcap Roughness 2 | `feafb27b160ed58a9c2d60ee84a7b2075a79df1dfd2a076eece655c26b32cf95` |
| `roughness-3.png` | Matcap Roughness 3 | `5df384205900fc4308ef8660520b7fb49feb5791dab1b7dfae13c8d876356de3` |
| `roughness-4.png` | Matcap Roughness 4 | `59434d1cf72c543244658c89ceb6157a7474743f388df345f0f7967e6e985452` |
| `studio-light.png` | light.png | `0eda72a2010f3711ead61f896f06f61de492b03dda074ea77b23c707f311c650` |
| `surface-grain.png` | TEXTURE / 01 | `914f3ae7bbac611c616a9bb99f3d604531b5edda20f6c2deeb1269db5bad843a` |
| `terrazzo.png` | Untitled Image | `771530cd6a3bba933e7f16aba7739a50998c6b1fc76fe953a34844a6c4273913` |

The Three.js materials reuse these images with locally implemented surface relief. The source’s entire layered Spline shader, postprocessing, and geometry are not copied. Exact rendered output therefore depends on the custom mesh, camera, shader composition, and material tuning. The visible source-credit overlay was removed at the owner's request on 2026-10-19; source attribution remains here.

## Source animation settings

The same scene export contains these authored `Start` transitions:

| Object | Target rotation | Duration | Delay | Repeat / easing |
| --- | --- | --- | --- | --- |
| `Cube` (`34DD22E8-0B44-44BE-A9D8-A5221E73CD13`) | X: −359° | 10,000 ms | 0 | Infinite; preset 0 (linear) |
| `rotation` (`E03553FA-1530-4BC9-8796-EE574880C9BA`) | Y: −359° | 10,000 ms | 0 | Infinite; preset 0 (linear) |
| `section 3` | X: −180° | 2,000 ms | 3,000 ms | Ping-pong rewind; preset 4 (ease-in/out) |
| `section` | X: −180° | 3,000 ms | 5,000 ms | Ping-pong rewind; preset 4 (ease-in/out) |

Spline’s loader maps preset 4 to cubic-bezier(0.42, 0, 0.58, 1). These settings were used in the previous animated implementation. Automatic tumbling and layer turns remain enabled. The owner clarified on 2026-10-19 that dragging is required only for manual steering; the cleanup removes the visible caption/control overlay, not the automatic animation.
