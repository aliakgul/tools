<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import MetronomeTool from "./MetronomeTool.vue";
import PianoTool from "./PianoTool.vue";
import RangeDetector from "./RangeDetector.vue";
import SoundTrainer from "./SoundTrainer.vue";
import { useSoundTrainer } from "../composables/useSoundTrainer";

const props = defineProps({
  data: { type: Object, required: true },
});

const { t } = useI18n();
const topics = computed(() => props.data?.topics || []);
const activeSlug = ref(topics.value[0]?.slug || "");
const activeWorkspace = ref("practice");
const activeTool = ref("range");
const activeExerciseIndex = ref(0);
const isRunning = ref(false);
const secondsLeft = ref(topics.value[0]?.duration || 60);
const activeSoundLabel = ref("");
const patternProgressionStep = ref(0);
const isVideoGuideOpen = ref(false);
const selectedVideoGuideIndex = ref(0);
const speedPercent = ref(100);
const selectedStartNote = ref("");
let timerId;
let soundLoopId;
let soundRestLabelId;
const { clearScheduled, isPlaying: isSoundPlaying, playCue, playGlide, playPattern, playTone } = useSoundTrainer();

const NATURAL_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const START_NOTE_OPTIONS = [
  "F2",
  "G2",
  "A2",
  "B2",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
];
const TOPIC_ILLUSTRATIONS = {
  articulation: "/illustrations/articulation.webp",
  breathing: "/illustrations/breathing.webp",
  pitch: "/illustrations/pitch.webp",
  posture: "/illustrations/posture.webp",
  range: "/illustrations/range.webp",
  resonance: "/illustrations/resonance.webp",
  "warm-ups": "/illustrations/warm-ups.webp",
};

const activeTopic = computed(
  () => topics.value.find((topic) => topic.slug === activeSlug.value) || topics.value[0] || {},
);
const recommendedSequence = computed(() => {
  const sequence = props.data?.recommendedSequence;
  if (!sequence?.topics?.length) return null;

  return sequence;
});
const topicExercises = computed(() => {
  if (activeTopic.value.exercises?.length) return activeTopic.value.exercises;

  return [
    {
      title: activeTopic.value.exerciseTitle,
      style: "steps",
      duration: activeTopic.value.duration || 60,
      steps: activeTopic.value.steps || [],
      sound: activeTopic.value.sound,
    },
  ];
});
const activeExercise = computed(() => topicExercises.value[activeExerciseIndex.value] || topicExercises.value[0] || {});
const activeTopicIllustration = computed(
  () => activeTopic.value.illustration || TOPIC_ILLUSTRATIONS[activeTopic.value.slug] || "",
);
const baseStartNote = computed(() => getSoundStartNote(activeExercise.value.sound));
const canAdjustSpeed = computed(() => Boolean(activeExercise.value.sound));
const canAdjustStartNote = computed(() => Boolean(baseStartNote.value));
const startNoteOptions = computed(() => {
  if (!canAdjustStartNote.value) return [];
  if (START_NOTE_OPTIONS.includes(baseStartNote.value)) return START_NOTE_OPTIONS;

  return [...START_NOTE_OPTIONS, baseStartNote.value].sort((a, b) => noteToMidi(a) - noteToMidi(b));
});
const adjustedSound = computed(() => adjustSound(activeExercise.value.sound));

const progress = computed(() => {
  const duration = activeExercise.value.duration || 1;
  return Math.max(0, Math.min(100, ((duration - secondsLeft.value) / duration) * 100));
});

const formattedTime = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft.value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
});

