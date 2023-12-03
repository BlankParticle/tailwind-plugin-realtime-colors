export type ColorTuple<_ extends "RGB" | "HSL" | ""> = [number, number, number];
export type HexColor = `#${string}`;
export type Modifier<T extends "RGB" | "HSL" | ""> = (rgb: ColorTuple<T>) => ColorTuple<T>;
export type Variants = (typeof variants)[number];

export const variants = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const hexToRgb = (color: HexColor) => {
  if (typeof color !== "string" || !color.startsWith("#")) {
    throw new TypeError("Color should be a hex string.");
  }

  const hexMatch = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  if (hexMatch) {
    return hexMatch.splice(1).map((c) => parseInt(c, 16)) as ColorTuple<"RGB">;
  }

  const hexMatchShort = /^#?([\da-f])([\da-f])([\da-f])$/i.exec(color);
  if (hexMatchShort) {
    return hexMatchShort.splice(1).map((c) => parseInt(c + c, 16)) as ColorTuple<"RGB">;
  }

  throw new Error("Invalid color format, Use hex color.");
};

export const rgbToHex = (color: ColorTuple<"RGB">) => {
  return `#${color.map((c) => c.toString(16).padStart(2, "0")).join("")}` as HexColor;
};

export const rgbToHsl = (color: ColorTuple<"RGB">) => {
  const [r, g, b] = color.map((c) => c / 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)] as ColorTuple<"HSL">;
};

export const hslToRgb = (color: ColorTuple<"HSL">) => {
  let [h, s, l] = color;

  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hueToRgb = ([p, q, t]: ColorTuple<"">) => {
    if (t < 0) t += 1;
    if (t > 1) t += 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r;
  let g;
  let b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb([p, q, h + 1 / 3]);
    g = hueToRgb([p, q, h]);
    b = hueToRgb([p, q, h - 1 / 3]);
  }

  return [r, g, b].map((c) => Math.round(c * 255)) as ColorTuple<"RGB">;
};

export const invertColor: Modifier<"RGB"> = (color) => {
  let [h, s, l] = rgbToHsl(color);
  l = 100 - l;
  h /= 360;
  s /= 100;
  l /= 100;

  let r;
  let g;
  let b;

  if (s === 0) r = g = b = Math.round(l * 255);
  else {
    const modifier = ([a, b, c]: ColorTuple<"">) => {
      if (c < 0) c += 1;
      if (c > 1) c -= 1;
      return c < 1 / 6
        ? a + (b - a) * 6 * c
        : c < 0.5
          ? b
          : c < 2 / 3
            ? a + (b - a) * (2 / 3 - c) * 6
            : a;
    };
    const n = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const m = 2 * l - n;

    r = Math.round(modifier([m, n, h + 1 / 3]) * 255);
    g = Math.round(modifier([m, n, h]) * 255);
    b = Math.round(modifier([m, n, h - 1 / 3]) * 255);
  }

  return [r, g, b];
};

export const tintModifier =
  (intensity: number): Modifier<"RGB"> =>
  (rgb) =>
    rgb.map((c) => Math.round(c + (255 - c) * intensity)) as ColorTuple<"RGB">;

export const shadeModifier =
  (intensity: number): Modifier<"RGB"> =>
  (rgb) =>
    rgb.map((c) => Math.round(c * intensity)) as ColorTuple<"RGB">;
