import { hex, hsl, rgb } from "color-convert";
import plugin from "tailwindcss/plugin";
import { type ThemeConfig } from "tailwindcss/types/config";
import { ColorTuple, invertColor, isColorDark, shadeModifier, tintModifier } from "./utils";

type HexColor = `#${string}`;
type Plugin = ReturnType<typeof plugin>;
export type RealtimeColorOptions = {
  colors: {
    text: HexColor;
    background: HexColor;
    primary: HexColor;
    secondary: HexColor;
    accent: HexColor;
  };
  theme: boolean;
  shades: (keyof RealtimeColorOptions["colors"])[];
  prefix: string;
  shadeAlgorithm: keyof typeof availableModifiers;
  colorFormat: "rgb" | "hsl" | "lch" | "lab";
};
type RealtimeColorOptionsWithoutColor = Omit<RealtimeColorOptions, "colors">;

const variants = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const availableModifiers = {
  tailwind: {
    50: tintModifier(0.95),
    100: tintModifier(0.9),
    200: tintModifier(0.75),
    300: tintModifier(0.6),
    400: tintModifier(0.3),
    500: (c: ColorTuple) => c,
    600: shadeModifier(0.9),
    700: shadeModifier(0.6),
    800: shadeModifier(0.45),
    900: shadeModifier(0.3),
    950: shadeModifier(0.2),
  },

  realtimeColors: Object.fromEntries(
    variants.map((variant) => [
      variant,
      (color: ColorTuple) => {
        const [h, s] = rgb.hsl(color);
        return hsl.rgb([h, s, 100 - variant / 10]);
      },
    ]),
  ),
};

const formatRGBColor = (color: ColorTuple, to: RealtimeColorOptions["colorFormat"]) => {
  switch (to) {
    case "rgb": {
      const [r, g, b] = color;
      return `${r}, ${g}, ${b}`;
    }
    case "hsl": {
      const [h, s, l] = rgb.hsl(color);
      return `${h} ${s}% ${l}%`;
    }
    case "lab": {
      const [l, a, b] = rgb.lab.raw(color).map((c) => c.toFixed(2));
      return `${l}% ${a} ${b}`;
    }
    case "lch": {
      const [l, c, h] = rgb.lch.raw(color).map((c) => c.toFixed(2));
      return `${l}% ${c} ${h}`;
    }
  }
};

const wrapInFunction = (color: string, type: RealtimeColorOptions["colorFormat"]) =>
  // For some reason rgb() doesn't work with `/ <alpha-value>`
  type === "rgb" ? `rgba(${color})` : `${type}(${color} / <alpha-value>)`;

const getCSS = (config: RealtimeColorOptions) => {
  const { theme, shades, prefix, colors } = config;
  if (!theme) return [];
  const modifiers = availableModifiers[config.shadeAlgorithm];
  const variables: Record<string, string> = {};
  const altVariables: Record<string, string> = {};
  for (const [colorName, color] of Object.entries(colors)) {
    const rgbColor = hex.rgb(color);
    if (shades.includes(colorName as keyof typeof colors)) {
      for (const [variant, modifier] of Object.entries(modifiers)) {
        variables[`--${prefix}${colorName}-${variant}`] = formatRGBColor(
          modifier(rgbColor),
          config.colorFormat,
        );
        altVariables[`--${prefix}${colorName}-${variant}`] = formatRGBColor(
          invertColor(modifier(rgbColor)),
          config.colorFormat,
        );
      }
    } else {
      variables[`--${prefix}${colorName}`] = formatRGBColor(rgbColor, config.colorFormat);
      altVariables[`--${prefix}${colorName}`] = formatRGBColor(
        invertColor(rgbColor),
        config.colorFormat,
      );
    }
  }
  const isDark = isColorDark(colors.background);
  return [
    {
      ":root": isDark ? variables : altVariables,
      ":is(.dark):root": isDark ? altVariables : variables,
    },
  ];
};
const getTheme = (config: RealtimeColorOptions) => {
  const { theme, shades, prefix, colors } = config;
  const colorsTheme: ThemeConfig["colors"] = {};
  const modifiers = availableModifiers[config.shadeAlgorithm];
  for (const [colorName, color] of Object.entries(colors)) {
    const rgbColor = hex.rgb(color);
    if (shades.includes(colorName as keyof typeof colors)) {
      colorsTheme[`${prefix}${colorName}`] = {};
      for (const [variant, modifier] of Object.entries(modifiers)) {
        (colorsTheme[`${prefix}${colorName}`] as Record<string, string>)[variant] = wrapInFunction(
          theme
            ? `var(--${prefix}${colorName}-${variant})`
            : formatRGBColor(modifier(rgbColor), config.colorFormat),
          config.colorFormat,
        );
      }
    } else {
      colorsTheme[`${prefix}${colorName}`] = wrapInFunction(
        theme ? `var(--${prefix}${colorName})` : formatRGBColor(rgbColor, config.colorFormat),
        config.colorFormat,
      );
    }
  }
  return colorsTheme;
};

const realtimeColorsPlugin = plugin.withOptions<RealtimeColorOptions>(
  (options) =>
    ({ addBase }) =>
      addBase(getCSS(options)),
  (options) => ({
    theme: {
      extend: {
        colors: getTheme(options),
      },
    },
  }),
);

function realtimeColors(
  config: Pick<RealtimeColorOptions, "colors"> & Partial<RealtimeColorOptionsWithoutColor>,
): Plugin;
function realtimeColors(
  url: string,
  extraConfig?: Partial<RealtimeColorOptionsWithoutColor>,
): Plugin;
function realtimeColors(
  configOrUrl: string | Pick<RealtimeColorOptions, "colors">,
  extraConfig?: Partial<RealtimeColorOptionsWithoutColor>,
): Plugin {
  const defaultConfig: RealtimeColorOptionsWithoutColor = {
    theme: true,
    shades: ["primary", "secondary", "accent"],
    prefix: "",
    shadeAlgorithm: "tailwind",
    colorFormat: "rgb",
  };

  if (typeof configOrUrl === "string") {
    const siteUrl = new URL(configOrUrl);
    const colors = siteUrl.searchParams.get("colors");
    if (!colors) {
      throw new Error("No colors provided!");
    }
    const colorArray = colors.split("-").map((c) => `#${c}`) as HexColor[];
    if (colorArray.length !== 5) {
      throw new Error("Invalid number of colors provided!");
    }
    const [text, background, primary, secondary, accent] = colorArray;
    return realtimeColorsPlugin({
      ...defaultConfig,
      ...extraConfig,
      colors: {
        text,
        background,
        primary,
        secondary,
        accent,
      },
    });
  }
  return realtimeColorsPlugin({
    ...defaultConfig,
    ...configOrUrl,
  });
}

export default realtimeColors;
