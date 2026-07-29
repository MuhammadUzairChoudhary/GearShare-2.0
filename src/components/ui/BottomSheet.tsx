import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { View, Modal, TouchableWithoutFeedback, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: number[];
  initialIndex?: number;
  testID?: string;
}

export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(function BottomSheet(
  { children, testID },
  ref,
) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = React.useState(false);

  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  const sheetStyle: ViewStyle = {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.bottomSheet,
    borderTopRightRadius: radius.bottomSheet,
    paddingTop: spacing.xxl,
    paddingBottom: insets.bottom + spacing.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: '80%',
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={close}
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={close}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback>
            <View style={sheetStyle}>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});
