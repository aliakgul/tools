<script setup>
import { durationInSeconds, formatTime, nextSession, normalizeMinutes, TIMER_MODES } from "../utils/timer";

const { t } = useI18n();
const durations = reactive({ focus: 25, shortBreak: 5, longBreak: 15 });
const mode = ref("focus");
const remaining = ref(durationInSeconds(mode.value, durations));
const running = ref(false);
const completedFocusSessions = ref(0);
const longBreakInterval = ref(4);
const autoStart = ref(false);
const soundEnabled = ref(true);
let deadline = 0;
let intervalId;

const progress = computed(() => {
  const total = durationInSeconds(mode.value, durations);
  return total ? Math.max(0, Math.min(1, 1 - remaining.value / total)) : 0;
});
const progressStyle = computed(() => ({ "--timer-progress": `${progress.value * 360}deg` }));
const clock = computed(() => formatTime(remaining.value));
const cyclePosition = computed(() => completedFocusSessions.value % longBreakInterval.value);

function playCompletionSound() {
  if (!soundEnabled.value) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const start = context.currentTime;
  [0, 0.18].forEach((delay) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 740;
    gain.gain.setValueAtTime(0.0001, start + delay);
    gain.gain.exponentialRampToValueAtTime(0.14, start + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + 0.15);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + delay);
    oscillator.stop(start + delay + 0.16);
  });
  window.setTimeout(() => context.close(), 600);
}

function stopTicker() {
  if (intervalId) window.clearInterval(intervalId);
  intervalId = undefined;
}

function setSession(nextMode, shouldRun = false) {
  stopTicker();
  mode.value = nextMode;
  remaining.value = durationInSeconds(nextMode, durations);
  running.value = false;
  if (shouldRun) start();
}

function finishSession() {
  stopTicker();
  playCompletionSound();
  const next = nextSession(mode.value, completedFocusSessions.value, longBreakInterval.value);
  completedFocusSessions.value = next.completedFocusSessions;
  setSession(next.mode, autoStart.value);
}

function updateRemaining() {
  remaining.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  if (remaining.value === 0) finishSession();
}

function start() {
  if (running.value) return;
  running.value = true;
  deadline = Date.now() + remaining.value * 1000;
  intervalId = window.setInterval(updateRemaining, 250);
}

function pause() {
  if (!running.value) return;
  updateRemaining();
  stopTicker();
  running.value = false;
}

function reset() {
  setSession(mode.value);
}

function skip() {
  setSession(mode.value === "focus" ? "shortBreak" : "focus");
}

function chooseMode(nextMode) {
  if (!TIMER_MODES.includes(nextMode)) return;
  setSession(nextMode);
}

function applyDuration(key) {
  durations[key] = normalizeMinutes(durations[key], key === "focus" ? 25 : key === "shortBreak" ? 5 : 15);
  if (!running.value && mode.value === key) remaining.value = durationInSeconds(key, durations);
}

function applyInterval() {
  longBreakInterval.value = Math.min(12, Math.max(2, Math.round(Number(longBreakInterval.value) || 4)));
}

useHead({
  title: computed(() =>
    running.value
      ? `${clock.value} · ${t(`pomodoro.modes.${mode.value}`)}`
      : `${t("pomodoro.title")} | ${t("site.name")}`,
  ),
});

onBeforeUnmount(() => stopTicker());
</script>

<template>
  <section class="pomodoro-workspace">
    <div class="pomodoro-card">
      <div class="pomodoro-modes" :aria-label="t('pomodoro.sessionType')">
        <button
          v-for="timerMode in TIMER_MODES"
          :key="timerMode"
          type="button"
          :class="{ 'is-active': mode === timerMode }"
          :aria-pressed="mode === timerMode"
          @click="chooseMode(timerMode)">
          {{ t(`pomodoro.modes.${timerMode}`) }}
        </button>
      </div>

      <div class="pomodoro-clock" :style="progressStyle" role="timer" aria-live="off">
        <div>
          <span>{{ t(`pomodoro.modes.${mode}`) }}</span>
          <strong>{{ clock }}</strong>
          <small>{{ running ? t("pomodoro.running") : t("pomodoro.paused") }}</small>
        </div>
      </div>

      <div class="pomodoro-actions">
        <button class="pomodoro-secondary" type="button" @click="reset">
          <Icon name="lucide:rotate-ccw" />
          <span>{{ t("pomodoro.reset") }}</span>
        </button>
        <button class="pomodoro-primary" type="button" @click="running ? pause() : start()">
          <Icon :name="running ? 'lucide:pause' : 'lucide:play'" />
          <span>{{ running ? t("pomodoro.pause") : t("pomodoro.start") }}</span>
        </button>
        <button class="pomodoro-secondary" type="button" @click="skip">
          <Icon name="lucide:skip-forward" />
          <span>{{ t("pomodoro.skip") }}</span>
        </button>
      </div>

      <div class="pomodoro-cycle">
        <div>
          <span v-for="index in longBreakInterval" :key="index" :class="{ 'is-complete': index <= cyclePosition }" />
        </div>
        <p>{{ t("pomodoro.completed", { count: completedFocusSessions }) }}</p>
      </div>
    </div>

    <aside class="pomodoro-settings">
      <div>
        <p class="eyebrow">{{ t("pomodoro.settingsLabel") }}</p>
        <h2>{{ t("pomodoro.settings") }}</h2>
      </div>
      <div class="pomodoro-duration-grid">
        <label v-for="timerMode in TIMER_MODES" :key="timerMode">
          <span>{{ t(`pomodoro.modes.${timerMode}`) }}</span>
          <span class="pomodoro-number">
            <input
              v-model.number="durations[timerMode]"
              type="number"
              min="1"
              max="120"
              inputmode="numeric"
              @change="applyDuration(timerMode)" />
            <small>{{ t("pomodoro.minutes") }}</small>
          </span>
        </label>
      </div>
      <label class="pomodoro-setting-row">
        <span>{{ t("pomodoro.longBreakEvery") }}</span>
        <input v-model.number="longBreakInterval" type="number" min="2" max="12" @change="applyInterval" />
      </label>
      <label class="pomodoro-toggle">
        <input v-model="autoStart" type="checkbox" />
        <span>{{ t("pomodoro.autoStart") }}</span>
      </label>
      <label class="pomodoro-toggle">
        <input v-model="soundEnabled" type="checkbox" />
        <span>{{ t("pomodoro.sound") }}</span>
      </label>
      <p class="pomodoro-note">
        <Icon name="lucide:info" />
        {{ t("pomodoro.note") }}
      </p>
    </aside>
  </section>
