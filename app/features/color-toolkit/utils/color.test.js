import test from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, createPalette, parseHex, readableTextColor, rgbToHex, rgbToHsl } from "./color.js";

test("parses short and full hex colors and rejects invalid input", () => {
  assert.deepEqual(parseHex("#0f8"), { r: 0, g: 255, b: 136 });
  assert.deepEqual(parseHex("336699"), { r: 51, g: 102, b: 153 });
  assert.equal(parseHex("#12xy00"), null);
});

test("converts RGB to canonical HEX and HSL", () => {
  assert.equal(rgbToHex({ r: 51, g: 102, b: 153 }), "#336699");
  assert.deepEqual(rgbToHsl({ r: 51, g: 102, b: 153 }), { h: 210, s: 50, l: 40 });
  assert.deepEqual(rgbToHsl({ r: 128, g: 128, b: 128 }), { h: 0, s: 0, l: 50 });
});

test("generates ordered tints and shades containing the source color", () => {
  assert.deepEqual(createPalette(parseHex("#336699")), [
    "#D6E0EB",
    "#ADC2D6",
    "#7A9CBD",
    "#336699",
    "#29527A",
    "#1F3D5C",
    "#14293D",
  ]);
});

test("calculates WCAG contrast and chooses the more readable text color", () => {
  assert.equal(contrastRatio(parseHex("#000000"), parseHex("#FFFFFF")), 21);
  assert.equal(readableTextColor(parseHex("#F5C242")), "#000000");
  assert.equal(readableTextColor(parseHex("#172033")), "#FFFFFF");
});
