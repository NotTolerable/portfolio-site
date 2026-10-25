/** Lightweight presentation metadata; the still experience does not import Three.js. */
export const cityShots = [
  {
    id: "arrival",
    at: 0,
    start: 0,
    label: "Arrival",
    title: "A little later.\nA little quieter.",
  },
  {
    id: "bookshop",
    at: 0.36,
    start: 0.22,
    label: "The late edition",
    title: "One more chapter.",
  },
  {
    id: "passing",
    at: 0.66,
    start: 0.52,
    label: "Passing by",
    title: "The night goes on.",
  },
  {
    id: "corner",
    at: 1,
    start: 0.82,
    label: "Around the corner",
    title: "Somewhere new.",
  },
] as const;
export type CityShot = (typeof cityShots)[number];
