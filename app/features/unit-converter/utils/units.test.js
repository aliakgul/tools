import test from "node:test";
import assert from "node:assert/strict";
import { convertUnit, unitEntries } from "./units.js";

const approximately = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} ≠ ${expected}`);

test("converts metric and imperial length and mass values", () => {
  assert.equal(convertUnit("length", 1, "mile", "kilometer"), 1.609344);
  approximately(convertUnit("length", 12, "inch", "foot"), 1);
  assert.equal(convertUnit("mass", 1, "pound", "kilogram"), 0.45359237);
});

test("converts temperatures with offsets", () => {
  assert.equal(convertUnit("temperature", 0, "celsius", "fahrenheit"), 32);
  assert.equal(convertUnit("temperature", 32, "fahrenheit", "celsius"), 0);
  assert.equal(convertUnit("temperature", 0, "celsius", "kelvin"), 273.15);
});

test("converts speed and decimal and binary data units", () => {
  assert.equal(convertUnit("speed", 100, "kilometersPerHour", "metersPerSecond"), 100 / 3.6);
  assert.equal(convertUnit("data", 1, "mebibyte", "kilobyte"), 1048.576);
});

test("rejects invalid values, categories, and units", () => {
  assert.equal(convertUnit("length", "not-a-number", "meter", "foot"), null);
  assert.equal(convertUnit("length", "", "meter", "foot"), null);
  assert.equal(convertUnit("unknown", 1, "meter", "foot"), null);
  assert.deepEqual(unitEntries("unknown"), []);
});
