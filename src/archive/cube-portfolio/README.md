# Archived cube portfolio

The owner authorized storing the cube while completely rebranding the active site around an anime-inspired night city.

The last complete cube version is Git commit `f48b6df`. This directory retains the prior `page.tsx`, `layout.tsx`, `header.tsx`, stylesheet, design source, and browser checks with `.archived` suffixes where needed so they cannot become live routes or duplicate active tests.

The original implementation is still available in `src/components/hero-cube.tsx`, `portfolio-intro.tsx`, `site-intro.tsx`, `cube-drawing.tsx`, `opening-paper.tsx`, and their cube/ink library helpers. Materials remain in `public/textures/resend/`; provenance is in `docs/assets/resend-cube.md`. Exact Rubik-state/orbit unit tests remain active.

To restore the old experience, restore the matching page/layout/header/CSS from that commit together, then run the archived browser tests against it. The current header/theme is deliberately different. No cube code or source-material images are loaded by the new homepage.
