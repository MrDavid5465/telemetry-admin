import { PALETTES, ThemeMode, ColorKey } from './palettes';

export type { ThemeMode, ColorKey };

export const COLOR_KEYS: ColorKey[] = [
  'red', 'orange', 'yellow', 'green', 'teal', 'cyan',
  'blue', 'indigo', 'purple', 'violet', 'magenta', 'pink',
];

export const COLOR_LABELS: Record<ColorKey, string> = {
  red: 'Red', orange: 'Orange', yellow: 'Yellow', green: 'Green', teal: 'Teal', cyan: 'Cyan',
  blue: 'Blue', indigo: 'Indigo', purple: 'Purple', violet: 'Violet', magenta: 'Magenta', pink: 'Pink',
};

export const MODE_KEYS: ThemeMode[] = ['light', 'dark', 'hc'];

export const MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light', dark: 'Dark', hc: 'High Contrast',
};

export const themeKey = (mode: ThemeMode, color: ColorKey): string => `${mode}-${color}`;

// Splits e.g. "dark-purple" -> { mode: "dark", color: "purple" } or
// "hc-teal" -> { mode: "hc", color: "teal" }. Falls back to dark-red (the
// reference theme all dark-mode contrast is validated against) for anything
// unrecognized, e.g. a settings.theme value from before this scheme existed.
export function parseThemeKey(key: string | undefined | null): { mode: ThemeMode; color: ColorKey } {
  const dash = (key ?? '').indexOf('-');
  const mode = dash > 0 ? (key as string).slice(0, dash) : '';
  const color = dash > 0 ? (key as string).slice(dash + 1) : '';
  if (MODE_KEYS.includes(mode as ThemeMode) && COLOR_KEYS.includes(color as ColorKey)) {
    return { mode: mode as ThemeMode, color: color as ColorKey };
  }
  return { mode: 'dark', color: 'red' };
}

const fontsAndSpacing = (fontSize: number) => ({
  fonts: {
    tiny: { fontSize: Math.round(10 * fontSize) },
    xSmall: { fontSize: Math.round(10 * fontSize) },
    small: { fontSize: Math.round(12 * fontSize) },
    smallPlus: { fontSize: Math.round(12 * fontSize) },
    medium: { fontSize: Math.round(14 * fontSize) },
    mediumPlus: { fontSize: Math.round(16 * fontSize) },
    large: { fontSize: Math.round(18 * fontSize) },
    xLarge: { fontSize: Math.round(20 * fontSize) },
    xLargePlus: { fontSize: Math.round(24 * fontSize) },
    xxLarge: { fontSize: Math.round(28 * fontSize) },
    xxLargePlus: { fontSize: Math.round(32 * fontSize) },
    superLarge: { fontSize: Math.round(42 * fontSize) },
    mega: { fontSize: Math.round(68 * fontSize) },
  },
  spacing: {
    s2: Math.round(4 * fontSize),
    s1: Math.round(8 * fontSize),
    m: Math.round(16 * fontSize),
    l1: Math.round(20 * fontSize),
    l2: Math.round(32 * fontSize),
  },
});

export const buildTheme = (mode: ThemeMode, color: ColorKey) => (fontSize: number = 1) => ({
  palette: PALETTES[mode][color],
  isInverted: mode !== 'light',
  ...fontsAndSpacing(fontSize),
});

// Full { themeKey: buildTheme fn } map for every mode x color combo, plus a
// `default` alias — handed straight to Denim's `themes` prop.
export const THEMES: Record<string, ReturnType<typeof buildTheme>> = (() => {
  const map: Record<string, ReturnType<typeof buildTheme>> = {};
  for (const mode of MODE_KEYS) {
    for (const color of COLOR_KEYS) {
      map[themeKey(mode, color)] = buildTheme(mode, color);
    }
  }
  map.default = map[themeKey('dark', 'red')];
  return map;
})();
