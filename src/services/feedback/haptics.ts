import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

/**
 * Semantic haptic service.
 *
 * Usage mapping (see INTERACTION_SYSTEM.md):
 * - selection: tabs, filters, chips, icon buttons
 * - action:    valid primary submissions, accept/confirm actions
 * - success:   important completed processes (request sent, pickup confirmed)
 * - warning:   destructive confirmation, irreversible choices
 * - error:     failed critical actions
 *
 * Rules:
 * - Never the only feedback — always pair with visible state.
 * - Never fire on disabled controls (call sites must guard).
 * - Never fire during scroll or for trivial automatic updates.
 * - Never fire on web (no native module).
 */
let hapticsEnabled = true;

function fire(fn: () => Promise<void>) {
  if (!hapticsEnabled || Platform.OS === 'web') return;
  // Haptics are best-effort; never let a failure surface to the UI.
  fn().catch(() => {});
}

export const haptics = {
  selection(): void {
    fire(() => ExpoHaptics.selectionAsync());
  },
  action(): void {
    fire(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light));
  },
  success(): void {
    fire(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success));
  },
  warning(): void {
    fire(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning));
  },
  error(): void {
    fire(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error));
  },
  /**
   * Test / environment hook. Disable to assert no haptics fire
   * (e.g. reduced-motion or testing setups).
   */
  _setEnabled(enabled: boolean): void {
    hapticsEnabled = enabled;
  },
};
