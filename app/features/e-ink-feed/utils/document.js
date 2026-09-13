export const sourcePresets = [
  { key: "npr", title: "NPR", url: "https://www.npr.org/", liteUrl: "https://text.npr.org/" },
  { key: "cnn", title: "CNN", url: "https://www.cnn.com/", liteUrl: "https://lite.cnn.com/" },
  { key: "cbc", title: "CBC", url: "https://www.cbc.ca/news", liteUrl: "https://www.cbc.ca/lite/news" },
  { key: "bbc", title: "BBC News", url: "https://www.bbc.com/news", liteUrl: "" },
  { key: "guardian", title: "The Guardian", url: "https://www.theguardian.com/international", liteUrl: "" },
  {
    key: "wikipedia",
    title: "Wikipedia · Current events",
    url: "https://en.wikipedia.org/wiki/Portal:Current_events",
    liteUrl: "",
  },
];

export function safeUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export function validateSource(source) {
  return {
    title: typeof source.title === "string" && Boolean(source.title.trim()),
    url: Boolean(safeUrl(source.url)),
    liteUrl: !source.liteUrl || Boolean(safeUrl(source.liteUrl)),
  };
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

// The exported document deliberately uses basic block layout and system fonts.
export function buildNewsDocument({
  title,
  sources,
  preferLite = true,
  fontSize = 22,
  spacing = "roomy",
  language = "en",
  liteLabel = "Lite",
  footer = "",
}) {
  if (
    !title?.trim() ||
    !sources.length ||
    sources.some((source) => Object.values(validateSource(source)).includes(false))
  )
    return "";
  const size = [18, 22, 26].includes(Number(fontSize)) ? Number(fontSize) : 22;
  const lang = ["en", "tr", "es"].includes(language) ? language : "en";
  const links = sources
    .map((source) => {
      const lite = preferLite && Boolean(source.liteUrl?.trim());
      const url = safeUrl(lite ? source.liteUrl : source.url);
      return `<li><a href="${escapeHtml(url)}">${escapeHtml(source.title.trim())}${lite ? ` <small>${escapeHtml(liteLabel)}</small>` : ""}</a></li>`;
    })
    .join("\n");
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title.trim())}</title>
<style>
html, body { background: #fff; color: #000; }
body { font-family: Arial, Helvetica, sans-serif; font-size: ${size}px; line-height: 1.5; margin: 0 auto; padding: 20px; max-width: 760px; }
h1 { font-size: 1.5em; line-height: 1.25; margin: 0 0 24px; overflow-wrap: break-word; }
ul { list-style: none; padding: 0; margin: 0; }
li { margin: 0 0 ${spacing === "compact" ? 8 : 16}px; page-break-inside: avoid; }
a, a:visited { display: block; padding: ${spacing === "compact" ? 10 : 18}px 14px; border: 2px solid #000; color: #000; text-decoration: none; word-wrap: break-word; }
a:focus, a:hover { text-decoration: underline; outline: 2px solid #000; }
small { display: inline-block; font-size: 0.65em; border: 1px solid #000; padding: 0 5px; vertical-align: middle; }
footer { margin-top: 28px; font-size: 0.65em; }
</style>
</head>
<body>
<h1>${escapeHtml(title.trim())}</h1>
<ul>
${links}
</ul>
<footer>${escapeHtml(footer)}</footer>
</body>
</html>`;
}

export function parseDraft(raw) {
  const value = JSON.parse(raw);
  if (
    value?.version !== 1 ||
    typeof value.title !== "string" ||
    !Array.isArray(value.sources) ||
    value.sources.length > 200
  )
    throw new Error("Invalid draft");
  if (
    value.sources.some(
      (source) => !source || ["title", "url", "liteUrl"].some((key) => typeof source[key] !== "string"),
    )
  )
    throw new Error("Invalid sources");
  return {
    title: value.title,
    sources: value.sources.map(({ title, url, liteUrl, key }) => ({
      title,
      url,
      liteUrl,
      key: typeof key === "string" ? key : "",
    })),
    preferLite: value.preferLite !== false,
    fontSize: [18, 22, 26].includes(value.fontSize) ? value.fontSize : 22,
    spacing: value.spacing === "compact" ? "compact" : "roomy",
  };
}
