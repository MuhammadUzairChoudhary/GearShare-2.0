import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
  type PressableProps,
} from 'react-native';
import { hitSlop } from '../../theme/spacing';
import { motionDuration, motionEasing, pressMotion, usePrefersReducedMotion } from '../../theme/motion';
import { haptics } from '../../services/feedback/haptics';

export type HapticFeedback = 'none' | 'selection' | 'action';

interface AlpinePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Semantic haptic fired on press-in. Defaults to none (opt-in). */
  haptic?: HapticFeedback;
  /** Applied while pressed: subtle background/border emphasis. */
  pressedStyle?: StyleProp<ViewStyle>;
  /** Applied when disabled. Avoid opacity-only for important controls. */
  disabledStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: PressableProps['accessibilityRole'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: PressableProps['accessibilityState'];
  testID?: string;
  /** Maps to hitSlop presets (sm/md/lg) to expand the touch target. */
  hitSlopSize?: keyof typeof hitSlop;
  /** Scale while pressed. Defaults to pressMotion.pressedScale (0.992). */
  pressedScale?: number;
}

/**
 * The restrained pressable primitive for the Alpine Instrument system.
 *
 * Behaviour:
 * - Scale compresses to pressedScale (0.992 max) for 80 ms, restores in 120 ms.
 * - Optional background/border emphasis via `pressedStyle`.
 * - Maximum translation is 1 px — no elevation, no bounce, no glow.
 * - Skipped entirely when the OS reports "reduce motion".
 * - Disabled controls never receive press handlers or haptics.
 */
export function AlpinePressable({
  children,
  onPress,
  onLongPress,
  disabled = false,
  haptic: hapticFeedback = 'none',
  pressedStyle,
  disabledStyle,
  style,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  testID,
  hitSlopSize,
  pressedScale = pressMotion.pressedScale,
}: AlpinePressableProps) {
  const reducedMotion = usePrefersReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(scale, {
        toValue,
        duration,
        easing: motionEasing.standard,
        useNativeDriver: true,
      }).start();
    },
    [scale],
  );

  const handlePressIn = useCallback(() => {
    if (hapticFeedback === 'selection') haptics.selection();
    if (hapticFeedback === 'action') haptics.action();
    if (!reducedMotion) animateTo(pressedScale, motionDuration.instant);
  }, [animateTo, hapticFeedback, pressedScale, reducedMotion]);

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) animateTo(1, motionDuration.fast);
  }, [animateTo, reducedMotion]);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      disabled={disabled}
      hitSlop={hitSlopSize ? hitSlop[hitSlopSize] : undefined}
      style={({ pressed }) => [
        style,
        pressed && pressedStyle,
        disabled && disabledStyle,
      ]}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      testID={testID}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}
