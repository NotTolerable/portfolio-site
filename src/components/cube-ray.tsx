export function CubeRay() {
  return (
    <svg className="cube-ray" viewBox="0 0 1440 1000" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cube-ray-haze">
          <stop stopColor="white" stopOpacity="0.11" />
          <stop offset="0.4" stopColor="white" stopOpacity="0.065" />
          <stop offset="0.72" stopColor="white" stopOpacity="0.018" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="cube-ray-soft" x="-50%" y="-20%" width="200%" height="150%"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <ellipse cx="1220" cy="100" rx="310" ry="1100" transform="rotate(34 1220 100)" fill="url(#cube-ray-haze)" filter="url(#cube-ray-soft)" />
    </svg>
  );
}
