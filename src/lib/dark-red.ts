export default (fontSize: number = 1) => ({
  palette: {
    "themePrimary": "#e03d42",
    "themeLighterAlt": "#090203",
    "themeLighter": "#240a0b",
    "themeLight": "#431214",
    "themeTertiary": "#872428",
    "themeSecondary": "#c5353a",
    "themeDarkAlt": "#e34e53",
    "themeDark": "#e8676b",
    "themeDarker": "#ee8d90",
    "neutralLighterAlt": "#171717",
    "neutralLighter": "#212121",
    "neutralLight": "#303030",
    "neutralQuaternaryAlt": "#393939",
    "neutralQuaternary": "#414141",
    "neutralTertiaryAlt": "#616161",
    "neutralTertiary": "#c8c8c8",
    "neutralSecondary": "#d0d0d0",
    "neutralPrimaryAlt": "#dadada",
    "neutralPrimary": "#ffffff",
    "neutralDark": "#f4f4f4",
    "black": "#f8f8f8",
    "white": "#0d0d0d"
  },
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
    mega: { fontSize: Math.round(68 * fontSize) }
  },
  spacing: {
    s2: Math.round(4 * fontSize),
    s1: Math.round(8 * fontSize),
    m: Math.round(16 * fontSize),
    l1: Math.round(20 * fontSize),
    l2: Math.round(32 * fontSize)
  }
});