export default (fontSize: number = 1) => {
  return {
    palette: {
      themePrimary: "#00833e",
      themeLighterAlt: "#f0faf5",
      themeLighter: "#c5ebd7",
      themeLight: "#98dab7",
      themeTertiary: "#48b47a",
      themeSecondary: "#11914d",
      themeDarkAlt: "#007537",
      themeDark: "#00632e",
      themeDarker: "#004922",
      neutralLighterAlt: "#faf9f8",
      neutralLighter: "#f3f2f1",
      neutralLight: "#edebe9",
      neutralQuaternaryAlt: "#e1dfdd",
      neutralQuaternary: "#d0d0d0",
      neutralTertiaryAlt: "#c8c6c4",
      neutralTertiary: "#a19f9d",
      neutralSecondary: "#605e5c",
      neutralPrimaryAlt: "#3b3a39",
      neutralPrimary: "#323130",
      neutralDark: "#201f1e",
      black: "#000000",
      white: "#ffffff",
      red: "#a52234",
      yellow: "#ffc107",
      green: "#00833e",
      blue: "#4c6bb3"
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
  };
};
