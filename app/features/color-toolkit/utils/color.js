function clampChannel(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function parseHex(value) {
  const normalized = String(value).trim().replace(/^#/, "");
  const expanded = /^[0-9a-f]{3}$/i.test(normalized)
    ? normalized
        .split("")
        .map((character) => character + character)
        .join("")
    : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) return null;
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const channel = (value) => clampChannel(value).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }) {
  const red = clampChannel(r) / 255;
  const green = clampChannel(g) / 255;
  const blue = clampChannel(b) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 2;
  const delta = maximum - minimum;

  if (delta === 0) return { h: 0, s: 0, l: Math.round(lightness * 100) };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (maximum === red) hue = 60 * (((green - blue) / delta) % 6);
  else if (maximum === green) hue = 60 * ((blue - red) / delta + 2);
  else hue = 60 * ((red - green) / delta + 4);

  return {
    h: Math.round(hue < 0 ? hue + 360 : hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function mixColors(color, target, amount) {
  const ratio = Math.min(1, Math.max(0, amount));
  return {
    r: color.r + (target.r - color.r) * ratio,
    g: color.g + (target.g - color.g) * ratio,
    b: color.b + (target.b - color.b) * ratio,
  };
}

export function createPalette(color) {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  return [
    mixColors(color, white, 0.8),
    mixColors(color, white, 0.6),
    mixColors(color, white, 0.35),
    color,
    mixColors(color, black, 0.2),
    mixColors(color, black, 0.4),
    mixColors(color, black, 0.6),
  ].map(rgbToHex);
}

export function relativeLuminance({ r, g, b }) {
  const linear = (channel) => {
    const value = clampChannel(channel) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(first, second) {
  const light = relativeLuminance(first);
  const dark = relativeLuminance(second);
  return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
}

export function readableTextColor(color) {
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  return contrastRatio(color, black) >= contrastRatio(color, white) ? "#000000" : "#FFFFFF";
}
