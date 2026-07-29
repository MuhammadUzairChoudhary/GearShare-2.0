import { TextStyle } from 'react-native';

export const fontFamilies = {
  spaceGrotesk: {
    regular: 'SpaceGrotesk-Regular',
    medium: 'SpaceGrotesk-Medium',
    semiBold: 'SpaceGrotesk-SemiBold',
    bold: 'SpaceGrotesk-Bold',
  },
  inter: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  ibmPlexMono: {
    regular: 'IBMPlexMono-Regular',
    medium: 'IBMPlexMono-Medium',
    semiBold: 'IBMPlexMono-SemiBold',
  },
} as const;

export type FontFamily = keyof typeof fontFamilies;
export type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

export const typography = {
  // Space Grotesk - Display & Titles
  displayLarge: {
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  } as TextStyle,
  displayMedium: {
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.25,
  } as TextStyle,
  titleLarge: {
    fontFamily: fontFamilies.spaceGrotesk.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.25,
  } as TextStyle,
  titleMedium: {
    fontFamily: fontFamilies.spaceGrotesk.semiBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,
  titleSmall: {
    fontFamily: fontFamilies.spaceGrotesk.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  // Inter - Interface & Body
  bodyLarge: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
  bodyMedium: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,
  bodySmall: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.25,
  } as TextStyle,
  labelLarge: {
    fontFamily: fontFamilies.inter.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  } as TextStyle,
  labelMedium: {
    fontFamily: fontFamilies.inter.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,
  labelSmall: {
    fontFamily: fontFamilies.inter.medium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  } as TextStyle,

  // IBM Plex Mono - Monetary, IDs, Measurements, Dates
  monoLarge: {
    fontFamily: fontFamilies.ibmPlexMono.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.25,
  } as TextStyle,
  monoMedium: {
    fontFamily: fontFamilies.ibmPlexMono.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
  monoSmall: {
    fontFamily: fontFamilies.ibmPlexMono.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.25,
  } as TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
