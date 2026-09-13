<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  activeLabel: { type: String, default: "" },
  canAdjustSpeed: { type: Boolean, default: false },
  canAdjustStartNote: { type: Boolean, default: false },
  isPlaying: { type: Boolean, default: false },
  sound: { type: Object, required: true },
  speedPercent: { type: Number, default: 100 },
  startNote: { type: String, default: "" },
  startNoteOptions: { type: Array, default: () => [] },
  voiceExample: { type: Object, default: null },
});

const emit = defineEmits(["update:speedPercent", "update:startNote"]);

const { t } = useI18n();
const audioRef = ref(null);
const isVoicePlaying = ref(false);

const modeIcon = computed(() => {
  const icons = {
    cue: "lucide:timer-reset",
    glide: "lucide:waves",
    pattern: "lucide:music-2",
    tone: "lucide:volume-2",
  };
  return icons[props.sound?.mode] || "lucide:volume-2";
});

const displayNotes = computed(() => {
  if (props.sound?.notes?.length) return props.sound.notes.join(" · ");
  if (props.sound?.note) return props.sound.note;
  if (props.sound?.from && props.sound?.to) return `${props.sound.from} → ${props.sound.to}`;
  if (props.sound?.cues?.length) return props.sound.cues.map((cue) => cue.label).join(" · ");
  return "";
});

const recordedVoiceExample = computed(() => (props.voiceExample?.src ? props.voiceExample : null));

const restDuration = computed(() => {
  if (typeof props.sound?.restDuration === "number") return props.sound.restDuration;

  const restDurations = {
    glide: 2,
    pattern: 3,
    tone: 2,
  };

  return restDurations[props.sound?.mode] || 0;
});

const movesUp = computed(() => props.sound?.mode === "pattern" && props.sound?.progression !== false);

function stopVoiceExample() {
  const audio = audioRef.value;
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  isVoicePlaying.value = false;
}

function toggleVoiceExample() {
  const audio = audioRef.value;
  if (!audio) return;

  if (isVoicePlaying.value) {
    stopVoiceExample();
    return;
  }

  audio.currentTime = 0;
  audio
    .play()
    .then(() => {
      isVoicePlaying.value = true;
    })
    .catch(() => {
      isVoicePlaying.value = false;
    });
}

onBeforeUnmount(stopVoiceExample);
</script>

<template>
  <div class="sound-tool">
    <div class="sound-tool__header">
      <div class="sound-tool__icon">
        <Icon :name="modeIcon" />
      </div>
      <div>
        <p class="eyebrow">{{ t("sound.label") }}</p>
        <h3>{{ sound.title }}</h3>
      </div>
    </div>

    <p class="sound-tool__description">{{ sound.description }}</p>

    <div class="sound-readout" :class="{ 'sound-readout--active': isPlaying }">
      <span>{{ activeLabel || displayNotes }}</span>
    </div>

    <div v-if="canAdjustSpeed || canAdjustStartNote" class="sound-controls">
      <label v-if="canAdjustSpeed" class="sound-control">
        <span>
          <Icon name="lucide:gauge" />
          {{ t("sound.speed") }}
        </span>
        <input
          :value="speedPercent"
          aria-valuemin="70"
          aria-valuemax="130"
          max="130"
          min="70"
          step="5"
          type="range"
          @input="emit('update:speedPercent', Number($event.target.value))" />
        <strong>{{ speedPercent }}%</strong>
      </label>

      <label v-if="canAdjustStartNote" class="sound-control sound-control--select">
        <span>
          <Icon name="lucide:music-2" />
          {{ t("sound.startNote") }}
        </span>
        <select :value="startNote" @change="emit('update:startNote', $event.target.value)">
          <option v-for="note in startNoteOptions" :key="note" :value="note">{{ note }}</option>
        </select>
      </label>
    </div>

    <div class="sound-tool__meta">
      <span v-if="sound.tempo">
        <Icon name="lucide:gauge" />
        {{ sound.tempo }} {{ t("sound.bpm") }}
      </span>
      <span v-if="sound.duration">
        <Icon name="lucide:clock-3" />
        {{ sound.duration }}s
      </span>
      <span v-if="restDuration">
        <Icon name="lucide:wind" />
        {{ restDuration }}s {{ sound.restLabel || t("sound.breathGap") }}
      </span>
      <span v-if="movesUp">
        <Icon name="lucide:trending-up" />
        {{ t("sound.movesUp") }}
      </span>
    </div>

    <audio
      v-if="recordedVoiceExample"
      ref="audioRef"
      :src="recordedVoiceExample.src"
      preload="none"
      @ended="isVoicePlaying = false"
      @pause="isVoicePlaying = false" />

    <button v-if="recordedVoiceExample" type="button" class="voice-example-button" @click="toggleVoiceExample">
      <Icon :name="isVoicePlaying ? 'lucide:square' : 'lucide:user-round-sound'" />
      {{ isVoicePlaying ? t("sound.stopExample") : recordedVoiceExample.label || t("sound.voiceExample") }}
    </button>
  </div>
</template>
