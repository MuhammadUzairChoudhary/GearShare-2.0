import { TextStyle } from 'react-native';
import { rf, rlh } from './responsiveFont';

export const fontFamilies = {
  spaceGrotesk: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    semiBold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
  inter: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  ibmPlexMono: {
    regular: 'IBMPlexMono_400Regular',
    medium: 'IBMPlexMono_500Medium',
    semiBold: 'IBMPlexMono_600SemiBold',
  },
} as const;

export type FontFamily = keyof typeof fontFamilies;
export type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

// ═══════════════════════════════════════════════════════════════════════
//  LEGACY — unchanged static typography object
//  Keep as-is so existing components don't break.
// ═══════════════════════════════════════════════════════════════════════

export const typography = {
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

// ═══════════════════════════════════════════════════════════════════════
//  NEW — semantic responsive type scale
//  Use these in screen files. They auto-scale via rf() / rlh().
// ═══════════════════════════════════════════════════════════════════════

/** Build a responsive TextStyle from base Figma values. */
export function makeTypeStyle(overrides: {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}): TextStyle {
  return {
    fontFamily: overrides.fontFamily,
    fontSize: rf(overrides.fontSize),
    lineHeight: rlh(overrides.lineHeight),
    ...(overrides.letterSpacing !== undefined ? { letterSpacing: overrides.letterSpacing } : {}),
    ...(overrides.textTransform ? { textTransform: overrides.textTransform } : {}),
  };
}

/**
 * Semantic type scale — each token matches a specific role from the Figma designs.
 *
 * Naming convention:
 *  heroPrice  → largest price values
 *  h1–h4      → section / card titles
 *  subtitle   → section headings
 *  body       → paragraphs, descriptions
 *  caption    → metadata, secondary info
 *  label      → badges, tags
 *  micro      → smallest UI text (IDs, timestamps)
 *  mono*      → technical / monetary data (IBM Plex Mono)
 */
export const typeScale = {
  // ── Space Grotesk (Display & Titles) ────────────────────────────────
  heroPrice: makeTypeStyle({
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  }),
  h1: makeTypeStyle({
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.6,
    textTransform: 'uppercase',
  }),
  h2: makeTypeStyle({
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.45,
    textTransform: 'uppercase',
  }),
  h3: makeTypeStyle({
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.4,
    textTransform: 'uppercase',
  }),
  h4: makeTypeStyle({
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.002,
    textTransform: 'uppercase',
  }),
  subtitle: makeTypeStyle({
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  }),

  // ── Inter (Body, Labels, Captions) ──────────────────────────────────
  body: makeTypeStyle({
    fontFamily: fontFamilies.inter.regular,
    fontSize: 14,
    lineHeight: 23,
  }),
  bodySmall: makeTypeStyle({
    fontFamily: fontFamilies.inter.regular,
    fontSize: 12,
    lineHeight: 20,
  }),
  bodyCaption: makeTypeStyle({
    fontFamily: fontFamilies.inter.regular,
    fontSize: 11,
    lineHeight: 16,
  }),
  caption: makeTypeStyle({
    fontFamily: fontFamilies.inter.medium,
    fontSize: 11,
    lineHeight: 16,
  }),
  label: makeTypeStyle({
    fontFamily: fontFamilies.inter.bold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  }),
  labelSmall: makeTypeStyle({
    fontFamily: fontFamilies.inter.bold,
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  }),

  // ── IBM Plex Mono (Technical / Monetary) ────────────────────────────
  monoPrice: makeTypeStyle({
    fontFamily: fontFamilies.ibmPlexMono.semiBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.01,
  }),
  monoBody: makeTypeStyle({
    fontFamily: fontFamilies.ibmPlexMono.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.015,
  }),
  monoSmall: makeTypeStyle({
    fontFamily: fontFamilies.ibmPlexMono.semiBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  }),
  monoMicro: makeTypeStyle({
    fontFamily: fontFamilies.ibmPlexMono.semiBold,
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  }),
  monoMicroRegular: makeTypeStyle({
    fontFamily: fontFamilies.ibmPlexMono.regular,
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  }),
} as const;

export type TypeScaleToken = keyof typeof typeScale;
