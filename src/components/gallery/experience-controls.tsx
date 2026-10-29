"use client";
import type { GraphicsMode, GraphicsState } from "@/lib/gallery/quality";
type SoundControlProps = {
  sound: boolean;
  pending: boolean;
  audioUnavailable: boolean;
  onSound: () => void;
};
export function SoundControl({ sound, pending, audioUnavailable, onSound }: SoundControlProps) {
  return (
    <button
      className="sound-control"
      type="button"
      onClick={onSound}
      disabled={pending || audioUnavailable}
      aria-pressed={sound}
      aria-label={audioUnavailable ? "Audio unavailable" : sound ? "Turn sound off" : "Turn sound on"}
    >
      <span className="sound-bars" aria-hidden="true"><i /><i /><i /></span>
      {audioUnavailable ? "Audio unavailable" : sound ? "Sound on" : "Sound off"}
    </button>
  );
}
export function ExperienceControls({
  graphics,
  sound,
  pending,
  audioUnavailable,
  onSound,
  onGraphics,
}: {
  graphics: GraphicsState;
  sound: boolean;
  pending: boolean;
  audioUnavailable: boolean;
  onSound: () => void;
  onGraphics: (mode: GraphicsMode) => void;
}) {
  return (
    <div className="experience-controls">
      <SoundControl sound={sound} pending={pending} audioUnavailable={audioUnavailable} onSound={onSound} />
      <div className="graphics-control">
        <label className="visually-hidden" htmlFor="gallery-graphics">
          Graphics quality
        </label>
        <select
          id="gallery-graphics"
          value={graphics.mode}
          onChange={(event) => onGraphics(event.target.value as GraphicsMode)}
        >
          <option value="auto">Auto · {graphics.label}</option>
          <option value="high">High</option>
          <option value="balanced">Balanced</option>
          <option value="performance">Performance</option>
        </select>
        <span className="visually-hidden" role="status">
          Graphics: {graphics.mode === "auto" ? "automatic, " : ""}
          {graphics.label}
        </span>
      </div>
    </div>
  );
}
