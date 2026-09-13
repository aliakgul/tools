<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useSoundTrainer } from "../composables/useSoundTrainer";

const { t } = useI18n();
const { clearScheduled, playTone } = useSoundTrainer();

const activeMode = ref("manual");
const isListening = ref(false);
const errorMessage = ref("");
const currentFrequency = ref(0);
const currentClarity = ref(0);
const lowestFrequency = ref(0);
const highestFrequency = ref(0);
const manualLowestNote = ref("C3");
const manualHighestNote = ref("C5");

let audioContext;
let analyser;
let stream;
let source;
let animationId;

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MANUAL_NOTE_OPTIONS = Array.from({ length: 5 }, (_, octave) =>
  NOTE_NAMES.map((note) => `${note}${octave + 2}`),
).flat();

const currentNote = computed(() => frequencyToNote(currentFrequency.value));
const lowestNote = computed(() => frequencyToNote(lowestFrequency.value));
const highestNote = computed(() => frequencyToNote(highestFrequency.value));
const isManualMode = computed(() => activeMode.value === "manual");
const manualLowestIndex = computed(() => noteOptionIndex(manualLowestNote.value));
const manualHighestIndex = computed(() => noteOptionIndex(manualHighestNote.value));
const canLowerLowest = computed(() => manualLowestIndex.value > 0);
const canRaiseLowest = computed(() => manualLowestIndex.value < manualHighestIndex.value);
const canLowerHighest = computed(() => manualHighestIndex.value > manualLowestIndex.value);
const canRaiseHighest = computed(() => manualHighestIndex.value < MANUAL_NOTE_OPTIONS.length - 1);
const manualSemitoneRange = computed(() => {
  if (!manualLowestNote.value || !manualHighestNote.value) return 0;

  return Math.max(0, noteToMidi(manualHighestNote.value) - noteToMidi(manualLowestNote.value));
});
const manualOctaveRange = computed(() => {
  const octaves = manualSemitoneRange.value / 12;

  return Number.isInteger(octaves) ? String(octaves) : octaves.toFixed(1);
});
const manualTrackStyle = computed(() => {
  const maxIndex = MANUAL_NOTE_OPTIONS.length - 1;
  const start = (manualLowestIndex.value / maxIndex) * 100;
  const end = (manualHighestIndex.value / maxIndex) * 100;

  return {
    left: `${Math.min(start, end)}%`,
    width: `${Math.abs(end - start)}%`,
  };
});
const manualRange = computed(() => {
  if (!manualLowestNote.value || !manualHighestNote.value) return t("rangeDetector.noManualRange");
  if (noteToMidi(manualLowestNote.value) > noteToMidi(manualHighestNote.value)) return t("rangeDetector.rangeOrder");

  return `${manualLowestNote.value} - ${manualHighestNote.value}`;
});
const detectedRange = computed(() => {
  if (!lowestNote.value || !highestNote.value) return t("rangeDetector.noRange");

  return `${lowestNote.value} - ${highestNote.value}`;
});

