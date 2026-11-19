export const colors = {
  // Core palette
  carbon950: '#0B0D0E',
  carbon850: '#171A1C',
  titanium100: '#ECEEEF',
  titanium50: '#F8F9F9',
  white: '#FFFFFF',

  // Signal colors
  signalLime: '#C8FF3D',
  signalLimeDark: '#91C900',
  iceBlue: '#69C8E8',
  // Trust — verification blue, the recognizable "verified" tick.
  verified: '#1D9BF0',

  // Graphite neutrals
  graphite700: '#353A3D',
  graphite500: '#6F767A',
  graphite300: '#AEB4B7',

  // Semantic colors
  success: '#73D98B',
  successBackground: '#14291B',
  warning: '#F2C94C',
  warningBackground: '#2F2914',
  error: '#FF6B65',
  errorBackground: '#321817',
  information: '#69C8E8',
  informationBackground: '#13262D',
} as const;

export type ColorToken = keyof typeof colors;

export const themeColors = {
  light: {
    background: colors.white,
    surface: colors.titanium50,
    surfaceElevated: colors.white,
    textPrimary: colors.carbon950,
    textSecondary: colors.graphite500,
    textTertiary: colors.graphite300,
    border: colors.titanium100,
    borderFocused: colors.graphite700,
    accent: colors.signalLimeDark,
    accentLight: colors.signalLime,
    accentOnDark: colors.signalLime,
    ...colors,
  },
  dark: {
    background: colors.carbon950,
    surface: colors.carbon850,
    surfaceElevated: colors.graphite700,
    textPrimary: colors.titanium50,
    textSecondary: colors.graphite300,
    textTertiary: colors.graphite500,
    border: colors.graphite700,
    borderFocused: colors.titanium100,
    accent: colors.signalLime,
    accentLight: colors.signalLime,
    accentOnDark: colors.signalLimeDark,
    ...colors,
  },
} as const;

export type ThemeColorScheme = typeof themeColors.light;
