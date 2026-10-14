export function CubeRay() {
  return (
    <svg className="cube-ray" viewBox="0 0 600 620" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cube-ray-haze">
          <stop stopColor="white" stopOpacity="0.11" />
          <stop offset="0.4" stopColor="white" stopOpacity="0.065" />
          <stop offset="0.72" stopColor="white" stopOpacity="0.018" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="cube-ray-soft" x="-50%" y="-20%" width="200%" height="150%"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>
      <ellipse cx="380" cy="150" rx="108" ry="375" transform="rotate(27 380 150)" fill="url(#cube-ray-haze)" filter="url(#cube-ray-soft)" />
    </svg>
  );
}
