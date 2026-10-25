/** Lightweight metadata is shared by the live journey and no-WebGL district narrative. */
import type { DistrictId } from './layout';
export const cityShots = [
  { id: 'arrival', at: 0, start: 0, district: 'a', label: 'Arrival', title: 'A little later.\nA little quieter.', subject: 'The commercial street', index: 0 },
  { id: 'awnings', at: .065, start: .035, district: 'a', label: 'Under the awnings', title: '', subject: 'Balconies and warm display windows', index: 2 },
  { id: 'bookshop', at: .12, start: .095, district: 'a', label: 'The late edition', title: 'One more chapter.', subject: 'The inset bookshop', index: 4 },
  { id: 'passing', at: .20, start: .165, district: 'a', label: 'Passing by', title: '', subject: 'The intersection beyond the shop', index: 6 },
  { id: 'corner', at: .28, start: .24, district: 'b', label: 'Lantern Street', title: 'The lights stay on.', subject: 'Hotel and café at the first turn', index: 10 },
  { id: 'arcade', at: .36, start: .325, district: 'b', label: 'After the last train', title: '', subject: 'The arcade and restaurant windows', index: 12 },
  { id: 'music', at: .43, start: .395, district: 'b', label: 'The Blue Note', title: '', subject: 'An intimate music venue', index: 14 },
  { id: 'north-turn', at: .52, start: .485, district: 'c', label: 'A different street', title: '', subject: 'The corner architecture and northward reveal', index: 18 },
  { id: 'gym', at: .59, start: .555, district: 'c', label: 'The late session', title: 'Around here.', subject: 'The boxing gym', index: 20 },
  { id: 'alley', at: .67, start: .635, district: 'c', label: 'Between the buildings', title: '', subject: 'A basketball hoop in the alley', index: 22 },
  { id: 'printshop', at: .74, start: .705, district: 'c', label: 'Corner Print', title: '', subject: 'An independent print and book shop', index: 24 },
  { id: 'quiet-turn', at: .83, start: .79, district: 'd', label: 'North of the noise', title: 'Room to breathe.', subject: 'A quieter, lower residential street', index: 27 },
  { id: 'residential', at: .93, start: .89, district: 'd', label: 'The last few windows', title: '', subject: 'North Studio and open sky', index: 32 },
  { id: 'last-light', at: 1, start: .965, district: 'd', label: 'Beyond the last light', title: 'Just a little further.', subject: 'A quiet park approach; the future court lies beyond', index: 34 },
] as const satisfies readonly {
  id: string;
  at: number;
  start: number;
  district: DistrictId;
  label: string;
  title: string;
  subject: string;
  index: number;
}[];
export type CityShot = typeof cityShots[number];