function frequencyToNote(frequency) {
  if (!frequency) return "";

  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const pitch = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitch}${octave}`;
}

function noteToMidi(note) {
  const match = /^([A-G]#?)(-?\d)$/.exec(note || "");
  if (!match) return 0;

  const [, pitch, octave] = match;
  const pitchIndex = NOTE_NAMES.indexOf(pitch);
  if (pitchIndex === -1) return 0;

  return (Number(octave) + 1) * 12 + pitchIndex;
}

function noteOptionIndex(note) {
  return Math.max(0, MANUAL_NOTE_OPTIONS.indexOf(note));
}

function autoCorrelate(buffer, sampleRate) {
  const size = buffer.length;
  let rms = 0;

  for (let i = 0; i < size; i += 1) {
    rms += buffer[i] * buffer[i];
  }

  rms = Math.sqrt(rms / size);
  if (rms < 0.012) return { clarity: rms, frequency: 0 };

  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / 1000);
  const maxOffset = Math.floor(sampleRate / 70);

  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;

    for (let i = 0; i < size - offset; i += 1) {
      correlation += buffer[i] * buffer[i + offset];
    }

    correlation /= size - offset;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestOffset === -1 || bestCorrelation < 0.004) {
    return { clarity: rms, frequency: 0 };
  }

  return {
    clarity: Math.min(1, bestCorrelation / Math.max(rms * rms, 0.0001)),
    frequency: sampleRate / bestOffset,
  };
}

function updateRange(frequency, clarity) {
  if (!frequency || clarity < 0.35 || frequency < 70 || frequency > 1000) return;

  currentFrequency.value = frequency;
  currentClarity.value = clarity;

  if (!lowestFrequency.value || frequency < lowestFrequency.value) {
    lowestFrequency.value = frequency;
  }

  if (!highestFrequency.value || frequency > highestFrequency.value) {
    highestFrequency.value = frequency;
  }
}

function analyze() {
  if (!analyser || !audioContext) return;

  const buffer = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buffer);
  const result = autoCorrelate(buffer, audioContext.sampleRate);
  updateRange(result.frequency, result.clarity);

  animationId = window.requestAnimationFrame(analyze);
}

async function startDetection() {
  if (!import.meta.client || isListening.value) return;

  errorMessage.value = "";

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    isListening.value = true;
    analyze();
  } catch {
    errorMessage.value = t("rangeDetector.permissionError");
    stopDetection();
  }
}

function stopDetection() {
  if (animationId) {
    window.cancelAnimationFrame(animationId);
    animationId = undefined;
  }

  if (source) {
    source.disconnect();
    source = undefined;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = undefined;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = undefined;
  }

  analyser = undefined;
  isListening.value = false;
}

function resetDetection() {
  currentFrequency.value = 0;
  currentClarity.value = 0;
  lowestFrequency.value = 0;
  highestFrequency.value = 0;
  errorMessage.value = "";
}

function updateManualLowest(index) {
  const nextIndex = Math.min(Number(index), manualHighestIndex.value);
  manualLowestNote.value = MANUAL_NOTE_OPTIONS[nextIndex];
}

function updateManualHighest(index) {
  const nextIndex = Math.max(Number(index), manualLowestIndex.value);
  manualHighestNote.value = MANUAL_NOTE_OPTIONS[nextIndex];
}

function stepManualBoundary(boundary, direction) {
  const currentIndex = boundary === "low" ? manualLowestIndex.value : manualHighestIndex.value;
  const nextIndex = currentIndex + direction;

  if (boundary === "low") {
    updateManualLowest(nextIndex);
    return;
  }

  updateManualHighest(nextIndex);
}

async function playManualNote(note) {
  await playTone({ note, duration: 1.2, waveform: "sine" });
}

function setMode(mode) {
  activeMode.value = mode;
  errorMessage.value = "";

  if (mode === "manual") {
    stopDetection();
  }
}

onBeforeUnmount(() => {
  stopDetection();
  clearScheduled();
});
</script>

<template>
  <section class="range-detector">
    <div class="range-detector__header">
      <div>
        <p class="eyebrow">{{ t("rangeDetector.label") }}</p>
        <h3>{{ t("rangeDetector.title") }}</h3>
      </div>
      <span class="range-detector__status" :class="{ 'range-detector__status--active': isListening }">
        <Icon :name="isListening ? 'lucide:radio' : 'lucide:mic'" />
        {{ isListening ? t("rangeDetector.listening") : t("rangeDetector.idle") }}
      </span>
    </div>

    <div class="range-detector__modes" :aria-label="t('rangeDetector.modeLabel')">
      <button type="button" :class="{ 'range-detector__mode--active': isManualMode }" @click="setMode('manual')">
        <Icon name="lucide:sliders-horizontal" />
        {{ t("rangeDetector.manualMode") }}
      </button>
      <button type="button" :class="{ 'range-detector__mode--active': !isManualMode }" @click="setMode('mic')">
        <Icon name="lucide:mic" />
        {{ t("rangeDetector.micMode") }}
      </button>
    </div>

    <template v-if="isManualMode">
      <div class="range-detector__manual-guide">
        <div class="range-detector__manual-heading">
          <div>
            <p class="eyebrow">{{ t("rangeDetector.manualMode") }}</p>
            <h4>{{ t("rangeDetector.comfortableRange") }}</h4>
          </div>
          <span>{{ t("rangeDetector.noMic") }}</span>
        </div>

        <div class="range-detector__manual-setters">
          <label>
            <span>{{ t("rangeDetector.lowest") }}</span>
            <strong>{{ manualLowestNote }}</strong>
            <div class="range-detector__note-stepper">
              <button
                type="button"
                :disabled="!canLowerLowest"
                :aria-label="t('rangeDetector.lowerNote')"
                @click="stepManualBoundary('low', -1)">
                <Icon name="lucide:minus" />
              </button>
              <button
                type="button"
                :aria-label="t('rangeDetector.playLowest')"
                @click="playManualNote(manualLowestNote)">
                <Icon name="lucide:volume-2" />
              </button>
              <button
                type="button"
                :disabled="!canRaiseLowest"
                :aria-label="t('rangeDetector.higherNote')"
                @click="stepManualBoundary('low', 1)">
                <Icon name="lucide:plus" />
              </button>
            </div>
            <select
              :aria-label="t('rangeDetector.lowest')"
              :value="manualLowestNote"
              @change="updateManualLowest($event.target.selectedIndex)">
              <option
                v-for="note in MANUAL_NOTE_OPTIONS.slice(0, manualHighestIndex + 1)"
                :key="`low-${note}`"
                :value="note">
                {{ note }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ t("rangeDetector.highest") }}</span>
            <strong>{{ manualHighestNote }}</strong>
            <div class="range-detector__note-stepper">
              <button
                type="button"
                :disabled="!canLowerHighest"
                :aria-label="t('rangeDetector.lowerNote')"
                @click="stepManualBoundary('high', -1)">
                <Icon name="lucide:minus" />
              </button>
              <button
                type="button"
                :aria-label="t('rangeDetector.playHighest')"
                @click="playManualNote(manualHighestNote)">
                <Icon name="lucide:volume-2" />
              </button>
              <button
                type="button"
                :disabled="!canRaiseHighest"
                :aria-label="t('rangeDetector.higherNote')"
                @click="stepManualBoundary('high', 1)">
                <Icon name="lucide:plus" />
              </button>
            </div>
            <select
              :aria-label="t('rangeDetector.highest')"
              :value="manualHighestNote"
              @change="updateManualHighest(manualLowestIndex + $event.target.selectedIndex)">
              <option v-for="note in MANUAL_NOTE_OPTIONS.slice(manualLowestIndex)" :key="`high-${note}`" :value="note">
                {{ note }}
              </option>
            </select>
          </label>
        </div>

        <div class="range-detector__range-slider">
          <div class="range-detector__range-labels">
            <span>{{ t("rangeDetector.lowest") }}</span>
            <span>{{ t("rangeDetector.highest") }}</span>
          </div>
          <div class="range-detector__range-control" aria-hidden="true">
            <span class="range-detector__range-track" />
            <span class="range-detector__range-fill" :style="manualTrackStyle" />
          </div>
          <div class="range-detector__range-values">
            <strong>{{ manualLowestNote }}</strong>
            <strong>{{ manualHighestNote }}</strong>
          </div>
        </div>
      </div>

      <div class="range-detector__manual-results">
        <div>
          <Icon name="lucide:music-2" />
          <span>{{ t("rangeDetector.range") }}</span>
          <strong>{{ manualRange }}</strong>
        </div>
        <div>
          <Icon name="lucide:move-vertical" />
          <span>{{ t("rangeDetector.octaveRange") }}</span>
          <strong>{{ manualOctaveRange }}</strong>
        </div>
        <div>
          <Icon name="lucide:activity" />
          <span>{{ t("rangeDetector.semitones") }}</span>
          <strong>{{ manualSemitoneRange }}</strong>
        </div>
      </div>

      <p class="range-detector__cue">{{ t("rangeDetector.manualCue") }}</p>
    </template>

    <template v-else>
      <div class="range-detector__readout">
        <div>
          <span>{{ t("rangeDetector.current") }}</span>
          <strong>{{ currentNote || "--" }}</strong>
        </div>
        <div>
          <span>{{ t("rangeDetector.lowest") }}</span>
          <strong>{{ lowestNote || "--" }}</strong>
        </div>
        <div>
          <span>{{ t("rangeDetector.highest") }}</span>
          <strong>{{ highestNote || "--" }}</strong>
        </div>
      </div>

      <div class="range-detector__summary">
        <Icon name="lucide:move-vertical" />
        <span>{{ detectedRange }}</span>
      </div>

      <div class="range-detector__actions">
        <button v-if="!isListening" type="button" class="button button--primary" @click="startDetection">
          <Icon name="lucide:mic" />
          {{ t("rangeDetector.start") }}
        </button>
        <button v-else type="button" class="button button--primary" @click="stopDetection">
          <Icon name="lucide:square" />
          {{ t("rangeDetector.stop") }}
        </button>
        <button type="button" class="button button--ghost" @click="resetDetection">
          <Icon name="lucide:rotate-ccw" />
          {{ t("rangeDetector.reset") }}
        </button>
      </div>

      <p class="range-detector__cue">{{ t("rangeDetector.cue") }}</p>
      <p v-if="errorMessage" class="range-detector__error">{{ errorMessage }}</p>
    </template>
  </section>
</template>
