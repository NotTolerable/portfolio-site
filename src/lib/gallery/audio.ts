/** Original ambient score and restrained game-interface cues; explicit opt-in only. */
export type GallerySoundCue =
  | "open" | "close" | "hover" | "chapter" | "select"
  | "type" | "object" | "transition" | "arrive" | "press";
export type GalleryAudioInteraction = {
  /** Retained for renderer compatibility; movement never starts an audio loop. */
  object?: number;
  panel?: boolean;
};
type Voice = { source: AudioBufferSourceNode; gain: GainNode };
const TAU = Math.PI * 2;
const sampleRate = 24000;
function randomSource(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
/** Fixed-pitch, dry game-interface ticks: no chirp, glide, air or noise layer. */
function interfaceBuffer(
  context: AudioContext,
  kind: "hover" | "type" | "confirm" | "release",
  seed: number,
) {
  const duration = kind === "hover" ? 0.055 : kind === "type" ? 0.034
      : kind === "confirm" ? 0.072 : 0.078,
    frequency = kind === "hover" ? 1620 : kind === "type" ? 1120
      : kind === "confirm" ? 1180 : 920,
    tuning = (kind === "type" ? 0.94 : 0.97)
      + randomSource(seed)() * (kind === "type" ? 0.12 : 0.06),
    buffer = context.createBuffer(1, duration * sampleRate, sampleRate),
    data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate,
      progress = t / duration,
      phase = TAU * frequency * tuning * t,
      attack = Math.min(1, t / 0.0016),
      edge = Math.min(1, (duration - t) / 0.006),
      envelope = Math.pow(Math.sin(Math.PI * progress), 0.45)
        * Math.exp(-progress * (kind === "type" ? 4.2 : 3.6)),
      // A tiny rounded onset and quiet harmonic make a crisp UI tick rather
      // than a sustained sine beep. Pitch stays constant throughout the note.
      transient = Math.sin(phase * 3.91) * Math.exp(-t * 300) * 0.035,
      voice = Math.sin(phase) + Math.sin(phase * 2) * 0.08 + transient;
    data[i] = voice * envelope * attack * edge * 0.72;
  }
  return buffer;
}

/**
 * A quiet, original 48-second composition, rendered once outside the live graph.
 * Four open-voiced chords overlap slowly; a few soft upper notes provide a
 * melody without a beat. Integer cycle counts and a preroll make the loop
 * continuous, including its stereo delay tails. There is no wind/noise layer.
 */
