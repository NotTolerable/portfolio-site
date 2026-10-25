/** One connected terrace. Stations are content destinations, not separate scenes. */
export const stations = [
  { id: 'main', label: 'Arrival', place: 'The observatory', number: '01' },
  { id: 'projects', label: 'Work', place: 'The workshop', number: '02' },
  { id: 'experience', label: 'Experience', place: 'The relay archive', number: '03' },
  { id: 'about', label: 'About', place: 'After hours', number: '04' },
  { id: 'skills', label: 'Toolkit', place: 'The toolbench', number: '05' },
  { id: 'contact', label: 'Contact', place: 'Open channel', number: '06' },
] as const;
export type StationId = typeof stations[number]['id'];
export type WorldView = { progress: number; project: number; skill: number; focused: boolean; paused: boolean; rain: boolean; reduced: boolean };
export type Observatory = {
  setView(view: WorldView): void;
  setPointer(x: number, y: number): void;
  setHover(active: boolean): void;
  dispose(): void;
};
export const projectTechnologies = {
  axiom: ['C++20', 'Linux', 'DPDK', 'FIX / SBE', 'CMake', 'Prometheus'],
  governance: ['Python', 'FastAPI', 'LangGraph', 'Pydantic', 'Next.js'],
  interview: ['React', 'FastAPI', 'PostgreSQL', 'Supabase', 'Whisper', 'Presage', 'Gemini'],
} as const;
