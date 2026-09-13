import Papa from "papaparse";

export const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_ROWS = 10000;
export const MAX_COLUMNS = 200;
export const MAX_CELLS = 200000;
export const delimiters = { comma: ",", tab: "\t", semicolon: ";" };

export function parseTable(text, delimiter = "auto") {
  if (new TextEncoder().encode(text).byteLength > MAX_BYTES) return { error: "tooLarge" };
  if (text.includes("\0")) return { error: "encoding" };
  if (!text.trim()) return { error: "empty" };
  const result = Papa.parse(text.replace(/^\uFEFF/, ""), {
    delimiter: delimiters[delimiter] || "",
    delimitersToGuess: Object.values(delimiters),
    header: false,
    dynamicTyping: false,
    skipEmptyLines: true,
    preview: MAX_ROWS + 2,
  });
  const syntaxError = result.errors.find((error) => error.code !== "UndetectableDelimiter");
  if (syntaxError) return { error: "malformed", row: (syntaxError.row ?? 0) + 1 };
  if (!result.data.length) return { error: "empty" };
  if (result.meta.truncated || result.data.length > MAX_ROWS + 1) return { error: "tooManyRows" };
  let columns = 0;
  for (const row of result.data) columns = Math.max(columns, row.length);
  if (columns > MAX_COLUMNS || columns * result.data.length > MAX_CELLS) return { error: "tooManyCells" };
  return {
    rows: result.data,
    columns,
    delimiter: Object.keys(delimiters).find((key) => delimiters[key] === result.meta.delimiter) || "comma",
    uncertain: result.errors.some((error) => error.code === "UndetectableDelimiter"),
    uneven: result.data.some((row) => row.length !== columns),
  };
}

// Values remain strings; sorting never changes IDs, dates, or source contents.
export function filterAndSortRows(rows, { search = "", column = -1, direction = "ascending", locale = "en" } = {}) {
  const query = search.trim().toLocaleLowerCase(locale);
  const selected = rows
    .map((cells, index) => ({ cells, index }))
    .filter((row) => !query || row.cells.some((cell) => cell.toLocaleLowerCase(locale).includes(query)));
  if (column < 0) return selected;
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  const numericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const numeric =
    rows.some((row) => (row[column] || "").trim()) &&
    rows.every((row) => {
      const value = (row[column] || "").trim();
      return (
        !value ||
        (numericPattern.test(value) &&
          Number.isFinite(Number(value)) &&
          Math.abs(Number(value)) <= Number.MAX_SAFE_INTEGER)
      );
    });
  const sign = direction === "descending" ? -1 : 1;
  return selected.sort((a, b) => {
    const left = a.cells[column] || "";
    const right = b.cells[column] || "";
    // Empty cells stay at the bottom in either direction.
    if (!left.trim() && right.trim()) return 1;
    if (left.trim() && !right.trim()) return -1;
    const order = numeric ? Number(left) - Number(right) : collator.compare(left, right);
    return order * sign || a.index - b.index;
  });
}
