import test from "node:test";
import assert from "node:assert/strict";
import { createQrSvg, normalizeQrOptions } from "./qr.js";

test("normalizes QR settings to supported values", () => {
  assert.deepEqual(normalizeQrOptions({ size: 80, margin: 99, errorCorrectionLevel: "x", dark: "red" }), {
    width: 160,
    margin: 8,
    errorCorrectionLevel: "M",
    color: { dark: "#111827", light: "#FFFFFF" },
  });
  assert.deepEqual(normalizeQrOptions({ size: 512, margin: 0, errorCorrectionLevel: "H", dark: "#123456" }), {
    width: 512,
    margin: 0,
    errorCorrectionLevel: "H",
    color: { dark: "#123456", light: "#FFFFFF" },
  });
});

test("creates a self-contained SVG and rejects empty content", async () => {
  const svg = await createQrSvg("https://example.com", { size: 240, margin: 1 });
  assert.match(svg, /^<svg/);
  assert.match(svg, /viewBox=/);
  assert.doesNotMatch(svg, /https:\/\/example\.com/);
  await assert.rejects(() => createQrSvg("  "), /empty/);
});
