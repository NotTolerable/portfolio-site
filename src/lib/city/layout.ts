/** World-space metres. These streets, portals, routes and district bounds share one map. */
export type DistrictId = 'a' | 'b' | 'c' | 'd';
export type Rect = readonly [
  number,
  number,
  number,
  number
]; // xmin,xmax,zmin,zmax
export const districtOrder: DistrictId[] = ['a', 'b', 'c', 'd'];
export const districts = [
  { id: 'a', label: 'The old quarter', short: 'Arrival', at: 0, start: 0, end: .28, bounds: [-16, 17, -43, 17], image: 'city-arrival', title: 'A little later.\nA little quieter.' },
  { id: 'b', label: 'Lantern Street', short: 'Nightlife', at: .36, start: .28, end: .52, bounds: [15, 72, -44, -18], image: 'city-nightlife', title: 'The lights stay on.' },
  { id: 'c', label: 'The side streets', short: 'Backstreets', at: .59, start: .52, end: .83, bounds: [44, 76, -91, -34], image: 'city-neighborhood', title: 'Around here.' },
  { id: 'd', label: 'North of the noise', short: 'Residential', at: .93, start: .83, end: 1, bounds: [15, 60, -138, -78], image: 'city-residential', title: 'Room to breathe.' },
] as const;
export const roads: Rect[] = [[-3.75, 3.75, -31, 14], [-7, 63.75, -34.75, -27.25], [56.25, 63.75, -89, -28], [27, 63.75, -89.75, -82.25], [27, 33, -132, -85], [47.4, 56.4, -71.1, -66.1]];
export const walkable: Rect[] = [...roads, [-5.9, -3.75, -27, 12], [3.75, 5.9, -27, 12], [-10, 57.1, -36.8, -34.75], [13, 56, -27.25, -25.1], [54.05, 56.25, -82.25, -35.5], [63.75, 65.95, -82.25, -28], [17, 57, -91.9, -89.75], [27, 55.9, -82.25, -80.05], [24.75, 27, -130, -90], [33, 35.25, -130, -90], [39.7, 41.3, -39.5, -35.0]];
export const districtAt = (progress: number) => districts.findLast(d => progress >= d.start - 1e-5) ?? districts[0];
export function insideRect(x: number, z: number, r: Rect, inset = 0) { return x >= r[0] + inset && x <= r[1] - inset && z >= r[2] + inset && z <= r[3] - inset; }
export function onWalkableGround(x: number, z: number) { return walkable.some(r => insideRect(x, z, r, -.12)); }
export const landmarks = [
  { id: 'late-edition', district: 'a', label: 'Late Edition', future: 'projects', position: [-5.9, 1.6, -10], box: [-6.1, -5.7, -16, -4], from: .075, to: .17 },
  { id: 'blue-note', district: 'b', label: 'The Blue Note', future: 'experience', position: [47, 1.8, -25.3], box: [41, 53, -25.5, -25.0], from: .38, to: .47 },
  { id: 'corner-print', district: 'c', label: 'Corner Print', future: 'about', position: [54.05, 1.7, -80], box: [53.8, 54.3, -84, -75], from: .69, to: .78 },
  { id: 'north-studio', district: 'd', label: 'North Studio', future: 'skills', position: [24.75, 1.7, -108], box: [24.5, 25, -113, -103], from: .90, to: .98 },
] as const;
export type LandmarkId = typeof landmarks[number]['id'];
