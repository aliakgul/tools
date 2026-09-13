<script setup>
import { computed, ref, watch } from "vue";
import { useSoundTrainer } from "../composables/useSoundTrainer";

const { t } = useI18n();
const { playPianoPattern, playPianoTone } = useSoundTrainer();

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const KEY_RANGES = [
  { label: "C3-B4", startOctave: 3, octaveCount: 2 },
  { label: "C4-B5", startOctave: 4, octaveCount: 2 },
  { label: "C2-B4", startOctave: 2, octaveCount: 3 },
];

const VARIATIONS = [
  { slug: "major", intervals: [0, 4, 7], tempo: 120 },
  { slug: "minor", intervals: [0, 3, 7], tempo: 120 },
];

const selectedRange = ref(KEY_RANGES[0].label);
const activeNote = ref("");
const lastPressedNote = ref("");

const activeRange = computed(() => KEY_RANGES.find((range) => range.label === selectedRange.value) || KEY_RANGES[0]);
const pianoKeys = computed(() => {
  const keys = [];

  for (
    let octave = activeRange.value.startOctave;
    octave < activeRange.value.startOctave + activeRange.value.octaveCount;
    octave += 1
  ) {
    NOTE_NAMES.forEach((pitch) => {
      keys.push({
        note: `${pitch}${octave}`,
        pitch,
        octave,
        isBlack: pitch.includes("#"),
      });
    });
  }

  return keys;
});
const whiteKeyCount = computed(() => pianoKeys.value.filter((key) => !key.isBlack).length);
const rootNote = computed(() => lastPressedNote.value || pianoKeys.value[0]?.note || "C4");

watch(pianoKeys, (keys) => {
  if (lastPressedNote.value && !keys.some((key) => key.note === lastPressedNote.value)) {
    lastPressedNote.value = keys[0]?.note || "";
  }
});

function keyStyle(key) {
  if (!key.isBlack) return {};

  const octaveOffset = key.octave - activeRange.value.startOctave;
  const whiteBeforeInOctave = {
    "C#": 1,
    "D#": 2,
    "F#": 4,
    "G#": 5,
    "A#": 6,
  }[key.pitch];
  const whiteIndex = octaveOffset * WHITE_NOTES.length + whiteBeforeInOctave;

  return {
    left: `${(whiteIndex / whiteKeyCount.value) * 100}%`,
  };
}

async function playNote(note) {
  activeNote.value = note;
  lastPressedNote.value = note;
  await playPianoTone({ note, duration: 1.35 });
  window.setTimeout(() => {
    if (activeNote.value === note) {
      activeNote.value = "";
    }
  }, 940);
}

function getNotesFromIntervals(intervals) {
  const rootPitch = rootNote.value.replace(/\d/g, "");
  const rootIndex = NOTE_NAMES.indexOf(rootPitch);
  const octave = Number(rootNote.value.match(/\d$/)?.[0] || 4);

  return intervals.map((interval) => {
    const chromaticIndex = rootIndex + interval;
    const pitch = NOTE_NAMES[chromaticIndex % NOTE_NAMES.length];
    const octaveOffset = Math.floor(chromaticIndex / NOTE_NAMES.length);

    return `${pitch}${octave + octaveOffset}`;
  });
}

async function playNotes(notes, tempo = 92) {
  await playPianoPattern({ notes, tempo }, (note) => {
    activeNote.value = note;
  });
  window.setTimeout(
    () => {
      activeNote.value = "";
    },
    ((notes.length * 60) / tempo + 0.2) * 1000,
  );
}

async function playVariation(variation) {
  const notes = getNotesFromIntervals(variation.intervals);

  await playNotes(notes, variation.tempo);
}
</script>

<template>
  <section class="piano-tool">
    <div class="piano-tool__header">
      <div>
        <p class="eyebrow">{{ t("piano.label") }}</p>
        <h3>{{ t("piano.title") }}</h3>
      </div>
      <span class="piano-tool__status">
        <Icon name="lucide:piano" />
        {{ activeNote || t("piano.idle") }}
      </span>
    </div>

    <div class="piano-tool__controls">
      <label>
        <span>{{ t("piano.range") }}</span>
        <select v-model="selectedRange">
          <option v-for="range in KEY_RANGES" :key="range.label" :value="range.label">{{ range.label }}</option>
        </select>
      </label>
      <div class="piano-tool__root">
        <span>{{ t("piano.lastNote") }}</span>
        <strong>{{ rootNote }}</strong>
      </div>
      <div class="piano-tool__variations" :aria-label="t('piano.variation')">
        <button
          v-for="variation in VARIATIONS"
          :key="variation.slug"
          type="button"
          class="button button--ghost piano-tool__scale"
          @click="playVariation(variation)">
          <Icon name="lucide:step-forward" />
          {{ t(`piano.variations.${variation.slug}`) }}
        </button>
      </div>
    </div>

    <div class="piano-tool__keyboard" :style="{ '--white-key-count': whiteKeyCount }" :aria-label="t('piano.keyboard')">
      <div class="piano-tool__white-keys">
        <button
          v-for="key in pianoKeys.filter((pianoKey) => !pianoKey.isBlack)"
          :key="key.note"
          type="button"
          class="piano-tool__key piano-tool__key--white"
          :class="{ 'piano-tool__key--active': activeNote === key.note }"
          :aria-label="key.note"
          @pointerdown.prevent="playNote(key.note)">
          <span>{{ key.note }}</span>
        </button>
      </div>
      <button
        v-for="key in pianoKeys.filter((pianoKey) => pianoKey.isBlack)"
        :key="key.note"
        type="button"
        class="piano-tool__key piano-tool__key--black"
        :class="{ 'piano-tool__key--active': activeNote === key.note }"
        :style="keyStyle(key)"
        :aria-label="key.note"
        @pointerdown.prevent="playNote(key.note)">
        <span>{{ key.note }}</span>
      </button>
    </div>

    <p class="piano-tool__cue">{{ t("piano.cue") }}</p>
  </section>
</template>
