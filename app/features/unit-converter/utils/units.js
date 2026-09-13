export const UNIT_CATEGORIES = ["length", "mass", "temperature", "speed", "data"];

const linear = (symbol, factor) => ({ symbol, toBase: (value) => value * factor, fromBase: (value) => value / factor });

export const units = {
  length: {
    millimeter: linear("mm", 0.001),
    centimeter: linear("cm", 0.01),
    meter: linear("m", 1),
    kilometer: linear("km", 1000),
    inch: linear("in", 0.0254),
    foot: linear("ft", 0.3048),
    yard: linear("yd", 0.9144),
    mile: linear("mi", 1609.344),
  },
  mass: {
    milligram: linear("mg", 0.000001),
    gram: linear("g", 0.001),
    kilogram: linear("kg", 1),
    ounce: linear("oz", 0.028349523125),
    pound: linear("lb", 0.45359237),
  },
  temperature: {
    celsius: { symbol: "°C", toBase: (value) => value + 273.15, fromBase: (value) => value - 273.15 },
    fahrenheit: {
      symbol: "°F",
      toBase: (value) => ((value - 32) * 5) / 9 + 273.15,
      fromBase: (value) => ((value - 273.15) * 9) / 5 + 32,
    },
    kelvin: { symbol: "K", toBase: (value) => value, fromBase: (value) => value },
  },
  speed: {
    metersPerSecond: linear("m/s", 1),
    kilometersPerHour: linear("km/h", 1 / 3.6),
    milesPerHour: linear("mph", 0.44704),
    knot: linear("kn", 0.5144444444444445),
  },
  data: {
    byte: linear("B", 1),
    kilobyte: linear("kB", 1000),
    megabyte: linear("MB", 1000 ** 2),
    gigabyte: linear("GB", 1000 ** 3),
    kibibyte: linear("KiB", 1024),
    mebibyte: linear("MiB", 1024 ** 2),
    gibibyte: linear("GiB", 1024 ** 3),
  },
};

export const defaultUnits = {
  length: ["meter", "kilometer"],
  mass: ["kilogram", "pound"],
  temperature: ["celsius", "fahrenheit"],
  speed: ["kilometersPerHour", "milesPerHour"],
  data: ["megabyte", "mebibyte"],
};

export function convertUnit(category, value, from, to) {
  if (typeof value === "string" && value.trim() === "") return null;
  const number = Number(value);
  const source = units[category]?.[from];
  const target = units[category]?.[to];
  if (!source || !target || !Number.isFinite(number)) return null;
  const result = target.fromBase(source.toBase(number));
  return Number.isFinite(result) ? result : null;
}

export function unitEntries(category) {
  return Object.entries(units[category] || {}).map(([key, unit]) => ({ key, symbol: unit.symbol }));
}
