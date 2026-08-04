import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

/**
 * Centralized motion tokens for the Alpine Instrument interaction system.
 *
 * Every animation in the app should source its duration and easing from here.
 * Do not scatter arbitrary animation values through screens and components.
 */

export const motionDuration = {
  /** Press feedback — must feel immediate. */
  instant: 80,
  /** Micro-transitions (icon swaps, focus rings). */
  fast: 120,
  /** Default for most transitions (toasts, status changes). */
  standard: 180,
  /** Sheets, menus, deliberate reveals. */
  deliberate: 240,
  /** Important completed states (request sent, pickup confirmed). */
  completion: 300,
} as const;

export type MotionDuration = keyof typeof motionDuration;

/**
 * Restrained easing presets (cubic-bezier via React Native Easing).
 * - standard: predictable settle, used for almost everything
 * - enter: quick start, soft landing (sheets, cards)
 * - exit: controlled departure (toast dismiss)
 */
export const motionEasing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.bezier(0.4, 0, 1, 1),
} as const;

/** Pressable feedback — small positional change, no elastic overshoot. */
export const pressMotion = {
  /** Interactive cards and generic pressables. */
  pressedScale: 0.992,
  /** Maximum vertical movement while pressed. */
  pressedTranslateY: 1,
  /** Primary/destructive buttons — slightly more pronounced but never below 0.985. */
  buttonPressedScale: 0.985,
} as const;

/** Bottom-sheet / modal presentation. */
export const sheetMotion = {
  duration: 240,
} as const;

/** Toast behaviour. */
export const toastMotion = {
  enterDuration: 180,
  exitDuration: 120,
  visibleMs: 3000,
} as const;

/**
 * Subscribe to the OS "reduce motion" preference.
 *
 * When enabled, components should:
 * - skip scale / translation press effects
 * - replace directional transitions with short fades
 * - keep state changes immediate
 *
 * The application must remain fully usable with motion disabled.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduced(enabled);
      })
      .catch(() => {
        // Default to motion enabled when the platform can't answer.
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (mounted) setReduced(enabled);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
