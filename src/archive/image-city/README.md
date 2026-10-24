# Image-based night-city archive

The previous scene projected original rendered city art onto a depth-deformed plane. The owner replaced it with a real street, character and travelling camera; see [decision 0006](../../../docs/decisions/0006-street-character-journey.md).

Restore the complete former composition from commit `92ef40c`. These snapshots preserve its hero component, renderer and stylesheet; `.archived` extensions keep snapshots out of the active build. The original artwork remains in `public/illustrations/night-city.webp` with [provenance](../../../docs/assets/night-city.md). Neither the old panorama nor renderer is loaded by the active homepage.