const activeVideoGuides = computed(() => {
  const guides = [];
  const seen = new Set();
  const addGuide = (guide) => {
    if (!guide?.youtubeId || seen.has(guide.youtubeId)) return;
    seen.add(guide.youtubeId);
    guides.push(guide);
  };

  const addExerciseGuides = (exercise) => {
    if (exercise?.videoGuides?.length) {
      exercise.videoGuides.forEach(addGuide);
      return;
    }

    addGuide(exercise?.videoGuide);
  };

  addExerciseGuides(activeExercise.value);
  activeTopic.value.exercises?.forEach((exercise) => {
    if (exercise === activeExercise.value) return;
    addExerciseGuides(exercise);
  });

  return guides;
});
const activeVideoGuide = computed(
  () => activeVideoGuides.value[selectedVideoGuideIndex.value] || activeVideoGuides.value[0] || null,
);
const activePrivacyCue = computed(() => {
  if (activeVideoGuide.value) return t("practice.videoPrivacyCue");

  return t("practice.defaultPrivacyCue");
});
const tools = computed(() => [
  {
    slug: "range",
    title: t("tools.rangeTitle"),
    icon: "lucide:move-vertical",
  },
  {
    slug: "metronome",
    title: t("tools.metronomeTitle"),
    icon: "lucide:timer",
  },
  {
    slug: "piano",
    title: t("tools.pianoTitle"),
    icon: "lucide:piano",
  },
]);

const videoEmbedUrl = computed(() => {
  if (!activeVideoGuide.value?.youtubeId) return "";

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  if (activeVideoGuide.value.start) {
    params.set("start", String(activeVideoGuide.value.start));
  }

  return `https://www.youtube-nocookie.com/embed/${activeVideoGuide.value.youtubeId}?${params.toString()}`;
});

const videoWatchUrl = computed(() => {
  if (!activeVideoGuide.value?.youtubeId) return "";

  const params = new URLSearchParams();
  if (activeVideoGuide.value.start) {
    params.set("t", `${activeVideoGuide.value.start}s`);
  }

  const query = params.toString();
  return `https://www.youtube.com/watch?v=${activeVideoGuide.value.youtubeId}${query ? `&${query}` : ""}`;
});

function getTopicSequenceNumber(topic) {
  const index = recommendedSequence.value?.topics?.indexOf(topic.slug) ?? -1;
  return index >= 0 ? index + 1 : null;
}