</template>

<style scoped>
.pomodoro-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(17rem, 0.75fr);
  gap: 1.5rem;
  align-items: start;
}
.pomodoro-card,
.pomodoro-settings {
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  border-radius: 1.5rem;
  box-shadow: 0 18px 50px rgb(15 23 42 / 0.08);
}
.pomodoro-card {
  display: grid;
  justify-items: center;
  gap: 2rem;
  padding: clamp(1.25rem, 4vw, 3rem);
}
.pomodoro-modes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.35rem;
  border-radius: 999px;
  background: var(--ui-bg-muted);
}
.pomodoro-modes button {
  border: 0;
  border-radius: 999px;
  padding: 0.65rem 0.9rem;
  color: var(--ui-text-muted);
  font-weight: 700;
  cursor: pointer;
}
.pomodoro-modes button.is-active {
  background: #e45757;
  color: white;
  box-shadow: 0 4px 14px rgb(228 87 87 / 0.25);
}
.pomodoro-clock {
  width: min(70vw, 19rem);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#e45757 var(--timer-progress), var(--ui-bg-muted) 0);
  position: relative;
}
.pomodoro-clock::before {
  content: "";
  position: absolute;
  inset: 0.7rem;
  border-radius: inherit;
  background: var(--ui-bg);
}
.pomodoro-clock div {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
}
.pomodoro-clock span {
  color: var(--ui-text-muted);
  font-weight: 700;
}
.pomodoro-clock strong {
  color: var(--ui-text-highlighted);
  font-size: clamp(3.5rem, 9vw, 5.5rem);
  line-height: 1;
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}
.pomodoro-clock small {
  color: var(--ui-text-muted);
}
.pomodoro-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.pomodoro-actions button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.85rem;
  padding: 0.75rem 1rem;
  font-weight: 800;
  cursor: pointer;
}
.pomodoro-primary {
  border: 1px solid #e45757;
  background: #e45757;
  color: white;
  min-width: 8rem;
  justify-content: center;
}
.pomodoro-secondary {
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  color: var(--ui-text);
}
.pomodoro-cycle {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  color: var(--ui-text-muted);
}
.pomodoro-cycle > div {
  display: flex;
  gap: 0.45rem;
}
.pomodoro-cycle span {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: var(--ui-bg-accented);
}
.pomodoro-cycle span.is-complete {
  background: #e45757;
}
.pomodoro-cycle p {
  margin: 0;
  font-size: 0.9rem;
}
.pomodoro-settings {
  display: grid;
  gap: 1.25rem;
  padding: 1.5rem;
}
.pomodoro-settings h2 {
  margin: 0.2rem 0 0;
  color: var(--ui-text-highlighted);
  font-size: 1.35rem;
  font-weight: 900;
}
.pomodoro-duration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}
.pomodoro-duration-grid label {
  display: grid;
  gap: 0.45rem;
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
}
.pomodoro-number {
  display: grid;
  gap: 0.2rem;
}
.pomodoro-number input,
.pomodoro-setting-row input {
  min-width: 0;
  border: 1px solid var(--ui-border);
  border-radius: 0.7rem;
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  padding: 0.65rem;
  font-weight: 800;
}
.pomodoro-number small {
  font-weight: 500;
}
.pomodoro-setting-row,
.pomodoro-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--ui-text);
  font-weight: 700;
}
.pomodoro-setting-row input {
  width: 4.5rem;
}
.pomodoro-toggle input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #e45757;
}
.pomodoro-note {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  line-height: 1.5;
}
.pomodoro-note svg {
  flex: 0 0 auto;
  margin-top: 0.15rem;
}
@media (max-width: 800px) {
  .pomodoro-workspace {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .pomodoro-actions button span {
    display: none;
  }
  .pomodoro-primary {
    min-width: 4rem;
  }
  .pomodoro-duration-grid {
    grid-template-columns: 1fr;
  }
  .pomodoro-number {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
}
</style>
