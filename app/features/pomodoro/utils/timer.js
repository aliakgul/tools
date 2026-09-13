export const TIMER_MODES = ["focus", "shortBreak", "longBreak"];

export function normalizeMinutes(value, fallback = 25) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return fallback;
  return Math.min(120, Math.max(1, Math.round(minutes)));
}

export function durationInSeconds(mode, durations) {
  return normalizeMinutes(durations[mode]) * 60;
}

export function nextSession(mode, completedFocusSessions, longBreakInterval = 4) {
  if (mode !== "focus") {
    return { mode: "focus", completedFocusSessions };
  }

  const completed = completedFocusSessions + 1;
  const interval = Math.min(12, Math.max(2, Math.round(Number(longBreakInterval) || 4)));
  return {
    mode: completed % interval === 0 ? "longBreak" : "shortBreak",
    completedFocusSessions: completed,
  };
}

export function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
