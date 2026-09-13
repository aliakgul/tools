import { onBeforeUnmount, ref } from "vue";

const NOTE_OFFSETS = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

function noteToFrequency(note) {
  const match = /^([A-G](?:#|b)?)(-?\d)$/.exec(note);
  if (!match) return 440;

  const [, pitch, octave] = match;
  const midi = (Number(octave) + 1) * 12 + NOTE_OFFSETS[pitch];
  return 440 * 2 ** ((midi - 69) / 12);
}

export function useSoundTrainer() {
  const isPlaying = ref(false);
  let audioContext;
  let masterGain;
  let stopCallbacks = [];

  function getContext() {
    if (!import.meta.client) return null;

    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.22;
      masterGain.connect(audioContext.destination);
    }

    return audioContext;
  }

  async function unlock() {
    const context = getContext();
    if (!context) return null;

    if (context.state === "suspended") {
      await context.resume();
    }

    return context;
  }

  function clearScheduled() {
    stopCallbacks.forEach((stop) => stop());
    stopCallbacks = [];
    isPlaying.value = false;
  }

  function scheduleTimeout(callback, delay) {
    const timeoutId = window.setTimeout(callback, delay);
    stopCallbacks.push(() => window.clearTimeout(timeoutId));
  }

  function playToneAt(context, { frequency, startTime, duration = 0.8, type = "sine", volume = 1 }) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const attack = 0.02;
    const release = Math.min(0.12, duration / 3);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + attack);
    gain.gain.setValueAtTime(volume, Math.max(startTime + attack, startTime + duration - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);

    stopCallbacks.push(() => {
      try {
        oscillator.stop();
      } catch {
        // The oscillator may already be stopped by the audio clock.
      }
    });
  }

  function playPianoToneAt(context, { frequency, startTime, duration = 1.4, volume = 1 }) {
    const output = context.createGain();
    const attack = 0.006;
    const decay = Math.min(0.42, duration * 0.42);
    const releaseStart = Math.max(startTime + attack + decay, startTime + duration * 0.72);
    const endTime = startTime + duration;
    const partials = [
      { ratio: 1, gain: 0.95, detune: 0 },
      { ratio: 2, gain: 0.32, detune: 2 },
      { ratio: 3, gain: 0.16, detune: -3 },
      { ratio: 4, gain: 0.08, detune: 4 },
      { ratio: 5, gain: 0.035, detune: -5 },
    ];

    output.gain.setValueAtTime(0.0001, startTime);
    output.gain.exponentialRampToValueAtTime(volume, startTime + attack);
    output.gain.exponentialRampToValueAtTime(volume * 0.28, startTime + attack + decay);
    output.gain.setValueAtTime(volume * 0.2, releaseStart);
    output.gain.exponentialRampToValueAtTime(0.0001, endTime);
    output.connect(masterGain);

    partials.forEach((partial) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = partial.ratio === 1 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency * partial.ratio, startTime);
      oscillator.detune.setValueAtTime(partial.detune, startTime);
      gain.gain.setValueAtTime(partial.gain, startTime);

      oscillator.connect(gain);
      gain.connect(output);
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.03);

      stopCallbacks.push(() => {
        try {
          oscillator.stop();
        } catch {
          // The oscillator may already be stopped by the audio clock.
        }
      });
    });

    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * 0.018)), context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }

    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(volume * 0.08, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.025);
    noise.connect(noiseGain);
    noiseGain.connect(output);
    noise.start(startTime);
    noise.stop(startTime + 0.03);

    stopCallbacks.push(() => {
      try {
        noise.stop();
      } catch {
        // The noise source may already be stopped by the audio clock.
      }
    });
  }

  async function playTone({ note = "A4", duration = 1.2, waveform = "sine" } = {}) {
    clearScheduled();
    const context = await unlock();
    if (!context) return;

    isPlaying.value = true;
    playToneAt(context, {
      frequency: noteToFrequency(note),
      startTime: context.currentTime + 0.02,
      duration,
      type: waveform,
    });
    scheduleTimeout(clearScheduled, (duration + 0.08) * 1000);
  }

  async function playPianoTone({ note = "A4", duration = 1.5 } = {}) {
    clearScheduled();
    const context = await unlock();
    if (!context) return;

    isPlaying.value = true;
    playPianoToneAt(context, {
      frequency: noteToFrequency(note),
      startTime: context.currentTime + 0.02,
      duration,
    });
    scheduleTimeout(clearScheduled, (duration + 0.08) * 1000);
  }

  async function playPianoPattern({ notes = [], tempo = 84 } = {}, onStep) {
    clearScheduled();
    const context = await unlock();
    if (!context || !notes.length) return;

    isPlaying.value = true;
    const beatLength = 60 / tempo;
    const start = context.currentTime + 0.05;

    notes.forEach((note, index) => {
      playPianoToneAt(context, {
        frequency: noteToFrequency(note),
        startTime: start + index * beatLength,
        duration: beatLength * 1.7,
        volume: 0.92,
      });
      scheduleTimeout(() => onStep?.(note, index), index * beatLength * 1000);
    });

    scheduleTimeout(clearScheduled, (notes.length * beatLength + 1) * 1000);
  }

  async function playPattern({ notes = [], tempo = 72, waveform = "sine" } = {}, onStep) {
    clearScheduled();
    const context = await unlock();
    if (!context || !notes.length) return;

    isPlaying.value = true;
    const beatLength = 60 / tempo;
    const start = context.currentTime + 0.05;

    notes.forEach((note, index) => {
      playToneAt(context, {
        frequency: noteToFrequency(note),
        startTime: start + index * beatLength,
        duration: beatLength * 0.82,
        type: waveform,
      });
      scheduleTimeout(() => onStep?.(note, index), index * beatLength * 1000);
    });

    scheduleTimeout(clearScheduled, (notes.length * beatLength + 0.2) * 1000);
  }

  async function playCue({ cues = [] } = {}, onStep) {
    clearScheduled();
    const context = await unlock();
    if (!context || !cues.length) return;

    isPlaying.value = true;
    let elapsed = 0;

    cues.forEach((cue, index) => {
      const startTime = context.currentTime + 0.05 + elapsed;
      playToneAt(context, {
        frequency: cue.frequency || 660,
        startTime,
        duration: 0.16,
        type: "sine",
        volume: index === 0 ? 1 : 0.75,
      });
      scheduleTimeout(() => onStep?.(cue, index), elapsed * 1000);
      elapsed += cue.duration || 1;
    });

    scheduleTimeout(clearScheduled, (elapsed + 0.2) * 1000);
  }

  async function playGlide({ from = "C4", to = "C5", duration = 3, waveform = "sine" } = {}) {
    clearScheduled();
    const context = await unlock();
    if (!context) return;

    isPlaying.value = true;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + 0.03;

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(noteToFrequency(from), startTime);
    oscillator.frequency.exponentialRampToValueAtTime(noteToFrequency(to), startTime + duration);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.9, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.03);

    stopCallbacks.push(() => {
      try {
        oscillator.stop();
      } catch {
        // The oscillator may already be stopped by the audio clock.
      }
    });
    scheduleTimeout(clearScheduled, (duration + 0.12) * 1000);
  }

  onBeforeUnmount(() => {
    clearScheduled();
    if (audioContext) {
      audioContext.close();
    }
  });

  return {
    isPlaying,
    clearScheduled,
    playCue,
    playGlide,
    playPianoPattern,
    playPianoTone,
    playPattern,
    playTone,
  };
}
