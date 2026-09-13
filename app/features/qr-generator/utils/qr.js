import QRCode from "qrcode";

export const ERROR_LEVELS = ["L", "M", "Q", "H"];

function boundedInteger(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(number)));
}

export function normalizeQrOptions(options = {}) {
  const errorCorrectionLevel = ERROR_LEVELS.includes(options.errorCorrectionLevel) ? options.errorCorrectionLevel : "M";
  return {
    width: boundedInteger(options.size, 320, 160, 1024),
    margin: boundedInteger(options.margin, 2, 0, 8),
    errorCorrectionLevel,
    color: {
      dark: /^#[0-9a-f]{6}$/i.test(options.dark) ? options.dark : "#111827",
      light: /^#[0-9a-f]{6}$/i.test(options.light) ? options.light : "#FFFFFF",
    },
  };
}

export async function renderQrToCanvas(canvas, value, options) {
  if (!String(value).trim()) throw new Error("empty");
  return QRCode.toCanvas(canvas, value, normalizeQrOptions(options));
}

export async function createQrSvg(value, options) {
  if (!String(value).trim()) throw new Error("empty");
  return QRCode.toString(value, { ...normalizeQrOptions(options), type: "svg" });
}
