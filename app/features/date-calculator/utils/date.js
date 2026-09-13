const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function formatDateOnly(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addYearsClamped(date, amount) {
  const year = date.getUTCFullYear() + amount;
  const month = date.getUTCMonth();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), daysInMonth(year, month))));
}

function addMonthsClamped(date, amount) {
  const target = date.getUTCMonth() + amount;
  const year = date.getUTCFullYear() + Math.floor(target / 12);
  const month = ((target % 12) + 12) % 12;
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), daysInMonth(year, month))));
}

export function calculateDateDifference(fromValue, toValue) {
  const from = parseDateOnly(fromValue);
  const to = parseDateOnly(toValue);
  if (!from || !to) return { error: "invalid" };

  const direction = from.getTime() === to.getTime() ? "same" : from < to ? "past" : "future";
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;
  const totalDays = Math.round((end - start) / DAY_MS);

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let cursor = addYearsClamped(start, years);
  if (cursor > end) {
    years -= 1;
    cursor = addYearsClamped(start, years);
  }

  let months = (end.getUTCFullYear() - cursor.getUTCFullYear()) * 12 + end.getUTCMonth() - cursor.getUTCMonth();
  let monthCursor = addMonthsClamped(cursor, months);
  if (monthCursor > end) {
    months -= 1;
    monthCursor = addMonthsClamped(cursor, months);
  }
  const days = Math.round((end - monthCursor) / DAY_MS);

  return {
    direction,
    years,
    months,
    days,
    totalDays,
    totalWeeks: totalDays / 7,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 24 * 60,
  };
}
