import test from "node:test";
import assert from "node:assert/strict";
import { buildNewsDocument, parseDraft, safeUrl, sourcePresets } from "./document.js";
const source = {
  title: "News & opinion",
  url: "https://example.com/news?a=1&b=2",
  liteUrl: "https://example.com/text",
};

test("export is a complete static document with safe text, order, and selected destinations", () => {
  const html = buildNewsDocument({
    title: '<script>alert("x")</script>',
    sources: [source, { ...source, title: "Second", liteUrl: "" }],
    language: "tr",
    footer: "A & B",
  });
  assert.ok(html.startsWith("<!DOCTYPE html>"));
  assert.ok(html.includes('lang="tr"'));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes('href="https://example.com/text"'));
  assert.ok(html.includes('href="https://example.com/news?a=1&amp;b=2"'));
  assert.ok(html.indexOf("News &amp; opinion") < html.indexOf("Second"));
  assert.ok(html.includes("A &amp; B"));
  assert.doesNotMatch(html, /<script|<link|<img|@import|target=|display:\s*(grid|flex)/i);
});

test("rejects unsafe destinations and incomplete sources instead of silently dropping them", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,<h1>x</h1>",
    "file:///etc/passwd",
    "https://user:pass@example.com",
    "/relative",
  ]) {
    assert.equal(safeUrl(url), "");
    assert.equal(buildNewsDocument({ title: "News", sources: [{ ...source, url }] }), "");
  }
  assert.equal(buildNewsDocument({ title: "News", sources: [] }), "");
  assert.equal(buildNewsDocument({ title: "News", sources: [{ ...source, title: " " }] }), "");
  assert.equal(buildNewsDocument({ title: "News", sources: [{ ...source, liteUrl: "javascript:alert(1)" }] }), "");
});

test("lightweight preference and presentation settings affect the actual exported document", () => {
  const html = buildNewsDocument({
    title: "News",
    sources: [source],
    preferLite: false,
    fontSize: 26,
    spacing: "compact",
  });
  assert.ok(html.includes("font-size: 26px"));
  assert.ok(html.includes("margin: 0 0 8px"));
  assert.ok(html.includes('href="https://example.com/news?a=1&amp;b=2"'));
  assert.ok(!html.includes("<small>"));
  const untrusted = buildNewsDocument({
    title: "News",
    sources: [source],
    fontSize: "22; color:red",
    language: 'en" onload="x',
  });
  assert.ok(untrusted.includes("font-size: 22px"));
  assert.ok(untrusted.includes('lang="en"'));
});

test("draft round trip preserves empty pages and editable data; malformed drafts are rejected", () => {
  const value = {
    version: 1,
    title: "My links",
    sources: [source],
    preferLite: false,
    fontSize: 18,
    spacing: "compact",
  };
  const restored = parseDraft(JSON.stringify(value));
  assert.equal(restored.sources[0].title, source.title);
  assert.equal(restored.preferLite, false);
  assert.deepEqual(parseDraft(JSON.stringify({ ...value, sources: [] })).sources, []);
  for (const raw of [
    "{",
    "null",
    JSON.stringify({ ...value, version: 2 }),
    JSON.stringify({ ...value, sources: [null] }),
  ])
    assert.throws(() => parseDraft(raw));
});

test("every preset produces a valid document", () => {
  assert.ok(buildNewsDocument({ title: "News", sources: sourcePresets }));
});
