import plugin from "tailwindcss/plugin";
import { ThemeConfig } from "tailwindcss/types/config";
import {
  type ColorTuple,
  type HexColor,
  type Modifier,
  type Variants,
  hexToRgb,
  hslToRgb,
  invertColor,
  rgbToHsl,
  shadeModifier,
  tintModifier,
  variants,
} from "./utils";

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
};
type RealtimeColorOptionsWithoutColor = Omit<RealtimeColorOptions, "colors">;

const isDarkMode = (color: HexColor) => {
  const l = rgbToHsl(hexToRgb(color))[2];
  return l > 50;
};

const availableModifiers = {
  tailwind: {
    50: tintModifier(0.95),
    100: tintModifier(0.9),
    200: tintModifier(0.75),
    300: tintModifier(0.6),
    400: tintModifier(0.3),
    500: (c: ColorTuple<"RGB">) => c,
    600: shadeModifier(0.9),
    700: shadeModifier(0.6),
    800: shadeModifier(0.45),
    900: shadeModifier(0.3),
    950: shadeModifier(0.2),
  } as Record<Variants, Modifier<"RGB">>,

  realtimeColors: Object.fromEntries(
    variants.map((variant) => [
      variant,
      (rgb) => {
        const [h, s, _l] = rgbToHsl(rgb);
        return hslToRgb([h, s, 100 - variant / 10]);
      },
    ]),
  ) as Record<Variants, Modifier<"RGB">>,
};

const getCSS = (config: RealtimeColorOptions) => {
  const { theme, shades, prefix, colors } = config;
  if (!theme) return [];
  const modifiers = availableModifiers[config.shadeAlgorithm];
  const variables: Record<string, string> = {};
  const altVariables: Record<string, string> = {};
  for (const [colorName, color] of Object.entries(colors)) {
    if (shades.includes(colorName as keyof typeof colors)) {
      const rgb = hexToRgb(color);
      for (const [variant, modifier] of Object.entries(modifiers)) {
        variables[`--${prefix}${colorName}-${variant}`] = modifier(rgb).join(",");
        altVariables[`--${prefix}${colorName}-${variant}`] = invertColor(modifier(rgb)).join(",");
      }
    } else {
      variables[`--${prefix}${colorName}`] = hexToRgb(color).join(", ");
      altVariables[`--${prefix}${colorName}`] = invertColor(hexToRgb(color)).join(", ");
    }
  }
  const isDark = isDarkMode(colors.background);
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
    if (shades.includes(colorName as keyof typeof colors)) {
      const rgb = hexToRgb(color);
      colorsTheme[`${prefix}${colorName}`] = {};
      for (const [variant, modifier] of Object.entries(modifiers)) {
        (colorsTheme[`${prefix}${colorName}`] as Record<string, string>)[variant] = `rgba(${
          theme ? `var(--${prefix}${colorName}-${variant})` : modifier(rgb).join(", ")
        })`;
      }
    } else {
      colorsTheme[`${prefix}${colorName}`] = `rgba(${
        theme ? `var(--${prefix}${colorName})` : hexToRgb(color).join(", ")
      })`;
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
