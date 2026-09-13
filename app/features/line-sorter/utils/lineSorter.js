export function sortLines(source, options = {}) {
  const {
    mode = "alphabetical",
    direction = "ascending",
    caseSensitive = false,
    trimLines = false,
    removeBlank = false,
    removeDuplicates = false,
    locale,
  } = options;

  let lines = source.split(/\r?\n/);
  if (trimLines) lines = lines.map((line) => line.trim());
  if (removeBlank) lines = lines.filter((line) => line.length > 0);

  if (removeDuplicates) {
    const seen = new Set();
    lines = lines.filter((line) => {
      const identity = caseSensitive ? line : line.toLocaleLowerCase(locale);
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }

  const collator = new Intl.Collator(locale, {
    sensitivity: caseSensitive ? "variant" : "base",
    numeric: mode === "natural",
  });
  const multiplier = direction === "descending" ? -1 : 1;

  return lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => {
      const comparison = mode === "length"
        ? a.line.length - b.line.length || collator.compare(a.line, b.line)
        : collator.compare(a.line, b.line);
      return comparison === 0 ? a.index - b.index : comparison * multiplier;
    })
    .map(({ line }) => line)
    .join("\n");
}
