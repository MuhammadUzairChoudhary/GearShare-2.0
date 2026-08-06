import React, { useCallback, useImperativeHandle, useRef } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { AlpinePressable } from './AlpinePressable';
import { AppIcon } from './Icons';
import {
  headerActionContainer,
  headerActionPressed,
  resolveHeaderActionMode,
} from './headerActionStyles';

/**
 * Shared options dropdown — the anchored 3-dot menu used by the chat screen
 * and the rental detail screen.
 *
 * - Trigger: vertical 3-dot button (40×40, bordered surface, hit slop).
 * - Menu: modal with controlled backdrop, dropdown card right-aligned under
 *   the trigger via `anchorTop` (measured from the trigger's onLayout).
 * - Items: `OptionsMenuItem` rows with a 28×28 icon tile + label; optional
 *   divider and destructive (error-red) treatment.
 */
interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  /** Vertical offset for the dropdown card — measured from the trigger button. */
  anchorTop: number;
  /** Menu items rendered as children (OptionsMenuItem rows). */
  children: React.ReactNode;
  testID?: string;
}

export function OptionsMenu({ visible, onClose, anchorTop, children, testID }: OptionsMenuProps) {
  const { colors } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose} testID={testID}>
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }}
        onPress={onClose}
        accessibilityLabel="Close options"
      >
        {/* Dropdown card — right-aligned with the trigger button */}
        <View
          onStartShouldSetResponder={() => true}
          style={{
            position: 'absolute',
            top: anchorTop,
            right: spacing.lg,
            minWidth: 230,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingVertical: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface OptionsMenuItemProps {
  /** Icon rendered inside the 28×28 tile. */
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  /** Error-red label + tile icon colour — for destructive actions (e.g. Delete). */
  destructive?: boolean;
  /** Hairline divider rendered above the item. */
  divider?: boolean;
  testID?: string;
}

export function OptionsMenuItem({
  icon,
  label,
  onPress,
  destructive = false,
  divider = false,
  testID,
}: OptionsMenuItemProps) {
  const { colors } = useTheme();
  const labelColor = destructive ? colors.error : colors.textPrimary;

  return (
    <>
      {divider && (
        <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg }} />
      )}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            backgroundColor: colors.surface,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <Text
          style={{
            flex: 1,
            fontFamily: fontFamilies.spaceGrotesk.bold,
            fontSize: rf(12),
            lineHeight: rf(17),
            color: labelColor,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const TRIGGER_SIZE = 40;
const DROPDOWN_GAP = 8;

/** The host-node surface OptionsMenuTrigger needs for native measurements. */
type MeasurableNode = {
  measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void;
};

interface OptionsMenuTriggerProps {
  onPress: () => void;
  accessibilityLabel: string;
  /**
   * Header-action mode, matching BackButton:
   * - default: solid elevated surface + hairline (theme background)
   * - bare: no stroke, no fill — flat non-white surfaces (grey chat field)
   * - overContent: translucent + hairline — over photography
   */
  bare?: boolean;
  overContent?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface OptionsMenuTriggerHandle {
  /**
   * Vertical screen offset under the trigger where the dropdown card should
   * sit. Measured in *window* coordinates (survives safe-area insets and
   * header padding). Falls back to the onLayout-derived offset when the
   * native measure is unavailable (e.g. in tests).
   */
  getAnchorTop: () => number;
}

/**
 * The vertical 3-dot trigger button — one shared component across the chat
 * and rental-detail headers.
 *
 * The trigger measures its own position in *window* coordinates so the
 * anchored dropdown always appears directly under the button, no matter how
 * much safe-area inset or header padding sits above it.
 */
export const OptionsMenuTrigger = React.forwardRef<OptionsMenuTriggerHandle, OptionsMenuTriggerProps>(
  function OptionsMenuTrigger({ onPress, accessibilityLabel, bare = false, overContent = false, style, testID }, ref) {
    const { colors, isDark } = useTheme();
    const mode = bare || overContent ? resolveHeaderActionMode(bare, overContent) : null;
    // onLayout is parent-relative, so it can't anchor a full-screen modal on
    // its own — it only serves as the fallback until measureInWindow reports
    // the true window position (or in tests, where the native measure is a no-op).
    const lastLayoutAnchor = useRef(TRIGGER_SIZE + DROPDOWN_GAP);
    // Native host node for measureInWindow (undefined in tests / SSR).
    const hostRef = useRef<MeasurableNode | null>(null);

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
      lastLayoutAnchor.current = e.nativeEvent.layout.y + e.nativeEvent.layout.height + DROPDOWN_GAP;
    }, []);

    // The press fires before the modal opens, so the trigger is still in the
    // window's responder tree and can be measured — Android otherwise returns
    // null for nodes behind a visible modal.
    useImperativeHandle(ref, () => ({
      getAnchorTop: () => {
        let y = lastLayoutAnchor.current;
        hostRef.current?.measureInWindow?.((_x, measuredY, _w, h) => {
          if (measuredY != null) y = measuredY + h + DROPDOWN_GAP;
        });
        return y;
      },
    }));

    return (
      <AlpinePressable
        // Captures the underlying host node for measureInWindow.
        onRef={(node: unknown) => {
          hostRef.current = (node as MeasurableNode | null) ?? null;
        }}
        onPress={onPress}
        onLayout={handleLayout}
        hitSlopSize="sm"
        haptic="selection"
        style={[
          {
            width: TRIGGER_SIZE,
            height: TRIGGER_SIZE,
            borderRadius: 10,
            ...(mode ? headerActionContainer(mode, colors, isDark) : {
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceElevated,
            }),
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
        pressedStyle={mode ? headerActionPressed(mode, colors, isDark) : { backgroundColor: colors.surface }}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <AppIcon name="dots-vertical" size={16} color={colors.textPrimary} />
      </AlpinePressable>
    );
  },
);
