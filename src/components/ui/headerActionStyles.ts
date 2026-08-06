import type { ViewStyle } from 'react-native';
import type { ThemeColorScheme } from '../../theme/ThemeContext';

/**
 * The three header-action button scenarios, shared by BackButton, the call
 * button, and the options trigger so every 40×40 header action adapts the
 * same way:
 *
 * - `solid`       — theme background: solid elevated surface + 1px hairline.
 * - `bare`        — flat non-white surface (e.g. the grey chat field): no
 *                   stroke, no fill — the icon sits directly on the surface.
 * - `overContent` — photography/busy content: translucent fill + hairline so
 *                   the image still reads through.
 */
export type HeaderActionMode = 'solid' | 'bare' | 'overContent';

export function headerActionContainer(
  mode: HeaderActionMode,
  colors: ThemeColorScheme,
  isDark: boolean,
): ViewStyle {
  switch (mode) {
    case 'bare':
      return { borderWidth: 0, borderColor: 'transparent', backgroundColor: 'transparent' };
    case 'overContent':
      return {
        borderWidth: 1,
        borderColor: isDark ? colors.graphite700 : '#DDE1E3',
        backgroundColor: isDark ? 'rgba(23,26,28,0.9)' : 'rgba(255,255,255,0.9)',
      };
    case 'solid':
    default:
      return {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceElevated,
      };
  }
}

export function headerActionPressed(
  mode: HeaderActionMode,
  colors: ThemeColorScheme,
  isDark: boolean,
): ViewStyle {
  switch (mode) {
    case 'bare':
      // A visible veil (≈ titanium100 on the grey field) so the press reads
      // immediately without drawing a pill.
      return { backgroundColor: isDark ? 'rgba(236,238,239,0.12)' : 'rgba(31,34,37,0.1)' };
    case 'overContent':
      return { backgroundColor: isDark ? 'rgba(23,26,28,0.6)' : 'rgba(255,255,255,0.6)' };
    case 'solid':
    default:
      return { backgroundColor: colors.surface };
  }
}

/** Map the BackButton-style boolean flags onto a single mode. */
export function resolveHeaderActionMode(bare?: boolean, overContent?: boolean): HeaderActionMode {
  if (bare) return 'bare';
  if (overContent) return 'overContent';
  return 'solid';
}
