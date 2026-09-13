import test from "node:test";
import assert from "node:assert/strict";
import { durationInSeconds, formatTime, nextSession, normalizeMinutes } from "./timer.js";

test("normalizes minute settings to whole minutes within supported limits", () => {
  assert.equal(normalizeMinutes("25"), 25);
  assert.equal(normalizeMinutes(0), 1);
  assert.equal(normalizeMinutes(999), 120);
  assert.equal(normalizeMinutes("invalid", 5), 5);
  assert.equal(durationInSeconds("focus", { focus: 30 }), 1800);
});

test("moves through focus and break sessions and schedules long breaks", () => {
  assert.deepEqual(nextSession("focus", 0, 4), { mode: "shortBreak", completedFocusSessions: 1 });
  assert.deepEqual(nextSession("shortBreak", 1, 4), { mode: "focus", completedFocusSessions: 1 });
  assert.deepEqual(nextSession("focus", 3, 4), { mode: "longBreak", completedFocusSessions: 4 });
  assert.deepEqual(nextSession("longBreak", 4, 4), { mode: "focus", completedFocusSessions: 4 });
});

test("formats time without displaying negative values", () => {
  assert.equal(formatTime(1500), "25:00");
  assert.equal(formatTime(61), "01:01");
  assert.equal(formatTime(-1), "00:00");
});
