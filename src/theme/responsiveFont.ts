import { Dimensions, PixelRatio } from 'react-native';

/**
 * Responsive font utility — scales font sizes proportionally to screen width
 * AND respects device-level accessibility font scaling (Dynamic Type / font size setting).
 *
 * Base design width: 375px (iPhone 13 mini / standard mobile design).
 * This ensures text is comfortable on all screen sizes and for users who
 * increase their device's font size for accessibility.
 */

const SCREEN_WIDTH = Dimensions.get('window').width;
const BASE_WIDTH = 375;

/**
 * Screen-width scale factor. Clamped to avoid extreme sizes on tiny/very wide screens.
 * - iPhone SE (320px): ~0.85×
 * - iPhone 13 mini (375px): 1.0×
 * - iPhone 14 Pro Max (430px): ~1.15×
 * - iPad (768px+): clamped to 1.2×
 */
const WIDTH_SCALE = Math.min(Math.max(SCREEN_WIDTH / BASE_WIDTH, 0.85), 1.2);

/**
 * Device-level font scale from accessibility settings (e.g., Dynamic Type on iOS,
 * Font Size on Android). Returns 1.0 when the user hasn't changed the default.
 * Clamped to a reasonable range so we don't break layouts with extreme values.
 *
 * Typical ranges:
 * - iOS: 0.85 (extra small) → 1.0 (default) → 1.5 (extra large) → 2.0 (accessibility max)
 * - Android: 0.85 → 1.0 → 1.3 → 1.5
 */
const FONT_SCALE = Math.min(Math.max(PixelRatio.getFontScale(), 0.85), 1.3);

/**
 * Combined scale factor. Uses the larger of width-scale and font-scale so that
 * text is always at least as large as the width-based size, but can be larger
 * if the user has increased their device font size.
 */
const COMBINED_SCALE = Math.max(WIDTH_SCALE, FONT_SCALE);

/**
 * Responsive font size.
 *
 * @param size - Base font size (as designed at 375px width with default font size).
 * @returns Scaled font size, rounded to the nearest pixel.
 *
 * Examples (at 375px default font size):
 *   rf(24) → 24
 *   rf(14) → 14
 *   rf(10) → 10
 *
 * If user sets font size to "extra large" (1.2×):
 *   rf(24) → 29  (24 × 1.2)
 *   rf(14) → 17  (14 × 1.2)
 */
export function rf(size: number): number {
  return PixelRatio.roundToNearestPixel(size * COMBINED_SCALE);
}

/**
 * Computes a responsive lineHeight from a design-lineHeight value.
 * Scales proportionally with the combined scale factor.
 *
 * @param lineHeight - The base lineHeight value from the design.
 * @returns Scaled lineHeight, rounded to the nearest pixel.
 *
 * Example:
 *   rlh(24) → same as rf(24) → 24 (at 375px), scales up on larger screens/text
 */
export function rlh(lineHeight: number): number {
  return PixelRatio.roundToNearestPixel(lineHeight * COMBINED_SCALE);
}
