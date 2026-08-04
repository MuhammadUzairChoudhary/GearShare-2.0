import React, { useEffect, useRef } from 'react';
import { Modal, View, Animated, TouchableWithoutFeedback, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { motionDuration, motionEasing, usePrefersReducedMotion } from '../../theme/motion';
import { haptics } from '../../services/feedback/haptics';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

interface AlpineDialogProps {
  visible: boolean;
  title: string;
  /** Explains what happens and the consequences before the user confirms. */
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  /**
   * Destructive confirmation (difficult or impossible to reverse):
   * error palette, warning haptic, no celebratory motion.
   */
  destructive?: boolean;
  testID?: string;
}

/**
 * Alpine dialog — for destructive confirmation and short irreversible choices only.
 *
 * Rules (INTERACTION_SYSTEM.md §12):
 * - Never used for long forms or lengthy policy content (use BottomSheet).
 * - Explains consequences before confirming; explicit labels ("Cancel Rental", never "OK").
 * - Controlled backdrop, 240 ms enter (reduced motion: instant), no elastic overshoot.
 * - Warning haptic fires exactly once per open; haptics are never the only feedback
 *   (title + message carry the meaning).
 * - Android hardware back dismisses (onRequestClose → onCancel).
 */
export function AlpineDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancel',
  onCancel,
  destructive = false,
  testID,
}: AlpineDialogProps) {
  const { colors } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  // Previous-visibility tracker. Initialized to false so a first render with
  // visible=true is treated as an opening transition.
  const wasVisible = useRef(false);

  useEffect(() => {
    // Animate + haptic only on a false → true transition, never on re-renders
    // while the dialog is already open (e.g. reduce-motion setting changes).
    const isOpening = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!isOpening) return;

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: reducedMotion ? motionDuration.instant : motionDuration.deliberate,
      easing: motionEasing.enter,
      useNativeDriver: true,
    }).start();
    if (destructive) {
      haptics.warning();
    }
  }, [visible, progress, reducedMotion, destructive]);

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  const dialogScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const dialogOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: destructive ? 1 : 0,
    borderColor: colors.error,
    maxWidth: 340,
    width: '100%',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      // Android requires a back handler; default to a no-op when onCancel is omitted.
      onRequestClose={onCancel ?? (() => {})}
      testID={testID}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <TouchableWithoutFeedback onPress={onCancel} accessibilityRole="button" accessibilityLabel="Dismiss">
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000',
              opacity: backdropOpacity,
            }}
          />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[cardStyle, { opacity: dialogOpacity, transform: [{ scale: dialogScale }] }]}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <View style={{ gap: spacing.sm }}>
            <AppText variant="titleMedium" color={destructive ? 'error' : 'textPrimary'}>
              {title}
            </AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              {message}
            </AppText>
          </View>
          <View style={{ gap: spacing.sm }}>
            <AppButton
              title={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'destructive' : 'primary'}
              fullWidth
              size="medium"
            />
            {onCancel && (
              <AppButton
                title={cancelLabel}
                onPress={onCancel}
                variant="ghost"
                fullWidth
                size="medium"
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
