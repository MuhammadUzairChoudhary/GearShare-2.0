import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { AppIcon } from './Icons';
import { useToast } from '../../providers/ToastProvider';

/** Matches the dashboard notification-bell red dot. */
const NOTIFICATION_RED = '#EF4444';

interface NotificationButtonProps {
  /** Override the default placeholder toast. */
  onPress?: () => void;
  testID?: string;
}

/**
 * Shared notification bell, matching the dashboard's header bell: 40×40
 * neutral surface, 1px hairline border, red indicator dot. Until a
 * notifications screen exists it shows an honest placeholder toast.
 */
export function NotificationButton({ onPress, testID }: NotificationButtonProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    showToast('Notifications are coming in the full release', 'info');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      testID={testID}
    >
      <AppIcon name="notification" size={16} color={colors.textPrimary} />
      {/* Red dot */}
      <View
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 9999,
          backgroundColor: NOTIFICATION_RED,
          borderWidth: 1,
          borderColor: colors.surfaceElevated,
          right: 9,
          top: 9,
        }}
      />
    </TouchableOpacity>
  );
}
