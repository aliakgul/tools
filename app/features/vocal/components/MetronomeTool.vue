<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useSoundTrainer } from "../composables/useSoundTrainer";

const { t } = useI18n();
const { playTone } = useSoundTrainer();

const bpm = ref(80);
const measureBeats = ref(4);
const isRunning = ref(false);
const currentBeat = ref(0);
const isAccentEnabled = ref(true);
let intervalId;

const beatInterval = computed(() => 60000 / bpm.value);
const beatMarkers = computed(() => Array.from({ length: measureBeats.value }, (_, index) => index + 1));

function clampBpm(value) {
  return Math.max(40, Math.min(220, Number(value) || 80));
}

async function playBeat(beat = (currentBeat.value % measureBeats.value) + 1) {
  currentBeat.value = beat;
  const isAccent = isAccentEnabled.value && currentBeat.value === 1;

  await playTone({
    note: isAccent ? "C5" : "C4",
    duration: 0.08,
    waveform: "square",
  });
}

async function previewBeat(beat) {
  await playBeat(beat);
}

async function startMetronome() {
  if (isRunning.value) return;

  isRunning.value = true;
  await playBeat();
  intervalId = window.setInterval(playBeat, beatInterval.value);
}

function stopMetronome() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = undefined;
  }

  isRunning.value = false;
  currentBeat.value = 0;
}

function toggleMetronome() {
  if (isRunning.value) {
    stopMetronome();
    return;
  }

  startMetronome();
}

function adjustBpm(amount) {
  const step = 5;
  const nextValue = amount > 0 ? Math.floor(bpm.value / step) * step + step : Math.ceil(bpm.value / step) * step - step;

  bpm.value = clampBpm(nextValue);
  restartIfRunning();
}

function updateBpm(value) {
  bpm.value = clampBpm(value);
  restartIfRunning();
}

function updateMeasureBeats(value) {
  measureBeats.value = Number(value);
  currentBeat.value = 0;
  restartIfRunning();
}

function restartIfRunning() {
  if (!isRunning.value) return;

  stopMetronome();
  startMetronome();
}

onBeforeUnmount(stopMetronome);
</script>

<template>
  <section class="metronome-tool">
    <div class="metronome-tool__header">
      <div>
        <p class="eyebrow">{{ t("metronome.label") }}</p>
        <h3>{{ t("metronome.title") }}</h3>
      </div>
      <span class="metronome-tool__status" :class="{ 'metronome-tool__status--active': isRunning }">
        <Icon :name="isRunning ? 'lucide:radio' : 'lucide:timer'" />
        {{ isRunning ? t("metronome.running") : t("metronome.idle") }}
      </span>
    </div>

    <div class="metronome-tool__display">
      <button type="button" :aria-label="t('metronome.slower')" @click="adjustBpm(-5)">
        <Icon name="lucide:minus" />
      </button>
      <label>
        <span>{{ t("metronome.bpm") }}</span>
        <strong>{{ bpm }}</strong>
        <input :value="bpm" type="range" min="40" max="220" step="1" @input="updateBpm($event.target.value)" />
      </label>
      <button type="button" :aria-label="t('metronome.faster')" @click="adjustBpm(5)">
        <Icon name="lucide:plus" />
      </button>
    </div>

    <div class="metronome-tool__beats" :aria-label="t('metronome.beatCells')">
      <button
        v-for="beat in beatMarkers"
        :key="beat"
        type="button"
        :aria-label="t('metronome.previewBeat', { beat })"
        :aria-pressed="currentBeat === beat"
        :class="{ 'metronome-tool__beat--active': currentBeat === beat }"
        @click="previewBeat(beat)">
        <span>{{ beat }}</span>
      </button>
    </div>

    <div class="metronome-tool__settings">
      <label>
        <span>{{ t("metronome.measureBeats") }}</span>
        <select :value="measureBeats" @change="updateMeasureBeats($event.target.value)">
          <option v-for="count in [2, 3, 4, 5, 6]" :key="count" :value="count">{{ count }}</option>
        </select>
      </label>
      <label class="metronome-tool__toggle">
        <input v-model="isAccentEnabled" type="checkbox" />
        <span>{{ t("metronome.accent") }}</span>
      </label>
    </div>

    <p class="metronome-tool__cue">{{ t("metronome.standardCue") }}</p>

    <button type="button" class="button button--primary metronome-tool__control" @click="toggleMetronome">
      <Icon :name="isRunning ? 'lucide:square' : 'lucide:play'" />
      {{ isRunning ? t("metronome.stop") : t("metronome.start") }}
    </button>
  </section>
</template>
