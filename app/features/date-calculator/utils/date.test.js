import test from "node:test";
import assert from "node:assert/strict";
import { calculateDateDifference, formatDateOnly, parseDateOnly } from "./date.js";

test("parses strict calendar dates without local timezone shifts", () => {
  assert.equal(formatDateOnly(parseDateOnly("2026-09-13")), "2026-09-13");
  assert.equal(parseDateOnly("2026-02-29"), null);
  assert.equal(parseDateOnly("13/09/2026"), null);
});

test("calculates calendar and total differences", () => {
  assert.deepEqual(calculateDateDifference("2024-01-15", "2026-03-20"), {
    direction: "past",
    years: 2,
    months: 2,
    days: 5,
    totalDays: 795,
    totalWeeks: 795 / 7,
    totalHours: 19080,
    totalMinutes: 1144800,
  });
});

test("handles reversed, equal, end-of-month, and leap-day ranges", () => {
  assert.equal(calculateDateDifference("2026-03-20", "2024-01-15").direction, "future");
  assert.deepEqual(calculateDateDifference("2026-01-01", "2026-01-01"), {
    direction: "same",
    years: 0,
    months: 0,
    days: 0,
    totalDays: 0,
    totalWeeks: 0,
    totalHours: 0,
    totalMinutes: 0,
  });
  assert.deepEqual(
    (({ years, months, days }) => ({ years, months, days }))(calculateDateDifference("2025-01-31", "2025-03-01")),
    { years: 0, months: 1, days: 1 },
  );
  assert.equal(calculateDateDifference("2024-02-29", "2025-02-28").years, 1);
});
