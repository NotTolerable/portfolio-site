/** Original procedural ambient score and UI cues. No external audio files. */
export function createAmbientAudio() {
  const context = new AudioContext(),
    master = context.createGain(),
    air = context.createGain(),
    filter = context.createBiquadFilter(),
    tone = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.45;
  filter.connect(air);
  air.gain.value = 0.075;
  air.connect(master);
  tone.gain.value = 0.08;
  tone.connect(master);
  const sources: AudioScheduledSourceNode[] = [],
    nodes: AudioNode[] = [master, air, filter, tone];
  const random = (() => {
    let s = 73;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  })();
  const buffer = context.createBuffer(
      1,
      context.sampleRate * 5,
      context.sampleRate,
    ),
    data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < data.length; i++) {
    brown = (brown + (random() * 2 - 1) * 0.025) / 1.025;
    const edge = Math.min(
      1,
      i / (context.sampleRate * 0.08),
      (data.length - i) / (context.sampleRate * 0.08),
    );
    data[i] = brown * 3 * edge;
  }
  const wind = context.createBufferSource();
  wind.buffer = buffer;
  wind.loop = true;
  wind.connect(filter);
  wind.start();
  sources.push(wind);
  nodes.push(wind);
  for (const [frequency, level] of [
    [55, 0.5],
    [110, 0.27],
    [164.81, 0.12],
  ]) {
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = level;
    oscillator.connect(gain);
    gain.connect(tone);
    oscillator.start();
    sources.push(oscillator);
    nodes.push(oscillator, gain);
  }
  let enabled = false,
    disposed = false,
    lastUpdate = 0,
    lastProgress = 0,
    lastCue = 0,
    suspendTimer: ReturnType<typeof setTimeout> | undefined;
  async function setEnabled(value: boolean) {
    if (disposed) return false;
    clearTimeout(suspendTimer);
    enabled = value;
    if (value) {
      await context.resume();
      master.gain.setTargetAtTime(0.32, context.currentTime, 0.16);
    } else {
      master.gain.setTargetAtTime(0, context.currentTime, 0.07);
      suspendTimer = setTimeout(() => {
        void context.suspend().catch(() => {});
      }, 500);
    }
    return enabled;
  }
  function visibility() {
    if (!enabled || disposed) return;
    if (document.hidden) {
      void context.suspend().catch(() => {});
    } else void context.resume().catch(() => {});
  }
  document.addEventListener("visibilitychange", visibility);
  return {
    setEnabled,
    update(progress: number) {
      if (!enabled || disposed || document.hidden) return;
      const now = performance.now();
      if (now - lastUpdate < 100) return;
      const speed = Math.min(1, Math.abs(progress - lastProgress) * 28);
      lastProgress = progress;
      lastUpdate = now;
      filter.frequency.setTargetAtTime(
        300 + speed * 700 + progress * 220,
        context.currentTime,
        0.25,
      );
      air.gain.setTargetAtTime(0.065 + speed * 0.08, context.currentTime, 0.2);
      tone.gain.setTargetAtTime(
        progress > 0.56 ? 0.055 : 0.08,
        context.currentTime,
        0.8,
      );
    },
    cue(kind: "open" | "close" | "hover" | "chapter" | "select") {
      if (
        !enabled ||
        disposed ||
        document.hidden ||
        context.state !== "running"
      )
        return;
      const now = context.currentTime;
      if (kind === "hover" && now - lastCue < 0.25) return;
      lastCue = now;
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      oscillator.type = "sine";
      const frequency =
        kind === "open"
          ? 660
          : kind === "close"
            ? 330
            : kind === "chapter"
              ? 220
              : kind === "hover"
                ? 880
                : 550;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 0.72,
        now + 0.13,
      );
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(
        kind === "hover" ? 0.025 : 0.055,
        now + 0.008,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      enabled = false;
      clearTimeout(suspendTimer);
      document.removeEventListener("visibilitychange", visibility);
      sources.forEach((source) => source.stop());
      nodes.forEach((node) => node.disconnect());
      void context.close();
    },
  };
}
export type AmbientAudio = ReturnType<typeof createAmbientAudio>;