async function atmosphericScore() {
  const duration = 48, preroll = 12, rate = 24000;
  const offline = new OfflineAudioContext(2, (duration + preroll) * rate, rate);
  const sum = offline.createGain(), tone = offline.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 1500;
  tone.Q.value = .35;
  sum.connect(tone);
  tone.connect(offline.destination);
  // Quiet stereo reflections give the harmonic material depth, not an air bed.
  for (const [time, level, pan] of [[.367, .14, -.55], [.613, .095, .55]]) {
    const delay = offline.createDelay(1), wet = offline.createGain(), space = offline.createStereoPanner();
    delay.delayTime.value = time;
    wet.gain.value = level;
    space.pan.value = pan;
    tone.connect(delay);
    delay.connect(wet);
    wet.connect(space);
    space.connect(offline.destination);
  }
  const chords = [
    [40, 55, 59, 66], // E minor 9
    [36, 52, 59, 62], // C major 9
    [43, 54, 57, 62], // G major 9
    [38, 52, 57, 64], // D suspended / add 9
  ];
  const frames = (duration + preroll) * 100 + 1;
  const smooth = (value: number) => {
    const x = Math.max(0, Math.min(1, value));
    return x * x * (3 - 2 * x);
  };
  const periodicFrequency = (midi: number, offset = 0) =>
    Math.round((440 * 2 ** ((midi - 69) / 12) + offset) * duration) / duration;
  function envelope(start: number, length: number, attack: number, release: number, level: number) {
    const curve = new Float32Array(frames);
    for (let frame = 0; frame < frames; frame++) {
      const time = frame / 100 - preroll;
      const local = ((time - start) % duration + duration) % duration;
      if (local < length) curve[frame] = level * smooth(local / attack) * smooth((length - local) / release);
    }
    return curve;
  }
  chords.forEach((notes, chord) => {
    const swell = offline.createGain();
    swell.gain.setValueCurveAtTime(envelope(chord * 12 - 1.5, 18, 4.8, 6.2, 1), 0, duration + preroll);
    swell.connect(sum);
    notes.forEach((midi, voice) => {
      for (const side of [-1, 1]) {
        const oscillator = offline.createOscillator(), gain = offline.createGain(), pan = offline.createStereoPanner();
        // A few rounded harmonics keep the pads warm instead of a pure sine drone.
        const real = new Float32Array([0, 0, 0, 0, 0]);
        const imaginary = new Float32Array([0, 1, .13, .052, .015]);
        oscillator.setPeriodicWave(offline.createPeriodicWave(real, imaginary));
        oscillator.frequency.value = periodicFrequency(midi, side * (.045 + voice * .024));
        gain.gain.value = voice === 0 ? .078 : .048;
        pan.pan.value = side * (.22 + voice * .12);
        oscillator.connect(gain);
        gain.connect(pan);
        pan.connect(swell);
        oscillator.start();
        oscillator.stop(duration + preroll);
      }
    });
  });
  // Widely spaced, fixed-pitch notes with a soft felt-like onset and long decay.
  [71, 67, 69, 66].forEach((midi, index) => {
    const note = offline.createOscillator(), gain = offline.createGain(), pan = offline.createStereoPanner();
    note.type = "sine";
    note.frequency.value = periodicFrequency(midi);
    gain.gain.setValueCurveAtTime(envelope(index * 12 + 6.7, 6.8, .45, 6, .052), 0, duration + preroll);
    pan.pan.value = index % 2 ? .35 : -.35;
    note.connect(gain);
    gain.connect(pan);
    pan.connect(sum);
    note.start();
    note.stop(duration + preroll);
  });
  const rendered = await offline.startRendering();
  const output = new AudioBuffer({ length: duration * rate, numberOfChannels: 2, sampleRate: rate });
  let peak = 0;
  for (let channel = 0; channel < 2; channel++) {
    const source = rendered.getChannelData(channel).subarray(preroll * rate, (duration + preroll) * rate);
    output.copyToChannel(source, channel);
    for (const value of source) peak = Math.max(peak, Math.abs(value));
  }
  const level = .28 / Math.max(.001, peak);
  for (let channel = 0; channel < 2; channel++) {
    const samples = output.getChannelData(channel);
    for (let frame = 0; frame < samples.length; frame++) samples[frame] *= level;
  }
  return output;
}
/** Must be created from the explicit sound button gesture. */
export function createAmbientAudio() {
  const context = new AudioContext(),
    master = context.createGain(),
    musicGain = context.createGain(),
    limiter = context.createDynamicsCompressor(),
    reflection = context.createDelay(0.05),
    reflectionGain = context.createGain();
  master.gain.value = 0;
  musicGain.gain.value = 0;
  musicGain.connect(master);
  master.connect(limiter);
  limiter.threshold.value = -12;
  limiter.knee.value = 18;
  limiter.ratio.value = 4;
  limiter.attack.value = 0.004;
  limiter.release.value = 0.1;
  limiter.connect(context.destination);
  // A single very quiet early reflection adds space without a wash or hiss.
  reflection.delayTime.value = 0.019;
  reflectionGain.gain.value = 0.055;
  reflection.connect(reflectionGain);
  reflectionGain.connect(master);
  const nodes: AudioNode[] = [master, musicGain, limiter, reflection, reflectionGain],
    voices = new Set<Voice>(),
    buffers = {
      type: [17, 43, 71, 107].map((seed) => interfaceBuffer(context, "type", seed)),
      hover: [229, 337, 461].map((seed) => interfaceBuffer(context, "hover", seed)),
      confirm: interfaceBuffer(context, "confirm", 619),
      release: interfaceBuffer(context, "release", 719),
    };
  let enabled = false,
    disposed = false,
    variation = 0,
    activation = 0,
    panelOpen = false,
    paused = false,
    suspendTimer: ReturnType<typeof setTimeout> | undefined;
  let score: AudioBuffer | undefined,
    preparing: Promise<AudioBuffer> | undefined,
    music: AudioBufferSourceNode | undefined;
  const lastCue: Partial<Record<GallerySoundCue, number>> = {};
  function play(buffer: AudioBuffer, level: number, rate = 1) {
    if (voices.size >= 16) return;
    const source = context.createBufferSource(), gain = context.createGain(),
      voice = { source, gain };
    source.buffer = buffer;
    source.playbackRate.value = rate;
    gain.gain.value = level * (panelOpen ? 0.9 : 1);
    source.connect(gain);
    gain.connect(master);
    gain.connect(reflection);
    voices.add(voice);
    source.onended = () => {
      voices.delete(voice);
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }
  async function setEnabled(value: boolean) {
    if (disposed) return false;
    const request = ++activation;
    clearTimeout(suspendTimer);
    enabled = value;
    if (value) {
      await context.resume();
      if (disposed || request !== activation || !enabled) return false;
      if (!score) {
        preparing ??= atmosphericScore();
        const ready = await preparing;
        if (disposed || request !== activation || !enabled) return false;
        score = ready;
        preparing = undefined;
      }
      if (!music) {
        music = context.createBufferSource();
        music.buffer = score;
        music.loop = true;
        music.connect(musicGain);
        music.start();
      }
      musicGain.gain.setTargetAtTime(paused ? 0 : panelOpen ? .13 : .22, context.currentTime, .65);
      master.gain.setTargetAtTime(0.62, context.currentTime, 0.06);
      if (document.hidden) void context.suspend().catch(() => {});
    } else {
      musicGain.gain.setTargetAtTime(0, context.currentTime, .08);
      master.gain.setTargetAtTime(0, context.currentTime, 0.045);
      suspendTimer = setTimeout(() => {
        if (!enabled && !disposed) void context.suspend().catch(() => {});
      }, 350);
    }
    return enabled;
  }
  function visibility() {
    if (!enabled || disposed) return;
    if (document.hidden) void context.suspend().catch(() => {});
    else void context.resume().catch(() => {});
  }
  document.addEventListener("visibilitychange", visibility);
  return {
    setEnabled,
    /** Pause the score gently while leaving intentional interface cues usable. */
    setPaused(value: boolean) {
      if (disposed) return;
      paused = value;
      musicGain.gain.setTargetAtTime(value ? 0 : panelOpen ? .13 : .22, context.currentTime, value ? .12 : .5);
    },
    update(progress: number, interaction: GalleryAudioInteraction = {}) {
      // Movement never adds wind/contact loops. Dialogs only duck the score.
      if (!Number.isFinite(progress)) return;
      const next = !!interaction.panel;
      if (panelOpen !== next) {
        panelOpen = next;
        musicGain.gain.setTargetAtTime(paused ? 0 : panelOpen ? .13 : .22, context.currentTime, .35);
      }
    },
    cue(kind: GallerySoundCue) {
      if (!enabled || disposed || document.hidden || context.state !== "running") return;
      const now = context.currentTime,
        interval = kind === "type" ? 0.065 : kind === "hover" ? 0.18
          : kind === "object" ? 0.3 : kind === "transition" ? 1.8 : 0.1;
      if (now - (lastCue[kind] ?? -Infinity) < interval) return;
      lastCue[kind] = now;
      variation++;
      if (kind === "type") {
        play(buffers.type[variation % buffers.type.length], 0.13);
      } else if (kind === "hover") {
        play(buffers.hover[variation % buffers.hover.length], 0.23);
      } else if (kind === "press" || kind === "select") {
        play(buffers.confirm, 0.25, 1.08);
      } else if (kind === "open") {
        play(buffers.confirm, 0.3, 0.9);
      } else if (kind === "close") {
        play(buffers.release, 0.24, 1.04);
      } else if (kind === "object") {
        play(buffers.hover[variation % buffers.hover.length], 0.1, 0.88);
      } else if (kind === "transition") {
        play(buffers.hover[variation % buffers.hover.length], 0.1, 0.84);
      } else if (kind === "arrive") {
        play(buffers.hover[variation % buffers.hover.length], 0.15, 0.78);
      } else {
        play(buffers.hover[variation % buffers.hover.length], 0.12, 0.98);
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      enabled = false;
      activation++;
      clearTimeout(suspendTimer);
      document.removeEventListener("visibilitychange", visibility);
      voices.forEach(({ source, gain }) => {
        source.onended = null;
        source.stop();
        source.disconnect();
        gain.disconnect();
      });
      voices.clear();
      music?.stop();
      music?.disconnect();
      music = undefined;
      score = undefined;
      preparing = undefined;
      nodes.forEach((node) => node.disconnect());
      void context.close().catch(() => {});
    },
  };
}
export type AmbientAudio = ReturnType<typeof createAmbientAudio>;