function noteToMidi(note) {
  const match = /^([A-G]#?)(-?\d)$/.exec(note || "");
  if (!match) return 0;

  const [, pitch, octave] = match;
  const pitchIndex = CHROMATIC_NOTES.indexOf(pitch);
  if (pitchIndex === -1) return 0;

  return (Number(octave) + 1) * 12 + pitchIndex;
}

function midiToNote(midi) {
  const pitch = CHROMATIC_NOTES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitch}${octave}`;
}

function transposeChromaticNote(note, semitones) {
  if (!note || !semitones) return note;

  return midiToNote(noteToMidi(note) + semitones);
}

function getSoundStartNote(sound) {
  if (!sound) return "";
  if (sound.notes?.length) return sound.notes[0];
  if (sound.note) return sound.note;
  if (sound.from) return sound.from;

  return "";
}

function adjustDuration(duration) {
  if (!duration) return duration;

  return duration / (speedPercent.value / 100);
}

function adjustSound(sound) {
  if (!sound) return null;

  const speed = speedPercent.value / 100;
  const baseNote = getSoundStartNote(sound);
  const startNote = selectedStartNote.value || baseNote;
  const semitoneOffset = startNote && baseNote ? noteToMidi(startNote) - noteToMidi(baseNote) : 0;
  const naturalOffset = startNote && baseNote ? getNaturalNoteDistance(baseNote, startNote) : null;
  const nextSound = { ...sound };

  if (nextSound.tempo) {
    nextSound.tempo = Math.round(nextSound.tempo * speed);
  }

  if (nextSound.duration) {
    nextSound.duration = adjustDuration(nextSound.duration);
  }

  if (nextSound.cues?.length) {
    nextSound.cues = nextSound.cues.map((cue) => ({
      ...cue,
      duration: adjustDuration(cue.duration),
    }));
  }

  if (nextSound.notes?.length) {
    nextSound.notes = nextSound.notes.map((note) => {
      if (naturalOffset !== null) return transposeNaturalNote(note, naturalOffset);

      return transposeChromaticNote(note, semitoneOffset);
    });
  }

  if (nextSound.note) {
    nextSound.note = transposeChromaticNote(nextSound.note, semitoneOffset);
  }

  if (nextSound.from) {
    nextSound.from = transposeChromaticNote(nextSound.from, semitoneOffset);
  }

  if (nextSound.to) {
    nextSound.to = transposeChromaticNote(nextSound.to, semitoneOffset);
  }

  return nextSound;
}

function stopTimer() {
  isRunning.value = false;
  if (timerId) {
    clearInterval(timerId);
    timerId = undefined;
  }
}

function clearSoundLoop() {
  if (soundLoopId) {
    window.clearTimeout(soundLoopId);
    soundLoopId = undefined;
  }

  if (soundRestLabelId) {
    window.clearTimeout(soundRestLabelId);
    soundRestLabelId = undefined;
  }
}

function resetTimer(duration = activeExercise.value.duration || 60) {
  stopTimer();
  clearSoundLoop();
  clearScheduled();
  activeSoundLabel.value = "";
  patternProgressionStep.value = 0;
  secondsLeft.value = duration;
}

function getSoundCycleDuration(sound = adjustedSound.value) {
  if (!sound) return 0;

  if (sound.mode === "cue") {
    return sound.cues?.reduce((total, cue) => total + (cue.duration || 1), 0) || 1;
  }

  if (sound.mode === "pattern") {
    return ((sound.notes?.length || 1) * 60) / (sound.tempo || 72);
  }

  return sound.duration || 1.2;
}

function getSoundRestDuration(sound = adjustedSound.value) {
  if (!sound) return 0;
  if (typeof sound.restDuration === "number") return sound.restDuration;

  const restDurations = {
    glide: 2,
    pattern: 3,
    tone: 2,
  };

  return restDurations[sound.mode] || 0;
}

function selectTopic(slug) {
  activeSlug.value = slug;
  activeExerciseIndex.value = 0;
  selectedVideoGuideIndex.value = 0;
  const nextTopic = topics.value.find((topic) => topic.slug === slug);
  resetTimer(nextTopic?.exercises?.[0]?.duration || nextTopic?.duration || 60);
}

function selectExercise(index) {
  activeExerciseIndex.value = index;
  selectedVideoGuideIndex.value = 0;
  resetTimer(topicExercises.value[index]?.duration || 60);
}

function shouldProgressPattern(sound) {
  return sound?.mode === "pattern" && sound.progression !== false;
}

function getPatternProgressionSteps(sound) {
  if (!shouldProgressPattern(sound)) return 1;

  return Math.max(1, sound.progression?.steps || 5);
}

function transposeNaturalNote(note, steps) {
  const match = /^([A-G])(-?\d)$/.exec(note);
  if (!match || !steps) return note;

  const [, pitch, octave] = match;
  const startIndex = NATURAL_NOTES.indexOf(pitch);
  if (startIndex === -1) return note;

  const nextIndex = startIndex + steps;
  const octaveOffset = Math.floor(nextIndex / NATURAL_NOTES.length);
  const normalizedIndex = ((nextIndex % NATURAL_NOTES.length) + NATURAL_NOTES.length) % NATURAL_NOTES.length;

  return `${NATURAL_NOTES[normalizedIndex]}${Number(octave) + octaveOffset}`;
}

function getNaturalNoteDistance(from, to) {
  const fromMatch = /^([A-G])(-?\d)$/.exec(from || "");
  const toMatch = /^([A-G])(-?\d)$/.exec(to || "");
  if (!fromMatch || !toMatch) return null;

  const [, fromPitch, fromOctave] = fromMatch;
  const [, toPitch, toOctave] = toMatch;

  return (
    (Number(toOctave) - Number(fromOctave)) * NATURAL_NOTES.length +
    NATURAL_NOTES.indexOf(toPitch) -
    NATURAL_NOTES.indexOf(fromPitch)
  );
}

function getProgressivePattern(sound) {
  if (!shouldProgressPattern(sound)) return sound;

  const progressionSteps = getPatternProgressionSteps(sound);
  const step = patternProgressionStep.value % progressionSteps;

  return {
    ...sound,
    notes: sound.notes?.map((note) => transposeNaturalNote(note, step)) || [],
  };
}

function advancePatternProgression(sound) {
  if (!shouldProgressPattern(sound)) return;

  patternProgressionStep.value = (patternProgressionStep.value + 1) % getPatternProgressionSteps(sound);
}

async function playActiveSound() {
  const sound = adjustedSound.value;
  activeSoundLabel.value = "";
  clearScheduled();

  if (!sound) return;

  if (sound.mode === "cue") {
    await playCue(sound, (cue) => {
      activeSoundLabel.value = cue.label;
    });
    return;
  }

  if (sound.mode === "pattern") {
    const progressiveSound = getProgressivePattern(sound);

    await playPattern(progressiveSound, (note) => {
      activeSoundLabel.value = note;
    });
    advancePatternProgression(sound);
    return;
  }

  if (sound.mode === "glide") {
    activeSoundLabel.value = `${sound.from} → ${sound.to}`;
    await playGlide(sound);
    return;
  }

  activeSoundLabel.value = sound.note || "";
  await playTone(sound);
}

function scheduleSoundLoop() {
  clearSoundLoop();

  if (!adjustedSound.value || !isRunning.value) return;

  const cycleDuration = Math.max(0.2, getSoundCycleDuration());
  const restDuration = Math.max(0, getSoundRestDuration());
  const delay = (cycleDuration + restDuration) * 1000;

  if (restDuration > 0) {
    soundRestLabelId = window.setTimeout(() => {
      if (isRunning.value && secondsLeft.value > 0) {
        activeSoundLabel.value = adjustedSound.value?.restLabel || t("sound.breathe");
      }
    }, cycleDuration * 1000);
  }

  soundLoopId = window.setTimeout(async () => {
    if (!isRunning.value || secondsLeft.value <= 0) return;
    await playActiveSound();
    scheduleSoundLoop();
  }, delay);
}

async function startPractice() {
  if (secondsLeft.value <= 0) {
    secondsLeft.value = activeExercise.value.duration || 60;
    patternProgressionStep.value = 0;
  }

  isRunning.value = true;
  await playActiveSound();
  scheduleSoundLoop();

  timerId = setInterval(() => {
    if (secondsLeft.value <= 1) {
      secondsLeft.value = 0;
      stopTimer();
      clearSoundLoop();
      clearScheduled();
      activeSoundLabel.value = "";
      return;
    }
    secondsLeft.value -= 1;
  }, 1000);
}

function pausePractice() {
  stopTimer();
  clearSoundLoop();
  clearScheduled();
  activeSoundLabel.value = "";
}

function togglePractice() {
  if (isRunning.value) {
    pausePractice();
    return;
  }

  startPractice();
}

function selectWorkspace(workspace) {
  activeWorkspace.value = workspace;

  if (workspace === "tools") {
    pausePractice();
  }
}

async function scrollToSection(id) {
  await nextTick();
  const element = document.getElementById(id);
  if (!element) return;

  const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
  const offset = headerHeight + 24;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function getStartingTopic() {
  return topics.value.find((topic) => topic.slug === "breathing") || topics.value[0] || null;
}

async function startWithFirstPractice() {
  const startingTopic = getStartingTopic();
  if (!startingTopic) return;

  selectWorkspace("practice");
  selectTopic(startingTopic.slug);
  await scrollToSection("workspace");
}

async function openToolsWorkspace() {
  selectWorkspace("tools");
  await scrollToSection("workspace");
}

async function handleWorkspaceChange(event) {
  if (!["practice", "tools"].includes(event.detail)) return;

  selectWorkspace(event.detail);
  await scrollToSection("workspace");
}

function openVideoGuide() {
  pausePractice();
  isVideoGuideOpen.value = true;
}

function closeVideoGuide() {
  isVideoGuideOpen.value = false;
}

function selectVideoGuide(index) {
  selectedVideoGuideIndex.value = index;
}

function resetSoundControls() {
  speedPercent.value = 100;
  selectedStartNote.value = baseStartNote.value || "";
}

watch(
  () => activeExercise.value,
  () => {
    clearSoundLoop();
    clearScheduled();
    activeSoundLabel.value = "";
    patternProgressionStep.value = 0;
    isVideoGuideOpen.value = false;
    selectedVideoGuideIndex.value = 0;
    resetSoundControls();
  },
  { immediate: true },
);

watch([speedPercent, selectedStartNote], () => {
  if (!isRunning.value) return;

  clearSoundLoop();
  clearScheduled();
  activeSoundLabel.value = "";
  void playActiveSound();
  scheduleSoundLoop();
});

onMounted(() => {
  window.addEventListener("vocal-workspace-change", handleWorkspaceChange);
});

onBeforeUnmount(() => {
  window.removeEventListener("vocal-workspace-change", handleWorkspaceChange);
  stopTimer();
  clearSoundLoop();
  clearScheduled();
});
</script>

<template>
  <section class="training-shell">
    <div class="training-hero">
      <div class="training-hero__copy">
        <UiAppMark icon="lucide:mic-vocal" color="#d9466b" size="lg" />
        <p class="eyebrow">{{ data?.hero?.kicker }}</p>
        <h1>{{ data?.hero?.title }}</h1>
        <p>{{ data?.hero?.intro }}</p>
        <div class="training-hero__actions">
          <button type="button" class="button button--primary" @click="startWithFirstPractice">
            <Icon name="lucide:play" />
            {{ data?.hero?.primaryAction }}
          </button>
          <button type="button" class="button button--ghost" @click="openToolsWorkspace">
            <Icon name="lucide:wrench" />
            {{ t("tools.open") }}
          </button>
        </div>
      </div>

      <div class="hero-session">
        <div class="hero-session__top">
          <div class="topic-panel__icon">
            <Icon :name="activeTopic.icon" />
          </div>
          <div>
            <p class="eyebrow">{{ activeTopic.title }}</p>
            <h2>{{ activeExercise.title }}</h2>
          </div>
        </div>
        <div class="hero-session__meter" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div class="hero-session__meta">
          <span>
            <Icon name="lucide:timer" />
            {{ Math.ceil((activeExercise.duration || 60) / 60) }} {{ t("practice.minutes") }}
          </span>
          <span>
            <Icon name="lucide:list-checks" />
            {{ topicExercises.length }} {{ t("practice.exercises") }}
          </span>
        </div>
        <div class="hero-session__checklist">
          <span v-for="checkpoint in activeTopic.checkpoints?.slice(0, 3)" :key="checkpoint">{{ checkpoint }}</span>
        </div>
      </div>
    </div>

    <div id="workspace" class="workspace-switch" :aria-label="t('workspace.label')">
      <button
        type="button"
        :class="{ 'workspace-switch__item--active': activeWorkspace === 'practice' }"
        @click="selectWorkspace('practice')">
        <Icon name="lucide:activity" />
        {{ t("workspace.practice") }}
      </button>
      <button
        type="button"
        :class="{ 'workspace-switch__item--active': activeWorkspace === 'tools' }"
        @click="selectWorkspace('tools')">
        <Icon name="lucide:wrench" />
        {{ t("workspace.tools") }}
      </button>
    </div>

    <template v-if="activeWorkspace === 'practice'">
      <div id="topics" class="topic-section" :aria-label="t('practice.topicsLabel')">
        <div v-if="recommendedSequence" class="topic-section__header">
          <p class="eyebrow">{{ recommendedSequence.label }}</p>
          <p>{{ recommendedSequence.note }}</p>
        </div>

        <div class="topic-strip">
          <button
            v-for="topic in topics"
            :key="topic.slug"
            type="button"
            class="topic-pill"
            :class="{ 'topic-pill--active': activeTopic.slug === topic.slug }"
            @click="selectTopic(topic.slug)">
            <span class="topic-pill__top">
              <span class="topic-pill__identity">
                <span v-if="getTopicSequenceNumber(topic)" class="topic-pill__order">
                  {{ getTopicSequenceNumber(topic) }}
                </span>
                <Icon :name="topic.icon" class="topic-pill__icon" />
              </span>
            </span>
            <span>{{ topic.title }}</span>
          </button>
        </div>
      </div>

      <div
        v-if="topicExercises.length > 1"
        class="exercise-picker exercise-picker--standalone"
        :aria-label="t('practice.exerciseOptions')">
        <button
          v-for="(exercise, index) in topicExercises"
          :key="exercise.id || exercise.title"
          type="button"
          :class="{ 'exercise-picker__item--active': activeExerciseIndex === index }"
          class="exercise-picker__item"
          @click="selectExercise(index)">
          <Icon :name="exercise.icon || 'lucide:activity'" />
          <span>{{ exercise.shortTitle || exercise.title }}</span>
        </button>
      </div>

      <div id="practice" class="practice-layout">
        <aside class="exercise-panel" aria-live="polite">
          <div class="practice-player">
            <div class="practice-player__header">
              <div class="practice-player__title">
                <p class="eyebrow">{{ t("practice.label") }}</p>
                <h2>{{ activeExercise.title }}</h2>
              </div>
              <div class="timer-badge">
                <Icon name="lucide:timer" />
                {{ formattedTime }}
              </div>
            </div>

            <div class="practice-progress" aria-hidden="true">
              <span :style="{ width: `${progress}%` }" />
            </div>

            <SoundTrainer
              v-if="adjustedSound"
              :key="`${activeTopic.slug}-${activeExerciseIndex}`"
              :active-label="activeSoundLabel"
              :can-adjust-speed="canAdjustSpeed"
              :can-adjust-start-note="canAdjustStartNote"
              :is-playing="isSoundPlaying"
              :sound="adjustedSound"
              :speed-percent="speedPercent"
              :start-note="selectedStartNote"
              :start-note-options="startNoteOptions"
              :voice-example="activeExercise.voiceExample"
              @update:speed-percent="speedPercent = $event"
              @update:start-note="selectedStartNote = $event" />

            <div class="practice-player__controls">
              <button type="button" class="player-button player-button--primary" @click="togglePractice">
                <Icon :name="isRunning ? 'lucide:pause' : 'lucide:play'" />
                <span>{{ isRunning ? t("practice.pause") : t("practice.start") }}</span>
              </button>
              <button type="button" class="player-button" @click="resetTimer()">
                <Icon name="lucide:rotate-ccw" />
                <span>{{ t("practice.reset") }}</span>
              </button>
              <button
                v-if="activeVideoGuides.length"
                type="button"
                class="player-button player-button--video"
                @click="openVideoGuide">
                <Icon name="lucide:circle-play" />
                <span>{{ t("practice.watchGuide") }}</span>
              </button>
            </div>
          </div>

          <div
            v-if="activeExercise.prompt"
            class="exercise-prompt"
            :class="`exercise-prompt--${activeExercise.style || 'steps'}`">
            {{ activeExercise.prompt }}
          </div>

          <div class="practice-cues">
            <div class="practice-cue practice-cue--safety">
              <Icon name="lucide:shield-alert" />
              <p>
                <strong>{{ t("practice.safety") }}</strong>
                {{ activeExercise.safetyCue || activeTopic.safetyCue || t("practice.defaultSafetyCue") }}
              </p>
            </div>
            <div class="practice-cue practice-cue--privacy">
              <Icon name="lucide:lock-keyhole" />
              <p>
                <strong>{{ t("practice.privacy") }}</strong>
                {{ activePrivacyCue }}
              </p>
            </div>
          </div>

          <ol class="exercise-steps">
            <li v-for="step in activeExercise.steps" :key="step">{{ step }}</li>
          </ol>
        </aside>

        <article class="topic-panel">
          <div class="topic-panel__header">
            <div class="topic-panel__icon">
              <Icon :name="activeTopic.icon" />
            </div>
            <div>
              <p class="eyebrow">{{ activeTopic.summary }}</p>
              <h2>{{ activeTopic.title }}</h2>
            </div>
          </div>

          <div class="topic-visual" :class="`topic-visual--${activeTopic.visual?.type || activeTopic.slug}`">
            <img
              v-if="activeTopicIllustration"
              class="topic-visual__image"
              :src="activeTopicIllustration"
              :alt="activeTopic.title"
              decoding="async"
              loading="lazy" />
          </div>

          <p class="topic-panel__concept">{{ activeTopic.concept }}</p>

          <div class="guidance-box">
            <Icon name="lucide:focus" />
            <p>{{ activeTopic.guidance }}</p>
          </div>

          <div class="checkpoints">
            <span v-for="checkpoint in activeTopic.checkpoints" :key="checkpoint">{{ checkpoint }}</span>
          </div>
        </article>
      </div>
    </template>

    <section v-else id="tools" class="tools-section" :aria-label="t('tools.label')">
      <div class="tools-section__header">
        <div>
          <p class="eyebrow">{{ t("tools.label") }}</p>
          <h2>{{ t("tools.title") }}</h2>
        </div>
        <p>{{ t("tools.description") }}</p>
      </div>

      <div class="tools-layout">
        <div class="tools-list" role="tablist" :aria-label="t('tools.label')">
          <button
            v-for="tool in tools"
            :key="tool.slug"
            type="button"
            role="tab"
            :aria-selected="activeTool === tool.slug"
            class="tools-list__item"
            :class="{ 'tools-list__item--active': activeTool === tool.slug }"
            @click="activeTool = tool.slug">
            <Icon :name="tool.icon" />
            <span>{{ tool.title }}</span>
          </button>
        </div>

        <div class="tools-panel">
          <RangeDetector v-if="activeTool === 'range'" />
          <MetronomeTool v-else-if="activeTool === 'metronome'" />
          <PianoTool v-else-if="activeTool === 'piano'" />
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="isVideoGuideOpen && activeVideoGuide"
        class="video-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="activeVideoGuide.title">
        <button
          type="button"
          class="video-modal__backdrop"
          :aria-label="t('practice.closeGuide')"
          @click="closeVideoGuide" />
        <div class="video-modal__panel">
          <div class="video-modal__header">
            <div>
              <p class="eyebrow">{{ activeVideoGuide.channel }}</p>
              <h2>{{ activeVideoGuide.title }}</h2>
            </div>
            <button
              type="button"
              class="video-modal__close"
              :aria-label="t('practice.closeGuide')"
              @click="closeVideoGuide">
              <Icon name="lucide:x" />
            </button>
          </div>

          <div class="video-modal__body" :class="{ 'video-modal__body--single': activeVideoGuides.length < 2 }">
            <div v-if="activeVideoGuides.length > 1" class="video-modal__list" :aria-label="t('practice.videoOptions')">
              <button
                v-for="(guide, index) in activeVideoGuides"
                :key="guide.youtubeId"
                type="button"
                class="video-modal__option"
                :class="{ 'video-modal__option--active': selectedVideoGuideIndex === index }"
                @click="selectVideoGuide(index)">
                <span class="video-modal__option-title">{{ guide.title }}</span>
                <span class="video-modal__option-meta">
                  {{ guide.channel }}
                  <strong v-if="index === 0">{{ t("practice.recommendedGuide") }}</strong>
                </span>
              </button>
            </div>

            <div class="video-modal__frame">
              <iframe
                :src="videoEmbedUrl"
                :title="activeVideoGuide.title"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                  web-share;
                "
                allowfullscreen
                referrerpolicy="strict-origin-when-cross-origin" />
            </div>
          </div>

          <div class="video-modal__footer">
            <p>{{ t("practice.videoNotice") }}</p>
            <a class="button button--ghost" :href="videoWatchUrl" target="_blank" rel="noopener noreferrer">
              <Icon name="lucide:external-link" />
              {{ t("practice.openOnYouTube") }}
            </a>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
