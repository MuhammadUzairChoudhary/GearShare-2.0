import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, Modal, Animated, TouchableWithoutFeedback, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { motionDuration, motionEasing, usePrefersReducedMotion } from '../../theme/motion';

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  /** Kept for API compatibility — the sheet sizes to content up to maxHeight. */
  snapPoints?: number[];
  initialIndex?: number;
  testID?: string;
}

/**
 * Alpine bottom sheet.
 *
 * - Bottom entry, controlled backdrop, 240 ms slide (deliberate).
 * - Reduced motion: instant presentation, no slide.
 * - Drag handle affordance; safe-area aware; keyboard-safe via content scroll.
 * - `close()` is also wired to Android hardware back (Modal onRequestClose).
 */
export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(function BottomSheet(
  { children, testID },
  ref,
) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = usePrefersReducedMotion();
  const { height: windowHeight } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  // Session token so a close that was superseded by a re-open never force-hides
  // the sheet (open() during a pending close animation).
  const sessionToken = useRef(0);

  const animateTo = useCallback(
    (toValue: number, onComplete?: () => void) => {
      Animated.timing(progress, {
        toValue,
        duration: reducedMotion ? motionDuration.instant : motionDuration.deliberate,
        easing: motionEasing.enter,
        useNativeDriver: true,
      }).start(onComplete);
    },
    [progress, reducedMotion],
  );

  const open = useCallback(() => {
    sessionToken.current += 1;
    setIsVisible(true);
    animateTo(1);
  }, [animateTo]);

  const close = useCallback(() => {
    const token = sessionToken.current;
    animateTo(0, () => {
      if (sessionToken.current === token) {
        setIsVisible(false);
      }
    });
  }, [animateTo]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  });
  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const sheetStyle: ViewStyle = {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.bottomSheet,
    borderTopRightRadius: radius.bottomSheet,
    paddingBottom: insets.bottom + spacing.lg,
    maxHeight: '80%',
    overflow: 'hidden',
  };

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      transparent
      onRequestClose={close}
      testID={testID}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={close}>
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', opacity: backdropOpacity }} />
        </TouchableWithoutFeedback>
        <Animated.View style={[sheetStyle, { transform: [{ translateY }] }]} accessibilityViewIsModal>
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.xs }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.titanium100 }} />
          </View>
          <View style={{ paddingHorizontal: spacing.lg }}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
});
