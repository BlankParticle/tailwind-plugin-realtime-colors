import { hex, rgb } from "color-convert";

export type ColorTuple = [number, number, number];

export const invertColor = (color: ColorTuple) => {
  let [h, s, l] = rgb.hsl(color);
  l = 100 - l;
  h /= 360;
  s /= 100;
  l /= 100;

  let r;
  let g;
  let b;

  if (s === 0) r = g = b = Math.round(l * 255);
  else {
    const modifier = ([a, b, c]: ColorTuple) => {
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

  return [r, g, b] as ColorTuple;
};

export const tintModifier = (intensity: number) => (rgb: ColorTuple) =>
  rgb.map((c) => Math.round(c + (255 - c) * intensity)) as ColorTuple;

export const shadeModifier = (intensity: number) => (rgb: ColorTuple) =>
  rgb.map((c) => Math.round(c * intensity)) as ColorTuple;

export const isColorDark = (color: string) => hex.hsl(color)[2] > 50;
