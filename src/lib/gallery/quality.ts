export type GraphicsMode = "auto" | "high" | "balanced" | "performance";
export type GraphicsTier = 0 | 1 | 2 | 3;
export const graphicsProfiles = [
  {
    label: "High",
    dpr: 1.7,
    mobileDpr: 1.35,
    snow: 10000,
    points: 85000,
    transmission: true,
    auroraEvery: 1,
    post: true,
    pixelated: false,
  },
  {
    label: "Balanced",
    dpr: 1.15,
    mobileDpr: 1,
    snow: 7500,
    points: 55000,
    transmission: true,
    auroraEvery: 2,
    post: true,
    pixelated: false,
  },
  {
    label: "Performance",
    dpr: 0.75,
    mobileDpr: 0.7,
    snow: 4000,
    points: 28000,
    transmission: false,
    auroraEvery: 3,
    post: false,
    pixelated: false,
  },
  {
    label: "Low-spec",
    dpr: 0.6,
    mobileDpr: 0.55,
    snow: 2400,
    points: 14000,
    transmission: false,
    auroraEvery: 4,
    post: false,
    pixelated: true,
  },
] as const;
export type GraphicsState = {
  mode: GraphicsMode;
  tier: GraphicsTier;
  label: string;
};
/** Measures sustained visible frame cadence; ignores startup, stalls and hidden time.
 * Fast and slow thresholds differ, with a recovery backoff to prevent oscillation. */
export class AdaptiveGraphics {
  mode: GraphicsMode = "auto";
  tier: GraphicsTier;
  private frames: number[] = [];
  private windowMs = 0;
  private cooldown = 2500;
  private fastMs = 0;
  private slowWindows = 0;
  private recoveryDelay = 18000;
  constructor(mobile = false) {
    this.tier = mobile ? 1 : 0;
  }
  get state(): GraphicsState {
    return {
      mode: this.mode,
      tier: this.tier,
      label: graphicsProfiles[this.tier].label,
    };
  }
  resetSampling(warmup = 1000) {
    this.frames = [];
    this.windowMs = 0;
    this.cooldown = warmup;
    this.fastMs = 0;
    this.slowWindows = 0;
  }
  select(mode: GraphicsMode) {
    this.mode = mode;
    if (mode !== "auto")
      this.tier = mode === "high" ? 0 : mode === "balanced" ? 1 : 2;
    this.resetSampling(1800);
    return this.state;
  }
  sample(frameMs: number): boolean {
    if (this.mode !== "auto" || !Number.isFinite(frameMs) || frameMs <= 0)
      return false;
    if (this.cooldown > 0) {
      this.cooldown -= frameMs;
      return false;
    }
    // A tab suspension or debugger pause is not evidence of sustained GPU pressure.
    if (frameMs > 250) {
      this.resetSampling(1200);
      return false;
    }
    this.frames.push(frameMs);
    this.windowMs += frameMs;
    if (this.windowMs < 1400 || this.frames.length < 8) return false;
    const sorted = [...this.frames].sort((a, b) => a - b),
      p90 = sorted[Math.floor(sorted.length * 0.9)],
      mean = this.windowMs / this.frames.length,
      span = this.windowMs;
    this.frames = [];
    this.windowMs = 0;
    if (mean > 18.7 && p90 > 19) {
      this.slowWindows++;
      this.fastMs = 0;
    } else {
      this.slowWindows = 0;
      this.fastMs = mean < 17.5 && p90 < 18.5 ? this.fastMs + span : 0;
    }
    if (this.tier < 3 && (this.slowWindows >= 2 || mean > 34)) {
      this.tier = Math.min(3, this.tier + (mean > 48 ? 2 : 1)) as GraphicsTier;
      this.recoveryDelay = Math.min(60000, this.recoveryDelay * 1.3);
      this.resetSampling(2500);
      return true;
    }
    if (this.tier > 0 && this.fastMs > this.recoveryDelay) {
      this.tier = (this.tier - 1) as GraphicsTier;
      this.resetSampling(3000);
      return true;
    }
    return false;
  }
}
