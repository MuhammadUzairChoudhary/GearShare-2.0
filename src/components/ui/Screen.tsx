import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';

import { ScrollView } from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  safeArea?: boolean;
  padded?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function Screen({
  children,
  safeArea = true,
  padded = true,
  scrollable = false,
  style,
  testID,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const screenStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: safeArea ? insets.top : 0,
    paddingBottom: safeArea ? insets.bottom : 0,
    paddingLeft: safeArea ? insets.left : 0,
    paddingRight: safeArea ? insets.right : 0,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: padded ? spacing.lg : 0,
  };

  const content = <View style={contentStyle}>{children}</View>;

  return (
    <View style={[screenStyle, style]} testID={testID}>
      {scrollable ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView>
      ) : (
        content
      )}
    </View>
  );
}
