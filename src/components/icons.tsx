export function Arrow({ diagonal = false, className = "" }: { diagonal?: boolean; className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Mark() {
  return (
    <svg className="brand-mark" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="m14 2 11 6v12l-11 6-11-6V8L14 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="m3 8 11 6 11-6M14 14v12M8.5 5l11 6v12" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function Chevron() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function LineIcon({ kind }: { kind: "code" | "chip" | "cloud" | "vision" | "shield" | "layers" }) {
  const paths = {
    code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20",
    chip: "M7 7h10v10H7V7Zm-4 3h4m-4 4h4m10-4h4m-4 4h4M10 3v4m4-4v4m-4 10v4m4-4v4M10 10h4v4h-4v-4Z",
    cloud: "M7 18a5 5 0 1 1 .5-10A6 6 0 0 1 19 10a4 4 0 0 1-1 8H7Z",
    vision: "M3 8V4h4m10 0h4v4M3 16v4h4m10 0h4v-4M5 12s2.5-4 7-4 7 4 7 4-2.5 4-7 4-7-4-7-4Zm7-2v4m-2-2h4",
    shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
    layers: "m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[kind]} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
